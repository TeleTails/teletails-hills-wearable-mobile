import { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Input, Button, Colors, Text } from '../components';
import { ArrayUtils } from '../utils';
import { PetsController, ConsultationController } from '../controllers';

class ConsultationFeedbackForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loading_submit_feedback: false,
      feedback_data: {
        satisfied: 0,
        recommend: 0,
        better: '',
      },
    }

  }

  componentDidMount() {

  }

  render_ten_point_rating = (key) => {
    let numbers      = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let selected_clr = this.props.primary_color || Colors.PRIMARY;

    let number_btns = numbers.map((number) => {
      let is_selected = this.state.feedback_data[key] === number;
      let color       = is_selected ? selected_clr : Colors.BORDER_GREY;
      return <TouchableOpacity style={{ borderWidth: 2, borderRadius: 10, padding: 10, borderColor: color }}
                               onPress={ () => {
                                 let new_feedback_obj = Object.assign({}, this.state.feedback_data);
                                 new_feedback_obj[key] = number;
                                 this.setState({ ...this.state, feedback_data: new_feedback_obj });
                               }}>
        <Text style={{ fontWeight: 'bold', color: Colors.TEXT_GREY }}>{ number }</Text>
      </TouchableOpacity>
    })

    return <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
      { number_btns }
    </View>
  }

  render_satisfied_question = () => {

    return <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>How satisfied are you with your care session?</Text>
      <View style={{ flexDirection: 'row' }}>
        { this.render_ten_point_rating('satisfied') }
      </View>
    </View>
  }

  render_recommend_section = () => {
    return <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>How likely would you be to recommend this service?</Text>
      <View style={{ flexDirection: 'row' }}>
        { this.render_ten_point_rating('recommend') }
      </View>
    </View>
  }

  render_better_section = () => {
    return <View>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>How was your experience today? We’d love to hear your feedback.</Text>
      <TextInput
        style={{ borderWidth: 2, borderRadius: 15, height: 120, borderColor: Colors.BORDER_GREY, padding: 15, paddingTop: 15, fontSize: 16 }}
        value={this.state.feedback_data['better']}
        maxHeight={120}
        autoCorrect={false}
        onChangeText={ (text) => {
          let new_feedback_obj = Object.assign({}, this.state.feedback_data);
          new_feedback_obj['better'] = text;
          this.setState({ ...this.state, feedback_data: new_feedback_obj });
        }}
        multiline={true}
      />
    </View>
  }

  render() {

    return (
      <View style={styles.main_container}>
        <Text style={{ fontWeight: '500', fontSize: 18, marginBottom: 10 }}>FEEDBACK FORM</Text>

        { this.render_satisfied_question() }
        { this.render_recommend_section()  }
        { this.render_better_section()     }

        <Button title='Submit Feedback'
                style={{ marginTop: 15 }}
                loading={this.state.loading_submit_feedback}
                onPress={ () => {

                  let care_consultation         = this.props.consultation;
                  let care_consultation_id      = care_consultation && care_consultation._id ? care_consultation._id : '';

                  let request_object       = {
                    care_consultation_id: care_consultation_id,
                    feedback_data: this.state.feedback_data,
                  }

                  if (care_consultation_id) {

                    this.setState({ loading_submit_feedback: true}, async () => {

                      let feedback_data_response = await ConsultationController.submitCareConsultationFeedback(request_object);

                      this.setState({ loading_submit_feedback: false });
                      if (this.props.submit_action) {
                        this.props.submit_action();
                      }
                    });

                  }

                }}/>

      </View>
    );
  }

}

const styles = StyleSheet.create({
  main_container: {

  },
  pet_row_container: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: 'grey',
    marginTop: 5,
    marginBottom: 5
  }
});

export default ConsultationFeedbackForm
