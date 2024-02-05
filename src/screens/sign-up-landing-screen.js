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
      selected_tab: 'home'
    }
  }

  componentDidMount = async () => {
    let t = setInterval(this._onHalfSecond, 500);
    this.setState({ t: t });
  }

  componentWillUnmount = () => {
    clearInterval(this.state.t);
  }

  _onHalfSecond = () => {
    if (this.welcome_animation && !this.state.welcome_animation_started) {
      this.welcome_animation.play();
      this.setState({ welcome_animation_started: true });
    }
  }

  continue_action = () => {
    this.props.navigation.navigate('SignUpSignInScreen')
  }

  render_preview_section = () => {

    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image style={{ width: '90%' }} resizeMode='contain' source={ require('../../assets/images/landing-screen-preview.png') } />
    </View>
  }

  render_button_section = () => {
    return <View style={{ backgroundColor: '#0255A5', height: 150, justifyContent: 'center', alignItems: 'center' }}>
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
          { this.render_preview_section() }
          { this.render_button_section()  }
      </SafeAreaView>
    );
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
