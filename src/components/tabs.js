import { Component } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon } from '../components';

class Tabs extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {

    return <View style={styles.container}>
      <TouchableOpacity style={styles.tab_button_container} onPress={ () => { this.props.home_action() }}>
        <Icon name='home' size={25} style={{ marginTop: 10, tintColor: this.get_tint_color('home') }} />
        <Text style={ [styles.tab_button_title, { color: this.get_tint_color('home') } ]}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab_button_container} onPress={ () => { this.props.health_action() }}>
        <Icon name='health' size={25} style={{ marginTop: 10, tintColor: this.get_tint_color('health') }} />
        <Text style={ [styles.tab_button_title, { color: this.get_tint_color('health') } ]}>Health</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab_button_container} onPress={ () => { this.props.vet_chat_action() }}>
        <Icon name='consultation' size={25} style={{ marginTop: 10, tintColor: this.get_tint_color('vet_chat') }} />
        <Text style={ [styles.tab_button_title, { color: this.get_tint_color('vet_chat') } ]}>Vet Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab_button_container} onPress={ () => { this.props.shop_action() }}>
        <Icon name='shopping-bag' size={25} style={{ marginTop: 10, tintColor: this.get_tint_color('shop') }} />
        <Text style={ [styles.tab_button_title, { color: this.get_tint_color('shop') } ]}>Shop</Text>
      </TouchableOpacity>
    </View>
  }

  get_tint_color = (tab_name) => {
    let selected_tab = this.props.selected_tab;

    if (tab_name === selected_tab) {
      return 'blue';
    } else {
      return '#4c4c4c';
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#e7e7e7'
  },
  tab_button_container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  tab_button_title: {
    fontSize: 11,
    fontWeight: 'medium',
    marginBottom: 5
  }
});

export default Tabs
