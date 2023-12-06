import { AuthController, UtilitiesController } from '../controllers';
import { config }           from '../../config';
import { setItem, getItem } from '../../storage';

export default class ConsultationController {

  static exceptionWrapper = (fn) => async (data) => {
    try {
      return await fn(data).catch((err) => { throw err });
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  static getCareConsultationDetails = ConsultationController.exceptionWrapper(async (care_consultation_id) => {
    let response = await UtilitiesController.get(`/v3/api/care/care_consultation_details/${care_consultation_id}`, {}, true);
    return response
  });

  static createCareConsultation = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post('/v5/api/care/new/blank_consultation', data, true);
    return response
  });

  static assignVideoAppointment = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v4/api/assign_video_appointment`, data, true);
    return response
  });

  static cancelVideoConsultation = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v3/api/care_client/cancel_care_consultation`, data, true);
    return response
  });

  static getClientResolveConsultation = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v4/api/client_resolve_consultation`, data, true);
    return response;
  });
  
  static getIntakeQuestions = ConsultationController.exceptionWrapper(async (params) => {
    let practice_id = config.practice_id;
    let partner_id  = config.partner_id;
    let response    = await UtilitiesController.post(`/v5/api/care/get/intake_questions`, { practice_id, partner_id }, true);
    let questions   = response && response.data && response.data.questions ? response.data.questions : [];
    return questions
  });

  static createIntakeResponse = ConsultationController.exceptionWrapper(async (data) => {
    let response  = await UtilitiesController.post('/v5/api/care/new/intake_response', data, true);
    return response
  });

  static getAvailableSlots = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v3/api/care_client/available_appointment_slots`, data, true);

    if (response && response.success && response.data && response.data.availability_slots) {
      return response.data.availability_slots;
    }

    return response
  });

}
