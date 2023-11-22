import { Component } from "react";
import { StyleSheet, Text, View } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon } from '../components';
import LottieView from 'lottie-react-native';

class HomeScreen extends Component {
  
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text onPress={ async () => { 
          await setItem('testing', 'Yes');
        }}>Set Storage</Text>
        <Text onPress={ async () => { 
          let stored_item = await getItem('testing');
          console.log(stored_item)
         }}>Get Storage</Text>
        <Icon />
        <LottieView autoPlay style={{ width: 200, height: 200, backgroundColor: '#eee' }} source={ require('../assets/animations/dog-trot.json') } />
        <Text onPress={ () => { this.props.navigation.push('Settings') }}>Home File CLASS! world!</Text>
      </View>
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
