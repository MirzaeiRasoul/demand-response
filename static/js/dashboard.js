(function ($) {
  // USE STRICT
  "use strict";
  // Load Page
  try {
    console.log("Welcome to Dashboard Page...");

    var startDate = "",
      endDate = "";

  } catch (error) {
    console.log(error);
  }
})(jQuery);


function loadInformation() {
  try {
    startDate = $("#start-date").val(),
      endDate = $("#end-date").val();
    if (!startDate || !endDate) {
      alert("لطفا همه اطلاعات لازم را وارد کنید.");
    } else if (!persianDateValidity(startDate) || !persianDateValidity(endDate)) {
      alert("اطلاعات تاریخ به درستی وارد نشده است.");
    } else if (Date.parse(startDate) > Date.parse(endDate)) {
      alert("تاریخ شروع نمی تواند بزرگتر از تاریخ پایان باشد.");
    } else {
      d3.csv('static/SampleHour.csv').then(prepareData);
    }
  } catch (error) {
    console.log(error);
  }
}


function prepareData(datas) {
  // datas is an array of objects where each object is something like:
  // {
  //   "MeterName": "TFC0040775001443",
  //   "Timestamp": "2018-03-23 00:23:00",
  //   "Clock_0-0_1_0_0_255_": "1397/01/03 00:23:00:000",
  //   "Current active demand-T_1-0_1_5_0_255_": "35",
  //   "Current reactive demand-T_1-0_3_5_0_255_": "21",
  //   "Active energy import _+A__1-0_1_8_0_255_": "1855990",
  //   "Active energy export_-A__1-0_2_8_0_255_": "0",
  //   "Reactive energy import _+R_ _QI+QII__1-0_3_8_0_255_": "1599130",
  //   "Reactive energy export _-R_ _QIII+QIV__1_0_4_8_0_255_": "0"
  // }

  var meterNames = [],
    clocks = [],
    demands = [];

  var userIndex = -1;
  var usersTotalDemands = [];

  var totalDemand = 0;

  datas.map(function (data) {
    var meterName = data["MeterName"];
    if (!meterNames.includes(meterName)) {
      meterNames.push(meterName);
      userIndex++;
      usersTotalDemands[userIndex] = 0;
    }

    var clock = data["Clock_0-0_1_0_0_255_"],
      demandDate = clock.split(" ")[0];

    if (persianDateCompare(startDate, demandDate) >= 0 && persianDateCompare(demandDate, endDate) >= 0) {
      clocks.push(clock);
    
      var demand = Number(data["Current active demand-T_1-0_1_5_0_255_"]);
      demands.push(demand);
      
      usersTotalDemands[userIndex] = usersTotalDemands[userIndex] + demand;
      totalDemand = totalDemand + demand;
    }
  });
  
  if (clocks.length == 0) {
    alert("اطلاعاتی برای کاربر در این بازه وجود ندارد.");
  } else {
    // Demand Informations
    var numOfUsers = meterNames.length;
    var firstDate = clocks[0].split(" ")[0],
      lastDate = clocks[clocks.length - 1].split(" ")[0];
    var numOfDays = persianDateCompare(firstDate, lastDate);
    
    $("#number-of-users").html(numberFormat(numOfUsers));
    $("#total-demand--value").html(numberFormat(totalDemand));

    var totalDemandDailyAvg = Math.round(totalDemand / (numOfUsers * numOfDays));
    $("#total-demand--daily-avg").html(numberFormat(totalDemandDailyAvg));
    
    var userWithMinDemandIndex = 0,
      userWithMaxDemandIndex = 0;
    for (var i = 1; i < usersTotalDemands.length; i++) {
      usersTotalDemands[i] < usersTotalDemands[userWithMinDemandIndex] ? userWithMinDemandIndex = i : '';
      usersTotalDemands[i] > usersTotalDemands[userWithMaxDemandIndex] ? userWithMaxDemandIndex = i : '';
    }
    
    var userWithMinDemand = meterNames[userWithMinDemandIndex];
    $("#user-with-min-demand").html(userWithMinDemand);
    var userWithMinDemandValue = usersTotalDemands[userWithMinDemandIndex];
    $("#user-with-min-demand--value").html(numberFormat(userWithMinDemandValue));
    var userWithMinDemandDailyAvg = Math.round(userWithMinDemandValue / numOfDays);
    $("#user-with-min-demand--daily-avg").html(numberFormat(userWithMinDemandDailyAvg));

    var userWithMaxDemand = meterNames[userWithMaxDemandIndex];
    $("#user-with-max-demand").html(userWithMaxDemand);
    var userWithMaxDemandValue = usersTotalDemands[userWithMaxDemandIndex];
    $("#user-with-max-demand--value").html(numberFormat(userWithMaxDemandValue));
    var userWithMaxDemandDailyAvg = Math.round(userWithMaxDemandValue / numOfDays);
    $("#user-with-max-demand--daily-avg").html(numberFormat(userWithMaxDemandDailyAvg));

    d3.csv('static/SampleHourAverage.csv').then(drawAverageDemandChart);

    // Reset Chart Type Filter Value
    $('#average-demand-chart-type-select').val('hourly').trigger('change.select2');
    // Show Chart Filter
    $("#average-demand-chart-filter-container").removeClass("d-none");
    $('#average-demand-chart-type-select').select2({
      minimumResultsForSearch: Infinity
    }).on('select2:select', function (event) {
      var selected = event.params.data.id;
      if (selected == "hourly") {
        d3.csv('static/SampleHourAverage.csv').then(drawAverageDemandChart);
      } else if (selected == "daily") {
        d3.csv('static/SampleDayAverage.csv').then(drawAverageDemandChart);
      }
    });
  }
}


function drawAverageDemandChart(datas) {
  const chartColor = 'rgba(42, 141, 212, 0.8)';
  // Resolve Update Chart Problem
  $('#average-demand-chart').remove();
  $('#average-demand-chart-container').empty().append('<canvas id="average-demand-chart"></canvas>');

  var ctx = document.getElementById('average-demand-chart').getContext('2d');
  Chart.defaults.global.defaultFontFamily = 'Roboto';
  Chart.defaults.global.defaultFontColor = '#333';

  var clocks = [],
    demands = [];

  datas.map(function (data) {
    var clock = data["Clock_0-0_1_0_0_255_"],
      demandDate = clock.split(" ")[0];

    if (persianDateCompare(startDate, demandDate) >= 0 && persianDateCompare(demandDate, endDate) >= 0) {
      clocks.push(clock);

      var demand = Number(data["Current active demand-T_1-0_1_5_0_255_"]);
      demands.push(demand);
    }
  });

  if (ctx) {
    ctx.height = 250;
    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: clocks,
        datasets: [
          {
            fill: false,
            borderWidth: 2,
            borderColor: chartColor,
            data: demands,
            pointRadius: 3,
            pointBackgroundColor: "#4272d7",
            pointBorderColor: chartColor,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#4272d7",
          }
        ]
      },
      options: {
        // Custom Tooltips
        tooltips: {
          callbacks: {
            label: function (tooltipItem, data) {
              var clock = data.labels[tooltipItem.index];
              if ($('#average-demand-chart-type-select').val() == "hourly") {
                var time = clock.split(" ")[1].substr(0, 8)
                var value = tooltipItem.yLabel;
                return (value + " - " + time);
              } else {
                var value = tooltipItem.yLabel;
                return value;
              }
            }
          }
        },
        maintainAspectRatio: true,
        legend: {
          display: false
        },
        responsive: true,
        scales: {
          xAxes: [{
            ticks: {
              fontFamily: "Sahel",
              fontSize: 12,
              // Include Just Date in xLabels
              callback: function (value, index, values) {
                return value.split(" ")[0];
              }
            },
            gridLines: {
              drawOnChartArea: true,
              color: '#f0f0f0'
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              fontFamily: "Sahel",
              fontSize: 12
            },
            scaleLabel: {
              display: true,
              labelString: 'Current Active Demand',
              fontSize: 16
            },
            gridLines: {
              display: true,
              color: '#f0f0f0'
            }
          }]
        }
      }
    });
  }
}


(function ($) {
  // USE STRICT
  "use strict";
  // Persian Date Picker
  try {
    $('#start-date').datepicker({
      dateFormat: 'yy/mm/dd',
      changeMonth: true,
      changeYear: true,
      maxDate: '+0d',
      onSelect: function (dateText, inst) {
        $('#end-date').datepicker('option', 'minDate', new JalaliDate(inst['selectedYear'], inst['selectedMonth'], inst['selectedDay']));
      }
    });

    $('#end-date').datepicker({
      dateFormat: 'yy/mm/dd',
      changeMonth: true,
      changeYear: true,
      maxDate: '+0d'
    });

  } catch (error) {
    console.log(error);
  }
})(jQuery);