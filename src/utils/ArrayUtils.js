
const getArray = (obj) => {
  var array = [];
  if (obj) {
    const objectKeys = Object.keys(obj);
    array = objectKeys.map((key) => {
      return obj[key];
    }).filter((value) => { return value });
  }
  return array;
}

const getArrayForKeys = (obj, keys) => {
  var array = [];
  if (obj && keys && keys.length > 0) {
    keys.forEach((key) => {
      if (obj[key]) {
        array.push(obj[key]);
      }
    });
  }
  return array;
}

const getObjectWithKeyValue = (array, key, value) => {
  var arr = array || [];
  var obj = null;
  if (arr.length > 0) {
    arr.forEach((element) => {
      if (element && element[key] && element[key] === value) {
        obj = element;
      }
    })
  }
  return obj;
}

const isArray = (value) => {
  return value && typeof value === 'object' && value.constructor === Array;
}

const getSingleObject = (arr) => {
  if (arr && isArray(arr) && arr.length > 0 && arr[0]) {
    return arr[0];
  } else if (arr && typeof arr === 'object' && arr !== null) {
    return arr;
  } else {
    return {};
  }
}

const allKeysNotNull = (the_object) => {
  let keys = Object.keys(the_object);

  for(var i = 0; i < keys.length; i++) {
    console.log('the_object[keys[i]]', the_object[keys[i]])
    if(!the_object[keys[i]]) { return false; }
  }

  return true;
}

export default {
  getArray,
  getArrayForKeys,
  getObjectWithKeyValue,
  isArray,
  getSingleObject,
  allKeysNotNull
}
