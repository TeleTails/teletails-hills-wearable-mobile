import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
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

    this.continuePress = this.continuePress.bind(this);
  }

  async componentDidMount() {
    /* let user = await AuthController.getUser(true);
    if(user) {
      this.props.navigation.navigate('Home');
    } */
  }

  continuePress() {
    this.props.navigation.navigate('SignUpSignInScreen')
  }

  render() {

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;

    return (
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ height: top_padding }} />
        <ScrollView style={{ backgroundColor: 'white', flexDirection: 'column'}}>
          <View style={{flex: 2}}></View>
          <View style={{justifyContent: 'flex-end', alignItems: 'center', flex: 1}}>
            <Button title={'Sign Up'}
                style={{ width: 330, marginBottom: 10 }}
                onPress={this.continuePress}/>
            <Button title={'Log In'}
                style={{ width: 330, marginBottom: 10 }}
                onPress={this.continuePress}/>
          </View>
        </ScrollView>

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
