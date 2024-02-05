import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors } from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';
import { AuthController } from '../controllers';

class SignUpSignInScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      host_name: 'hills',
      display_section: 'email', // 'email' 'code'
      loading_submit_email: false,
      loading_submit_code: false,
      display_resend_code: false,
      seconds_remaining: 45
    }
  }

  componentDidMount = () => {
    let second_timer = setInterval(this._onEverySecond, 1000);
  }

  _onEverySecond = () => {
    let seconds_remaining = this.state.seconds_remaining;
    if (seconds_remaining > 0) {
      this.setState({ seconds_remaining: seconds_remaining - 1 })
    }
    if (seconds_remaining === 0 && !this.state.display_resend_code) {
      this.setState({ display_resend_code: true })
    }
  }

  render_email_input_section = () => {
    if (this.state.display_section !== 'email') {
      return null;
    }

    let email_error = this.state.email_error || '';

    return <View style={{ backgroundColor: 'white', width: '90%', borderRadius: 12, padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 5 }}>Log in or sign up</Text>
      <Text style={{ fontSize: 15, color: 'grey', marginBottom: 15 }}>You will be asked to verify your email</Text>
      <Input value={ this.state.email }
         style={{ marginBottom: 15, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
         border_color='#e7e7e7'
         onChangeText={ text => this.setState({ email: text }) } />
      <Button title={ 'CONTINUE' }
              style={{  }}
              loading={this.state.loading_submit_email}
              onPress={ () => { this.sign_up_sign_in_action() }} />
      { email_error ? <Text style={{ fontSize: 16, marginTop: 15, textAlign: 'center', color: Colors.RED }}>{ email_error }</Text> : null }
    </View>
  }

  render_code_input_section = () => {
    if (this.state.display_section !== 'code') {
      return null;
    }

    let display_resend_code = this.state.display_resend_code;
    let email_error = this.state.email_error || '';

    return <View style={{ backgroundColor: 'white', width: '90%', borderRadius: 12, padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 5 }}>Confirmation Code</Text>
      <Text style={{ fontSize: 15, color: 'grey', marginBottom: 15 }}>Enter the 4 digit code that you received in your email.</Text>
      <Input value={ this.state.code }
             style={{ width: 100, alignSelf: 'center', textAlign: 'center', marginBottom: 15, fontSize: 16, height: 50, padding: 0, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             keyboardType='number-pad'
             border_color='#e7e7e7'
             onChangeText={ (text) => {
               if (text.length === 4) {
                 this.verify_code_action(text);
               }
               this.setState({ code: text })
             }} />
      <Button title={ 'Continue' }
         style={{  }}
         loading={this.state.loading_submit_code}
         onPress={ () => { this.verify_code_action() }} />
      { email_error ? <Text style={{ fontSize: 16, marginTop: 15, textAlign: 'center', color: Colors.RED }}>{ email_error }</Text> : null }
      { display_resend_code ? <TouchableOpacity style={{ alignItems: 'center', marginTop: 10, padding: 5 }} onPress={ () => { this.resend_code_action() }}>
                                <Text style={{ color: '#0255A5', fontWeight: 'bold' }}>Resend Code</Text>
                              </TouchableOpacity>
                            : <View style={{ alignItems: 'center', marginTop: 15 }}>
                                <Text style={{ fontSize: 16, color: 'grey' }}>{ "Didn't get a code?" }</Text>
                                <Text style={{ fontSize: 16, color: 'grey', width: 240, paddingLeft: 15 }}>{ "Tray again in: " + this.state.seconds_remaining + ' seconds.' }</Text>
                              </View> }
    </View>
  }

  render() {

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;

    return (
      <Screen hide_nav_bar={true} scroll={true} style={{ backgroundColor: Colors.PRIMARY }}>
        <View style={{ alignItems: 'center', paddingTop: 140 }}>
          { this.render_email_input_section() }
          { this.render_code_input_section()  }
        </View>
      </Screen>
    );
  }

  sign_up_sign_in_action = async () => {
    let email     = this.state.email;
    let host_name = this.state.host_name;

    if (!email) {
      return;
    }

    this.setState({ loading_submit_email: true });

    let data = {
      email: email,
      host_name: host_name,
      short_code: true
    }

    let response = await AuthController.singleEmailSignUpSignIn(data);

    if(response && response.success) {
      this.setState({
        is_new: response.is_new,
        email_message: "We sent a verification code to your email...",
        email_error: null,
        code_error: null,
        display_section: 'code',
        loading_submit_email: false,
        display_resend_code: false,
        seconds_remaining: 45
      })
    } else if (response && response.error) {
      this.setState({
        email_message: null,
        email_error: response.error,
        code_error: null,
        loading_submit_email: false,
        display_resend_code: false,
        seconds_remaining: 45
      })
    }
  }

  verify_code_action = async (passed_code) => {
    let code      = this.state.code;
    let host_name = this.state.host_name;
    let email     = this.state.email;
    let is_new    = this.state.is_new;

    if (passed_code) {
      code = passed_code;
    }

    let data = {
      email: email,
      host_name: host_name,
      code: code
    }

    this.setState({ loading_submit_code: true });

    let response = await AuthController.singleEmailSignUpSignInCodeVerify(data);

    if(response && response.success) {
      let user = await AuthController.getUser(true);
      if(user && user.first_name) {
        this.props.navigation.navigate('SignInWelcomeScreen')
      } else {
        this.props.navigation.navigate('SignUpInfoScreen')
      }
      this.setState({ loading_submit_code: false })
    } else if (response && response.error) {
      this.setState({
        email_message: null,
        email_error: null,
        code_error: response.error,
        loading_submit_code: false
      })
    }
  }

  resend_code_action = () => {
    this.setState({
      display_section: 'email',
      email_message: '',
      email_error: '',
      code_error: ''
    })
  }

}

export default SignUpSignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
