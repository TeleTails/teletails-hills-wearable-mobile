import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, View, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, RefreshControl, ImageBackground, StatusBar } from 'react-native';
import { Icon, Text, Colors } from '../components';
// import { SignInUniversal } from '../containers';
// import AuthController      from '../controllers/authController';
// import UtilitiesController from '../controllers/utilities-controller';

class Screen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      display_sign_in: false
    }
  }

  componentDidMount = async () => {
    // let user    = await AuthController.getUser();
    // let user_id = user && user.user_id ? user.user_id : '';
    // let token   = user && user.token   ? user.token   : '';
    // let named   = user && user.first_name && user.first_name.toLowerCase() !== 'pet' ? true : false;

    // this.setState({ display_sign_in: !user_id || !token || !named });
  }

  goBack = () => {
    this.props.navigation.pop();
  }

  render_left_nav_button = () => {
    let left_btn_action  = () => {
                              if (this.props.back_to_home) {
                                this.props.navigation.navigate('Home')
                              } else {
                                this.goBack();
                              }
                           }
        left_btn_action  = this.props.left_action ? this.props.left_action : left_btn_action;
    let is_modal         = this.props.modal && this.props.modal === true ? true : false;
    let hide_left_btn    = this.props.hide_left_btn || is_modal ? true : false;

    if (hide_left_btn) {
      return null;
    }

    return <TouchableOpacity onPress={left_btn_action}>
      <Icon name='chevron-circle-left' size={30} color={Colors.PRIMARY} />
    </TouchableOpacity>
  }

  render_right_nav_button = () => {
    let is_modal         = this.props.modal && this.props.modal === true ? true : false;
    let icon_color       = is_modal                   ? Colors.PRIMARY             : '#F7F8FA';
        icon_color       = this.props.right_btn_color ? this.props.right_btn_color : icon_color;
    let icon_name        = this.props.right_icon      ? this.props.right_icon      : 'dot-circle';
        icon_name        = is_modal                   ? 'close'                    : icon_name;
    let right_btn_action = this.props.right_action;
        right_btn_action = is_modal && !this.props.right_action ? () => { this.goBack() } : right_btn_action;
    let right_btn_icon   = this.props.right_btn_icon;

    if (!right_btn_action) {
      return <View style={{ width: 30 }}></View>;
    }

    return <TouchableOpacity onPress={ () => { right_btn_action() }}>
      <Icon name={ icon_name } size={30} solid={true} color={icon_color} />
    </TouchableOpacity>
  }

  render_navigation_bar = (hide_title) => {
    let title             = this.props.title || '';
    let nav_bar_container = this.props.modal ? styles.modal_nav_bar_container : styles.nav_bar_container;
    let hide_nav_bar      = this.props.hide_nav_bar === true ? true : false;

    if (hide_title) {
      title = '';
    }

    if (hide_nav_bar === true) {
      return null;
    }

    return <View style={nav_bar_container}>
      { this.render_left_nav_button() }
      <Text style={{ fontSize: 18, color: '#000000', fontWeight: 'bold' }}>{ title }</Text>
      { this.render_right_nav_button() }
    </View>
  }

  render() {

    let passed_style  = this.props.style || {};
    let new_style     = Object.assign({}, passed_style)
    let enable_scroll = this.props.scroll === true ? true : false;
    let is_web        = Platform.OS === 'web';
    let disply_bg_img = this.props.bg_image === true ? true : false;
    let bg_white      = this.props.bg_white === true ? true : false;

    // let image_bg = require('../assets/images/default-bg-image.png');
    //     image_bg = bg_white ? require('../assets/images/default-bg-image-white.png') : image_bg;
    //     image_bg = disply_bg_img && this.state.display_sign_in && is_web ? require('../assets/images/web-sign-in-bg.png') : image_bg;

    // refreshControl={
    //   <RefreshControl
    //   refreshing={this.props.refresh_loading}
    //   enabled={true}
    //   colors={[Colors.PRIMARY]}
    //   tintColor={Colors.PRIMARY}
    //   onRefresh={ () => {
    //     if (this.props.refresh_action) {
    //       this.props.refresh_action();
    //     }
    //   }} />
    // }
    //

    let  sign_in_view  = false;
    let top_padding    = Platform.OS === "android" ? StatusBar.currentHeight : 0;
    let boreder_radius = new_style && new_style.borderRadius ? new_style.borderRadius : 0;

    if (enable_scroll) {
      return (

        <SafeAreaView style={[ styles.main_container, new_style ]} >
          <View style={{ height: top_padding }} />
          { this.render_navigation_bar(sign_in_view) }

          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={ Platform.OS === 'ios' ? 'padding' : 'height' }
            keyboardVerticalOffset={ Platform.OS === 'ios' || Platform.OS === 'android' ? 0 : 0 }>

            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              <View style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{ maxWidth: 450, width: '100%', flex: 1 }}>
                    { this.props.children }
                  </View>
              </View>
            </ScrollView>

          </KeyboardAvoidingView>
        </SafeAreaView>

      );
    } else {
      return (
        <SafeAreaView style={[ styles.main_container, new_style ]} >
            <View style={{ height: top_padding }} />
            { this.render_navigation_bar() }
            <View style={{ flex: 1, alignItems: 'center', borderRadius: boreder_radius, overflow: 'hidden' }}>
                <View style={{ maxWidth: 450, width: '100%', flex: 1 }}>
                  { this.props.children }
                </View>
            </View>
        </SafeAreaView>
      );
    }
  }
}

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    backgroundColor: 'white',
  },
  nav_bar_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center'
  },
  modal_nav_bar_container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '500'
  }
});

export default Screen
