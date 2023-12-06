import { Component } from 'react';
import { DateUtils } from '../utils';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Input, Button, Text, Icon, Colors } from '../components';
import { ConsultationController } from '../controllers';

class VideoCallSchedule extends Component {

  constructor(props) {
    super(props);
    let today_date_str = new Date().toString();
        today_date_str = this.get_cleaned_time_str(today_date_str);
    this.state = {
      selected_date_str: today_date_str,
      selected_day_slots: [],
      selection_display_dates: [],
      selected_slot: null,
    }
  }

  componentDidMount() {
    let display_dates = this.get_display_dates_array();
    this.pull_available_slots_for_date(this.state.selected_date_str);
    this.props.display_change_action('schedule_video_dates');
    this.setState({ selection_display_dates: display_dates, selected_slot: null });
  }

  render_top_dates_row = () => {
    let dates_arr  = this.state.selection_display_dates || [];
    let date_boxes = [];

    let today_date_str = new Date().toString();
        today_date_str = this.get_cleaned_time_str(today_date_str);
    let first_date_str = dates_arr && dates_arr[0] ? dates_arr[0] : '';
        first_date_str = this.get_cleaned_time_str(first_date_str.toString());
    let disable_prev   = today_date_str.toString() === first_date_str.toString();
    let disable_next   = this.disable_next_button(first_date_str.toString());

    let selected_date_obj  = new Date(this.state.selected_date_str);
    let month_str          = DateUtils.getLongMonth(selected_date_obj) + ' ' + DateUtils.getYear(selected_date_obj);

    dates_arr.forEach((date) => {
      let date_number = DateUtils.getDateNumber(date);
      let day_str     = DateUtils.getShortWeekday(date);
      let cleaned_str = this.get_cleaned_time_str(date.toString())
      let is_selected = this.state.selected_date_str === cleaned_str;
      let border_clr  = is_selected ? Colors.PRIMARY : '#e7e7e7';
      let text_color  = is_selected ? 'white'   : Colors.TEXT_GREY;
      let bg_color    = is_selected ? Colors.PRIMARY : 'white';
      date_boxes.push(
        <TouchableOpacity style={{ borderWidth: 1, borderColor: border_clr, borderRadius: 10, backgroundColor: bg_color, padding: 10, alignItems: 'center', width: 70, marginRight: 3, marginLeft: 3 }}
                          onPress={ () => {
                            this.pull_available_slots_for_date(cleaned_str);
                            this.setState({ ...this.state, selected_date_str: cleaned_str })
                          }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 5, color: text_color }}>{ day_str.toUpperCase() }</Text>
          <Text style={{ fontSize: 24, fontWeight: '500', color: text_color }}>{ date_number }</Text>
        </TouchableOpacity>
      );
    });

    return <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity onPress={ () => { this.navigate_dates(true, false) }}>
          <Icon name='chevron-circle-left' size={32} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.TEXT_GREY, marginRight: 20, marginLeft: 20 }}>{ month_str }</Text>
        <TouchableOpacity onPress={ () => {
                            if (disable_next) {
                              return;
                            }
                            this.navigate_dates(false, true)
                          }}>
          <Icon name='chevron-circle-right' size={32} />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', flex: 1, justifyContent: 'center', marginTop: 20 }}>
        { date_boxes }
      </View>
    </View>
  }

  render_slots_list = () => {
    let slots_array = this.state.selected_day_slots || [];

    let slot_rows = slots_array.map((slot) => {
      let slot_date   = new Date(slot.time);
      let start_time  = DateUtils.getTime(slot_date);
      let duration    = slot.duration ? slot.duration.toString() : '15';
      let is_selected = this.state.selected_slot && this.state.selected_slot._id === slot._id ? true : false;
      let display_btn = is_selected;
      let display_confirm = this.state.booked_cliked_id === slot._id;

      if (slot && (slot.available === false || slot.booked === true)) {
        return null;
      }

      return <TouchableOpacity style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center', marginBottom: 10 }}
                               onPress={ () => {
                                 this.props.display_change_action('schedule_video_confirm');
                                 this.setState({ selected_slot: slot })
                               }}>
        <Text style={{ fontWeight: 'bold', color: 16, color: '#474747' }}>{ start_time + ' - ' + duration + ' Minutes' }</Text>
      </TouchableOpacity>
    })

    return <View>
      { slot_rows }
    </View>
  }

  render_selected_slot = () => {
    let selected_slot = this.state.selected_slot || {};
    let slot_date     = new Date(selected_slot.time);
    let slot_date_str = DateUtils.getLongMonth(slot_date) + ' ' + DateUtils.getDateNumber(slot_date) + ', ' + DateUtils.getYear(slot_date);
    let start_time    = DateUtils.getTime(slot_date);
    let duration      = selected_slot.duration ? selected_slot.duration.toString() : '15';

    return <View>
      <Text style={{ fontWeight: '500', fontSize: 18, marginBottom: 5 }}>Selected Appointment Time</Text>
      <Text style={{ fontSize: 16, color: Colors.TEXT_GREY }}>{ slot_date_str }</Text>
      <Text style={{ fontSize: 16, color: Colors.TEXT_GREY }}>{ start_time }</Text>
      <Text style={{ fontSize: 16, color: Colors.TEXT_GREY }}>{ duration + ' Minutes' }</Text>
      <Button title='Book Appointment'
              style={{ marginTop: 20, marginBottom: 5 }}
              loading={this.props.loading_create_consultation}
              onPress={ () => {
                this.props.booking_confirmation_action(selected_slot._id);
              }}/>
      <Button title='Choose a Different Time'
              style={{ marginTop: 5, marginBottom: 5 }}
              outline={true}
              onPress={ () => {
                this.props.display_change_action('schedule_video_dates');
                this.setState({ selected_slot: null })
              }}/>
    </View>
  }

  render() {
    let display_dates    = this.get_display_dates_array();
    let selected_slot    = this.state.selected_slot;
    let display_selected = this.props.schedule_display_section === 'schedule_video_confirm' ? true : false;

    return (
      <View style={styles.main_container}>
        { !display_selected ? this.render_top_dates_row() : null }
        { !display_selected ? this.render_slots_list()    : null }
        {  display_selected ? this.render_selected_slot() : null }
      </View>
    );
  }

  pull_available_slots_for_date = async (date) => {
    let practice_id = this.props.practice_id;
    let partner_id  = this.props.partner_id;

    let intial_request_data = {
      practice_id: practice_id,
      partner_id: partner_id,
      date: date,
    }

    let today_date_str = new Date().toString();
        today_date_str = this.get_cleaned_time_str(today_date_str);

    if (intial_request_data.date === today_date_str) {
      intial_request_data.date = (new Date()).toString();
    }

    let avail_slots = await ConsultationController.getAvailableSlots(intial_request_data);

    this.setState({ selected_day_slots: avail_slots });
  }

  navigate_dates = (prev, next) => {
    let existing_display_array = this.state.selection_display_dates || [];
    let first_date             = existing_display_array && existing_display_array[0] ? existing_display_array[0] : new Date().toString();
    let last_date              = existing_display_array && existing_display_array[existing_display_array.length - 1] ? existing_display_array[existing_display_array.length - 1] : new Date().toString();
    let updated_display_array  = [];

    if (prev) {
      let base_date = new Date(first_date);

      let min_date = new Date();
          min_date.setTime(base_date.getTime() - (4 * 24 * 60 * 60 * 1000));

      if (min_date.getDate() < new Date().getDate()) {
        let default_dates_arr = this.get_display_dates_array(new Date().toString());
        this.setState({ ...this.state, selection_display_dates: default_dates_arr })
        return;
      }

      let date_1 = new Date();
          date_1.setTime(base_date.getTime() - (4 * 24 * 60 * 60 * 1000));
      let date_2 = new Date();
          date_2.setTime(base_date.getTime() - (3 * 24 * 60 * 60 * 1000));
      let date_3 = new Date();
          date_3.setTime(base_date.getTime() - (2 * 24 * 60 * 60 * 1000));
      let date_4 = new Date();
          date_4.setTime(base_date.getTime() - (1 * 24 * 60 * 60 * 1000));
      updated_display_array = [date_1, date_2, date_3, date_4];
    }

    if (next) {
      let base_date = new Date(last_date);

      let date_1 = new Date();
          date_1.setTime(base_date.getTime() + (1 * 24 * 60 * 60 * 1000));
      let date_2 = new Date();
          date_2.setTime(base_date.getTime() + (2 * 24 * 60 * 60 * 1000));
      let date_3 = new Date();
          date_3.setTime(base_date.getTime() + (3 * 24 * 60 * 60 * 1000));
      let date_4 = new Date();
          date_4.setTime(base_date.getTime() + (4 * 24 * 60 * 60 * 1000));
      updated_display_array = [date_1, date_2, date_3, date_4];
    }

    if (updated_display_array.length > 0) {
      this.setState({ ...this.state, selection_display_dates: updated_display_array })
    }
  }

  get_display_dates_array = (date_str) => {
    let selected_date_str = this.state.selected_date_str;

    if (date_str) {
      selected_date_str = date_str;
    }

    let date_1 = new Date(selected_date_str);

    let date_2 = new Date();
        date_2.setTime(date_1.getTime() + (1 * 24 * 60 * 60 * 1000));
    let date_3 = new Date();
        date_3.setTime(date_1.getTime() + (2 * 24 * 60 * 60 * 1000));
    let date_4 = new Date();
        date_4.setTime(date_1.getTime() + (3 * 24 * 60 * 60 * 1000));

    return [date_1, date_2, date_3, date_4];
  }

  get_cleaned_time_str = (date_str) => {
    let date_obj = new Date(date_str);
    date_obj.setHours(0);
    date_obj.setMinutes(0);
    date_obj.setSeconds(0);
    date_obj.setMilliseconds(0);
    return date_obj.toString();
  }

  disable_next_button = (first_date_str) => {
    let first_date_object = new Date(first_date_str);
    let today_date_object = new Date();
    let disable_button    = false;

    if (first_date_object > today_date_object) {
      disable_button = true;
    }

    return disable_button;
  }

}

const styles = StyleSheet.create({
  main_container: {

  }
});

export default VideoCallSchedule
