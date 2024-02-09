import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { DateUtils, StringUtils } from '../utils';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Image, Platform, TouchableOpacity, TextInput, KeyboardAvoidingView, FlatList, Modal } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors, MediaModal } from '../components';
import { ConsultationController, PetsController }   from '../controllers';
import { MediaController }  from '../controllers';

class HealthBodyConditionScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      images: [],
      side_image_url: '',
      top_image_url: '',
      health_entries: [],
      expanded_entry_id: '',
      adding_side_image: false,
      adding_top_image: false,
      opened_modal: false
    }

    this.addHealthEntry = this.addHealthEntry.bind(this);
  }

  componentDidMount = async () => {
    let patient_id = this.props && this.props.route && this.props.route.params && this.props.route.params.pet_id ? this.props.route.params.pet_id : '';
    let partner_id = await getItem('partner_id');
    let user_id    = await getItem('user_id');

    this.pull_past_entries(patient_id);

    this.setState({ partner_id: partner_id, patient_id: patient_id, user_id: user_id });
  }

  async addHealthEntry() {
    let { partner_id, patient_id, user_id, images } = this.state;

    images = images.filter(image=>!!image);
    let mapped_images = images.map((image, i)=>{return {[`image_url_${i+1}`]: image}});
    mapped_images = Object.assign({}, ...mapped_images);

    if(images.length && images.length === 2) {
      let data = {
        type: 'BODY_CONDITION',
        patient_id,
        client_id: user_id,
        partner_id,
        entry_data: {
          ...mapped_images,
          date: new Date()
        }
      }

      console.log('data1', data);

      await PetsController.createHealthEntry(data);

      data = {
        type: 'BODY_CONDITION',
        patient_id,
        partner_id
      }

      let health_entries = await PetsController.getHealthEntries(data);

      health_entries = health_entries && health_entries.health_entries ? health_entries.health_entries : [];

      this.setState({ health_entries });
    }

  }

  render_image_block = (image_url, index) => {
    let add_image_title = index === 0 ? 'Add Side Image' : 'Add Top Image';
    let is_adding_side  = index === 0 ? true : false;
    let is_adding_top   = index === 1 ? true : false;
    if (image_url) {
      return <View style={styles.preview_image_container}>
        <Image style={styles.preview_image} resizeMode='cover' source={{ uri: image_url }} />
        <TouchableOpacity style={styles.preview_image_trash}
                          onPress={ () => { this.remove_image_preview(index) }}>
          <Icon name='trash' size={18} />
        </TouchableOpacity>
      </View>
    } else {
      return <TouchableOpacity style={styles.add_image_container}
                               onPress={ ()=> { this.setState({ opened_modal: true, adding_side_image: is_adding_side, adding_top_image: is_adding_top }) }}>
        <Icon name='plus-circle' color='#e7e7e7' />
        <Text style={styles.add_image_button_title}>{ add_image_title }</Text>
      </TouchableOpacity>
    }
  }

  render_add_image_buttons = () => {
    let side_image_url = this.state.side_image_url;
    let top_image_url  = this.state.top_image_url;

    return <View style={styles.add_image_buttons_container}>
      { this.render_image_block(side_image_url, 0) }
      <View style={{ width: 10 }} />
      { this.render_image_block(top_image_url, 1) }
    </View>
  }

  render_submit_button = () => {
    let no_images = !this.state.side_image_url || !this.state.top_image_url;

    if (no_images) {
      return null;
    }

    return <View>
      <Button title='Submit'
              style={{ borderRadius: 40, width: 200, alignSelf: 'center' }}
              loading={this.state.loading_uploading_images}
              onPress={ () => { this.add_health_entry() }}/>
    </View>
  }

  render_past_entries = () => {
    let health_entries = this.state.health_entries;
    let entry_rows = health_entries.map((entry) => {
      let entry_data  = entry.entry_data || {};
      let date        = entry_data.date ? DateUtils.getLongMonth(entry_data.date) + ' ' + DateUtils.getDateNumber(entry_data.date) : '';
      let side_image_url = entry_data && entry_data.side_image_url ? entry_data.side_image_url : '';
      let top_image_url  = entry_data && entry_data.top_image_url  ? entry_data.top_image_url  : '';
      let is_expanded = this.state.expanded_entry_id === entry._id;
      return <View style={{ paddingRight: 20, paddingLeft: 20 }}>
        <TouchableOpacity onPress={ () => { this.setState({ expanded_entry_id: is_expanded ? '' : entry._id })}}>
          <Text style={{ fontSize: 16, fontWeight: 'medium' }}>{ date }</Text>
        </TouchableOpacity>
        { is_expanded ? <View style={{ flexDirection: 'row', marginTop: 15 }}>
          { side_image_url ? <Image style={{height: 80, width: 80, borderRadius: 10, marginRight: 10 }} resizeMode='cover' source={{ uri: side_image_url }} /> : null  }
          { top_image_url  ? <Image style={{height: 80, width: 80, borderRadius: 10, marginRight: 10 }} resizeMode='cover' source={{ uri: top_image_url  }} /> : null  }
        </View> : null }
        <Line style={{ marginTop: 15, marginBottom: 15 }} />
      </View>
    })

    return <View>
      <Text style={styles.section_title}>Past Entries</Text>
      <View style={{ height: 20 }} />
      { entry_rows }
    </View>
  }

  render() {

    return <Screen scroll={true} title='Body Condition' navigation={this.props.navigation}>
      <Text style={styles.section_title}>New Entry</Text>
      { this.render_add_image_buttons() }
      { this.render_submit_button()     }
      { this.render_past_entries()      }
      { this.render_media_modal()       }
    </Screen>
  }

  render_media_modal = () => {
    return <MediaModal display={this.state.opened_modal}
      keep_as_local={true}
      button_title='Add Image'
      close_action={ () => {
        this.setState({ opened_modal: false })
      }}
      media_action={ (media_object) => {
        if (media_object && media_object.type === 'image') {
          this.add_image(media_object)
        }
      }} />
  }

  add_health_entry = async () => {
    this.setState({ loading_uploading_images: true }, async () => {
      let partner_id     = this.state.partner_id;
      let patient_id     = this.state.patient_id;
      let user_id        = this.state.user_id;
      let side_image_url = this.state.side_image_url;
      let top_image_url  = this.state.top_image_url;

      console.log('side_image_url, top_image_url', side_image_url, top_image_url)

      let upload_response = await MediaController.uploadMediaFromLibrary(side_image_url);
      let is_success      = upload_response && upload_response.success ? true : false;
      let uploaded_url    = is_success && upload_response && upload_response.message && upload_response.message.Location ? upload_response.message.Location : '';
      side_image_url = uploaded_url;

      upload_response = await MediaController.uploadMediaFromLibrary(top_image_url);
      is_success      = upload_response && upload_response.success ? true : false;
      uploaded_url    = is_success && upload_response && upload_response.message && upload_response.message.Location ? upload_response.message.Location : '';
      top_image_url = uploaded_url;

      console.log('side_image_url, top_image_url', side_image_url, top_image_url)

      if (side_image_url && top_image_url) {
        let request_data = {
          type: 'BODY_CONDITION',
          patient_id: patient_id,
          client_id:  user_id,
          partner_id: partner_id,
          entry_data: {
            top_image_url: top_image_url,
            side_image_url: side_image_url,
            date: new Date()
          }
        }

        let create_res = await PetsController.createHealthEntry(request_data);
        let is_success = create_res.success === true ? true : false;

        this.pull_past_entries(patient_id);

        this.setState({ loading_uploading_images: false, side_image_url: is_success ? '' : this.state.side_image_url, top_image_url: is_success ? '' : this.state.top_image_url });
      }
    });
  }

  add_image = async (media_object) => {
    let url = media_object.url || '';
    if (url && this.state.adding_side_image) {
      this.setState({ side_image_url: url, opened_modal: false, adding_side_image: false, adding_top_image: false });
    }
    if (url && this.state.adding_top_image) {
      this.setState({ top_image_url: url, opened_modal: false, adding_side_image: false, adding_top_image: false });
    }
  }

  remove_image_preview = (index) => {
    let side_image_url = index === 0 ? '' : this.state.side_image_url;
    let top_image_url  = index === 1 ? '' : this.state.top_image_url;
    this.setState({ side_image_url: side_image_url, top_image_url: top_image_url });
  }

  pull_past_entries = async (patient_id) => {
    let partner_id = await getItem('partner_id');
    let user_id    = await getItem('user_id');

    let request_data   = { type: 'BODY_CONDITION', patient_id: patient_id, partner_id: partner_id }
    let health_entries = await PetsController.getHealthEntries(request_data);
        health_entries = health_entries && health_entries.health_entries ? health_entries.health_entries : [];

    this.setState({ health_entries: health_entries })
  }
}

export default HealthBodyConditionScreen;

const styles = StyleSheet.create({
  add_image_container: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 18,
    borderColor: '#e7e7e7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
    height: 154
  },
  add_image_button_title: {
    fontWeight: 'medium',
    color: 'grey', marginTop: 5
  },
  add_image_buttons_container: {
    flexDirection: 'row',
    padding: 20
  },
  preview_image: {
    height: 150,
    width: '100%',
    borderRadius: 10
  },
  preview_image_container: {
    flex: 1,
    alignItems: 'center'
  },
  preview_image_trash: {
    padding: 15,
    paddingRight: 30,
    paddingLeft: 30
  },
  section_title: {
    fontSize: 18,
    fontWeight: 'medium',
    marginLeft: 20, marginTop: 10
  },
  single_add_image_button: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e7e7e7',
    padding: 15,
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
