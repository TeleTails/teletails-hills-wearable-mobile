import { Component } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Colors, Text } from '../components';

class Input extends Component {

  constructor(props) {
    super(props);
    this.state = {
      border_color: this.props.border_color || '#bbbbc0',
      is_active: false
    }
  }

  render_date_input = (combined_props) => {
    let value         = this.props.value || '';
    let change_action = this.props.onChangeText;

    return <TextInput placeholder={ combined_props.placeholder }
                      value={ combined_props.value }
                      autoCapitalize={ combined_props.autoCapitalize }
                      autoCorrect={ combined_props.autoCorrect }
                      keyboardType='number-pad'
                      onBlur={  () => { this.setState({ is_active: false, border_color: this.props.border_color || '#bbbbc0' }) }}
                      onFocus={ () => { this.setState({ is_active: true,  border_color: Colors.PRIMARY }) }}
                      style={[ styles.default_style, combined_props.active_style, combined_props.passed_style ]}
                      onChangeText={ (input_str) => {
                        let date_str = input_str;
                        let backed   = input_str.length > 1 && input_str[input_str.length - 1] === '/' ? true : false;
                        let cleaned  = date_str.replace('/', '')
                        if (input_str.length >= 10) {
                          combined_props.change_action(input_str.slice(0, 10));
                          return;
                        }
                        if (cleaned.length > 2 && cleaned.length < 5) {
                          cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2)
                        }

                        if (cleaned.length === 5) {
                          cleaned = cleaned.replace('/', '');
                          cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
                        }

                        if (cleaned.length > 5) {
                          cleaned = cleaned.replace('/', '');
                          cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4);
                        }
                        combined_props.change_action(cleaned);
                      }}
                     />
  }

  render_text_input(combined_props) {
    return <TextInput placeholder={ combined_props.placeholder }
                      defaultValue={ combined_props.value }
                      autoCapitalize={ combined_props.autoCapitalize }
                      autoCorrect={ combined_props.autoCorrect }
                      keyboardType={ combined_props.keyboardType }
                      secureTextEntry={ combined_props.secureTextEntry }
                      textContentType={ combined_props.textContentType }
                      onBlur={  () => { this.setState({ is_active: false, border_color: this.props.border_color || '#bbbbc0' }) }}
                      onFocus={ () => { this.setState({ is_active: true,  border_color: Colors.PRIMARY }) }}
                      style={[ styles.default_style, combined_props.active_style, combined_props.passed_style ]}
                      onChangeText={ combined_props.change_action }
                     />
  }

  render_input() {

    let value         = this.props.value || '';
    let change_action = this.props.onChangeText;
    let placeholder   = this.props.placeholder || '';
    let passed_style  = this.props.style || {};
    let active_style  = { borderColor: this.state.border_color }

    let textContentType = this.props.textContentType || 'none';
    let autoCapitalize  = this.props.autoCapitalize || 'none';
    let autoCorrect     = this.props.autoCorrect     === true ? true : false;
    let secureTextEntry = this.props.secureTextEntry === true ? true : false;
    let keyboardType    = this.props.keyboardType || 'default';

    let combined_props = { value, change_action, placeholder, passed_style, active_style, autoCapitalize, autoCorrect, textContentType, secureTextEntry, keyboardType };

    switch(this.props.type) {
      case 'date-mmddyyyy':
        return this.render_date_input(combined_props);
      default:
        return this.render_text_input(combined_props);
    }
  }

  render_label = () => {
    let label = this.props.label || '';
    let label_style = this.props.labelStyle || '';

    if (!label) {
      return null;
    }

    return <View style={{ marginLeft: 10, height: 18, backgroundColor: 'white', position: 'absolute', zIndex: 3, elevation: 0, paddingRight: 8, paddingLeft: 8 }}>
              <Text style={[ { color: Colors.TEXT_GREY }, label_style ]}>{ label }</Text>
           </View>
  }

  render() {
    let label      = this.props.label || '';
    let pad_height = label ? 9 : 0;
    return (
      <View style={{  }}>
        <View style={{ height: pad_height }} />
        { this.render_label() }
        { this.render_input() }
      </View>
    );
  }

}

const styles = StyleSheet.create({
  default_style: {
    color: Colors.TEXT_GREY,
    borderWidth: 1,
    padding: 15,
    paddingTop: 18,
    paddingBottom: 18,
    borderRadius: 12,
    backgroundColor: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-Regular'
  }
});

export default Input
