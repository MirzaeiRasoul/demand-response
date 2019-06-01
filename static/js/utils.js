function numberFormat(num) {
  return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

function persianDateValidity(date) {
  var dateformat = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
  if (!date.match(dateformat)) {
    return false;
  } else {
    var day = date.substr(8, 2);
    var month = date.substr(5, 2);
    var year = date.substr(0, 4);
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1300 || year > 1398) {
      return false;
    }
  }
  return true;
}

function persianDateCompare(firstDate, secondDate) {
  var firstYear = Number(firstDate.substr(0, 4)),
    firstMonth = Number(firstDate.substr(5, 2)),
    firstDay = Number(firstDate.substr(8, 2));

  var secondYear = Number(secondDate.substr(0, 4)),
    secondMonth = Number(secondDate.substr(5, 2)),
    secondDay = Number(secondDate.substr(8, 2));

  var firstPersianDate = new persianDate([firstYear, firstMonth, firstDay]),
    secondPersianDate = new persianDate([secondYear, secondMonth, secondDay]);

  var diff = secondPersianDate.diff(firstPersianDate, 'days');
  return diff;
}