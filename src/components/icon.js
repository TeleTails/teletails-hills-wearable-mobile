import { Component } from "react";
import { Image, View } from 'react-native';

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

    switch (icon_name) {
      case 'arrow-right':
        return <Image style={ style_obj } source={ require('../../assets/icons/arrow-right.png') } />
        break;
      case 'arrow-up':
        return <Image style={ style_obj } source={ require('../../assets/icons/arrow-up.png') } />
        break;
      case 'arrow-circle-right':
        return <Image style={ style_obj } source={ require('../../assets/icons/arrow-circle-right.png') } />
        break;
      case 'check':
        return <Image style={ style_obj } source={ require('../../assets/icons/check.png') } />
        break;
      case 'check-circle':
        return <Image style={ style_obj } source={ require('../../assets/icons/check-circle.png') } />
        break;
      case 'chevron-left':
        return <Image style={ style_obj } source={ require('../../assets/icons/chevron-left.png') } />
        break;
      case 'chevron-right':
        return <Image style={ style_obj } source={ require('../../assets/icons/chevron-right.png') } />
        break;
      case 'chevron-circle-left':
        return <Image style={ style_obj}  source={ require('../../assets/icons/chevron-circle-left.png') } />
        break;
      case 'chevron-circle-right':
        return <Image style={ style_obj}  source={ require('../../assets/icons/chevron-circle-right.png') } />
        break;
      case 'close':
        return <Image style={ style_obj}  source={ require('../../assets/icons/close.png') } />
        break;
      case 'ellipsis':
        return <Image style={ style_obj}  source={ require('../../assets/icons/ellipsis.png') } />
        break;
      case 'envelope':
        return <Image style={ style_obj}  source={ require('../../assets/icons/envelope.png') } />
        break;
      case 'home':
        return <Image style={ style_obj } source={ require('../../assets/icons/home.png') } />
        break;
      case 'health':
        return <Image style={ style_obj } source={ require('../../assets/icons/health.png') } />
        break;
      case 'consultation':
        return <Image style={ style_obj } source={ require('../../assets/icons/consultation.png') } />
        break;
      case 'shopping-bag':
        return <Image style={ style_obj } source={ require('../../assets/icons/shopping-bag.png') } />
        break;
      case 'live-chat':
        return <Image style={ style_obj } source={ require('../../assets/icons/live-chat.png') } />
        break;
      case 'location':
        return <Image style={ style_obj } source={ require('../../assets/icons/location.png') } />
        break;
      case 'paperclip':
        return <Image style={ style_obj } source={ require('../../assets/icons/paperclip.png') } />
        break;
      case 'plus-circle':
        return <Image style={ style_obj } source={ require('../../assets/icons/plus-circle.png') } />
        break;
      case 'hamburger-menu':
        return <Image style={ style_obj } source={ require('../../assets/icons/hamburger-menu.png') } />
        break;
      case 'setting':
        return <Image style={ style_obj } source={ require('../../assets/icons/setting.png') } />
        break;
      case 'video':
        return <Image style={ style_obj } source={ require('../../assets/icons/video.png') } />
        break;
      case 'video-call':
        return <Image style={ style_obj } source={ require('../../assets/icons/video-call.png') } />
        break;
      case 'user':
        return <Image style={ style_obj } source={ require('../../assets/icons/user.png') } />
        break;
      default:

    }
  }

}

export default Icon;
