import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Platform } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs } from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';

class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selected_tab: 'home'
    }
  }

  render_tab_component = () => {
    switch (this.state.selected_tab) {
      case 'home':
        return <HomeTab />
      case 'health':
        return <HealthTab />
      case 'vet_chat':
        return <CareTab />
      case 'shop':
        return <ShopTab />
      default:
        return null;
    }
  }

  render() {

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;

    return (
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ height: top_padding }} />
        <ScrollView style={{ backgroundColor: 'white' }}>
          { this.render_tab_component() }
        </ScrollView>
        <Tabs selected_tab={this.state.selected_tab}
              home_action={        () => { this.home_tab_action()    }}
              health_action={      () => { this.health_action()      }}
              vet_chat_action={    () => { this.vet_chat_action()    }}
              shop_action={        () => { this.shop_action()        }}
            />
      </SafeAreaView>
    );
  }

  home_tab_action = async () => {
    await analytics().logEvent('login', { tab_name: 'home' });
    this.setState({ selected_tab: 'home' })
  }

  health_action = async () => {
    await analytics().logEvent('login', { tab_name: 'health' });
    this.setState({ selected_tab: 'health' })
  }

  vet_chat_action = async () => {
    await analytics().logEvent('login', { tab_name: 'vet_chat' })
    this.setState({ selected_tab: 'vet_chat' })
  }

  shop_action = async () => {
    await analytics().logEvent('tab_changed', { tab_name: 'shop' })
    this.setState({ selected_tab: 'shop' })
  }


}

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


/*
  <Text onPress={ async () => {
    await setItem('testing', 'Yes');
  }}>Set Storage</Text>
  <Text style={{ fontFamily: 'Poppins-Thin' }} onPress={ async () => {
    let stored_item = await getItem('testing');
    console.log(stored_item)
  }}>GET STORAGE</Text>
  <Input type='date-mmddyyyy' label='Date' value={this.state.date}  onChangeText={ (date_str) => { this.setState({ date: date_str }) }} />
  <Button title='Get' />
  <Checkbox checked={true} />
  <Icon name='home' size={40} color='#1dc2ff' />
  <View style={{ width: '100%', height: 200 }}>
  <Cards data={[ <View style={{ backgroundColor: 'pink', flex: 1, height: '100%' }}></View>, <View style={{ backgroundColor: 'pink', marginRight: 10, height: 200, width: 100 }}></View>, <View style={{ backgroundColor: 'pink', marginRight: 10, height: 200, width: 100 }}></View> ]} />
  </View>
  <Text style={{ height: 150 }}>This is a poppins font that haser been applied to the home screen.</Text>
  <LottieView autoPlay style={{ width: 200, height: 200, backgroundColor: '#eee' }} source={ require('../assets/animations/dog-trot.json') } />
  <Text onPress={ () => { this.props.navigation.push('Settings') }}>Home File CLASS! world!</Text>
  */
