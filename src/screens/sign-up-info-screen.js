import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors } from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';
import { AuthController, UserController } from '../controllers';

class SignUpInfoScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected_tab: 'home',
      first_name: '',
      last_name: '',
      zipcode: ''
    }
  }

  async componentDidMount() {
    let user = await AuthController.getUser(true);

    this.setState({
      user
    })
  }

  async continue_action() {
    let first_name = this.state.first_name;
    let last_name  = this.state.last_name;
    let zipcode    = this.state.zipcode;

    let data = {
      first_name: first_name,
      last_name: last_name,
      zipcode: zipcode
    }

    if (!first_name || !last_name || !zipcode) {
      this.setState({ error_message: 'First name, Last Name, and Zipcode are required fields.' })
      return;
    }

    let response = await UserController.completeUserSignUp(data);

    if(response && response.success) {
      this.props.navigation.push('SignInWelcomeScreen')
    } else {
      this.setState({
        error_message: response.error
      })
    }
  }

  render_inputs_section = () => {
    let error_message = this.state.error_message;

    return <View style={{ backgroundColor: 'white', width: '90%', borderRadius: 12, padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 5 }}>Signing up</Text>
      <Text style={{ fontSize: 15, color: 'grey', marginBottom: 15 }}>Please enter your details</Text>
      <Input value={ this.state.first_name }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             placeholder='First Name*'
             onChangeText={ (text) => this.setState({ first_name: text }) }/>
      <Input value={ this.state.last_name }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             placeholder='Last Name*'
             onChangeText={ (text) => this.setState({ last_name: text }) }/>
      <Input value={ this.state.zipcode }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             placeholder='Zipcode*'
             onChangeText={ (text) => this.setState({ zipcode: text }) }/>
      <Button title={'CONTINUE'}
              style={{ marginBottom: 0, marginTop: 10 }}
              onPress={ () => { this.continue_action() }}/>
      { error_message ? <Text style={{ marginTop: 15, fontSize: 16, color: Colors.RED, textAlign: 'center' }}>{ error_message }</Text> : null }
    </View>
  }

  render() {
    return (
      <Screen scroll={true} hide_nav_bar={true} style={{ backgroundColor: '#0255A5' }}>
        <View style={{ alignItems: 'center', paddingTop: 100 }}>
          { this.render_inputs_section() }
        </View>
      </Screen>
    );
  }

}

export default SignUpInfoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
