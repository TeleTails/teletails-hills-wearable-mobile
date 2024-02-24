import { Component } from 'react';
import { PARTNER_ID } from '@env'
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
      cta_orientation: '',
      chat_consultations: [],
      video_consultations: [],
      active_threads: []
    }
  }

  componentDidMount = async () => {
    let is_signed_in  = await getItem('token') ? true : false;
    let partner_id    = PARTNER_ID;

    if (is_signed_in) {
      let chats_res   = await ConsultationController.getClientChatConsultations(partner_id);
      let chats       = chats_res && chats_res.data && chats_res.data.care_consultations ? chats_res.data.care_consultations : [];

      let video_res   = await ConsultationController.getUpcomingVideoConsultations(partner_id);
      let videos      = video_res && video_res.data && video_res.data.care_consultations ? video_res.data.care_consultations : [];

      let orientation = chats.length === 0 && videos.length === 0 ? 'vertical' : 'horizontal';

      this.get_active_threads();

      this.setState({ chat_consultations: chats, video_consultations: videos, cta_orientation: orientation });
    }
  }

  render_active_threads = () => {
    let active_threads = this.state.active_threads;

    if (!active_threads || active_threads.length === 0) {
      return null;
    }

    let thread_rows = active_threads.map((thread, ind) => {
      let thread_id = thread._id;
      let subject   = thread.subject || 'Provider Message';
      let pet_name  = thread.patient ? StringUtils.displayName(thread.patient) : '';
      return <View>
        <TouchableOpacity style={{ marginTop: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                          onPress={ () => { this.props.navigation.push('ConsultationThread', { thread_id: thread_id }) }}>
          <View>
            <Text style={styles.selection_row_title}>{ subject }</Text>
            <Text style={styles.selection_row_subtitle}>{ pet_name }</Text>
          </View>
          <Icon name='chevron-right' size={13} color='grey' />
        </TouchableOpacity>
        <Line hide={ active_threads.length - 1 === ind } />
      </View>
    })

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Provider Messages</Text>
      <View style={styles.list_container}>
        { thread_rows }
      </View>
    </View>
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
      let date_str = DateUtils.getLongMonth(date_obj) + ' ' + DateUtils.getDateNumber(date_obj);
          date_str = add_zero ? DateUtils.getLongMonth(date_obj) + ' 0' + DateUtils.getDateNumber(date_obj) : date_str;
          date_str = !care_consultation.updated_at ? '' : date_str;

      let care_consultation_id = care_consultation._id;

      return <View>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.props.navigation.push('ConsultationChat', { care_consultation_id: care_consultation_id }) }}>
          <View>
            <Text style={styles.selection_row_title}>{ name }</Text>
            <View style={{ height: 3 }} />
            <Text style={styles.selection_row_subtitle}>{ category }</Text>
            <Text style={styles.selection_row_subtitle}>{ date_str }</Text>
          </View>
          <Icon name='chevron-right' size={13} color='grey' />
        </TouchableOpacity>
        <Line hide={ idx === filtered_chats.length - 1 } />
      </View>
    })

    if (chat_rows.length === 0) { return null }

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Active Chats</Text>
      <View style={styles.list_container}>
        { chat_rows }
      </View>
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
            <View style={{ height: 3 }} />
            <Text style={styles.selection_row_subtitle}>{ category }</Text>
            <Text style={styles.selection_row_subtitle}>{ date_string + ' | ' + time_string }</Text>
          </View>
          <Icon name='chevron-right' size={13} color='grey' />
        </TouchableOpacity>
        <Line hide={ idx === filtered_chats.length - 1 } />
      </View>
    })

    if (video_rows.length === 0) { return null }

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Upcoming Video Appointments</Text>
      <View style={styles.list_container}>
        { video_rows }
      </View>
    </View>
  }

  render_completed = () => {
    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Completed Consultations</Text>
      <View style={styles.list_container}>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.props.navigation.push('CompletedConsultations', { type: 'CHAT' }) }}>
          <Text style={styles.selection_row_title}>View Completed Chats</Text>
          <Icon name='arrow-right' size={13} color={'grey'} />
        </TouchableOpacity>
        <Line />
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.props.navigation.push('CompletedConsultations', { type: 'VIDEO' }) }}>
          <Text style={styles.selection_row_title}>View Completed Appointments</Text>
          <Icon name='arrow-right' size={13} color={'grey'} />
        </TouchableOpacity>
      </View>
      <View style={{ height: 30 }} />
    </View>
  }

  render() {

    let cta_orientation = this.state.cta_orientation;
        cta_orientation = 'horizontal';

    return <View style={{  }}>
      <View style={styles.vertical_buffer} />
      <CareCtaButtons navigation={this.props.navigation} orientation={ cta_orientation } />
      { this.render_active_chats()    }
      { this.render_upcoming_videos() }
      { this.render_active_threads()  }
      { this.render_completed()       }
    </View>
  }

  get_active_threads = async () => {
    let user_id      = await getItem('user_id');
    let request_data = { client_id: user_id }
    ConsultationController.getActiveThreads(request_data).then((response) => {
      let active_threads = response.success && response.data && response.data.care_consultations ? response.data.care_consultations : [];
      this.setState({ active_threads: active_threads });
    }).catch((err) => {  });
  }

}

const styles = StyleSheet.create({
  vertical_buffer: {

  },
  chat_row_container: {
    flex: 1,
    padding: 20,
    paddingLeft: 0,
    paddingRight: 0,
    flexDirection: 'column',
  },
  section_container: {
    marginTop: 25,
    paddingLeft: 20,
    paddingRight: 20
  },
  list_container: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingRight: 20,
    paddingLeft: 20,
    marginTop: 15
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
    fontSize: 15,
    fontWeight: 'medium',
    color: '#040415'
  },
  selection_row_subtitle: {
    fontSize: 14,
    color: '#575762'
  },
  section_title: {
    fontSize: 18,
    fontWeight: 'medium',
    color: '#0054A4'
  }
});

export default CareTab
