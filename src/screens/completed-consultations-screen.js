import { Component } from "react";
import { PARTNER_ID } from '@env'
import { DateUtils, StringUtils } from '../utils';
import { StyleSheet, View, TouchableOpacity, Image } from 'react-native';
import { Screen, Line, Text, Icon, Colors   } from '../components';
import { setItem, getItem } from '../../storage';
import { ConsultationController } from '../controllers';

class CompletedConsultationsScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      consultations: []
    }
  }

  componentDidMount = async () => {
    let partner_id = PARTNER_ID;
    let completed_consultations_res = await ConsultationController.getCompletedConsultations(partner_id);
    let completed_consultations     = completed_consultations_res && completed_consultations_res.data && completed_consultations_res.data.care_consultations ? completed_consultations_res.data.care_consultations : [];
    this.setState({ consultations: completed_consultations });
  }

  open_selected_chat = (care_consultation_id, is_chat_type, is_video_type) => {
    let is_chat  = is_chat_type  && is_chat_type  === true ? true : false;
    let is_video = is_video_type && is_video_type === true ? true : false;

    if (care_consultation_id && is_chat) {
      this.props.navigation.push('ConsultationChat', { care_consultation_id: care_consultation_id });
    }

    if (care_consultation_id && is_video) {
      this.props.navigation.push('ConsultationVideoAppointment', { care_consultation_id: care_consultation_id });
    }
  }

  render_consultations = () => {
    let consultations = this.state.consultations;
    let dislay_empty  = consultations && consultations.length === 0 ? true : false;
    let filter_type   = this.props && this.props.route && this.props.route.params && this.props.route.params.type ? this.props.route.params.type : '';

    let consultation_rows = consultations.map((consultation, index) => {
      let is_chat   = consultation && consultation.type && consultation.type === 'CHAT'   ? true : false;
      let is_video  = consultation && consultation.type && consultation.type === 'VIDEO'  ? true : false;
      let is_thread = consultation && consultation.type && consultation.type === 'THREAD' ? true : false;

      if (filter_type === 'CHAT'  && is_video) { return null }
      if (filter_type === 'VIDEO' && is_chat)  { return null }

      let patient  = consultation && consultation.patient ? consultation.patient : {};
      let name     = StringUtils.displayName(patient);

      let date_obj = consultation.resolved_at ? new Date(consultation.resolved_at) : consultation.updated_at;
      let date_num = DateUtils.getDateNumber(date_obj);
      let add_zero = date_num.toString().length === 1;
      let date_str = DateUtils.getShortMonth(date_obj) + ' ' + DateUtils.getDateNumber(date_obj);
          date_str = add_zero ? DateUtils.getShortMonth(date_obj) + ' 0' + DateUtils.getDateNumber(date_obj) : date_str;
          date_str = !consultation.updated_at ? '' : date_str;

      let type_lbl = is_chat   ? 'Chat'    : '';
          type_lbl = is_video  ? 'Video'   : type_lbl;
          type_lbl = is_thread ? 'Provider Message' : type_lbl;

      return  <View key={index} >
        <TouchableOpacity style={styles.row} onPress={ () => { this.open_selected_chat(consultation._id, is_chat, is_video) } }>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <View style={styles.icon_container}>
                { is_video  ? <Image style={{ height: 22, width: 22 }} source={ require('../../assets/images/video-visit.png') } /> : null }
                { is_chat   ? <Image style={{ height: 22, width: 22 }} source={ require('../../assets/images/live-chat.png') } />   : null }
                { is_thread ? <Icon name='envelope-rounded' size={24} color={ Colors.PRIMARY } /> : null }
              </View>
              <View style={{  }}>
                <Text style={{ fontSize: 16, fontWeight: 'medium', color: '#040415' }}>{ name }</Text>
                <Text style={{ fontSize: 14, color: '#575762', marginTop: 5 }}>{ date_str + ' | ' + type_lbl }</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
        <Line />
      </View>
    })

    return <View style={styles.row_container}>
      { consultation_rows }
    </View>
  }

  render() {

    return <Screen title='Completed Consultations' scroll={true} navigation={this.props.navigation}>
      <View>
        { this.render_consultations() }
      </View>

    </Screen>
  }

}

export default CompletedConsultationsScreen;

const styles = StyleSheet.create({
  row_container: {
    flex: 1,
    padding: 20
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70
  },
  title: {
    fontSize: 16,
    fontWeight: 'medium'
  },
  icon_container: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#DBE6F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  }
});
