(function ($) {
  // USE STRICT
  "use strict";
  // Load Page
  try {
    console.log("Welcome to Home Page...");

    var userId = "",
      startDate = "",
      endDate = "";

    var userNames = {
      "TFC0040775001526": "اصغر حدیدیان",
      "TFC0040775001467": "بهجت ابریشمی",
      "TFC0040775001474": "بانک اقتصاد نوین",
      "TFC0040775013076": "علی اصغر فخری لو",
      "TFC0040775001510": "کتابخانه عمومی شهرک الهیه"
    };

    for (var key in userNames) {
      var opt = "<option value=" + key + ">" + userNames[key] + "</option>";
      $("#user-id").append(opt);
    }

  } catch (error) {
    console.log(error);
  }
})(jQuery);


function loadInformation() {
  userId = $("#user-id").val(),
    startDate = $("#start-date").val(),
    endDate = $("#end-date").val();
  if (!userId || !startDate || !endDate) {
    alert("لطفا همه اطلاعات لازم را وارد کنید.");
  } else {
    d3.csv('static/SampleHour.csv').then(prepareData);
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

  // Check Filter Validity
  var userIdValidation = datas.find(data => data["MeterName"] == userId);
  if (!userIdValidation) { // Check UserId Validity
    alert("شماره کاربری به درستی وارد نشده است.");
  } else if (!persianDateValidity(startDate) || !persianDateValidity(endDate)) { // Check Input Dates Validity
    alert("اطلاعات تاریخ به درستی وارد نشده است.");
  } else if (Date.parse(startDate) > Date.parse(endDate)) {
    alert("تاریخ شروع نمی تواند بزرگتر از تاریخ پایان باشد.");
  } else {
    var clocks = [],
      demands = [];

    var totalDemand = 0,
      minDemand = 1000000,
      minDemandIndex = 0,
      maxDemand = 0,
      maxDemandIndex = 0;

    var index = -1;
    datas.map(function (data) {
      if (data["MeterName"] == userId) {
        var clock = data["Clock_0-0_1_0_0_255_"],
          demandDate = clock.split(" ")[0];

        if (persianDateCompare(startDate, demandDate) >= 0 && persianDateCompare(demandDate, endDate) >= 0) {
          index++;
          clocks.push(clock);

          var demand = Number(data["Current active demand-T_1-0_1_5_0_255_"]);
          demands.push(demand);

          totalDemand = totalDemand + demand;
          if (demand < minDemand) {
            minDemand = demand;
            minDemandIndex = index;
          }
          if (demand >= maxDemand) {
            maxDemand = demand;
            maxDemandIndex = index;
          }
        }
      }
    });

    if (clocks.length == 0) {
      alert("اطلاعاتی برای کاربر در این بازه وجود ندارد.");
    } else {
      // User Demand Informations
      $("#user-total-demand").html(numberFormat(totalDemand));
      var avgDemand = Math.round(totalDemand / demands.length);
      $("#user-avg-demand").html(numberFormat(avgDemand));

      var minDemandDate = clocks[minDemandIndex].split(" ")[0];
      $("#user-min-demand").html(numberFormat(minDemand) + " (" + minDemandDate + ")");
      var maxDemandDate = clocks[maxDemandIndex].split(" ")[0];
      $("#user-max-demand").html(numberFormat(maxDemand) + " (" + maxDemandDate + ")");

      d3.csv('static/SampleHour.csv').then(drawDemandChart);

      // Reset Chart Type Filter Value
      $('#demand-chart-type-select').val('hourly').trigger('change.select2');
      // Show Chart Filter
      $("#demand-chart-filter-container").removeClass("d-none");
      $('#demand-chart-type-select').select2({
        minimumResultsForSearch: Infinity
      }).on('select2:select', function (event) {
        var selected = event.params.data.id;
        if (selected == "hourly") {
          d3.csv('static/SampleHour.csv').then(drawDemandChart);
        } else if (selected == "daily") {
          d3.csv('static/SampleDay.csv').then(drawDemandChart);
        }
      });
    }
  }
}


function drawDemandChart(datas) {
  const chartColor = 'rgba(42, 141, 212, 0.8)';
  // Resolve Update Chart Problem
  $('#demand-chart').remove();
  $('#demand-chart-container').empty().append('<canvas id="demand-chart"></canvas>');

  var ctx = document.getElementById('demand-chart').getContext('2d');
  Chart.defaults.global.defaultFontFamily = 'Roboto';
  Chart.defaults.global.defaultFontColor = '#333';

  var clocks = [],
    demands = [];

  datas.map(function (data) {
    if (data["MeterName"] == userId) {
      var clock = data["Clock_0-0_1_0_0_255_"],
        demandDate = clock.split(" ")[0];

      if (persianDateCompare(startDate, demandDate) >= 0 && persianDateCompare(demandDate, endDate) >= 0) {
        clocks.push(clock);

        var demand = Number(data["Current active demand-T_1-0_1_5_0_255_"]);
        demands.push(demand);
      }
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
              if ($('#demand-chart-type-select').val() == "hourly") {
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


(function ($) {
  // USE STRICT
  "use strict";
  // Select2
  try {
    $('#user-id').select2();
  } catch (error) {
    console.log(error);
  }
})(jQuery);