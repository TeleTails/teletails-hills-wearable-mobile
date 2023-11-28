import { Component } from "react";
import { StyleSheet, View } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards } from '../components';
import LottieView from 'lottie-react-native';

class HomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return (
      <Screen title='Home'>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
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
      </View>
      </Screen>
    );
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
