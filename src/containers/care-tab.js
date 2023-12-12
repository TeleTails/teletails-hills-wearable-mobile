import { Component } from 'react';
import { config }    from '../../config';
import { setItem, getItem } from '../../storage';
import { DateUtils, StringUtils } from '../utils';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Line, Icon } from '../components';
import { ConsultationController } from '../controllers';
import { CareCtaButtons } from '../containers';

class CareTab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      chat_consultations: [],
      video_consultations: []
    }
  }

  componentDidMount = async () => {
    let is_signed_in  = await getItem('token') ? true : false;
    let partner_id    = config.partner_id;

    if (is_signed_in) {
      let chats_res   = await ConsultationController.getClientChatConsultations(partner_id);
      let chats       = chats_res && chats_res.data && chats_res.data.care_consultations ? chats_res.data.care_consultations : [];

      let video_res   = await ConsultationController.getUpcomingVideoConsultations(partner_id);
      let videos      = video_res && video_res.data && video_res.data.care_consultations ? video_res.data.care_consultations : [];

      this.setState({ chat_consultations: chats, video_consultations: videos });
    }
  }

  render_active_chats = () => {

    let chat_consultations = this.state.chat_consultations;
    let filtered_chats     = chat_consultations.filter((care_consultation) => { return care_consultation.status === 'ACTIVE' || care_consultation.status === 'IN_PROGRESS' });

    let chat_rows = filtered_chats.map((care_consultation, idx) => {
      let patient  = care_consultation && care_consultation.patient  ? care_consultation.patient  : {};
      let name     = StringUtils.displayName(patient);
      let category = care_consultation && care_consultation.category ? care_consultation.category : {};
          category = StringUtils.keyToDisplayString(category);

      let date_obj = care_consultation.created_at ? new Date(care_consultation.created_at) : care_consultation.created_at;
      let date_num = DateUtils.getDateNumber(date_obj);
      let add_zero = date_num.toString().length === 1;
      let date_str = DateUtils.getShortMonth(date_obj) + ' ' + DateUtils.getDateNumber(date_obj);
          date_str = add_zero ? DateUtils.getLongMonth(date_obj) + ' 0' + DateUtils.getDateNumber(date_obj) : date_str;
          date_str = !care_consultation.updated_at ? '' : date_str;

      let care_consultation_id = care_consultation._id;

      return <View>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.props.navigation.push('ConsultationChat', { care_consultation_id: care_consultation_id }) }}>
          <View>
            <Text style={styles.selection_row_title}>{ name }</Text>
            <Text style={{ fontSize: 14, color: '#4c4c4c' }}>{ category }</Text>
            <Text style={{ fontSize: 14, color: '#4c4c4c' }}>{ date_str }</Text>
          </View>
          <Icon name='chevron-right' size={14} />
        </TouchableOpacity>
        <Line hide={false && idx === filtered_chats.length - 1} />
      </View>
    })

    if (chat_rows.length === 0) { return null }

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Active Chats</Text>
      { chat_rows }
    </View>
  }

  render_upcoming_videos = () => {

    let video_consultations = this.state.video_consultations;
    let filtered_chats      = video_consultations.filter((care_consultation) => { return care_consultation.status === 'ACTIVE' || care_consultation.status === 'IN_PROGRESS' || care_consultation.status === 'SCHEDULED' });

    let video_rows = filtered_chats.map((care_consultation, idx) => {
      let patient  = care_consultation && care_consultation.patient  ? care_consultation.patient  : {};
      let name     = StringUtils.displayName(patient);
      let category = care_consultation && care_consultation.category ? care_consultation.category : {};
          category = StringUtils.keyToDisplayString(category);

      let apt_time    = care_consultation && care_consultation.appointment && care_consultation.appointment.time ? care_consultation.appointment.time : '';
      let time_string = '';
      let date_string = '';

      if (apt_time) {
        time_string = DateUtils.getHoursString(apt_time) +  ':'  + DateUtils.getMinutesString(apt_time) + ' ' + DateUtils.getAMPMString(apt_time);
        date_string = DateUtils.getLongWeekday(apt_time) + ' - ' + DateUtils.getLongMonth(apt_time)    + ' ' + DateUtils.getDateNumber(apt_time);
      }

      let care_consultation_id = care_consultation._id;

      return <View>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.props.navigation.push('ConsultationVideoAppointment', { care_consultation_id: care_consultation_id }) }}>
          <View>
            <Text style={styles.selection_row_title}>{ name }</Text>
            <Text style={{ fontSize: 14, color: '#4c4c4c' }}>{ category }</Text>
            <Text style={{ fontSize: 14, color: '#4c4c4c' }}>{ date_string + ' | ' + time_string }</Text>
          </View>
          <Icon name='chevron-right' size={14} />
        </TouchableOpacity>
        <Line hide={false && idx === filtered_chats.length - 1} />
      </View>
    })

    if (video_rows.length === 0) { return null }

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Upcoming Video Appointments</Text>
      { video_rows }
    </View>
  }

  render_completed = () => {
    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Completed Consultations</Text>
        <View style={{ height: 5 }} />
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.props.navigation.push('CompletedConsultations', { type: 'CHAT' }) }}>
          <Text style={{ fontWeight: 'regular', fontSize: 15 }}>View Completed Chats</Text>
          <Icon name='arrow-right' size={15} />
        </TouchableOpacity>
        <Line />
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.props.navigation.push('CompletedConsultations', { type: 'VIDEO' }) }}>
          <Text style={{ fontWeight: 'regular', fontSize: 15 }}>View Completed Appointments</Text>
          <Icon name='arrow-right' size={15} />
        </TouchableOpacity>
    </View>
  }

  render() {

    return <View style={{  }}>
      <View style={styles.vertical_buffer} />
      <CareCtaButtons navigation={this.props.navigation} />
      { this.render_active_chats()    }
      { this.render_upcoming_videos() }
      { this.render_completed() }
    </View>
  }

}

const styles = StyleSheet.create({
  vertical_buffer: {
    height: 30
  },
  chat_row_container: {
    flex: 1,
    padding: 20,
    paddingLeft: 0,
    paddingRight: 0,
    flexDirection: 'column',
  },
  section_container: {
    paddingRight: 20,
    paddingLeft: 20,
    marginTop: 30
  },
  selection_row_container: {
    flex: 1,
    padding: 20,
    paddingLeft: 0,
    paddingRight: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
    fontSize: 18,
    fontWeight: 'semibold'
  }
});

export default CareTab
