import { Component } from "react";
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Screen, Line, Text, Icon } from '../components';
import { setItem, getItem } from '../../storage';

class VetLocatorScreen extends Component {

  render() {
    return <Screen title='Vet Locator' scroll={true} navigation={this.props.navigation}>
      <Text>Vet Locator</Text>
    </Screen>
  }

}

export default VetLocatorScreen;

const styles = StyleSheet.create({

});
