
const displayName = (parentObject) => {
  var name = '';
  if (parentObject && parentObject.name) {
    name = parentObject.name.charAt(0).toUpperCase() + parentObject.name.slice(1);
  }
  if (parentObject && parentObject.first_name) {
    name = name ? name + ' ' + sentenceCase(parentObject.first_name) : sentenceCase(parentObject.first_name)
  }
  if (parentObject && parentObject.last_name) {
    name = name + ' ' + sentenceCase(parentObject.last_name);
  }
  return name;
}

const sentenceCase = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const displayMoney = (amount) => {
  const amountInDollars = amount/100;
  return '$' + amountInDollars.toFixed(2);
}

const displayPhoneNumber = (numberStr) => {
  var displayString = '';
  var originalStringCounter = 0;
  for (var i = 0; i < numberStr.length + 2; i++) {
    if (i === 3) {
      displayString = displayString + '-';
    } else if (i === 7) {
      displayString = displayString + '-';
    } else {
      displayString = displayString + numberStr.charAt(originalStringCounter);
      originalStringCounter = originalStringCounter + 1;
    }
  }
  return displayString;
}

const displayCodePhoneNumber = (num_str) => {
  let str = num_str || '';
  let has_code = str && str.length > 2 && str[0] && str[1] && str[0] === '+' && str[1] === '1' ? true : false;
  let cleaned  = str;

  if (has_code) {
    if (str.length >= 12) {
      cleaned = '(' + str[2] + str[3] + str[4] + ') ' + str[5] + str[6] + str[7] + ' ' + str.substr(8);
    }
  }

  return cleaned;
}

const displayStringToKey = (display_string) => {
  let key_string  = '';
  let display_str = display_string || '';
      display_str = display_str.toLowerCase();

  let words       = display_str.split(' ');

  words.forEach((word, i) => {
    let is_last = i === words.length - 1;
    if (is_last) {
      key_string = key_string + word;
    } else {
      key_string = key_string + word + '_';
    }
  });

  return key_string;
}

const keyToDisplayString = (key_string) => {
  let display_string = '';
  let key_str        = key_string || '';
  let next_is_upper  = false;

  for (var i = 0; i < key_str.length; i++) {
    let char = key_str.charAt(i);
    if (next_is_upper) {
      char = char.toUpperCase();
      next_is_upper = false;
    }
    if (i === 0) {
      char = char.toUpperCase();
    }
    if (char === '_') {
      char = ' ';
      next_is_upper = true;
    }

    display_string  = display_string + char;
  }

  return display_string;
}

const getUserRolesString = (user_roles_object) => {
  if (!user_roles_object) {
    return '';
  }

  let roles        = user_roles_object;
  let allRolesText = '';
  let allRoles     = [];

  allRoles.push(roles.admin ? 'Admin' : '');
  allRoles.push(roles.vet   ?  'Veterinarian'     : '');
  allRoles.push(roles.behaviorist ? 'Behaviorist' : '');
  allRoles.push(roles.tech        ? 'Tech'        : '');
  allRoles.push(roles.front_desk  ? 'Front Desk'  : '');
  allRoles.push(roles.practice_manager ?  'Practice Manager' : '');
  allRoles.push(roles.practice_owner   ?  'Practice Owner'   : '');

  allRoles.forEach((roleText) => {
    if (allRolesText === '' && roleText !== '') {
      allRolesText = roleText;
    } else if (roleText !== '') {
      allRolesText = allRolesText + ' | ' + roleText;
    }
  })

  return allRolesText;
}

const displayGender = (gender_key) => {
  const genderKeys = {
    'MALE': 'Male',
    'FEMALE': 'Female',
    'MN': 'Male Neutered',
    'FS': 'Female Spayed',
  }

  return genderKeys[gender_key] || '';
}

const displayProviderName = (parentObject) => {
  var name = '';
  if (parentObject && parentObject.name) {
    name = parentObject.name.charAt(0).toUpperCase() + parentObject.name.slice(1);
  }
  if (parentObject && parentObject.first_name) {
    name = name + ' ' + sentenceCase(parentObject.first_name);
  }
  if (parentObject && parentObject.last_name && parentObject.last_name.length !== 3) {
    name = name + ' ' + sentenceCase(parentObject.last_name);
  }

  if (parentObject && parentObject.last_name && parentObject.last_name.length === 3) {
    name = name + ' ' + parentObject.last_name.toUpperCase();
  }

  return name;
}

const getMonthYear = (month_year_str) => {
  let full_str = month_year_str || '';
  let splitted = full_str.split('/');
  let month    = splitted && splitted[0] ? splitted[0] : '';
  let year     = splitted && splitted[1] ? splitted[1] : '';
  let full_obj = { month: month, year: year };
  return full_obj;
}

const partnerColorHex = (partner_details, type) => {
  let partner       = partner_details || {};
  let partner_name  = partner.name    || '';
  let partner_color = '#FD574A';

  switch (partner_name) {
    case 'wellpet':
      partner_color = '#4E348A';
      partner_color = type === 'secondary'   ? '#cf4a2a' : partner_color;
      partner_color = type === 'translucent' ? '#dbd6e7' : partner_color;
      break;
    case 'church&dwight':
      partner_color = '#BD0935';
      partner_color = type === 'secondary'   ? '#BD0935' : partner_color;
      partner_color = type === 'translucent' ? '#f1cdd6' : partner_color;
      break;
    case 'dodowell':
      partner_color = '#2FB3F8';
      partner_color = type === 'secondary'   ? '#75DC89' : partner_color;
      partner_color = type === 'translucent' ? '#d2effe' : partner_color;
      break;
    case 'ollie':
      partner_color = '#3A546F';
      partner_color = type === 'secondary'   ? '#728DB5' : partner_color;
      partner_color = type === 'translucent' ? '#c3cbd3' : partner_color;
      break;
    default:
      partner_color = type === 'translucent' ? '#feccc8' : partner_color;
// '21B1FB' blue
// 'd2effe' blue translucent
  }

  return partner_color;
}

const getPriceFromCents = (cents) => {
  let dollar;
  if(typeof cents === 'string') {
    cents = parseInt(cents);
  }

  dollar = Math.round(((cents / 100) + Number.EPSILON) * 100) / 100

  let dollar_str = dollar.toString();

  let dollar_tokens = dollar_str.split('.');

  if(dollar_tokens.length === 1) {
    return `${dollar_str}.00`;
  }

  if(dollar_tokens.length === 2) {
    if(dollar_tokens[1].length === 1) {
      return `${dollar_tokens[0]}.${dollar_tokens[1]}0`
    }

    if(dollar_tokens[1].length === 2) {
      return `${dollar_tokens[0]}.${dollar_tokens[1]}`
    }

    if(dollar_tokens[1].length === 0) {
      return `${dollar_tokens[0]}.00`
    }
  }

  return "0.00";
}

const validateExpirationDate = (str) => {
  if(str.length !== 5) { return false; }

  if(str.indexOf('/') === -1) { return false; }

  let exp_tokens = str.split('/');

  let month = exp_tokens[0];
  let year = exp_tokens[1];

  if(month.length !== 2) { return false; }
  if(year.length !== 2) { return false; }

  if(isNaN(month)) { return false; }
  if(isNaN(year)) { return false; }

  let exp_date = new Date(`${month}/28/${year}`);
  let date_now = new Date();

  if(exp_date < date_now) { return false; }

  return true;
}

const displayBirthdayAge = (mmddyyyy) => {
  if (!mmddyyyy) {
    return '';
  }

  let birth_date   = new Date(mmddyyyy);
  let today_date   = new Date();

  let total_months = parseInt((today_date.getTime() - birth_date.getTime()) / 2629746000);
  let year_number  = parseInt(total_months/12)
  let month_number = parseInt(total_months % 12)

  let date_string  = year_number > 0  ? year_number + ' Yr' : '';
      date_string  = year_number > 0  && month_number > 0 ? date_string + ' ' + month_number + ' Mo' : date_string;
      date_string  = year_number <= 0 && month_number > 0 ? month_number + ' Mo' : date_string;

  return date_string;
}

export default {
  displayBirthdayAge,
  displayGender,
  displayName,
  displayMoney,
  displayPhoneNumber,
  displayProviderName,
  displayStringToKey,
  displayCodePhoneNumber,
  getMonthYear,
  getUserRolesString,
  keyToDisplayString,
  sentenceCase,
  partnerColorHex,
  getPriceFromCents,
  validateExpirationDate
}
