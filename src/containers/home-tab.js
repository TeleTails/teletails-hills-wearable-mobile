import { Component } from 'react';
import { config }           from '../../config';
import { SignIn }           from '../containers';
import { AuthController }   from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text, Button, Icon } from '../components';
import { HomeCtaButtons } from '../containers';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

class HomeTab extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 }}>
        <Text style={{ fontSize: 26, fontWeight: 'semibold' }}>Welcome</Text>
        <TouchableOpacity onPress={ () => { this.props.navigation.push('Settings') }}>
          <Icon name='setting' size={30} />
        </TouchableOpacity>
      </View>
      <HomeCtaButtons navigation={this.props.navigation} />

    </View>
  }

}

const styles = StyleSheet.create({

});

export default HomeTab
