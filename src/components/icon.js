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
      case 'home':
        return <Image style={ style_obj } source={ require('../../assets/icons/home.png') } />
        break;
      default:

    }
  }

}

export default Icon;
