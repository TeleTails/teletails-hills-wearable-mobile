import LottieView from 'lottie-react-native';
import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Icon, Colors, Text } from '../components';

class Button extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {

    let btn_style  = this.props.style   || {};
    let btn_title  = this.props.title   || 'Submit';
    let is_loading = this.props.loading === true ? true : false;
    let btn_action;
    let inactive   = this.props.inactive;
    let icon_name  = this.props.icon ? this.props.icon : '';
    let outline    = this.props.outline === true ? true : false;

    let title_style  = this.get_title_style();

    let styles_array = [ styles.default_style, { backgroundColor: Colors.PRIMARY }, btn_style ];
        styles_array = outline ? [ styles.outline_style, { borderColor: Colors.PRIMARY }, btn_style ] : styles_array;

    if(inactive) {
      let intactive_btn_style = styles.inactive_button;
        if(typeof intactive_btn_style !== 'number') {
        intactive_btn_style['backgroundColor'] = Colors.PRIMARY_FADED || '#8bdaf7';
        styles_array.push(intactive_btn_style);
      }
    } else {
      btn_action = this.props.onPress ? this.props.onPress : () => { };
    }

    return (
      <TouchableOpacity style={styles_array}
                        onPress={btn_action}>
        <View style={{ height: 25, width: 25 }}>
          { is_loading  ? <LottieView autoPlay style={{ width: 25, height: 25 }} source={ require('../../assets/animations/white-spinner.json') } /> : null }
          { !is_loading && icon_name ? <Icon name={icon_name} size={19} style={{ marginTop: 2 }} solid={true} color={ outline ? Colors.PRIMARY : 'white' } /> : null }
        </View>
        <Text style={title_style}>{ btn_title }</Text>
        <View style={{ height: 25, width: 25 }}></View>
      </TouchableOpacity>
    );
  }

  get_title_style = () => {

    let btn_style         = this.props.style     || {};

    let title_color       = btn_style.color      || null;
    let title_font_size   = btn_style.fontSize   || null;
    let title_font_weight = btn_style.fontWeight || null;
    let outline           = this.props.outline === true ? true : false;

    let title_style_obj   = {};

    if (outline)           { title_style_obj['color']      = Colors.PRIMARY    }
    if (title_color)       { title_style_obj['color']      = title_color       }
    if (title_font_size)   { title_style_obj['fontSize']   = title_font_size   }
    if (title_font_weight) { title_style_obj['fontWeight'] = title_font_weight }

    return [ styles.default_title_style, { fontWeight: '500' }, title_style_obj ]
  }

}

const styles = StyleSheet.create({
  default_style: {
    backgroundColor: '#1dc2ff',
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  default_title_style: {
    color: 'white',
    fontWeight: '500',
    marginRight: 10,
    marginLeft: 10,
    fontSize: 16
  },
  inactive_button: {
    backgroundColor: '#add5f5'
  },
  outline_style: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default Button
