import { AuthController, UtilitiesController } from '../controllers';
import { config }           from '../../config';
import { setItem, getItem } from '../../storage';

export default class PetsController {

    static exceptionWrapper = (fn) => async (data) => {
      try {
        return await fn(data).catch((err) => { throw err });
      } catch (err) {
        return { success: false, error: err.message }
      }
    };

    static getPets = PetsController.exceptionWrapper(async () => {
      let response = await UtilitiesController.post('/v5/api/pets/get/pets', {}, true);
      return response;
    });

    static getPet = PetsController.exceptionWrapper(async (patient_id) => {
      let response = await UtilitiesController.post(`/v5/api/pets/get/pet`, { patient_id: patient_id }, true);
      return response;
    });

    static updatePet = PetsController.exceptionWrapper(async (data) => {
      let response = await UtilitiesController.post(`/v5/api/pets/update/pet`, data, true);
      return response;
    });

    static addPet = PetsController.exceptionWrapper(async (data) => {
      let response = await UtilitiesController.post(`/v5/api/pets/new/pet`, data, true);
      return response;
    })

    // Get the latest date that the pet food 
    static getLatestPetFoodUpdateDate = PetsController.exceptionWrapper(async () => {
      let response = await UtilitiesController.post('/v5/api/pets/get/pet_food_update_date', {}, true);
      console.log('response', response)
      return response && response.success && response.data ? response.data.last_pet_food_update : null;
    });

    static getPetFood = PetsController.exceptionWrapper(async () => {
      let response = await UtilitiesController.post('/v5/api/pets/get/pet_food_list', {}, true);
      return response && response.success ? response.data : [];
    });

    static getHealthEntries = PetsController.exceptionWrapper(async (data) => {
      let response = await UtilitiesController.post('/v5/api/care/get/health_entries', data, true);
      return response && response.success ? response.data : [];
    });

    static createHealthEntry = PetsController.exceptionWrapper(async (data) => {
      let response = await UtilitiesController.post('/v5/api/care/new/health_entry', data, true);
      return response && response.success ? response.data : [];
    });
    
}
