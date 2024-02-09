import { AuthController, UtilitiesController } from '../controllers';
import { config }              from '../../config';
import { setItem, getItem }    from '../../storage';

export default class UserController {

  static exceptionWrapper = (fn) => async (data) => {
    try {
      return await fn(data).catch((err) => { throw err });
    } catch (err) {
      return { success: false, error: err.message }
    }
  };

  static completeUserSignUp = UserController.exceptionWrapper(async (data) => {
    let response = await UtilitiesController.post(`/v5/api/users/update/user`, data, false);

    if (response.success) {
      await AuthController.getLoggedInUser();
    }

    return response;
  });

  static updateProfile = UserController.exceptionWrapper(async (data) => {
      let response = await UtilitiesController.post(`/v4/api/user/update_profile`, data, true);

      if (response.success) {
        await AuthController.getLoggedInUser();
      }

      return response;
  });

  static updateProfileImage = UserController.exceptionWrapper(async (image) => {
    let response = await UtilitiesController.uploadFile(image, null, '/v4/api/user/upload_profile_image');

    return response
  });

  static getUserArticles = UserController.exceptionWrapper(async (data) => {
    let partner_name = config.partner_name;
    let response   = await UtilitiesController.get(`/v4/api/user/get_partner_articles/${partner_name}`, data, true);
    return response;
  });

  static getNewUserArticles = UserController.exceptionWrapper(async (data) => {
    let partner_name = config.partner_name;
    let response   = await UtilitiesController.get(`/v4/get_new_user_partner_articles/${partner_name}`, data, true);
    return response;
  });
}
