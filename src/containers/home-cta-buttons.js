import { Component } from 'react';
import { SignIn }           from '../containers';
import { AuthController }   from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text, Button, Icon, Colors } from '../components';
import { View, StyleSheet, TouchableOpacity, Image, TouchableWithoutFeedback, Modal } from 'react-native';

class HomeCtaButtons extends Component {

  constructor(props) {
    super(props);
    this.state = {
      display_coming_soon_modal: false
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
      <TouchableOpacity style={styles.button_container}
                        onPress={ () => {
                          // this.props.navigation.push('VetLocator')
                          this.setState({ display_coming_soon_modal: true });
                        }}>
        <View style={styles.icon_container}>
          <Image style={{ height: 26, width: 26 }} source={ require('../../assets/images/connect-a-device.png') } />
        </View>
        <Text style={styles.button_title}>Connect a</Text>
        <Text style={styles.button_title}>Device</Text>
      </TouchableOpacity>
      { this.render_options_modal() }
    </View>
  }

  render_options_modal = () => {
    return <Modal
      animationType="fade"
      transparent={true}
      visible={ this.state.display_coming_soon_modal }
      onRequestClose={() => {
        this.setState({ display_coming_soon_modal: false })
      }}>

      <TouchableWithoutFeedback onPress={ () => { this.setState({ display_coming_soon_modal: false }) }}>
        <View style={styles.outer_container}>
          <TouchableWithoutFeedback onPress={ () => { this.setState({ display_coming_soon_modal: false }) }}>
            <View style={styles.content_container}>
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Image style={{ height: 30, width: 30, marginBottom: 12 }} source={ require('../../assets/images/connect-a-device.png') } />
                <Text style={{ fontSize: 15, color: '#4c4c4c', fontWeight: 'medium' }}>Device Connectivity</Text>
                <Text style={{ fontSize: 15, color: '#4c4c4c', fontWeight: 'medium' }}>Coming Soon</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

    </Modal>
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
  },
  outer_container: {
    backgroundColor: 'rgba(0,0,0, 0.2)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  close_button_container: {
    alignItems: 'flex-end'
  },
  content_container: {
    backgroundColor: 'white',
    height: 170,
    width: 220,
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#e7e7e7',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20
  },
});

export default HomeCtaButtons
