import { Component } from 'react';
import {  NOTIF_URL, VIDEO_BASE_URL } from '@env'
import { setItem, getItem } from '../../storage';
import { StringUtils, DateUtils } from '../utils';
import { ConsultationFeedbackForm } from '../containers';
import { StyleSheet, View, TextInput, ScrollView, Platform, Linking } from 'react-native';
import { Button, Input, Screen, Line, Text, Colors } from '../components';
import { AuthController, ConsultationController, UtilitiesController, PetsController } from '../controllers';
import io from 'socket.io-client';

class ConsultationVideoAppointmentScreen extends Component {

  constructor(props) {
    super(props);

    let care_consultation_id = this.props && this.props.route && this.props.route.params && this.props.route.params.care_consultation_id ? this.props.route.params.care_consultation_id : '';
    let back_to_home         = this.props && this.props.route && this.props.route.params && this.props.route.params.back_to_home ? this.props.route.params.back_to_home : false;

    this.state = {
      consultation_id: care_consultation_id,
      care_consultation: null,
      display_feedback: false,
      back_to_home: back_to_home,
      pet_age_string: '',
      appointment_time: '',
      enable_join_button: false
    }

    this.consultation_socket = null;
  }

  get_patient_age = async (patient_id) => {
    let pet_res = await PetsController.getPet(patient_id);
    let pet     = pet_res && pet_res.success && pet_res.data && pet_res.data.pet ? pet_res.data.pet : {};
    let age_str = '';
    let years   = pet && pet.age_num_years  ? pet.age_num_years  : '';
    let months  = pet && pet.age_num_months ? pet.age_num_months : '';

    if (years) {
      let year_s = years < 2 ? 'year' : 'years';
      age_str    = years + ' ' + year_s;
    }

    if (months) {
      let month_s = months < 2 ? 'month' : 'months';
      age_str = age_str + ' ' + months + ' ' + month_s;
    }

    this.setState({ pet_age_string: age_str });
  }

  _onEverySecondTimer = () => {

    let appointment = this.state.appointment ? this.state.appointment : {};
    let apt_time    = appointment && appointment.time ? appointment.time : '';
    let is_canceled = this.state.is_canceled;
    let is_resolved = this.state.is_resolved;

    if (apt_time && !is_canceled && !is_resolved) {
      let current_date  = new Date();
      let apt_date_obj  = new Date(apt_time);
      let min_diff      = (apt_date_obj.getTime() - current_date.getTime()) / 60000;
      let enable_button = min_diff < 5 ? true : false;
      this.setState({ enable_join_button: enable_button })
    }

  }

  pull_consulation_data = (care_consultation_id) => {
    var t = setInterval(this._onEverySecondTimer, 1000);
    this.setState({ loading_consultation: true, timer_interval: t }, async () => {

      let care_consultation_res = await ConsultationController.getCareConsultationDetails(care_consultation_id);
      let care_consultation     = care_consultation_res && care_consultation_res.data && care_consultation_res.data.care_consultation ? care_consultation_res.data.care_consultation : {};
      let care_consult_details  = care_consultation     && care_consultation.care_consultation_details ? care_consultation.care_consultation_details : {};
      let appointment           = care_consultation     && care_consultation.appointment ? care_consultation.appointment : {};
      let client                = care_consult_details  && care_consult_details.client   ? care_consult_details.client  : {};
      let patient               = care_consult_details  && care_consult_details.patient  ? care_consult_details.patient : {};
      let display_feedback      = care_consult_details  && care_consult_details._id      && !care_consult_details.feedback_data && is_resolved ? true : false;
      let is_canceled           = care_consult_details  && care_consult_details.status   && care_consult_details.status === 'CANCELED' ? true : false;
      let is_resolved           = care_consult_details  && care_consult_details.status   && care_consult_details.status === 'RESOLVED' ? true : false;
      let video_url             = '';

      if (care_consultation) {
        let access_code = care_consultation && care_consultation.video_session_codes && care_consultation.video_session_codes.universal_access_code ? care_consultation.video_session_codes.universal_access_code.toUpperCase() : '';
        let session_num = care_consultation && care_consultation.video_session       && care_consultation.video_session.session_number  ? care_consultation.video_session.session_number : '';
            video_url   = VIDEO_BASE_URL + '/' + session_num + '/' + access_code;
      }

      if (patient) {
        let patient_id = patient._id;
        this.get_patient_age(patient_id);
      }

      this.setState({ care_consultation: care_consult_details, appointment: appointment, client: client, patient: patient, loading_consultation: false, display_feedback: display_feedback, is_canceled: is_canceled, is_resolved: is_resolved, video_url: video_url })
    });
  }

  consultation_socket_connect(consultation_id) {
    return io(NOTIF_URL, {
        query: 'notification=' + consultation_id
    });
  }

  componentWillUnmount() {
    clearInterval(this.state.timer_interval);
  }

  async componentDidMount() {
    let care_consultation_id = this.state.consultation_id;

    console.log('care_consultation_id', care_consultation_id)

    if(care_consultation_id) {

      if (!this.consultation_socket) {
        this.consultation_socket = this.consultation_socket_connect(care_consultation_id);
      }

      this.consultation_socket.on("connect_error", (err) => {
        console.log(`connect_error due to ${err.message}`);
        console.log(err)
      });

      this.consultation_socket.on('care_consultation_updated', async () => {
        this.pull_consulation_data(care_consultation_id);
      });

      let user_id = await getItem("user_id");
    }

    this.pull_consulation_data(care_consultation_id);
  }

  render_appointment_details = () => {
    let consultation_dets = this.state.care_consultation;
    let care_consultation = this.state.care_consultation;
    let is_live_video     = care_consultation && care_consultation.type === 'LIVE_VIDEO' ? true : false;

    if (is_live_video) {
      return null;
    }

    let appointment       = this.state.appointment ? this.state.appointment : {};
    let client            = this.state.client      ? this.state.client      : {};
    let patient           = this.state.patient     ? this.state.patient     : {};
    let apt_time          = appointment && appointment.time ? appointment.time : '';
    let time_string       = '';
    let date_string       = '';
    let enable_join_btn   = false;
    let is_canceled       = this.state.is_canceled;
    let is_resolved       = this.state.is_resolved;

    if (apt_time) {
      time_string = DateUtils.getHoursString(apt_time) +  ':'  + DateUtils.getMinutesString(apt_time) + ' ' + DateUtils.getAMPMString(apt_time);
      date_string = DateUtils.getLongWeekday(apt_time) + ' - ' + DateUtils.getShortMonth(apt_time)    + ' ' + DateUtils.getDateNumber(apt_time);
    }

    if (apt_time) {
      // let current_date = new Date();
      // let apt_date_obj = new Date(apt_time);
      // let min_diff     = (apt_date_obj.getTime() - current_date.getTime()) / 60000;
      // enable_join_btn  = min_diff < 5 ? true : false;
      enable_join_btn  = this.state.enable_join_button;
    }

    enable_join_btn  = is_canceled || is_resolved ? false : enable_join_btn;

    let client_name  = client ?  StringUtils.displayName(client) : '';
    let client_email = client ?  client.email : '';
    let client_phone = client && client.phone_number ? StringUtils.displayCodePhoneNumber(client.phone_number) : '';

    let patient_type   = patient && patient.type   ? patient.type   : '';
    let patient_age    = this.state.pet_age_string;
    let patient_breed  = patient && patient.breed  ? patient.breed  : '';
    let patient_name   = patient  ? StringUtils.displayName(patient) : '';
    let patient_gender = patient  ? StringUtils.displayGender(patient.gender) : '';

    let video_session_url = this.state.video_url;

    return <View>
      <Text style={styles.section_title}>Appointment Info</Text>
      { is_canceled  ? null : <Text style={styles.info_text}>{ date_string + ' | ' + time_string }</Text> }
      { !is_canceled ? null : <Text style={[styles.info_text, { color: Colors.RED   }]}>Canceled</Text> }
      { !is_resolved ? null : <Text style={[styles.info_text, { color: Colors.GREEN }]}>Completed</Text> }

      <View style={{ height: 15 }} />

      <Text style={styles.info_text}>{ client_name  }</Text>
      <Text style={styles.info_text}>{ client_email }</Text>
      <Text style={styles.info_text}>{ client_phone }</Text>

      <View style={{ height: 15 }} />

      <Button title={'Join Video Session'}
              inactive={!enable_join_btn}
              onPress={ () => {
                Linking.openURL(this.state.video_url)
              }}
            />

      <Line style={{ marginTop: 15, marginBottom: 15 }} />

      <Text style={styles.section_title}>Pet Details</Text>

      <View style={styles.patient_details_row}>
        <View style={styles.patient_row_label_container}><Text style={styles.patient_row_label}>Name</Text></View>
        <View style={styles.patient_row_value_container}><Text style={styles.patient_row_value}>{ patient_name }</Text></View>
      </View>
      <View style={styles.patient_details_row}>
        <View style={styles.patient_row_label_container}><Text style={styles.patient_row_label}>Type</Text></View>
        <View style={styles.patient_row_value_container}><Text style={styles.patient_row_value}>{ patient_type }</Text></View>
      </View>
      <View style={styles.patient_details_row}>
        <View style={styles.patient_row_label_container}><Text style={styles.patient_row_label}>Breed</Text></View>
        <View style={styles.patient_row_value_container}><Text style={styles.patient_row_value}>{ patient_breed }</Text></View>
      </View>
      <View style={styles.patient_details_row}>
        <View style={styles.patient_row_label_container}><Text style={styles.patient_row_label}>Age</Text></View>
        <View style={styles.patient_row_value_container}><Text style={styles.patient_row_value}>{ patient_age }</Text></View>
      </View>
      <View style={styles.patient_details_row}>
        <View style={styles.patient_row_label_container}><Text style={styles.patient_row_label}>Gender</Text></View>
        <View style={styles.patient_row_value_container}><Text style={styles.patient_row_value}>{ patient_gender }</Text></View>
      </View>

    </View>
  }

  render_intake_questions = () => {
    let care_consultation = this.state.care_consultation ? this.state.care_consultation : {};
    let intake_responses  = care_consultation && care_consultation.intake_responses && care_consultation.intake_responses.responses ? care_consultation.intake_responses.responses : [];
    let category          = care_consultation && care_consultation.category ? care_consultation.category : '';
        category          = StringUtils.keyToDisplayString(category);

    let response_rows = intake_responses.map((intake_response, index) => {
      let question_string = intake_response.question_text;
      let choice_string   = intake_response.choice_response;
          choice_string   = choice_string ? StringUtils.sentenceCase(choice_string.toLowerCase()) : choice_string;
      let text_prompt     = intake_response.text_prompt;
      let text_response   = intake_response.text_response;
      return <View key={index} style={{ marginBottom: 10 }}>
        <Text style={styles.intake_question}>{ question_string }</Text>
        { choice_string ? <Text style={styles.info_text}>{ choice_string }</Text> : null }
        { text_prompt   ? <Text style={styles.info_text}>{ text_prompt   }</Text> : null }
        { text_response ? <Text style={styles.info_text}>{ text_response }</Text> : null }
      </View>
    })

    let no_intake_questions = response_rows && response_rows.length === 0 ? true : false;

    return <View sytle={{ }}>
      <View style={{ height: 15 }} />

      <Text style={styles.section_title}>Category</Text>
      <Text style={styles.info_text}>{ category }</Text>

      { no_intake_questions ? null : <View style={{ height: 15 }} /> }

      { no_intake_questions ? null : <Text style={styles.section_title}>Intake Questions</Text> }
      { response_rows }
    </View>
  }

  render_cancel_section = () => {
    if (!this.state.care_consultation || this.state.is_canceled || this.state.is_resolved) {
      return null;
    }

    let appointment       = this.state.appointment ? this.state.appointment : {};
    let apt_date_time     = appointment && appointment.time ? new Date(appointment.time) : new Date();
    let current_time      = new Date();
    let display_complete  = current_time.getTime() > apt_date_time.getTime()

    if (display_complete) {
      return <View>
        <Button title={'Cancel Appointment'}
                outline={true}
                loading={ this.state.loading_cancel }
                onPress={ async () => {
                  let care_consultation_id = this.state.care_consultation ? this.state.care_consultation._id : '';

                  let request_data = {
                    care_consultation_id: care_consultation_id,
                  }

                  this.setState({ loading_cancel: true });
                  let resolve_response = await ConsultationController.getClientResolveConsultation(request_data);

                  if (resolve_response.success === true) {
                    this.pull_consulation_data(care_consultation_id)
                  }
                  this.setState({ loading_cancel: false });
                }}/>
      </View>
    } else {
      return <View>
        <Button title={'Cancel Appointment'}
                outline={true}
                loading={ this.state.loading_cancel }
                onPress={ async () => {
                  let care_consultation_id = this.state.care_consultation ? this.state.care_consultation._id : '';

                  let request_data = {
                    care_consultation_id: care_consultation_id,
                  }

                  this.setState({ loading_cancel: true });
                  let cancel_response = await ConsultationController.cancelVideoConsultation(request_data);

                  if (cancel_response.success === true) {
                    this.pull_consulation_data(care_consultation_id)
                  }
                  this.setState({ loading_cancel: false });
                }}/>
      </View>
    }
  }

  render_feedback_section = () => {
    return <Screen navigation={this.props.navigation} title='Consultation Details' scroll={true} back_to_home={this.state.back_to_home}>
      <View style={{ flex: 1, padding: 20, paddingTop: 0 }}>
        <Button title='View Consultation Details' style={{ marginTop: 20 }} onPress={ () => { this.setState({ display_feedback: false }) }}/>
        <Line style={{ marginTop: 20, marginBottom: 20 }} />
        <ConsultationFeedbackForm
          consultation={ this.state.care_consultation &&  this.state.care_consultation.care_consultation_details ? this.state.care_consultation.care_consultation_details : null }
          submit_action={ () => { this.setState({ display_feedback: false }) }}
        />
      </View>
    </Screen>
  }

  render() {

    if (this.state.display_feedback === true) {
      return this.render_feedback_section();
    }

    return (
      <Screen navigation={this.props.navigation} title='Consultation Details' scroll={true} back_to_home={this.state.back_to_home}>
        <View style={{ padding: 20 }}>
          { this.render_appointment_details() }
          { this.render_intake_questions()    }
          <Line style={{ marginTop: 15, marginBottom: 15 }} />
          { this.render_cancel_section()      }
          <View style={{ height: 15 }} />
        </View>
      </Screen>
    );
  }

}

const styles = StyleSheet.create({
  patient_details_row: {
    flexDirection: 'row',
    marginBottom: 5
  },
  patient_row_label_container: {
    width: 80
  },
  patient_row_value_container: {

  },
  patient_row_label: {
    fontSize: 15,
    color: '#575762'
  },
  patient_row_value: {
    fontSize: 15,
    color: '#575762'
  },
  section_title: {
    fontSize: 18,
    fontWeight: 'medium',
    color: '#0054A4',
    marginBottom: 10
  },
  intake_question: {
    fontSize: 15,
    color: '#575762',
    marginBottom: 5
  },
  info_text: {
    fontSize: 15,
    color: '#575762'
  }
});

export default ConsultationVideoAppointmentScreen
