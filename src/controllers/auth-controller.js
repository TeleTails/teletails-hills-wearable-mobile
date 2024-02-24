import { UtilitiesController } from '../controllers';
import { SELECTED_PARTNER } from '@env'
import { setItem, getItem }    from '../../storage';

export default class AuthController {

    static exceptionWrapper = (fn) => async (data) => {
      try {
        return await fn(data).catch((err) => { throw err });
      } catch (err) {
        return { success: false, error: err.message }
      }
    };

    static signOut = AuthController.exceptionWrapper(async () => {
        await AuthController.clearToken();
    });

    static clearToken = async (user) => {
      await setItem('token', '');
      await setItem('user_id', '');
      await setItem('user', {});
    }

    static setUser = async (user) => {
      console.log('user', user)
      let user_obj = {
        _id: user._id || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        photo_url: user.photo_url || '',
        phone_number: user.phone_number || '',
        zipcode: user.zipcode || ''
      }

      await setItem('user', user_obj);
    }

    static getLoggedInUser = AuthController.exceptionWrapper(async () => {
        let response = await UtilitiesController.get(`/v4/api/user`, {}, true);
        if (response.success && response.data) {
          await AuthController.setUser(response.data)
        }
        return response;
    });

    static getPartnerDetails = AuthController.exceptionWrapper(async () => {
        let response     = await UtilitiesController.get(`/v4/api/partner_details/${SELECTED_PARTNER}`, {}, true);
        let partner_id   = response && response.data && response.data.partner_details && response.data.partner_details._id  ? response.data.partner_details._id  : '';
        let partner_code = response && response.data && response.data.partner_details && response.data.partner_details.code ? response.data.partner_details.code : '';

        if (partner_id) {
          await setItem('partner_id', partner_id);
          await setItem('partner_code', partner_code);
        }
    });

    static getUser = async (get_new) => {

        if (get_new) {
          await AuthController.getLoggedInUser();
        }

        let user = await getItem('user');

        return user;
    }

    static singleEmailSignUpSignIn = AuthController.exceptionWrapper(async (data) => {
        let response = await UtilitiesController.post('/v4/signup_signin', data, true);
        return response;
    });

    static singleEmailSignUpSignInCodeVerify = AuthController.exceptionWrapper(async (data) => {
        let response = await UtilitiesController.post('/v4/signup_signin_verify', data, true);

        if(response.success) {
          let user_id = response.user_id || '';
          let token   = response.token   || '';

          await setItem('token', token);
          await setItem('user_id', user_id);

          await AuthController.getLoggedInUser();
        }

        return response;
    });
}
