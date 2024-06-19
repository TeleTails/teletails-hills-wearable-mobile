import AsyncStorage from '@react-native-async-storage/async-storage';

let clearStorate = async () => {
  await AsyncStorage.clearStorate();
}

let setItem = async (key, value) => {
  try {
    let storage = await AsyncStorage.getItem('storage');

    if (!storage) {
      let new_storage_obj  = {};
      new_storage_obj[key] = value;
      let stringified      = JSON.stringify(new_storage_obj);
      await AsyncStorage.setItem('storage', stringified);
    }

    if (storage) {
      let storage_obj  = JSON.parse(storage);
      storage_obj[key] = value;
      let stringified  = JSON.stringify(storage_obj);
      await AsyncStorage.setItem('storage', stringified);
    }
  } catch (err) {
    console.log("Save Error:")
    console.log(err)
  }
}

let getItem = async (key) => {
  try  {
    let storage     = await AsyncStorage.getItem('storage');
    let storage_obj = JSON.parse(storage);

    if (storage && storage_obj && storage_obj[key] !== null) {
      return storage_obj[key];
    }

    return null;
  } catch (err) {
    return null;
  }
}

let deleteItem = async (key) => {
  try  {
    let storage     = await AsyncStorage.getItem('storage');
    let storage_obj = JSON.parse(storage);

    if (storage && storage_obj && storage_obj[key] !== null) {
      await AsyncStorage.removeItem(key)
    }

    return null;
  } catch (err) {
    return null;
  }
}

export {
  setItem,
  getItem,
  deleteItem,
  clearStorate
}
