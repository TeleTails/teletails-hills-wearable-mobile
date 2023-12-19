import { Component } from "react";
import { Image, View, TouchableOpacity } from 'react-native';

class Icon extends Component {

  render() {
    let icon_name = this.props.name || '';

    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        { this.get_image_component(icon_name) }
      </View>
    );
  }

  get_image_component = (icon_name) => {
    let style      = this.props.style;
    let size       = this.props.size   || 30;
    let width      = this.props.width  || size;
    let height     = this.props.height || size;
        height     = this.props.size && !this.props.height ? width: height;
    let color      = this.props.color  || 'black';
    let style_obj  = { height: height, width: width, tintColor: color, ...style };

    let component  = <View></View>;

    switch (icon_name) {
      case 'arrow-right':
        component = <Image style={ style_obj } source={ require('../../assets/icons/arrow-right.png') } />
        break;
      case 'arrow-up':
        component = <Image style={ style_obj } source={ require('../../assets/icons/arrow-up.png') } />
        break;
      case 'arrow-circle-right':
        component = <Image style={ style_obj } source={ require('../../assets/icons/arrow-circle-right.png') } />
        break;
      case 'check':
        component = <Image style={ style_obj } source={ require('../../assets/icons/check.png') } />
        break;
      case 'check-circle':
        component = <Image style={ style_obj } source={ require('../../assets/icons/check-circle.png') } />
        break;
      case 'chevron-left':
        component = <Image style={ style_obj } source={ require('../../assets/icons/chevron-left.png') } />
        break;
      case 'chevron-right':
        component = <Image style={ style_obj } source={ require('../../assets/icons/chevron-right.png') } />
        break;
      case 'chevron-circle-left':
        component = <Image style={ style_obj}  source={ require('../../assets/icons/chevron-circle-left.png') } />
        break;
      case 'chevron-circle-right':
        component = <Image style={ style_obj}  source={ require('../../assets/icons/chevron-circle-right.png') } />
        break;
      case 'close':
        component = <Image style={ style_obj}  source={ require('../../assets/icons/close.png') } />
        break;
      case 'ellipsis':
        component = <Image style={ style_obj}  source={ require('../../assets/icons/ellipsis.png') } />
        break;
      case 'envelope':
        component = <Image style={ style_obj}  source={ require('../../assets/icons/envelope.png') } />
        break;
      case 'home':
        component = <Image style={ style_obj } source={ require('../../assets/icons/home.png') } />
        break;
      case 'health':
        component = <Image style={ style_obj } source={ require('../../assets/icons/health.png') } />
        break;
      case 'consultation':
        component = <Image style={ style_obj } source={ require('../../assets/icons/consultation.png') } />
        break;
      case 'shopping-bag':
        component = <Image style={ style_obj } source={ require('../../assets/icons/shopping-bag.png') } />
        break;
      case 'live-chat':
        component = <Image style={ style_obj } source={ require('../../assets/icons/live-chat.png') } />
        break;
      case 'location':
        component = <Image style={ style_obj } source={ require('../../assets/icons/location.png') } />
        break;
      case 'paperclip':
        component = <Image style={ style_obj } source={ require('../../assets/icons/paperclip.png') } />
        break;
      case 'plus-circle':
        component = <Image style={ style_obj } source={ require('../../assets/icons/plus-circle.png') } />
        break;
      case 'hamburger-menu':
        component = <Image style={ style_obj } source={ require('../../assets/icons/hamburger-menu.png') } />
        break;
      case 'minus-circle':
        component = <Image style={ style_obj } source={ require('../../assets/icons/minus-circle.png') } />
        break;
      case 'setting':
        component = <Image style={ style_obj } source={ require('../../assets/icons/setting.png') } />
        break;
      case 'video':
        component = <Image style={ style_obj } source={ require('../../assets/icons/video.png') } />
        break;
      case 'video-call':
        component = <Image style={ style_obj } source={ require('../../assets/icons/video-call.png') } />
        break;
      case 'user':
        component = <Image style={ style_obj } source={ require('../../assets/icons/user.png') } />
        break;
      default:

    }

    if (this.props.onPress) {
      return <TouchableOpacity onPress={() => { this.props.onPress() }}>
        { component }
      </TouchableOpacity>
    } else {
      return component;
    }
  }

}

export default Icon;
