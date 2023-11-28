import { Component } from 'react';
import { View } from 'react-native';

class Line extends Component {

  render() {
    let default_style = { backgroundColor: '#e7e7e7', height: 1, width: '100%' };
    let style         = this.props.style;

    if (style) {
      Object.keys(style).forEach((key) => {
        default_style[key] = style[key];
      })
    }

    if (this.props.hide) {
      return null;
    }

    return <View style={default_style}></View>
  }

}

export default Line
