import { Component } from 'react';
import { config }           from '../../config';
import { SignIn }           from '../containers';
import { AuthController }   from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text, Button, Icon } from '../components';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

class CareCtaButtons extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render_vertical_orientation = () => {

    return <View style={styles.vertical_container}>
      <TouchableOpacity style={styles.vertical_button_container} onPress={ () => { this.props.navigation.push('ConsultationStart', { type: 'VIDEO' }) }}>
        <View style={styles.icon_container}><Icon name='video-call' size={40} /></View>
        <View style={styles.title_container}>
          <Text style={styles.vertical_button_title}>Video Visit</Text>
          <Text style={styles.vertical_button_subtitle}>Schedule a video visit with a vet pro for a later time</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.middle_vertical_button_container} onPress={ () => { this.props.navigation.push('ConsultationStart', { type: 'CHAT' }) }}>
        <View style={styles.icon_container}><Icon name='live-chat' size={42} /></View>
        <View style={styles.title_container}>
          <Text style={styles.vertical_button_title}>Live Chat</Text>
          <Text style={styles.vertical_button_subtitle}>Get your pet health questions answered by a professional.</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.vertical_button_container} onPress={ () => {  }}>
        <View style={styles.icon_container}><Icon name='envelope' size={40} /></View>
        <View style={styles.title_container}>
          <Text style={styles.vertical_button_title}>Message</Text>
          <Text style={styles.vertical_button_subtitle}>Send us an offline message with your concerns</Text>
        </View>
      </TouchableOpacity>
    </View>
  }

  render_horizontal_orientation = () => {
    return <View style={styles.container}>
      <TouchableOpacity style={styles.button_container} onPress={ () => { this.props.navigation.push('ConsultationStart', { type: 'VIDEO' }) }}>
        <Icon name='video-call' size={40} />
        <Text style={styles.button_title}>Video Visit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.middle_button_container} onPress={ () => { this.props.navigation.push('ConsultationStart', { type: 'CHAT' }) }}>
        <Icon name='live-chat' size={42} />
        <Text style={styles.button_title}>Live Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button_container} onPress={ () => {  }}>
        <Icon name='envelope' size={40} />
        <Text style={styles.button_title}>Message</Text>
      </TouchableOpacity>
    </View>
  }

  render() {

    let orientation = this.props.orientation;

    if (!orientation) {
      return null;
    }

    return <View>
      { orientation === 'horizontal' ? this.render_horizontal_orientation() : null }
      { orientation === 'vertical'   ? this.render_vertical_orientation()   : null }
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
  },
  vertical_container: {
    flexDirection: 'column',
    paddingRight: 20,
    paddingLeft: 20
  },
  middle_vertical_button_container: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderRadius: 15,
    padding: 20,
    marginTop: 5,
    marginBottom: 5,
    paddingLeft: 0
  },
  vertical_button_container: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderRadius: 15,
    padding: 20,
    paddingLeft: 0
  },
  vertical_button_title: {
    fontSize: 16,
    fontWeight: 'medium'
  },
  vertical_button_subtitle: {
    flex: 1,
    fontWeight: 'regular',
    color: '#4c4c4c'
  },
  icon_container: {
    width: 80
  },
  title_container: {
    flexDirection: 'column',
    flex: 1,
  }
});

export default CareCtaButtons
