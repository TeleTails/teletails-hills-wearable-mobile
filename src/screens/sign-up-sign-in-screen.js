import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs } from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';
import { AuthController } from '../controllers';

class SignUpSignInScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected_tab: 'home',
      host_name: 'hills'
    }

    this.continuePress = this.continuePress.bind(this);
    this.signUpSignIn = this.signUpSignIn.bind(this);
    this.verifyCode = this.verifyCode.bind(this);
  }

  async componentDidMount() {
    /* let user = await AuthController.getUser(true);
    if(user) {
      this.props.navigation.navigate('Home');
    } */
  }

  continuePress() {
    this.props.navigation.navigate('SignUpLanding')
  }

  async signUpSignIn() {
    let { email, host_name } = this.state;
    let data = {
      host_name,
      short_code: true,
      email
    }

    let response = await AuthController.singleEmailSignUpSignIn(data);

    console.log('response', response)

    if(response && response.success) {
      this.setState({
        is_new: response.is_new,
        email_message: "We sent a verification code to your email...",
        email_error: null,
        code_error: null
      })
    } else if (response && response.error) {
      this.setState({
        email_message: null,
        email_error: response.error,
        code_error: null
      })
    }
  }

  async verifyCode() {
    let { code, host_name, email, is_new } = this.state;

    let data = {
      email, host_name, code
    }

    let response = await AuthController.singleEmailSignUpSignInCodeVerify(data);
    console.log('response', response)
    if(response && response.success) {
      let user = await AuthController.getUser(true);
      if(user && user.first_name) {
        this.props.navigation.navigate('SignInWelcomeScreen')
      } else {
        this.props.navigation.navigate('SignUpInfoScreen')
      }
      /* if(is_new) {
        this.props.navigation.navigate('SignUpInfoScreen')
      } else {
        this.props.navigation.navigate('SignInWelcomeScreen')
      } */
    } else if (response && response.error) {
      this.setState({
        email_message: null,
        email_error: null,
        code_error: response.error
      })
    }
  }

  render() {
    let { email, code, code_error, email_error, email_message } = this.state;

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;

    return (
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ height: top_padding }} />
        <ScrollView style={{ backgroundColor: 'white' }}>
          <View>
            <Text>What's Your Email</Text>
            <Input value={ email }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             onChangeText={event=>this.setState({email: event})}/>
             <Button title={'Submit'}
              style={{ width: 330, marginBottom: 10 }}
              onPress={this.signUpSignIn}/>
              {email_error ? <View><Text style={{color: 'red'}}>{email_error}</Text></View> : null}
              {email_message ? <View><Text style={{color: 'green'}}>{email_message}</Text></View> : null}
          </View>
          <View>
            <Text>Confirmation Code</Text>
            <Input value={ code }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             onChangeText={event=>this.setState({code: event})}/>
             <Button title={'Submit'}
              style={{ width: 330, marginBottom: 10 }}
              onPress={this.verifyCode}/>
              {code_error ? <View><Text style={{color: 'red'}}>{code_error}</Text></View> : null}
          </View>
          

        </ScrollView>

      </SafeAreaView>
    );
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
