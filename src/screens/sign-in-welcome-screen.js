import LottieView from 'lottie-react-native';
import { Component } from "react";
import { StyleSheet, View, Image, TouchableOpacity, Linking, Platform } from 'react-native';
import { Button, Text, Checkbox, Screen, Colors } from '../components';
import { UserController } from '../controllers';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

class SignInWelcomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      agreed: false,
      display_agree_error: false,
      display_prompt: false,
      display_notification_prompt: false,
      bow_animation_started: false,
      enable_continue: false
    }
  }

  componentDidMount = async () => {
    this.dog_animation.play();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let display_notification_prompt  = existingStatus && existingStatus === 'undetermined' ? true  : false;
        display_notification_prompt  = existingStatus && existingStatus === 'denied'       ? false : display_notification_prompt;
        display_notification_prompt  = existingStatus && existingStatus === 'granted'      ? false : display_notification_prompt;

    let push_token_res = await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId });
    let push_token     = push_token_res.data;
    if (push_token) {
      this.update_user_token(push_token);
    }

    this.setState({ display_notification_prompt: display_notification_prompt });
  }

  componentDidUpdate = () => {
    if (this.dog_bows_animation && !this.state.bow_animation_started) {
      this.dog_bows_animation.play();
      this.setState({ bow_animation_started: true });
    }
  }

  render_enable_notifications = () => {
    let notification_button_title = 'ENABLE NOTIFICATIONS';
        notification_button_title = this.state.enable_continue === true ? 'CONTINUE' : notification_button_title;

    return <Screen hide_nav_bar={true} style={{ backgroundColor: Colors.PRIMARY, borderRadius: 20 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LottieView loop={true} ref={animation => { this.dog_bows_animation = animation }} style={{ width: 250, height: 250 }} source={require('../../assets/animations/dog-bows.json')} />
      </View>
      <View style={{ height: 220, backgroundColor: 'white', borderRadius: 30, padding: 30, marginRight: 10, marginLeft: 10, alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 22 }}>Enable Notifications</Text>
        <View style={{ flexDirection: 'row', width: '100%', backgroundColor: 'white', marginBottom: 20, marginTop: 5 }}>
          <Text style={{ flex: 1, color: 'grey', fontWeight: 'medium', fontSize: 16, paddingTop: 10, textAlign: 'center' }}>Enable notifications to ensure that you never miss a message from your provider.</Text>
        </View>
        <Button title={ notification_button_title }
                style={{ width: 330, marginBottom: 10, borderWidth: 2, borderColor: 'white' }}
                onPress={ () => { this.enable_notification_action() }}/>
      </View>
    </Screen>
  }

  render() {

    let check_color = this.state.display_agree_error ? Colors.RED : '#e7e7e7';

    if (this.state.display_prompt) {
      return this.render_enable_notifications();
    }

    return (
      <Screen hide_nav_bar={true} style={{ backgroundColor: Colors.PRIMARY, borderRadius: 20 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LottieView loop={true} ref={animation => { this.dog_animation = animation }} style={{ width: 250, height: 250 }} source={require('../../assets/animations/dog-pouncing.json')} />
        </View>
        <View style={{ height: 220, backgroundColor: 'white', borderRadius: 30, padding: 30, marginRight: 10, marginLeft: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 22 }}>Welcome to PetFit</Text>
          <View style={{ flexDirection: 'row', width: '100%', backgroundColor: 'white', marginBottom: 20, marginTop: 5 }}>
            <Checkbox style={{ marginRight: 5, marginLeft: 20, borderColor: check_color }} checked={this.state.agreed} onPress={ () => { this.setState({ agreed: !this.state.agreed }) }} />
            <Text style={{ flex: 1, color: 'grey', fontWeight: 'medium', fontSize: 16, paddingTop: 10 }}>I agree to PetFit <Text onPress={ () => { Linking.openURL('https://www.teletails.com/tospet') }} style={{ fontWeight: 'medium', color: Colors.PRIMARY }}>Terms & Conditions</Text> and <Text onPress={ () => { Linking.openURL('https://www.teletails.com/privacypolicy') }} style={{ fontWeight: 'medium', color: Colors.PRIMARY }}>Privacy Policy.</Text></Text>
          </View>
          <Button title={'CONTINUE'}
                  style={{ width: 330, marginBottom: 10, borderWidth: 2, borderColor: 'white' }}
                  onPress={ () => { this.continue_action() }}/>
        </View>
      </Screen>
    );
  }

  enable_notification_action = async () => {
    if (this.state.enable_continue) {
      this.props.navigation.push('Home');
      return;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (true || Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      let push_token_res = await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId });
      let push_token     = push_token_res.data;
      if (push_token) {
        this.update_user_token(push_token);
      }
    } else {
      alert('Must use physical device for Push Notifications');
    }

    this.setState({ enable_continue: true });
  }

  continue_action() {
    if (!this.state.agreed) {
      this.setState({ display_agree_error: true })
      return;
    }

    if (this.state.display_notification_prompt) {
      this.setState({ display_prompt: true, display_agree_error: false });
    } else {
      this.setState({ display_agree_error: false })
      this.props.navigation.push('Home')
    }
  }

  update_user_token = async (push_token) => {
    let request_data = {
      push_enabled: true,
      expo_token: push_token
    }

    let udpate_notif_pref_res = await UserController.updateUserNotificationPreferences(request_data);
  }

}

export default SignInWelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
