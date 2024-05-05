import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { StyleSheet, View, ScrollView, SafeAreaView, Platform } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors } from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';
import { AuthController, UserController, WearablesController } from '../controllers';

class SignUpInfoScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected_tab: 'home',
      first_name: '',
      last_name: '',
      street: '',
      city: '',
      state: '',
      country: 'United States',
      zipcode: '',
      display_address_inputs: false
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
      this.setState({ display_address_inputs: true });
    } else {
      this.setState({
        error_message: response.error
      })
    }
  }

  address_continue_action = async () => {
    let street  = this.state.street;
    let city    = this.state.city;
    let state   = this.state.state;
    let country = this.state.country;

    if (!street || !city || !state || !country) {
      this.setState({ error_message: 'Street, City, State, Zipcode and Country are required fields.' })
      return;
    } else {
      this.setState({ loading_address_button: true, error_message: '' });
    }

    let address          = street + ', ' + city + ', ' + state + ', ' +  country;
    let address_data     = { address: address }
    let address_response = await WearablesController.validateAddress(address_data);
    let is_success       = address_response && address_response.success === true ? true : false

    if (is_success) {
      this.props.navigation.push('SignInWelcomeScreen');
      this.setState({ loading_address_button: false });
    } else {
      this.setState({ error_message: 'The address is invalid, please verify each input.', loading_address_button: false });
    }

  }

  render_name_inputs_section = () => {
    if (this.state.display_address_inputs) {
      return null;
    }

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

  render_address_inputs_section = () => {
    if (!this.state.display_address_inputs) {
      return null;
    }

    let error_message = this.state.error_message;

    return <View style={{ backgroundColor: 'white', width: '90%', borderRadius: 12, padding: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20, marginBottom: 5 }}>Address</Text>
      <Text style={{ fontSize: 15, color: 'grey', marginBottom: 15 }}>Please enter your Address</Text>

      <Input value={ this.state.street }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             placeholder='Street*'
             onChangeText={ (text) => this.setState({ street: text }) }/>

      <Input value={ this.state.city }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             placeholder='City*'
             onChangeText={ (text) => this.setState({ city: text }) }/>

      <Input value={ this.state.state }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             placeholder='State*'
             onChangeText={ (text) => this.setState({ state: text }) }/>

     <Input value={ this.state.country }
            style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
            border_color='#e7e7e7'
            placeholder='Country*'
            onChangeText={ (text) => this.setState({ country: text }) }/>

      <Button title={'CONTINUE'}
              style={{ marginBottom: 0, marginTop: 10 }}
              loading={this.state.loading_address_button}
              onPress={ () => { this.address_continue_action() }}/>
      { error_message ? <Text style={{ marginTop: 15, fontSize: 16, color: Colors.RED, textAlign: 'center' }}>{ error_message }</Text> : null }
    </View>
  }

  render() {
    return (
      <Screen scroll={true} hide_nav_bar={true} style={{ backgroundColor: '#0255A5' }}>
        <View style={{ alignItems: 'center', paddingTop: 100 }}>
          { this.render_name_inputs_section() }
          { this.render_address_inputs_section() }
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
