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
          font_family = 'Montserrat-Thin';
          break;
        case 'extralight':
          font_family = 'Montserrat-ExtraLight';
          break;
        case 'light':
          font_family = 'Montserrat-Light';
          break;
        case 'regular':
          font_family = 'Montserrat-Regular';
          break;
        case 'medium':
          font_family = 'Montserrat-Medium';
          break;
        case 'semibold':
          font_family = 'Montserrat-SemiBold';
          break;
        case 'bold':
          font_family = 'Montserrat-Bold';
          break;
        case 'extrabold':
          font_family = 'Montserrat-ExtraBold';
          break;
        case 'black':
          font_family = 'Montserrat-Black';
          break;
        default:
          font_family = 'Montserrat-Regular'
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
