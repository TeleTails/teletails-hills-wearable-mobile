import { Component } from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';
import { Screen, Line, Text, Icon, Cards, IntakeFormQuestion, Button } from '../components';
import { PetsController, ConsultationController } from '../controllers';
import { config }            from '../../config';
import { VideoCallSchedule } from '../containers';
import { setItem, getItem }  from '../../storage';
import { StringUtils }       from '../utils';

class ConsultationStartScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      current_section: 'pets', // pets triage category intake schedule
      pets: [],
      intake_questions: [],
      intake_responses: {},
      selected_pet: {},
      selected_category: {},
      pet_can_interact_response: '',
      pet_breathing_response: '',
      consultation_type: 'video'
    }
  }

  componentDidMount = async () => {
    this.pull_pets();
    this.pull_intake_questions();
  }

  render_progress_bar = () => {
    let section    = this.state.current_section;
    let percentage = '20%';
        percentage = section === 'pets'     ? '20%' : percentage;
        percentage = section === 'triage'   ? '40%' : percentage;
        percentage = section === 'category' ? '60%' : percentage;
        percentage = section === 'intake'   ? '80%' : percentage;
        percentage = section === 'schedule' ? '90%' : percentage;

        percentage = section === 'intake' && this.state.consultation_type === 'chat' ? '90%' : percentage;

    return <View style={styles.progress_bar_container}>
      <View style={styles.progress_bar}>
        <View style={{ height: '100%', width: percentage, backgroundColor: 'blue', borderRadius: 20 }}></View>
      </View>
    </View>
  }

  render_pet_selection = () => {
    if (this.state.current_section !== 'pets') {
      return null;
    }

    let pets = this.state.pets || [];

    let pet_rows = pets.map((pet) => {
      let pet_name = StringUtils.displayName(pet);
      return <View>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.pet_selection_action(pet) }}>
          <Text style={styles.selection_row_title}>{ pet_name }</Text>
        </TouchableOpacity>
        <Line />
      </View>
    })

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Select a pet</Text>
      { pet_rows }
    </View>
  }

  render_triage = () => {
    if (this.state.current_section !== 'triage') {
      return null;
    }

    let display_second_triage = this.state.pet_can_interact_response === 'no';

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Triage Questions</Text>

      <Text style={styles.triage_question}>Is your pet unresponsive or unable to interact with you?</Text>
      <View style={styles.triage_buttons_container}>
        <TouchableOpacity style={ this.state.pet_can_interact_response === 'yes' ? styles.triage_button_selected : styles.triage_button} onPress={ () => { this.setState({ pet_can_interact_response: 'yes' }) }}><Text style={ this.state.pet_can_interact_response === 'yes' ? styles.triage_button_title_selected : styles.triage_button_title }>Yes</Text></TouchableOpacity>
        <View style={styles.triage_button_buffer} />
        <TouchableOpacity style={ this.state.pet_can_interact_response === 'no'  ? styles.triage_button_selected : styles.triage_button} onPress={ () => { this.setState({ pet_can_interact_response: 'no'  }) }}><Text style={ this.state.pet_can_interact_response === 'no'  ? styles.triage_button_title_selected : styles.triage_button_title }>No</Text></TouchableOpacity>
      </View>
      <View style={{ height: 10 }} />

      { display_second_triage ? <View>
      <Text style={styles.triage_question}>Is your pet having trouble breathing?</Text>
      <View style={styles.triage_buttons_container}>
        <TouchableOpacity style={ this.state.pet_breathing_response === 'yes' ? styles.triage_button_selected : styles.triage_button} onPress={ () => { this.setState({ pet_breathing_response: 'yes' }) }}><Text style={ this.state.pet_breathing_response === 'yes' ? styles.triage_button_title_selected : styles.triage_button_title }>Yes</Text></TouchableOpacity>
        <View style={styles.triage_button_buffer} />
        <TouchableOpacity style={ this.state.pet_breathing_response === 'no'  ? styles.triage_button_selected : styles.triage_button} onPress={ () => { this.setState({ pet_breathing_response: 'no',  current_section: 'category' }) }}><Text style={ this.state.pet_breathing_response === 'no'  ? styles.triage_button_title_selected : styles.triage_button_title }>No</Text></TouchableOpacity>
      </View>
      </View> : null }

      { this.render_emergency_message() }

    </View>
  }

  render_emergency_message = () => {
    let display_emergency_message = this.state.pet_can_interact_response === 'yes' || this.state.pet_breathing_response === 'yes';
    if (display_emergency_message) {
      return <View style={{ marginBottom: 15, marginTop: 20 }}>
        <Text style={{ color: '#39C0B2', fontSize: 16 }}>This sounds like an emergency. Please call your nearest animal hospital for immediate in-person help.</Text>
      </View>
    }
  }

  render_category = () => {
    if (this.state.current_section !== 'category') {
      return null;
    }

    let categories = [ 'allergies', 'anxiety', 'behavior', 'dental', 'general_advice', 'joint_health', 'nutrition', 'sensitive_stomach', 'skin_and_ears' ];
    let category_rows = categories.map((category) => {
      let display_category = StringUtils.keyToDisplayString(category);
      return <View>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.category_selection_action(category) }}>
          <Text style={styles.selection_row_title}>{ display_category }</Text>
        </TouchableOpacity>
        <Line />
      </View>
    })

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Select a Category</Text>
      { category_rows }
    </View>
  }

  render_intake = () => {
    if (this.state.current_section !== 'intake') {
      return null;
    }

    let questions = this.state.intake_questions;
    let question_rows = questions.map((question_obj, index) => {
    let question_index = question_obj.index;
    let question_text  = question_obj.question_text;

    return <IntakeFormQuestion
              key={index}
              question={question_obj}
              on_change={ (intake_response) => {
                let updated_responses = Object.assign({}, this.state.intake_responses);
                updated_responses[question_index] = intake_response;
                this.setState({ intake_responses: updated_responses });
              }}
            />
  })

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Intake Questions</Text>
      { question_rows }
      <Button title='Continue To Schedule Appointment ' onPress={ () => { this.continue_action() }} />
    </View>
  }

  render_schedule = () => {
    if (this.state.current_section !== 'schedule') {
      return null;
    }

    let practice_id = config.practice_id;
    let partner_id  = config.partner_id;
    let patient_id  = this.state.selected_pet && this.state.selected_pet._id ? this.state.selected_pet._id : '';

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Book a video session</Text>
      <Text style={{ color: 'grey', fontSize: 16, marginBottom: 20 }}>Select a date and time for your video call</Text>
      <VideoCallSchedule
        practice_id={practice_id}
        partner_id={partner_id}
        loading_create_consultation={this.state.loading_create_consultation}
        schedule_display_section={ this.state.display_section }
        display_change_action={ (section_name) => { this.setState({ display_section: section_name }) }}
        booking_confirmation_action={ async (availability_slot_id) => {

          if (!availability_slot_id) {
            console.log(' ERROR ')
            return;
          }

          this.setState({ loading_create_consultation: true });

          let consultation_data = {
            partner_id: partner_id,
            type: 'VIDEO',
            category: this.state.selected_category,
            patient_id: patient_id,
            is_training: false,
            is_async: false
          }

          let create_res = await ConsultationController.createCareConsultation(consultation_data);
          let is_success = create_res && create_res.success ? true : false;
          let care_consultation_id = is_success && create_res.data && create_res.data.care_consultation && create_res.data.care_consultation._id ? create_res.data.care_consultation._id : '';

          if (!is_success || !care_consultation_id) {
            console.log(' ERROR ')
            this.setState({ loading_create_consultation: false });
            return;
          }

          let intake_responses = this.state.intake_responses ? Object.values(this.state.intake_responses) : [];
          let intake_data      = { care_consultation_id: care_consultation_id, responses: intake_responses, category: this.state.selected_category }
          let intake_res       = await ConsultationController.createIntakeResponse(intake_data);

          let assign_data    = { care_consultation_id: care_consultation_id, availability_slot_id: availability_slot_id }
          let assign_res     = await ConsultationController.assignVideoAppointment(assign_data);
          let assign_success = assign_res && assign_res.success ? true : false;

          if (!assign_success) {
            console.log(' ERROR ')
            this.setState({ loading_create_consultation: false });
            return;
          }

          if (assign_success) {
            this.props.navigation.push('ConsultationVideoAppointment', { care_consultation_id: care_consultation_id, back_to_home: true });
          }

          this.setState({ loading_create_consultation: false });
        }}
      />
    </View>
  }

  render() {
    return <Screen title='New Consult' scroll={true} navigation={this.props.navigation} left_action={this.back_button_action}>
      { this.render_progress_bar()  }
      { this.render_pet_selection() }
      { this.render_triage()        }
      { this.render_category()      }
      { this.render_intake()        }
      { this.render_schedule()      }
    </Screen>
  }

  category_selection_action = (category) => {
    this.setState({ selected_category: category, current_section: 'intake' });
  }

  pet_selection_action = (pet) => {
    this.setState({ selected_pet: pet, current_section: 'triage' });
  }

  pull_pets = async () => {
    let pets_response = await PetsController.getPets();
    let is_success    = pets_response && pets_response.success;
    let pets          = is_success && pets_response.data && pets_response.data.pets ? pets_response.data.pets : [];
    this.setState({ pets: pets });
  }

  pull_intake_questions = async () => {
    let intake_questions = await ConsultationController.getIntakeQuestions();
    this.setState({ intake_questions: intake_questions });
  }

  back_button_action = () => {
    let current_display_section = this.state.current_section;

    let new_display_section = current_display_section === 'triage'   ? 'pets'     : new_display_section;
        new_display_section = current_display_section === 'category' ? 'triage'   : new_display_section;
        new_display_section = current_display_section === 'intake'   ? 'category' : new_display_section;
        new_display_section = current_display_section === 'schedule' ? 'intake'   : new_display_section;

    if (current_display_section === 'pets') {
      this.props.navigation.pop();
    } else {
      this.setState({ current_section: new_display_section, pet_can_interact_response: '', pet_breathing_response: '' })
    }
  }

  continue_action = () => {
    let pet              = this.state.selected_pet;
    let intake_responses = this.state.intake_responses;
    let category         = this.state.selected_category;

    this.setState({ current_section: 'schedule' })
  }

}

export default ConsultationStartScreen;

const styles = StyleSheet.create({
  section_container: {
    paddingRight: 20,
    paddingLeft: 20
  },
  selection_row_container: {
    flex: 1,
    padding: 20,
    paddingLeft: 0
  },
  selection_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30
  },
  selection_row_title: {
    fontSize: 16,
    fontWeight: 'medium'
  },
  section_title: {
    fontSize: 22,
    fontWeight: 'semibold'
  },
  progress_bar_container: {
    paddingRight: 20,
    paddingLeft: 20,
    marginTop: 20,
    marginBottom: 20
  },
  progress_bar: {
    height: 10,
    borderRadius: 20,
    backgroundColor: '#e7e7e7'
  },
  triage_question: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 15
  },
  triage_buttons_container: {
    flexDirection: 'row'
  },
  triage_button: {
    borderWidth: 1,
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12
  },
  triage_button_title: {
    fontWeight: 'semibold',
    fontSize: 15
  },
  triage_button_selected: {
    borderWidth: 1,
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'blue'
  },
  triage_button_title_selected: {
    fontWeight: 'semibold',
    fontSize: 15,
    color: 'white'
  },
  triage_button_buffer: {
    width: 10
  }
});
