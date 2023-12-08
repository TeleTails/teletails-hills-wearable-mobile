import { Component }    from 'react';
import { StringUtils }  from '../utils';
import * as ImagePicker from 'expo-image-picker';
import { AuthController, UserController } from '../controllers';
import { Screen, Button, Input, Icon, Text } from '../components';
import { StyleSheet, View, Image, TouchableOpacity, Platform } from 'react-native';

class UserProfileScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      display_section: 'user_details', // 'user_details' 'user_edit_inputs'
    }
  }

  componentDidMount = async () => {
    let user = await AuthController.getUser(true);

    if (user) {
      this.setState({ ...user })
    }
  }

  saveProfile = async () => {
    this.setState({ loading: true }, async () => {
      let user_info = {
        first_name: this.state.first_name,
        last_name: this.state.last_name,
      }

      let image = this.state.image;
      let success_all = true;
      let profile_save_return = await UserController.updateProfile(user_info);

      success_all = success_all && profile_save_return.success;

      if(image) {
        let profile_save_image_return = await UserController.updateProfileImage(image);
        success_all = success_all && profile_save_image_return.success;
      }

      if(success_all) {
        let user = await AuthController.getUser(true);

        this.setState({
          ...user,
          loading: false,
          display_section: 'user_details'
        })
      } else {
        this.setState({ loading: false })
      }
    })
  }

  render_profile_label_value = (label, value) => {
    return <View style={styles.user_details_row}>
      <View style={styles.label_container}><Text>{ label }</Text></View>
      <View><Text>{ value }</Text></View>
    </View>
  }

  launch_media_selector = () => {
    this.setState({ loading_preview: true }, async () => {
      let image = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: true,
         aspect: [4, 3],
         quality: 1,
         base64: true
       });

       this.setState({ loading_preview: false, image });
    });
  }

  render_profile_photo_edit = (photo_url) => {

    let old_photo = photo_url;
    let new_photo = this.state.image;
    let photo_uri = old_photo;

    if(new_photo) {
      photo_uri = new_photo.uri
    }

    return <View style={styles.user_profile_photo}>
      <TouchableOpacity onPress={ () => { this.launch_media_selector() }}
                        style={{ alignItems: 'center', marginBottom: 10 }}>
        {photo_uri ?
          <Image style={styles.preview_style} source={{ uri: photo_uri }} /> :
          <View style={styles.temp_holder}><Icon name='user' size={34} color='white' /></View> }
      </TouchableOpacity>
    </View>
  }

  render_profile_photo = (photo_url) => {
    return <View style={styles.user_profile_photo}>
        {photo_url ?
          <Image style={styles.preview_style} source={{ uri: photo_url}} /> :
          <View style={styles.temp_holder}><Icon name='user' size={34} solid={true} color='white' /></View> }
    </View>
  }

  render_user_details() {
    if (this.state.display_section !== 'user_details') {
      return null;
    }

    let first_name = this.state.first_name;
        first_name = first_name ? StringUtils.sentenceCase(first_name) : first_name;
    let last_name  = this.state.last_name;
        last_name  = last_name  ? StringUtils.sentenceCase(last_name)  : last_name;
    let email      = this.state.email;
    let photo_url  = this.state.photo_url;

    return (
        <View>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ marginRight: 15 }}>{ this.render_profile_photo(photo_url) }</View>
            <View style={{ justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#040415' }}>{ first_name + ' ' + last_name }</Text>
              <Text style={{ fontSize: 16, color: '#575762', marginTop: 3 }}>{ email }</Text>
            </View>
          </View>

          <View style={{ height: 20 }} />
          <Button title='Edit' onPress={ () => { this.setState({ display_section: 'user_edit_inputs' }) }} />
        </View>
    );
  }

  render_user_edit_inputs = () => {
    if (this.state.display_section !== 'user_edit_inputs') {
      return null;
    }

    let photo_url = this.state.photo_url;
    let first_name = this.state.first_name;
    let last_name = this.state.last_name;
    let email = this.state.email;
    let loading = this.state.loading;

    return <View>
       { this.render_profile_photo_edit(photo_url)     }
       <Input label='First Name'
              value={first_name}
              style={{ marginBottom: 12 }}
              onChangeText={ (text) => {
                this.setState({ first_name: text });
              }}/>

       <Input label='Last Name'
              value={last_name}
              style={{ marginBottom: 15 }}
              onChangeText={ (text) => {
                this.setState({ last_name: text });
              }}/>

        <Button loading={loading} title='Save Profile'
                onPress={this.saveProfile}/>
      </View>
  }

  render() {
    return (
      <Screen navigation={this.props.navigation} title={'User Profile'} bg_white={true} scroll={true} auth={true} auth_success={ () => { this.pull_user_details() }}>
        <View style={{ padding: 20 }}>
          { this.render_user_details()     }
          { this.render_user_edit_inputs() }
        </View>
      </Screen>
    );
  }

  pull_user_details = async () => {
    let user = await AuthController.getUser(true);

    if(user) {
      this.setState({ ...user })
    }
  }

}

export default UserProfileScreen;

const styles = StyleSheet.create({
  user_details_row: {
      flexDirection: 'row',
    },
    label_container: {
      width: 120
    },
    user_profile_photo: {

    },
    preview_style: {
      height: 80,
      width: 80,
      borderRadius: 40
    },
    temp_holder: {
      height: 80,
      width: 80,
      borderRadius: 40,
      backgroundColor: '#e7e7e7',
      justifyContent: 'center',
      alignItems: 'center'
    }
});
