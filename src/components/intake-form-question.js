import { Component } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Input, Colors, Text } from '../components';

class IntakeFormQuestion extends Component {

  constructor(props) {
    super(props);
    this.state = {
      response_object: {},
    }
  }

  componentDidMount() {

  }

  render_base_question = () => {
    let question_text = this.props.question && this.props.question.question_text ? this.props.question.question_text : '';

    return <View>
      <Text style={styles.question_text}>{ question_text }</Text>
    </View>
  }

  render_choices = (choices) => {
    let num_of_choices = choices ? choices.length : 0;

    if (num_of_choices === 0) {
      return null;
    }

    let choice_rows = choices.map((choice_str) => {
      let selected_choice = this.state.response_object && this.state.response_object.choice_response ? this.state.response_object.choice_response : '';
      let selected_style  = [styles.selected_choice, { backgroundColor: 'black' }];
      let default_style   = styles.default_choice;
      let is_selected     = selected_choice === choice_str;
      let choice_style    = is_selected ? selected_style : default_style;
      return <TouchableOpacity key={choice_str}
                               style={choice_style}
                               onPress={ () => {
                                 let updated_res_obj = Object.assign({}, this.state.response_object);
                                 updated_res_obj['choice_response'] = choice_str;
                                 this.update_parent_object(updated_res_obj);
                                 this.setState({ response_object: updated_res_obj });
                               }}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: is_selected ? 'white' : 'black', fontWeight: 'semibold' }}>{ choice_str }</Text>
      </TouchableOpacity>
    })

    return <View>
      { choice_rows }
    </View>
  }

  render_text_prompt = (text_prompt) => {
    if (!text_prompt) {
      return null;
    }

    return <View style={{ marginBottom: 10, marginTop: 15 }}>
      <Text style={{ color: Colors.TEXT_GREY, fontSize: 18 }}>{ text_prompt }</Text>
    </View>
  }

  render_input_box = () => {
    let question      = this.props.question;
    let choices       = question && question.choices     ? question.choices     : [];
    let text_prompt   = question && question.text_prompt ? question.text_prompt : '';
    let display_input = choices.length === 0 || text_prompt;
    let response_text = this.state.response_object && this.state.response_object.response_text ? this.state.response_object.response_text : '';

    if (!display_input) {
      return null;
    }

    return <View>
      <Input value={ response_text }
             style={{ marginBottom: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             onChangeText={(input_text)=>{
               let new_response_text = input_text;
               let updated_res_obj   = Object.assign({}, this.state.response_object);
               updated_res_obj['response_text'] = new_response_text;
               this.update_parent_object(updated_res_obj)
               this.setState({ response_object: updated_res_obj });
             }}/>
    </View>
  }

  render() {
    let question    = this.props.question;
    let choices     = question && question.choices     ? question.choices     : [];
    let text_prompt = question && question.text_prompt ? question.text_prompt : '';

    return <View style={{  }}>
        { this.render_base_question()          }
        { this.render_choices(choices)         }
        { this.render_text_prompt(text_prompt) }
        { this.render_input_box(question)      }
      </View>
  }

  update_parent_object = (lastest_response_object) => {
    let question_text = this.props.question && this.props.question.question_text ? this.props.question.question_text : '';
    let updated_obj   = Object.assign({}, lastest_response_object);

    if (!updated_obj.question_text) {
      updated_obj['question_text'] = question_text;
    }

    if (this.props.on_change) {
      this.props.on_change(updated_obj);
    }
  }
}

const styles = StyleSheet.create({
  selected_choice: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 5,
  },
  default_choice: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 5,
    backgroundColor: 'white'
  },
  question_text: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 15
  }
});

export default IntakeFormQuestion
