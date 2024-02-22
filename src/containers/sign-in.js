import LottieView    from 'lottie-react-native';
import { Component } from 'react';
import { SELECTED_PARTNER } from '@env'
import { View, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { Text, Colors, Button, Checkbox, Input, Line, Icon } from '../components';
import { StringUtils, EventsUtils } from '../utils';
import { AuthController, UserController } from '../controllers';

class SignIn extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      display_section: 'email',
      loading_sending_email: false,
      loading_verifying_code: false,
      validation_code: '',
      host_name: SELECTED_PARTNER,
      is_new_sign_up: false,
      first_name: '',
      last_name: '',
      zipcode: '',
      tos_accepted: false
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.t);
    clearInterval(this.state.t_2);
  }

  componentDidMount() {
    this.setState({
      email: ''
    })
  }

  _onHalfSecond = () => {
    if (this.check_animation && !this.state.check_animation_started) {
      this.check_animation.play();
      this.setState({ check_animation_started: true });
    }
  }

  _onTwoSecond = () => {
    if (this.props.success_action) {
      this.props.success_action();
    }
  }

  render_email_section = () => {
    if (this.state.display_section !== 'email') {
      return null;
    }

    let is_android = Platform.OS === 'android';

    return <View>
      <View style={{ marginTop: 15, marginBottom: 5 }}>
        <View style={{ alignItems: 'center', marginBottom:5 }}>
          <Image style={{ height: 60, width: 60, marginBottom: 5 }} source={ require('../../assets/images/envelope.png') } />
          <Text style={{ fontSize: 16, marginBottom: 20, color: 'grey', textAlign: 'center' }}>A Sign-In verification code will be sent to this email address</Text>
        </View>
        <Input label={ 'Enter Email Address' }
               value={this.state.email}
               labelStyle={{ fontWeight: '500', fontSize: is_android ? 14 : 16 }}
               style={{ marginBottom: 10 }}
               onChangeText={ (email_address) => {
                 this.setState({ email: email_address });
               }} />
        { this.render_error_message() }
        <Button title='Send Code'
                style={{ borderRadius: 40, marginTop: 10, width: 200, alignSelf: 'flex-end' }}
                loading={this.state.loading_sending_email}
                onPress={ () => {
                  if (this.state.loading_sending_email) {
                    return;
                  }
                  this.send_email_action();
                  this.setState({ loading_sending_email: true, error_message: '' });
                }}/>
      </View>
    </View>
  }

  render_code_section = () => {
    if (this.state.display_section !== 'code') {
      return null;
    }

    let is_android = Platform.OS === 'android';

    return <View>
      <View style={{ marginTop: 15, marginBottom: 5 }}>
        <View style={{ alignItems: 'center', marginBottom: 10 }}>
          <Image style={{ height: 50, width: 50, marginBottom: 15 }} source={ require('../../assets/images/envelope_code.png') } />
          <Text style={{ fontSize: 18, color: 'grey', textAlign: 'center' }}>A Sign-In verification code sent to:</Text>
          <Text style={{ fontSize: 18, marginBottom: 15, color: Colors.PRIMARY, textAlign: 'center', marginTop: 5 }}>{ this.state.email }</Text>
        </View>
        <Input label={ 'Enter Code' }
               value={this.state.validation_code}
               labelStyle={{ fontWeight: '500', fontSize: is_android ? 14 : 16 }}
               style={{ marginBottom: 10 }}
               onChangeText={ (code) => {
                 this.setState({ ...this.state, validation_code: code });
               }} />
        { this.render_error_message() }
        <Button title='Verify Code'
                style={{ borderRadius: 40, marginTop: 10, width: 200, alignSelf: 'flex-end' }}
                loading={this.state.loading_verifying_code}
                onPress={ () => {
                  if (this.state.loading_verifying_code) {
                    return;
                  }
                  this.verify_code_action();
                  this.setState({ loading_verifying_code: true, error_message: '' });
                }}/>
        <View style={{ flexDirection: 'row', marginTop: 15 }}>
          <View style={{ flex: 1 }}></View>
          <TouchableOpacity style={{ width: 200, padding: 0 }}
                            onPress={ () => {
                              this.setState({
                                email: '',
                                display_section: 'email',
                                loading_sending_email: false,
                                loading_verifying_code: false,
                                validation_code: '',
                              })
                            }}>
            <Text style={{ textAlign: 'center', color: Colors.PRIMARY, fontSize: 16 }}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  }

  render_name_inputs_section = () => {
    if (this.state.display_section !== 'name_inputs') {
      return null;
    }

    let is_android = Platform.OS === 'android';

    return <View>
      <View style={{ marginTop: 15, marginBottom: 5 }}>
        <View style={{ alignItems: 'center', marginBottom:5 }}>
          <Icon name='home' size={30} solid={true} />
          <Text style={{ fontSize: 16, marginBottom: 20, color: 'grey', textAlign: 'center' }}>Just a few more details to complete your user profile.</Text>
        </View>
        <Input label={ 'Enter First Name' }
               value={this.state.first_name}
               labelStyle={{ fontWeight: '500', fontSize: is_android ? 14 : 16 }}
               style={{ marginBottom: 10 }}
               onChangeText={ (f_name) => {
                 this.setState({ first_name: f_name });
               }} />
        <Input label={ 'Enter Last Name' }
               value={this.state.last_name}
               labelStyle={{ fontWeight: '500', fontSize: is_android ? 14 : 16 }}
               style={{ marginBottom: 10 }}
               onChangeText={ (l_name) => {
                 this.setState({ last_name: l_name });
               }} />
       <Input label={ 'Enter Zipcode' }
              value={this.state.last_name}
              labelStyle={{ fontWeight: '500', fontSize: is_android ? 14 : 16 }}
              style={{ marginBottom: 10 }}
              onChangeText={ (zipcode) => {
                this.setState({ zipcode: zipcode });
              }} />
        <View style={{ flexDirection: 'row', marginTop: 5, marginBottom: 10 }}>
          <Text style={{ fontSize: 16, color: '#575762', letterSpacing: 0.2, flex: 1 }}>By creating your DodoVet account you are agreeing to our <Text onPress={ () => { Linking.openURL('https://www.teletails.com/tospet') }} style={{ fontWeight: 'bold', color: Colors.PRIMARY }}>Terms & Conditions</Text> and <Text onPress={ () => { Linking.openURL('https://www.teletails.com/privacypolicy') }} style={{ fontWeight: 'bold', color: Colors.PRIMARY }}>Privacy Policy.</Text></Text>
        </View>
        { this.render_error_message() }
        <Button title='Create Account'
                style={{ borderRadius: 40, marginTop: 10, width: 230, alignSelf: 'flex-end' }}
                loading={this.state.loading_save_profile}
                onPress={ () => {
                  if (this.state.loading_save_profile) {
                    return;
                  }
                  this.setState({ loading_save_profile: true, error_message: '' })
                  this.update_profile_action();
                }}/>
      </View>
    </View>
  }

  render_success_section = () => {
    if (this.state.display_section !== 'success') {
      return null;
    }

    return <View>
      <View style={styles.success_container}>
        <View style={{ alignItems: 'center' }}>
          <LottieView loop={false} ref={animation => { this.check_animation = animation }} style={{ width: 250, height: 250 }} source={require('../../assets/animations/check.json')} />
        </View>
      </View>
    </View>
  }

  render_error_message = () => {
    if (this.state.error_message) {
      return <View style={{ marginTop: 5, marginBottom: 5 }}>
        <Text style={{ textAlign: 'center', fontSize: 18, color: Colors.RED }}>{ this.state.error_message }</Text>
      </View>
    }
  }

  render() {
    if (this.state.display_section === 'success') {
      return this.render_success_section();
    }

    return <View style={styles.main_container}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Sign In</Text>
      { this.render_email_section() }
      { this.render_code_section()  }
      { this.render_name_inputs_section() }
    </View>
  }

  send_email_action = async () => {
    let response   = await AuthController.singleEmailSignUpSignIn({ email: this.state.email, host_name: this.state.host_name, short_code: true });
    let is_success = response && response.success;
    let is_new     = response && response.is_new && response.is_new === true ? true : false;

    console.log(response)

    if (is_success) {
      this.setState({ loading_sending_email: false, display_section: 'code', is_new_sign_up: is_new });
    } else {
      let error_message = response && response.error ? response.error : 'Sign In Error';
      this.setState({ loading_sending_email: false, error_message: error_message });
    }
  }

  verify_code_action = async () => {
    let code       = this.state.validation_code;
    let response   = await AuthController.singleEmailSignUpSignInCodeVerify({ email: this.state.email, host_name: this.state.host_name, code: code });
    let is_success = response && response.success;
    let default_nm = response && response.default_named === true ? true : false;

    if (is_success) {
      let partner  = await AuthController.getPartnerDetails();
      let section  = default_nm ? 'name_inputs' : 'success';
      let t        = null;
      let t_2      = null;

      if (section === 'success') {
        t   = setInterval(this._onHalfSecond, 500);
        t_2 = setInterval(this._onTwoSecond, 2500);
      }

      this.setState({ loading_verifying_code: false, display_section: section, t: t, t_2: t_2 });
    } else {
      let error_message = response && response.error ? response.error : 'Sign In Error';
      this.setState({ loading_verifying_code: false, error_message: error_message });
    }
  }

  update_profile_action = async () => {

    let user_info = {
      first_name: this.state.first_name,
      last_name: this.state.last_name,
      zipcode: this.state.zipcode
    }

    if (this.state.first_name && this.state.last_name && this.state.zipcode) {
      let response   = await UserController.updateProfile(user_info);
      let is_success = response && response.success;
      if (is_success) {
        let t   = setInterval(this._onHalfSecond, 500);
        let t_2 = setInterval(this._onTwoSecond, 2500);
        this.setState({ loading_save_profile: false, display_section: 'success', t: t, t_2: t_2 });
      } else {
        let error_message = response && response.error ? response.error : 'Create Account';
        this.setState({ loading_save_profile: false, error_message: error_message });
      }
      this.setState({ loading_save_profile: false });
    }

    if (!this.state.first_name || !this.state.last_name || !this.state.zipcode) {
      let error_message = 'First Name, Last Name and Zipcode are required';
      this.setState({ loading_save_profile: false, error_message: error_message });
    }

  }

}

const styles = StyleSheet.create({
  main_container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 20,
    borderWidth: 1
  },
  success_container: {
    padding: 20,
    margin: 20,
    borderRadius: 20
  }
});

export default SignIn
