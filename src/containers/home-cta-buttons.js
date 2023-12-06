import { Component } from 'react';
import { config }           from '../../config';
import { SignIn }           from '../containers';
import { AuthController }   from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text, Button, Icon } from '../components';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

class HomeCtaButtons extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return <View style={styles.container}>
      <TouchableOpacity style={styles.button_container} onPress={ () => { this.props.navigation.push('ConsultationStart') }}>
        <Icon name='video-call' size={40} />
        <Text style={styles.button_title}>Video Visit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.middle_button_container} onPress={ () => { this.props.navigation.push('ConsultationStart') }}>
        <Icon name='live-chat' size={42} />
        <Text style={styles.button_title}>Live Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button_container} onPress={ () => { this.props.navigation.push('VetLocator') }}>
        <Icon name='location' size={40} />
        <Text style={styles.button_title}>Office Visit</Text>
      </TouchableOpacity>
    </View>
  }

}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingRight: 20,
    paddingLeft: 20,
    alignItems: 'center',
    height: 100
  },
  button_title: {
    marginBottom: 10,
    marginTop: 10,
    fontWeight: 'semibold'
  },
  button_container: {
    backgroundColor: 'white',
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderRadius: 15
  },
  middle_button_container: {
    marginRight: 5,
    marginLeft: 5,
    backgroundColor: 'white',
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderRadius: 15
  }
});

export default HomeCtaButtons
