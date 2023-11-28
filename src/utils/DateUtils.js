const getConstants = () => {
  var constants = {
    'MONTHS_SHORT': {
      0: 'Jan',
      1: 'Feb',
      2: 'Mar',
      3: 'Apr',
      4: 'May',
      5: 'Jun',
      6: 'Jul',
      7: 'Aug',
      8: 'Sep',
      9: 'Oct',
      10: 'Nov',
      11: 'Dec',
    },
    'MONTHS_LONG' : {
      0: 'January',
      1: 'February',
      2: 'March',
      3: 'April',
      4: 'May',
      5: 'June',
      6: 'July',
      7: 'August',
      8: 'September',
      9: 'October',
      10: 'November',
      11: 'December',
    },
    'MILITARY_TO_REGULAR': {
      13: 1,
      14: 2,
      15: 3,
      16: 4,
      17: 5,
      18: 6,
      19: 7,
      20: 8,
      21: 9,
      22: 10,
      23: 11,
      0: 12,
    },
    'WEEK_DAYS_SHORT': {
      0: 'Sun',
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
      6: 'Sat',
    },
    'WEEK_DAYS_LONG' : {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',

    },

  }
  return constants;
}

// Milliseconds since Epoch
const getDateTime = (dateTime) => {
  const constants = getConstants();
  const date = new Date(dateTime);
  return date.getTime();
}

// Nov, Dec. Jan etc.
const getShortMonth = (dateTime) => {
  const constants = getConstants();
  const date = new Date(dateTime);
  const shortMonth = constants.MONTHS_SHORT[date.getMonth()];
  return shortMonth;
}

// November, December, January etc.
const getLongMonth = (dateTime) => {
  const constants = getConstants();
  const date = new Date(dateTime);
  const longMonth = constants.MONTHS_LONG[date.getMonth()];
  return longMonth;
}

// Mon, Tue, Wed etc.
const getShortWeekday = (dateTime) => {
  const constants = getConstants();
  const date = new Date(dateTime);
  const shortWeekDay = constants.WEEK_DAYS_SHORT[date.getDay()];
  return shortWeekDay;
}

// Monday, Tuesday, Wednesday etc.
const getLongWeekday = (dateTime) => {
  const constants = getConstants();
  const date = new Date(dateTime);
  const weekDay = constants.WEEK_DAYS_LONG[date.getDay()];
  return weekDay;
}

// 3, 21, 5, etc.
const getDateNumber = (dateTime) => {
  const date = new Date(dateTime);
  const dateNumber = date.getDate();
  return dateNumber;
}

const getMonthNumber = (dateTime) => {
  const date = new Date(dateTime);
  const monthNumber = date.getMonth() + 1;
  return monthNumber;
}

// 12:40 PM
const getTime = (dateTime) => {
  const constants = getConstants();
  const date = new Date(dateTime);
  const hours = date.getHours() > 12 || date.getHours() === 0 ? constants.MILITARY_TO_REGULAR[date.getHours()] : date.getHours()
  const minutes = date.getMinutes().toString().length == 1 ? '0' + date.getMinutes() : date.getMinutes()
  const seconds = date.getSeconds().toString().length == 1 ? '0' + date.getSeconds() : date.getSeconds()
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return hours + ':' + minutes + ' ' + ampm;
}

const getHoursString = (dateTime) => {
  const constants = getConstants();
  const date = new Date(dateTime);
  const hours = date.getHours() > 12 || date.getHours() === 0 ? constants.MILITARY_TO_REGULAR[date.getHours()] : date.getHours()
  return hours;
}

const getMilitaryHoursString = (dateTime) => {
  const constants = getConstants();
  const date = new Date(dateTime);
  const hours = date.getHours().toString();
  return hours;
}

const militaryToRegular = (military) => {
  let constants = getConstants();
  let hours     = military > 12 || military === 0 ? constants.MILITARY_TO_REGULAR[military] : military;
  return hours;
}

const getMinutesString = (dateTime) => {
  const date = new Date(dateTime);
  const minutes = date.getMinutes().toString().length == 1 ? '0' + date.getMinutes() : date.getMinutes()
  return minutes;
}

const getAMPMString = (dateTime) => {
  const date = new Date(dateTime);
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return ampm;
}

// 2017, 2018, etc.
const getYear = (dateTime) => {
  const date = new Date(dateTime);
  const year = date.getFullYear()
  return year;
}

const getUTCDateTime = () => {
  const nowDate = new Date();
  const nowUTC = Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate(),
    nowDate.getUTCHours(), nowDate.getUTCMinutes(), nowDate.getUTCSeconds(), nowDate.getUTCMilliseconds());
  return nowUTC;
}

const getCurrentUTCDate = () => {
   var now = new Date();
   var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
   return utc;
}

const getCurrentUTCHour = () => {
  var now = new Date();
  var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  return utc.getHours();
}

const getDatabaseEndpointDateFormat = () => {
  var now = new Date();
  var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const shortMonth = getShortMonth(utc).toLowerCase();
  const day = getDateNumber(utc)
  const year = getYear(utc)
  const formattedDateString = shortMonth + '-' + day + '-' + year;
  return formattedDateString;
}

const getDayBeginning = () => {
  var now = new Date();
  var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  utc.setHours(0,0,0,0);
  return utc.getTime() - now.getTimezoneOffset() * 60000;
}

const getCurrentHourQuarterNumber = () => {
  var now = new Date();
  var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const minuteNumber = utc.getMinutes();
  if (minuteNumber >= 0 && minuteNumber < 15) {
    return 1;
  }
  if (minuteNumber >= 15 && minuteNumber < 30) {
    return 2;
  }
  if (minuteNumber >= 30 && minuteNumber < 45) {
    return 3;
  }
  if (minuteNumber >= 45 && minuteNumber <= 59) {
    return 4;
  }
}

const getCurrentMinute = () => {
  var now = new Date();
  var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const minuteNumber = utc.getMinutes();
  return minuteNumber;
}

const getNextQuarterTime = (dateTime) => {
  const now = new Date(dateTime);
  var newDate = new Date(dateTime);
  const minuteNumber = now.getMinutes();
  if (minuteNumber >= 0 && minuteNumber < 15) {
    newDate.setHours(now.getHours(), 15, 0, 0);
  }
  if (minuteNumber >= 15 && minuteNumber < 30) {
    newDate.setHours(now.getHours(), 30, 0, 0);
  }
  if (minuteNumber >= 30 && minuteNumber < 45) {
    newDate.setHours(now.getHours(), 45, 0, 0);
  }
  if (minuteNumber >= 45 && minuteNumber <= 59) {
    newDate.setHours(now.getHours() + 1, 0, 0, 0);
  }
  return newDate;
}

const getDifferenceBetweenDateAndNextQuarter = (dateTime) => {
  const now = new Date(dateTime);
  var newDate = new Date(dateTime);
  const minuteNumber = now.getMinutes();
  if (minuteNumber >= 0 && minuteNumber < 15) {
    newDate.setHours(now.getHours(), 15, 0, 0);
  }
  if (minuteNumber >= 15 && minuteNumber < 30) {
    newDate.setHours(now.getHours(), 30, 0, 0);
  }
  if (minuteNumber >= 30 && minuteNumber < 45) {
    newDate.setHours(now.getHours(), 45, 0, 0);
  }
  if (minuteNumber >= 45 && minuteNumber <= 59) {
    newDate.setHours(now.getHours() + 1, 0, 0, 0);
  }

  var _second = 1000;
  var _minute = _second * 60;
  var _hour = _minute * 60;
  var _day = _hour * 24;

  var distance = newDate - now;
  var days = Math.floor(distance / _day);
  var hours = Math.floor((distance % _day) / _hour);
  var minutes = Math.floor((distance % _hour) / _minute);
  var seconds = Math.floor((distance % _minute) / _second);

  seconds = seconds.toString().length == 1 ? '0' + seconds : seconds;

  const timeDifference = {
    minutes: minutes,
    seconds: seconds,
  }
  return timeDifference
}

const getDatesFromXDaysAgo = (numberOfDays) => {
  var today = new Date(getDayBeginning());
  var newDate = new Date(today);
  newDate.setDate(today.getDate() - numberOfDays);
  return newDate;
}

const getDatabaseEndpointDateFormatForDate = (dateTime) => {
  var now = new Date(dateTime);
  var utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const shortMonth = getShortMonth(utc).toLowerCase();
  const day = getDateNumber(utc)
  const year = getYear(utc)
  const formattedDateString = shortMonth + '-' + day + '-' + year;
  return formattedDateString;
}

const getCareSlotIndex = (dateTime) => {
  let date     = new Date(dateTime);
  let year_str = getYear(date).toString();
  let date_str = getDateNumber(date).toString();
  let hour_str = date.getHours().toString();
  let min_str  = date.getMinutes().toString();
  return year_str + '_' + date_str + '_' + hour_str + '_' + min_str;
}

const delay = async (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export default {
  delay,
  getCareSlotIndex,
  getDateTime,
  getShortMonth,
  getLongMonth,
  getMilitaryHoursString,
  getMonthNumber,
  getShortWeekday,
  getLongWeekday,
  getDateNumber,
  getTime,
  getHoursString,
  getMinutesString,
  getAMPMString,
  getYear,
  getUTCDateTime,
  getCurrentUTCDate,
  getCurrentUTCHour,
  getDatabaseEndpointDateFormat,
  getDayBeginning,
  getCurrentHourQuarterNumber,
  getNextQuarterTime,
  getDifferenceBetweenDateAndNextQuarter,
  getDatesFromXDaysAgo,
  getDatabaseEndpointDateFormatForDate,
  militaryToRegular,
}
