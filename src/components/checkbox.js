import { Component } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Icon, Colors } from '../components';

class Checkbox extends Component {

  render() {
    let default_style = { flexDirection: 'row', alignItems: 'center' };
    let style         = this.props.style;
    let onPress       = this.props.onPress;
    let label         = this.props.label;
    let label_color   = this.props.label_color || 'black';
    let checked       = this.props.checked;

    let background_color = checked ? Colors.PRIMARY : 'white';
    let border_color     = checked ? Colors.PRIMARY : '#e7e7e7';

    if (!checked && style && style.borderColor) {
      border_color = style.borderColor;
    }

    return <TouchableOpacity style={[default_style, style]} onPress={onPress}>
      <View style={{ backgroundColor: background_color, padding: 2, borderWidth: 2, borderColor: border_color, borderRadius: 8, height: 26, width: 26, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name='check' size={12} color={'white'} />
      </View>
      <Text style={{ marginLeft: 8, color: label_color, fontSize: 18 }}>{ label }</Text>
    </TouchableOpacity>
  }

}

export default Checkbox
