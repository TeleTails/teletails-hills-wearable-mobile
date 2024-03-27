import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { StyleSheet, View, ScrollView, SafeAreaView, Platform } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors } from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';
import { AuthController, UserController } from '../controllers';

class WearableConnectScreen extends Component {

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
    
  }

  render() {
    return (
      <Screen title='Connect' scroll={true} modal={true} navigation={this.props.navigation}>
        <View style={{ alignItems: 'center', paddingTop: 100 }}>
          <Text>Connect your device</Text>
        </View>
      </Screen>
    );
  }

}

export default WearableConnectScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
