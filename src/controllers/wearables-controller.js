import { AuthController, UtilitiesController } from '../controllers';
import { PARTNER_NAME } from '@env'
import { setItem, getItem }    from '../../storage';

export default class WearablesController {

  static exceptionWrapper = (fn) => async (data) => {
    try {
      return await fn(data).catch((err) => { throw err });
    } catch (err) {
      return { success: false, error: err.message }
    }
  };

  static validateAddress = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/validate_address`, data, true);
    return response;
  });

  static getAllFeedingPreferences = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_all_feeding_preferences`, {}, true);
    return response;
  });

  static getAllSpecies = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_all_species`, {}, true);
    return response;
  });

  static getAllDogBreeds = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_all_dog_breeds`, {}, true);
    return response;
  });

  static getAllCatBreeds = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_all_cat_breeds`, {}, true);
    return response;
  });

  static getDogFoodBrands = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_dog_food_brands`, {}, true);
    return response;
  });

  static getCatFoodBrands = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_cat_food_brands`, {}, true);
    return response;
  });

  static registerNewUser = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/register_wearables_user`, {}, true);
    return response;
  });

}
