import { Component } from 'react';
import { config }           from '../../config';
import { SignIn }           from '../containers';
import { AuthController }   from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text, Button, Icon } from '../components';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';

class HomeCtaButtons extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return <View style={styles.container}>
      <TouchableOpacity style={styles.button_container} onPress={ () => { this.props.navigation.push('ConsultationStart', { type: 'VIDEO' }) }}>
        <View style={styles.icon_container}>
          <Image style={{ height: 26, width: 26 }} source={ require('../../assets/images/video-visit.png') } />
        </View>
        <Text style={styles.button_title}>Video</Text>
        <Text style={styles.button_title}>Visit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.middle_button_container} onPress={ () => { this.props.navigation.push('ConsultationStart', { type: 'CHAT' }) }}>
        <View style={styles.icon_container}>
          <Image style={{ height: 26, width: 26 }} source={ require('../../assets/images/live-chat.png') } />
        </View>
        <Text style={styles.button_title}>Live</Text>
        <Text style={styles.button_title}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button_container} onPress={ () => { this.props.navigation.push('VetLocator') }}>
        <View style={styles.icon_container}>
          <Image style={{ height: 26, width: 26 }} source={ require('../../assets/images/connect-a-device.png') } />
        </View>
        <Text style={styles.button_title}>Connect a</Text>
        <Text style={styles.button_title}>Device</Text>
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
    fontWeight: 'medium',
    fontSize: 15
  },
  button_container: {
    backgroundColor: 'white',
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    height: 130,
    width: 103
  },
  icon_container: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#DBE6F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  middle_button_container: {
    marginRight: 10,
    marginLeft: 10,
    backgroundColor: 'white',
    flex: 1,
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    height: 130,
    width: 103
  }
});

export default HomeCtaButtons
