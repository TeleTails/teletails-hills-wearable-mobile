import React, { Component } from 'react';
import * as ImagePicker     from 'expo-image-picker';
import { MediaController }  from '../controllers';
import { Platform, StyleSheet, View, TouchableOpacity, Modal, Image, TouchableWithoutFeedback } from 'react-native';
import { Button, Icon, Colors, Text } from '../components';
import { Video } from 'expo-av';

class MediaModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading_preview: false,
      loading_upload: false,
      upload_object: null,
      photo_uri: '',
      video_uri: '',
      uploaded_url: '',
    }
  }

  render() {
    let hide_select_button = this.state.photo_uri !== '' || this.state.video_uri !== '';

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={ this.props.display }
        onRequestClose={() => {
          this.props.close_action();
        }}>

        <TouchableWithoutFeedback onPress={ () => { this.props.close_action() }}>
          <View style={styles.outer_container}>
            <TouchableWithoutFeedback onPress={ () => {  }}>
              <View style={styles.content_container}>
                <TouchableOpacity style={styles.close_button_container} onPress={ () => { this.props.close_action() }}>
                  <Icon name='times-circle' />
                </TouchableOpacity>

                { this.state.photo_uri ? <TouchableOpacity onPress={ () => { this.setState({ uploaded_url: null, photo_uri: '', video_uri: '' }) }}>
                                           <Image style={styles.preview_style} source={{ uri: this.state.photo_uri }} />
                                         </TouchableOpacity>
                                       : null }
                { this.state.video_uri ? <Video style={styles.preview_style}
                                                source={{
                                                  uri: this.state.video_uri,
                                                }}
                                                useNativeControls
                                                resizeMode="contain"
                                                isLooping
                                              />
                                       : <View></View> }

                { hide_select_button ? null
                                     : <View style={{ height: 230 }}>
                                        <TouchableOpacity style={styles.upload_button_container}
                                                         onPress={ () => { this.launch_media_selector() }}>
                                          { this.state.loading_preview ? <Text>Loading...</Text>
                                                                       : <Icon name='home' size={30}   /> }
                                          <Text style={styles.upload_button_text}>Photo Library</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.camera_button_container}
                                                         onPress={ () => { this.launch_camera() }}>
                                          { this.state.loading_preview ? <Text>Loading...</Text>
                                                                       : <Icon name='home' size={22}   /> }
                                          <Text style={styles.upload_button_text}>Camera</Text>
                                        </TouchableOpacity>
                                       </View>
                                      }

                <View style={styles.primary_button_container}>
                  <Button title={ this.props.button_title || 'Send Media' }
                          loading={this.state.loading_upload}
                          icon={'paperclip'}
                          onPress={ () => {
                            let media_url  = '';
                            let media_type = 'video';
                            if (this.props.media_action) {
                              this.setState({ loading_upload: true }, async () => {

                                let upload_object = this.state.upload_object;
                                let media_type    = upload_object.type;
                                let media_uri     = upload_object.uri;

                                let upload_response = await MediaController.uploadMediaFromLibrary(media_uri);
                                let is_success      = upload_response && upload_response.success ? true : false;
                                let uploaded_url    = is_success && upload_response && upload_response.message && upload_response.message.Location ? upload_response.message.Location : '';

                                this.setState({ loading_upload: false });

                                if (is_success) {
                                  this.props.media_action({ type: media_type, url: uploaded_url });
                                }
                              });

                            }
                          }}/>
                </View>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>

      </Modal>
    );
  }

  launch_media_selector = async () => {
    let permission_result = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission_result.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    this.setState({ loading_preview: true }, async () => {

      let result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.All,
         allowsEditing: true,
         aspect: [4, 3],
         quality: 1,
         base64: true,
       });

      let image_uri = '';
      let video_uri = '';

      let data = result && result.uri ? result.uri : null;
      delete result.base64;
      //ex: data:image/png;base64,

      if(Platform.OS === 'web') {
        if(data.indexOf(':image') !== -1) {
          result = {
            ...result,
            type: 'image'
          }
          image_uri = result.uri;
        } else if(data.indexOf(':video') !== -1) {
          result = {
            ...result,
            type: 'video'
          }
          video_uri = result.uri;
        }
      } else {
          image_uri = result.type === 'image' ? result.uri : '';
          video_uri = result.type === 'video' ? result.uri : '';
       }

       this.setState({ loading_preview: false, upload_object: result, photo_uri: image_uri, video_uri });
    });
  }

  launch_camera = async () => {
    let camera_result = await ImagePicker.requestCameraPermissionsAsync();
    let roll_result   = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (camera_result.granted === false || roll_result.granted === false) {
      alert("Permission to camera and photo library is required!");
      return;
    }

    this.setState({ loading_preview: true }, async () => {

      let result = await ImagePicker.launchCameraAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.All,
         allowsEditing: true,
         aspect: [4, 3],
         quality: 1,
         base64: true
       })

       let image_uri = '';
       let video_uri = '';

       image_uri = result.type === 'image' ? result.uri : '';
       video_uri = result.type === 'video' ? result.uri : '';

       this.setState({ loading_preview: false, upload_object: result, photo_uri: image_uri, video_uri: video_uri });
    });
  }

}

const styles = StyleSheet.create({
  close_button_container: {
    alignItems: 'flex-end'
  },
  content_container: {
    backgroundColor: 'white',
    height: 380,
    width: '90%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#e7e7e7',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20
  },
  outer_container: {
    backgroundColor: 'rgba(0,0,0, 0.2)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  preview_style: {
    height: 200,
    width: 300,
    borderRadius: 20,
    marginTop: 30,
    alignSelf: 'center'
  },
  primary_button_container: {
    marginTop: 30
  },
  camera_button_container: {
    backgroundColor: '#f5f5f5',
    height: 80,
    width: 200,
    borderRadius: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 15,
    flexDirection: 'row',
    paddingLeft: 20
  },
  upload_button_container: {
    backgroundColor: '#f5f5f5',
    height: 80,
    width: 200,
    borderRadius: 15,
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 30,
    flexDirection: 'row',
    paddingLeft: 20
  },
  upload_button_text: {
    fontWeight: '500',
    color: '#454545',
    marginLeft: 20
  }
});

export default MediaModal
