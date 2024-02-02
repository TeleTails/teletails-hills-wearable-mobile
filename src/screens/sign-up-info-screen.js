import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs } from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';
import { AuthController, UserController } from '../controllers';

class SignUpInfoScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected_tab: 'home'
    }

    this.continuePress = this.continuePress.bind(this);
  }

  async componentDidMount() {
    let user = await AuthController.getUser(true);

    this.setState({
      user
    })
  }

  async continuePress() {
    let { first_name, last_name, zipcode, user } = this.state;

    let data = {
      first_name, last_name, zipcode
    }

    let response = await UserController.completeUserSignUp(data);

    if(response && response.success) {
      this.props.navigation.navigate('Home')
    } else {
      this.setState({
        error_message: response.error
      })
    }
  }

  render() {
    let { first_name, last_name, zipcode, error_message } = this.state;

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;

    return (
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ height: top_padding }} />
        <ScrollView style={{ backgroundColor: 'white' }}>
          <View>
            <Text>Sign Up</Text>
            <Input value={ first_name }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             onChangeText={event=>this.setState({first_name: event})}/>
            <Input value={ last_name }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             onChangeText={event=>this.setState({last_name: event})}/>
            <Input value={ zipcode }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             onChangeText={event=>this.setState({zipcode: event})}/>
             <Button title={'Submit'}
              style={{ width: 330, marginBottom: 10 }}
              onPress={this.continuePress}/>
            {error_message ? <View><Text style={{color: 'red'}}>{error_message}</Text></View> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
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
