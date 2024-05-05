import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Platform, TouchableOpacity, Image } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs } from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';
import { AuthController } from '../controllers';

class SignUpLandingScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected_tab: 'home',
      display_animation: true,
      navigate_to_home: false,
      elapsed_seconds: 0
    }
  }

  componentDidMount = async () => {
    let t = setInterval(this._onHalfSecond, 500);

    let token   = await getItem('token');
    let user    = await this.check_token_and_user();
    let to_home = token && user && user._id && user.first_name && user.first_name.toLowerCase() !== 'pet' && user.address && user.address.city;

    if (to_home) {
      this.setState({ t: t, navigate_to_home: true });
    } else {
      this.setState({ t: t, display_animation: false });
    }
  }

  componentWillUnmount = () => {
    clearInterval(this.state.t);
  }

  _onHalfSecond = () => {
    if (this.welcome_animation && !this.state.welcome_animation_started) {
      this.welcome_animation.play();
      this.setState({ welcome_animation_started: true });
    }

    if (this.state.navigate_to_home && this.state.elapsed_seconds > 2) {
      this.props.navigation.push('Home');
      this.setState({ navigate_to_home: false });
    }

    if (this.state.elapsed_seconds > 5) {
      this.setState({ display_animation: false });
    }

    this.setState({ elapsed_seconds: this.state.elapsed_seconds + 0.5 });
  }

  continue_action = () => {
    this.props.navigation.push('SignUpSignInScreen')
  }

  render_welcome_animation = () => {
    if (!this.state.display_animation) {
      return null;
    }

    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LottieView loop={true} ref={animation => { this.welcome_animation = animation }} style={{ width: 150, height: 150 }} source={require('../../assets/animations/dog-trot.json')} />
    </View>
  }

  render_preview_section = () => {
    if (this.state.display_animation) {
      return null;
    }

    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 20 }}>
      <Image style={{ width: '90%' }} resizeMode='contain' source={ require('../../assets/images/landing-screen-preview.png') } />
    </View>
  }

  render_button_section = () => {
    if (this.state.display_animation) {
      return null;
    }

    return <View style={{ backgroundColor: '#0255A5', height: 110, justifyContent: 'center', alignItems: 'center' }}>
      <TouchableOpacity style={{ borderWidth: 2, borderColor: 'white', borderRadius: 5, padding: 15, width: '80%', alignItems: 'center' }}
                        onPress={ () => {
                          this.continue_action();
                        }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>GET STARTED</Text>
      </TouchableOpacity>
    </View>
  }

  render() {

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;

    return (
      <SafeAreaView style={{ backgroundColor: '#0255A5', flex: 1 }}>
        <View style={{ height: top_padding }} />
          { this.render_welcome_animation() }
          { this.render_preview_section()   }
          { this.render_button_section()    }
      </SafeAreaView>
    );
  }

  check_token_and_user = async () => {
    await setItem('user', {});
    let user = await AuthController.getUser(true);
    return user;
  }
}

export default SignUpLandingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
