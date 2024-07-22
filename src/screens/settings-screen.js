import { Component } from "react";
import { StyleSheet, View, TouchableOpacity, Linking } from 'react-native';
import { Screen, Line, Text, Icon } from '../components';
import { setItem, getItem } from '../../storage';

class SettingsScreen extends Component {

  render() {
    return <Screen title='Settings' scroll={true} navigation={this.props.navigation}>
      <View style={styles.settings_row_container}>
        <TouchableOpacity style={styles.settings_row} onPress={ () => { this.props.navigation.push('UserProfile') }}>
          <Text style={styles.settings_row_title}>Profile</Text>
          <Icon name='arrow-right' size={13} />
        </TouchableOpacity>
        <Line style={styles.settings_line} />
        <TouchableOpacity style={styles.settings_row} onPress={ () => { this.props.navigation.push('Pets') }}>
          <Text style={styles.settings_row_title}>Pets</Text>
          <Icon name='arrow-right' size={13} />
        </TouchableOpacity>
        <Line style={styles.settings_line} />
        <TouchableOpacity style={styles.settings_row} onPress={ () => { this.props.navigation.push('CompletedConsultations') }}>
          <Text style={styles.settings_row_title}>Completed Consultations</Text>
          <Icon name='arrow-right' size={13} />
        </TouchableOpacity>
        <Line style={styles.settings_line} />
        <TouchableOpacity style={styles.settings_row} onPress={ () => { Linking.openURL('https://www.teletails.com/contact-us-ppc') }}>
          <Text style={styles.settings_row_title}>Support</Text>
          <Icon name='arrow-right' size={13} />
        </TouchableOpacity>
        <Line style={styles.settings_line} />
        <TouchableOpacity style={styles.settings_row} onPress={ () => { Linking.openURL('https://www.teletails.com/contact-us-petfit') }}>
          <Text style={styles.settings_row_title}>Account Management</Text>
          <Icon name='arrow-right' size={13} />
        </TouchableOpacity>
        <Line style={styles.settings_line} />
        <TouchableOpacity style={styles.settings_row} onPress={ () => { this.sign_out_action() }}>
          <Text style={styles.settings_row_title}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  }

  sign_out_action = async () => {
    await setItem('token', '');
    await setItem('user_id', '');
    await setItem('user', {});
    await setItem('wearables_user_profile', null);
    await setItem('hide_add_pets', 'false');
    this.props.navigation.popToTop();
  }

}

export default SettingsScreen;

const styles = StyleSheet.create({
  settings_row_container: {
    flex: 1,
    padding: 20,
    paddingTop: 15,
    paddingBottom: 15
  },
  settings_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70
  },
  settings_row_title: {
    fontSize: 15,
    fontWeight: 'medium'
  },
  settings_line: {

  }
});
