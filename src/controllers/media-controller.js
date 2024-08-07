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

    response  = await UtilitiesController.post('/wearables/api/file_download', {file_name}, true);

    return response
  });

}
