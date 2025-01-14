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

  static validateSensorNumber = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/validate_sensor_nuber`, data, true);
    return response;
  });

  static assignSensor = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/assign_sensor`, data, true);
    return response;
  });

  static updateSensor = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/update_sensor`, data, true);
    return response;
  });

  static completeManually = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/complete_manually`, data, true);
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

  static getBfiImagePositions = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_bfi_image_positions`, {}, true);
    return response;
  });

  static checkPetUnique = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/check_pet_unique`, data, true);
    return response;
  });

  static registerNewUser = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/register_wearables_user`, {}, true);
    return response;
  });

  static addNewPet = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/add_new_pet`, data, true);
    return response;
  });

  static getUserProfile = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_user_profile`, {}, true);
    return response;
  });

  static getUserPets = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_user_pets`, {}, true);
    return response;
  });

  static getWearablesPet = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_wearables_pet`, data, true);
    return response;
  });

  static addPetWeight = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/add_pet_weight`, data, true);
    return response;
  });

  static getPetWeightHistory = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_pet_weight_history`, data, true);
    return response;
  });

  static getPetBehavior = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/get_pet_behavior`, data, true);
    return response;
  });

  static getRecommendedDiet = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/recommended_diet`, data, true);
    return response;
  });

  static getPetIntake = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/intake`, data, true);
    return response;
  });

  static getPetIntakeConfig = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/intake_config`, data, true);
    return response;
  });

  static addPetIntake = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/add_intake`, data, true);
    return response;
  });

  static deletePetIntake = WearablesController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/wearables/api/intake_delete`, data, true);
    return response;
  });

}
