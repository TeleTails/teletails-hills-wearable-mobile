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
                  <Icon name='close' color={Colors.PRIMARY} />
                </TouchableOpacity>

                { this.state.photo_uri ? <TouchableOpacity style={{ height: 250, width: '100%', marginTop: 10 }} onPress={ () => { this.setState({ uploaded_url: null, photo_uri: '', video_uri: '' }) }}>
                                           <Image style={styles.preview_style} resizeMode='contain' source={{ uri: this.state.photo_uri }} />
                                         </TouchableOpacity>
                                       : null }
                { this.state.video_uri ? <View style={{ height: 250, width: '100%', marginTop: 10 }}>
                                          <Video style={styles.preview_style}
                                                source={{
                                                  uri: this.state.video_uri,
                                                }}
                                                useNativeControls
                                                resizeMode="contain"
                                                isLooping
                                              />
                                         </View>
                                       : <View></View> }

                { hide_select_button ? null
                                     : <View style={{ height: 260, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>

                                        <TouchableOpacity style={styles.upload_button_container} onPress={ () => { this.launch_media_selector() }}>
                                          <View style={styles.icon_container}>
                                            <Icon name='photo-gallery' size={26} color={Colors.PRIMARY} />
                                          </View>
                                          <Text style={styles.button_title}>Photo</Text>
                                          <Text style={styles.button_title}>Library</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.upload_button_container} onPress={ () => { this.launch_camera() }}>
                                           <View style={styles.icon_container}>
                                             <Icon name='camera' size={26} color={Colors.PRIMARY} />
                                           </View>
                                           <Text style={styles.button_title}>Take</Text>
                                           <Text style={styles.button_title}>Photo</Text>
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
                            this.setState({ loading_upload: true }, async () => {
                                let upload_object = this.state.upload_object;
                                let media_type    = upload_object.type;
                                let media_uri     = upload_object.uri;

                                if (this.props.media_action) {
                                    if(!this.props.keep_as_local) {
                                      let upload_response = await MediaController.uploadMediaFromLibrary(media_uri);
                                      let is_success      = upload_response && upload_response.success ? true : false;
                                      let uploaded_url    = is_success && upload_response && upload_response.message && upload_response.message.Location ? upload_response.message.Location : '';

                                      if (is_success) {
                                        this.props.media_action({ type: media_type, url: uploaded_url });
                                      }
                                    } else {
                                      this.props.media_action({ type: media_type, url: media_uri });
                                    }
                                }
                                this.setState({
                                  photo_uri: '',
                                  video_uri: '',
                                  loading_upload: false,
                                  upload_object: null
                                })
                              });
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
  button_title: {
    fontWeight: 'medium',
    fontSize: 15
  },
  close_button_container: {
    alignItems: 'flex-end'
  },
  content_container: {
    backgroundColor: 'white',
    height: 390,
    width: '90%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#e7e7e7',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20
  },
  icon_container: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#DBE6F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  outer_container: {
    backgroundColor: 'rgba(0,0,0, 0.2)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  preview_style: {
    height: '100%',
    width: '100%',
    borderRadius: 20,
    alignSelf: 'center'
  },
  primary_button_container: {
    marginTop: 10
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
    width: 160,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    height: 130,
    width: 103,
    marginRight: 5,
    marginLeft: 5
  },
  upload_button_text: {
    fontWeight: '500',
    color: '#454545',
    marginLeft: 20
  }
});

export default MediaModal
