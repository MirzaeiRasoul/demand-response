function renderChart() {
  const chartColor = 'rgba(42, 141, 212, 0.8)';

  var userId = $("#user-id").val();
  var startDate = $("#start-date").val();
  var endDate = $("#end-date").val();
  if (!userId || !startDate || !endDate) {
    alert("لطفا همه اطلاعات لازم را وارد کنید.");
  } else {
    d3.csv('static/‌Zanjan-FAHAM-Test.csv').then(makeChart);
  }
  
  function makeChart(datas){
    // Resolve Update Chart Problem
    $('#demand-chart').remove();
    $('#demand-chart-container').append('<canvas id="demand-chart"></canvas>');

    var ctx = document.getElementById('demand-chart').getContext('2d');
    // Chart.defaults.global.defaultFontFamily = 'Roboto';
    Chart.defaults.global.defaultFontFamily = 'sahel';
    Chart.defaults.global.defaultFontColor = '#333';

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
    var userIdValidation = datas.find(data => data["MeterName"] === userId);
    if (!userIdValidation) { // Check UserId Validity
      alert("شماره کاربری به درستی وارد نشده است.");
    } else if (!checkDateValidity(startDate) || !checkDateValidity(endDate)) { // Check Input Dates Validity
      alert("اطلاعات تاریخ به درستی وارد نشده است.");
    } else if (Date.parse(startDate) > Date.parse(endDate)) {
      alert("تاریخ شروع نمی تواند بزرگتر از تاریخ پایان باشد.");
    } else {
      var timeStamps = [];
      var clocks = []
      var demands = [];
      datas.map(function (data) {
        if (data["MeterName"] == userId) {
          clocks.push(data["Clock_0-0_1_0_0_255_"]);
          timeStamps.push(data["Timestamp"]);
          demands.push(data["Current active demand-T_1-0_1_5_0_255_"]);
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
                backgroundColor: chartColor,
                borderColor: 'transparent',
                pointHoverBackgroundColor: '#4272d7',
                borderWidth: 0,
                data: demands
              }
            ]
          },
          options: {
            // Custom Tooltips
            tooltips: {
              callbacks: {
                label: function (tooltipItem, data) {
                  var clock = data.labels[tooltipItem.index];
                  var time = clock.split(" ")[1].substr(0, 8)
                  var value = tooltipItem.yLabel;
                  return (value + " - " + time);
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
            },
            elements: {
              point: {
                radius: 0,
                hitRadius: 10,
                hoverRadius: 4,
                hoverBorderWidth: 3
              }
            }
          }
        });
      }
    }
  }
}


function checkDateValidity(date) {
  var dateformat = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
  if (!date.match(dateformat)) {
    return false;
  } else {
    var day = date.substr(8);
    var month = date.substr(5, 2);
    var year = date.substr(0, 4);
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1300 || year > 1398){
     return false; 
    }
  }
  return true;
}


(function ($) {
  // USE STRICT
  "use strict";
  // Persian Date Picker
  try {

    $('#start-date').datepicker({
      // dateFormat: 'dd MM yy',
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
  // Scroll Bar
  try {
    var jscr1 = $('.js-scrollbar1');
    if(jscr1[0]) {
      const ps1 = new PerfectScrollbar('.js-scrollbar1');      
    }
  } catch (error) {
    console.log(error);
  }
})(jQuery);


(function ($) {
  // USE STRICT
  "use strict";
  // Dropdown 
  try {
    var menu = $('.js-item-menu');
    var sub_menu_is_showed = -1;

    for (var i = 0; i < menu.length; i++) {
      $(menu[i]).on('click', function (e) {
        e.preventDefault();
        $('.js-right-sidebar').removeClass("show-sidebar");        
        if (jQuery.inArray(this, menu) == sub_menu_is_showed) {
          $(this).toggleClass('show-dropdown');
          sub_menu_is_showed = -1;
        }
        else {
          for (var i = 0; i < menu.length; i++) {
            $(menu[i]).removeClass("show-dropdown");
          }
          $(this).toggleClass('show-dropdown');
          sub_menu_is_showed = jQuery.inArray(this, menu);
        }
      });
    }
    $(".js-item-menu, .js-dropdown").click(function (event) {
      event.stopPropagation();
    });
    $("body,html").on("click", function () {
      for (var i = 0; i < menu.length; i++) {
        menu[i].classList.remove("show-dropdown");
      }
      sub_menu_is_showed = -1;
    });
  } catch (error) {
    console.log(error);
  }

  var wW = $(window).width();
    // Right Sidebar
    var right_sidebar = $('.js-right-sidebar');
    var sidebar_btn = $('.js-sidebar-btn');

    sidebar_btn.on('click', function (e) {
      e.preventDefault();
      for (var i = 0; i < menu.length; i++) {
        menu[i].classList.remove("show-dropdown");
      }
      sub_menu_is_showed = -1;
      right_sidebar.toggleClass("show-sidebar");
    });

    $(".js-right-sidebar, .js-sidebar-btn").click(function (event) {
      event.stopPropagation();
    });

    $("body,html").on("click", function () {
      right_sidebar.removeClass("show-sidebar");
    });
 
  try {
    // Hamburger Menu
    $('.hamburger').on('click', function () {
      $(this).toggleClass('is-active');
      $('.navbar-mobile').slideToggle('500');
    });
    $('.navbar-mobile__list li.has-dropdown > a').on('click', function () {
      var dropdown = $(this).siblings('ul.navbar-mobile__dropdown');
      $(this).toggleClass('active');
      $(dropdown).slideToggle('500');
      return false;
    });
  } catch (error) {
    console.log(error);
  }
})(jQuery);


(function ($) {
  // USE STRICT
  "use strict";
  try {
    $('[data-toggle="tooltip"]').tooltip();
  } catch (error) {
    console.log(error);
  }
})(jQuery);