import React from 'react';
import { AuthController, UtilitiesController } from '../controllers';
import { setItem, getItem } from '../../storage';

export default class MediaController {

  static exceptionWrapper = (fn) => async (data) => {
      try {
          return await fn(data).catch((err) => {
              throw err;
          });
      } catch (err) {
          return {
              success: false,
              error: err.message
              }
      }
  };

  static uploadMediaFromLibrary = MediaController.exceptionWrapper(async (image) => {
    let response;

    let mobile_upload = image.length > 4 && image.substring(0, 5) === 'file:';

    if(!mobile_upload) {
      response  = await UtilitiesController.post('/api/mobile_file/caremobileuploads', {image}, true);
    } else {
      response  = await UtilitiesController.uploadFile(image, null, '/api/file/caremobileuploads');
    }
    return response
  });

  static uploadWearablesMediaFromLibrary = MediaController.exceptionWrapper(async (image) => {
    let response;

    let mobile_upload = image.length > 4 && image.substring(0, 5) === 'file:';

    console.log('mobile_upload', mobile_upload)
    if(!mobile_upload) {
      response  = await UtilitiesController.post('/wearables/api/file_upload/uploads', {image}, true);
    } else {
      response  = await UtilitiesController.uploadFile(image, null, '/wearables/api/file/uploads');
    }
    return response
  });

  static downloadWearablesMedia = MediaController.exceptionWrapper(async (file_name) => {
    let response;

    response  = await UtilitiesController.post('/api/file_download', {file_name}, true);

    return response
  });

  static uploadPrivateMediaFromLibrary = MediaController.exceptionWrapper(async (image) => {
    let response;

    let mobile_upload = image.length > 4 && image.substring(0, 5) === 'file:';

    console.log('mobile_upload', mobile_upload)
    if(!mobile_upload) {
      response  = await UtilitiesController.post('/api/private_file_upload/uploads/hills', {image}, true);
    } else {
      response  = await UtilitiesController.uploadFile(image, null, '/api/private_file/uploads/hills');
    }
    return response
  });

  static downloadPrivateMedia = MediaController.exceptionWrapper(async (file_name) => {
    let response;

    response  = await UtilitiesController.post('/api/private_file_download', {file_name, partner_name: 'hills'}, true);

    return response
  });

  static downloadPrivateMediaFromObject = MediaController.exceptionWrapper(async (data) => {
    let response;

    response  = await UtilitiesController.post('/v5/api/care/retrieve_media', data, true);
console.log('response', response)
    return response && response.data ? response.data : {};
  });

}
