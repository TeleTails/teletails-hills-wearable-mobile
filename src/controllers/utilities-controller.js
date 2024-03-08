import { CHAT_URL, API_URL, NOTIF_URL } from '@env'
import { getItem, setItem } from '../../storage';
import io from 'socket.io-client';

let sockets = {};

export default class UtilitiesController {

  static postExceptionWrapper = (fn) => async (url, body, internal, clearContentType) => {
    try {
      return await fn(url, body, internal, clearContentType).catch((err) => {
        throw err;
      });
    } catch (err) {
      console.log('endpoint err', err);
      return await UtilitiesController.getError_SaveError({err, url, body, internal, clearContentType});
    }
  };

  static getError_SaveError = async ({err, url, body, internal, clearContentType}) => {
    let error = { success: false }

    if(err.app_error) {
        error = {...error, error: err.app_error }

        if(err.already_exists) {
            error = { ...error, data: { already_exists: true } }
        }
    } else {
        error = { ...error, error: err.message ? err.message : JSON.stringify(err) }
    }

    // TODO: call endpoint to save error

    return error;
  }

  static getSocket({query, name, notification}) {

    let the_socket = sockets[name];

    if(!the_socket || !the_socket.connected) {
      let chat_url = UtilitiesController.getUrl('', !notification, notification);

      let options = {
        query,
      }

      // if(chat_url.indexOf('localhost') === -1) {
        options = {
          ...options,
          path: notification ? '/notifications' : '/chat'
        }
      // }

      console.log('chat_url', chat_url, options);

      the_socket = io(chat_url, options);

      the_socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
        console.log(err)
      });

      sockets = {
        ...sockets,
        [name]: the_socket
      }
    }

    return the_socket;
  }

  static getUrl(url, useChat = false, useNotif = false) {
    if(useChat) {
      return `${CHAT_URL}${url}`
    } else if(useNotif) {
      return `${NOTIF_URL}${url}`
    } else {
      return `${API_URL}${url}`
    }
  }

  static getChatUrl() {
    return UtilitiesController.getUrl('', true);
  }

  static async getToken() {
    let stored_token = getItem('token');
    let token        = stored_token || '';
    //token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjNkMDUyYzkzZGI0MDExYjk2NTU3YzBlIiwicm9sZSI6IkNMSUVOVCIsImhvc3RfbmFtZSI6ImhpbGxzIiwiaWF0IjoxNzA5MjQ1OTg0LCJleHAiOjE3ODcwMDU5OTF9.0xJHAZYWr6t-gMMq4yvipmsJikG1sJ_aRNaa81cKWLc'
    return token;
  }

  static post = UtilitiesController.postExceptionWrapper(async (url, body, internal, clearContentType) => {
      if(internal) url = UtilitiesController.getUrl(url, false);

      let token = await UtilitiesController.getToken();

      let headers = {
          Accept: 'application/json',
          Authorization: token
      }

      if(!clearContentType) {
        headers = {
          ...headers,
          'Content-Type': 'application/json',
        }
      } else {
        headers = {
          ...headers,
          'Content-Type': 'multipart/form-data'
        }
      }

      console.log('headers', headers);
      console.log('url', url);
      console.log('body', body);

      let response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      console.log('response', )

      let res = await response.json();

      if(!res.success) {
        if(res.message === 'jwt expired') {
          res.error = 'Your session has expired. Please log in.'
        } else {
          res.error = res.error;
        }
      }

      if (!res || !res.success) {

      }

      return res;
  })

  static put = UtilitiesController.postExceptionWrapper(async (url, body, internal, clearContentType) => {
    if(internal) url = UtilitiesController.getUrl(url, false);

    let token = await UtilitiesController.getToken();

    let headers = {
        Accept: 'application/json',
        Authorization: token
    }

    if(!clearContentType) {
      headers = {
        ...headers,
        'Content-Type': 'application/json',
      }
    } else {
      headers = {
        ...headers,
        'Content-Type': 'multipart/form-data'
      }
    }

    let response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });

    let res = await response.json();

    if(!res.success) {
      if(res.message === 'jwt expired') {
        res.error = 'Your session has expired. Please log in.'
      } else {
        res.error = res.error;
      }
    }

    if (!res || !res.success) {

    }

    return res;
  })

  static async get(url, data, internal) {
    try {

      if(internal) url = UtilitiesController.getUrl(url, false);

      let token = await UtilitiesController.getToken();

      let response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token
        }
      });

      // console.log('GET to: ', url);
      // console.log('token: ', token);

      let res = await response.json();

      // console.log('GET response: ', res);

      if(!res.success) {
        if(res.message === 'jwt expired') {
          res.error = 'Your session has expired. Please log in.'
        }
      }

      if (!res || !res.success) {

      }

      return res;
    } catch(err) {
      console.log(err);
      // alert('The server is updating. Please wait a few seconds.', err);
    }
  }

  static async update(url, body, internal) {
    try {

      if(internal) url = UtilitiesController.getUrl(url, false);

      // console.log('UPDATE to: ', url);
      // console.log('UPDATE BODY', body);

      let token = await UtilitiesController.getToken();

      let response = await fetch(url, {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify(body)
      });

      let res = await response.json();

      if(!res.success) {
        if(res.message === 'jwt expired') {
          res.error = 'Your session has expired. Please log in.'
        } else {
          res.error = res.error
        }
      }

      // console.log('UPDATE Response', res);

      return res;
    } catch(err) {
      console.log(err);
    }
  }

  static futch = (url, opts={}, onProgress) => {
    // console.log(url, opts)
    return new Promise( (res, rej)=>{
        var xhr = new XMLHttpRequest();
        xhr.open(opts.method || 'get', url);
        for (var k in opts.headers||{})
            xhr.setRequestHeader(k, opts.headers[k]);
        xhr.onload = e => res(e.target);
        xhr.onerror = rej;
        if (xhr.upload && onProgress)
            xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
        xhr.send(opts.body);
    });
  }

  static async uploadFile(image, values, url) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = new FormData();

        if(image) {
          data.append('file', {
            uri: image,
            type: image.type,
            name: 'image_from_care_mobile',
          });
        }

        if(values) {
          data.append('values', JSON.stringify(values));
        }

        let token = await UtilitiesController.getToken();

        this.futch(UtilitiesController.getUrl(url), {
          method: 'post',
          headers: {
            Authorization: token
          },
          body: data
        }, (progressEvent) => {
          let progress = progressEvent.loaded / progressEvent.total;
          console.log('progress', progress)
        }).then(async (res, err) => {
          if(err) {
            console.log("err", err);
            reject(err);
          } else {
            console.log("upload response", res._response);
            let response = JSON.parse(res._response)
            resolve(response);
          }
        });
      } catch(err) {
        reject({
          success: false,
          error: err
        });
      }
    });
  }

  static async uploadImageWithValues(data, url) {
    return new Promise(async (resolve, reject) => {
      try {
        let token = await UtilitiesController.getToken();

        url = UtilitiesController.getUrl(url);

        console.log('url', url)

        this.futch(url, {
          method: 'post',
          headers: {
            Authorization: token
          },
          body: data
        }, (progressEvent) => {
          let progress = progressEvent.loaded / progressEvent.total;
          console.log('progress', progress)
        }).then(async (res, err) => {
          if(err) {
            console.log("err", err);
            reject(err);
          } else {
            console.log("upload response", res._response);
            let response = JSON.parse(res._response)
            resolve(response);
          }
        });
      } catch(err) {
        reject({
          success: false,
          error: err
        });
      }
    });
  }

  static getTodayString = () => {
    return (new Date()).toLocaleDateString()
  }

  static isToday = (date_to_check) => {
    return UtilitiesController.getTodayString() === date_to_check;
  }
}
