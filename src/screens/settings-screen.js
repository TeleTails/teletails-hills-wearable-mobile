import { Component } from "react";
import { StyleSheet, Text, View } from 'react-native';

class SettingsScreen extends Component {
  
  render() {
    return (
      <View
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text onPress={ () => { this.props.navigation.push('Settings') }}>Settings File CLASS! world!</Text>
      </View>
    );
  }

}

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
