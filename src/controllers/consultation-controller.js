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

  static assignLiveChat = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v4/api/assign_live_chat`, data, true);
    return response
  });

  static assignAsyncChat = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v4/api/assign_async_chat`, data, true);
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

  static getCompletedConsultations = ConsultationController.exceptionWrapper(async (partner_id) => {
    let response = await UtilitiesController.get(`/v4/api/completed_consultations/${partner_id}`, {}, true);
    return response;
  });

  static getOnlineChatProviders = ConsultationController.exceptionWrapper(async ({ practice_id, partner_id }) => {
    let request_body          = { practice_id: practice_id, partner_id: partner_id };
    let response              = await UtilitiesController.post(`/v5/api/care/get/online_chat_providers`, request_body, true);
    let online_providers_data = response && response.data ? response.data : {};

    if (response.success) {
      return online_providers_data;
    }

    return response
  });

  static checkProviderPartnerLink = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.get(`/v4/api/provider_partner_linked/${data.provider_id}/${data.partner_id}`, {}, true);
    return response;
  });

  static sendCareConsultationMessage = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v3/api/care/chat_message`, data, true);
    return response
  });

  static getConsultationChatMessages = ConsultationController.exceptionWrapper(async (care_consultation_id) => {
    let response              = await UtilitiesController.get(`/v3/api/care/chat_messages/${care_consultation_id}`, {}, true);
    let consultation_messages = response && response.data ? response.data : {};
    return response
  });

  static submitCareConsultationFeedback = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v3/api/care_client/add_care_feedback`, data, true);
    return response
  });

  static getUpcomingVideoConsultations = ConsultationController.exceptionWrapper(async (partner_id) => {
    let response = await UtilitiesController.get(`/v4/api/video_upcoming_consultations/${partner_id}`, {}, true);
    return response;
  });

  static getClientChatConsultations = ConsultationController.exceptionWrapper(async (partner_id) => {
    let response = await UtilitiesController.get(`/v4/api/chat_consultations/${partner_id}`, {}, true);
    return response;
  });

  static createThread = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v5/api/care/new/client_thread`, data, true);
    return response;
  });

  static sendThreadMessage = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v5/api/care/new/consultation_message`, data, true);
    return response
  });

  static getThreadMessages = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v5/api/care/get/consultation_messages`, data, true);
    return response
  });

  static getActiveThreads = ConsultationController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v5/api/care/get/client_active_threads`, data, true);
    return response
  });
}
