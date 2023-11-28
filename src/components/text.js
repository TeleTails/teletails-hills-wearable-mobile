import { Component } from 'react';
import { Text as DefaultText } from 'react-native';
import { Colors } from '../components';

class Text extends Component {

  render() {

    let style       = this.props.style;
    let font_family = 'Poppins-Regular';
    let hide        = this.props.hide ? true : false;
    let font_weight = 'regular';
        font_weight = style && style.fontWeight ? style.fontWeight : font_weight;

    if (style && style.length) {
      style.forEach((styl_obj) => {
        if (styl_obj && styl_obj.fontWeight) {
          font_weight = styl_obj.fontWeight;
        }
      })
    }

    if (font_weight) {
      switch (font_weight) {
        case 'thin':
          font_family = 'Poppins-Thin';
          break;
        case 'extralight':
          font_family = 'Poppins-ExtraLight';
          break;
        case 'light':
          font_family = 'Poppins-Light';
          break;
        case 'regular':
          font_family = 'Poppins-Regular';
          break;
        case 'medium':
          font_family = 'Poppins-Medium';
          break;
        case 'semibold':
          font_family = 'Poppins-SemiBold';
          break;
        case 'bold':
          font_family = 'Poppins-Bold';
          break;
        case 'extrabold':
          font_family = 'Poppins-ExtraBold';
          break;
        case 'black':
          font_family = 'Poppins-Black';
          break;
        default:
          font_family = 'Poppins-Regular'
      }
    }

    if (hide) {
      return null;
    }

    let style_prop = style && style.length ? [ { fontFamily: font_family, color: 'black' }, ...style ] : { fontFamily: font_family, color: 'black', ...style };

    return <DefaultText { ...this.props } style={style_prop} >{ this.props.children }</DefaultText>
  }

}

export default Text
