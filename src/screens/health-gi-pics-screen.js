import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { DateUtils, StringUtils } from '../utils';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Image, Platform, TouchableOpacity, TextInput, KeyboardAvoidingView, FlatList, Modal } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors, MediaModal } from '../components';
import { ConsultationController, PetsController }   from '../controllers';

class HealthGiPicsScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      images: [],
      health_entries: [],
      expanded_entry_id: '',
      opened_modal: false
    }
  }

  componentDidMount = async () => {
    let patient_id = this.props && this.props.route && this.props.route.params && this.props.route.params.pet_id ? this.props.route.params.pet_id : '';
    let partner_id = await getItem('partner_id');
    let user_id    = await getItem('user_id');

    this.pull_past_entries(patient_id)

    this.setState({ partner_id: partner_id, patient_id: patient_id, user_id: user_id });
  }

  render_image_block = (image_url, index) => {
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
                               onPress={ ()=> { this.setState({ opened_modal: true }) }}>
        <Icon name='plus-circle' color='#e7e7e7' />
        <Text style={styles.add_image_button_title}>Add Image</Text>
      </TouchableOpacity>
    }
  }

  render_add_image_buttons = () => {
    let images = this.state.images;

    if (images && images.length === 0) {
      return <View style={styles.add_image_buttons_container}>
        <TouchableOpacity onPress={ ()=> { this.setState({ opened_modal: true }) }}
                          style={styles.single_add_image_button}>
          <Text style={{ fontWeight: 'medium', color: 'grey', fontSize: 17 }}>Add Image</Text>
        </TouchableOpacity>
      </View>
    }

    let image_1_url = images && images[0] ? images[0] : '';
    let image_2_url = images && images[1] ? images[1] : '';
    let image_3_url = images && images[2] ? images[2] : '';

    return <View style={styles.add_image_buttons_container}>
      { this.render_image_block(image_1_url, 0) }
      <View style={{ width: 10 }} />
      { this.render_image_block(image_2_url, 1) }
      <View style={{ width: 10 }} />
      { this.render_image_block(image_3_url, 2) }
    </View>
  }

  render_submit_button = () => {
    let no_images = this.state.images && this.state.images.length === 0;

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
      let image_url_1 = entry_data && entry_data.image_url_1 ? entry_data.image_url_1 : '';
      let image_url_2 = entry_data && entry_data.image_url_2 ? entry_data.image_url_2 : '';
      let image_url_3 = entry_data && entry_data.image_url_3 ? entry_data.image_url_3 : '';
      let is_expanded = this.state.expanded_entry_id === entry._id;
      return <View style={{ paddingRight: 20, paddingLeft: 20 }}>
        <TouchableOpacity onPress={ () => { this.setState({ expanded_entry_id: is_expanded ? '' : entry._id })}}>
          <Text style={{ fontSize: 16, fontWeight: 'medium' }}>{ date }</Text>
        </TouchableOpacity>
        { is_expanded ? <View style={{ flexDirection: 'row', marginTop: 15 }}>
          { image_url_1 ? <Image style={{height: 80, width: 80, borderRadius: 10, marginRight: 10 }} resizeMode='cover' source={{ uri: image_url_1 }} /> : null  }
          { image_url_2 ? <Image style={{height: 80, width: 80, borderRadius: 10, marginRight: 10 }} resizeMode='cover' source={{ uri: image_url_2 }} /> : null  }
          { image_url_3 ? <Image style={{height: 80, width: 80, borderRadius: 10 }} resizeMode='cover' source={{ uri: image_url_3 }} /> : null  }
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
    
    return <Screen scroll={true} title='GI Pics' navigation={this.props.navigation}>
      <Text style={styles.section_title}>New Entry</Text>
      { this.render_add_image_buttons() }
      { this.render_submit_button()     }
      <View style={{ height: 20 }} />
      { this.render_past_entries() }
      { this.render_media_modal() }
    </Screen>
  }

  render_media_modal = () => {
    return <MediaModal display={this.state.opened_modal}
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

  add_image = async (media_object) => {
    let images  = this.state.images;
    let url     = media_object.url || '';
    let new_arr = [ ...images ];
    if (url) {
      new_arr.push(url);
    }
    this.setState({ images: new_arr, opened_modal: false })
  }

  add_health_entry = async () => {

    let partner_id    = this.state.partner_id;
    let patient_id    = this.state.patient_id;
    let user_id       = this.state.user_id;
    let images        = this.state.images;
    let mapped_images = images.map((image, i) => { return { [`image_url_${i+1}`] : image }});
        mapped_images = Object.assign({}, ...mapped_images);

    if(images.length) {
      this.setState({ loading_uploading_images: true });

      let request_data = {
        type: 'GI_PICS',
        patient_id: patient_id,
        client_id:  user_id,
        partner_id: partner_id,
        entry_data: {
          ...mapped_images,
          date: new Date()
        }
      }

      let create_res = await PetsController.createHealthEntry(request_data);
      let is_success = create_res.success === true ? true : false;

      this.pull_past_entries(patient_id);

      this.setState({ loading_uploading_images: false, images: is_success ? [] : this.state.images });
    }
  }

  remove_image_preview = (index) => {
    let current_images = [ ...this.state.images ];
    let new_images     = [];
    current_images.forEach((img, i) => {
      if (i !== index) {
        new_images.push(img);
      }
    });
    this.setState({ images: new_images });
  }

  pull_past_entries = async (patient_id) => {
    let partner_id = await getItem('partner_id');
    let user_id    = await getItem('user_id');

    let request_data   = { type: 'GI_PICS', patient_id: patient_id, partner_id: partner_id }
    let health_entries = await PetsController.getHealthEntries(request_data);
        health_entries = health_entries && health_entries.health_entries ? health_entries.health_entries : [];

    this.setState({ health_entries: health_entries })
  }

}

export default HealthGiPicsScreen;

const styles = StyleSheet.create({
  add_image_container: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 18,
    borderColor: '#e7e7e7',
    justifyContent: 'center',
    alignItems: 'center'
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
    height: 100,
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
