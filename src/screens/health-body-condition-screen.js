import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { DateUtils, StringUtils } from '../utils';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Image, Platform, TouchableOpacity, TextInput, KeyboardAvoidingView, FlatList, Modal } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors, MediaModal } from '../components';
import { ConsultationController, PetsController }   from '../controllers';

class HealthBodyConditionScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      images: [],
      opened_modal: false
    }

    this.drawImage = this.drawImage.bind(this);
    this.addImage = this.addImage.bind(this);
    this.addHealthEntry = this.addHealthEntry.bind(this);
    this.drawRecord = this.drawRecord.bind(this);
    this.drawPastImage = this.drawPastImage.bind(this);
    this.clearImage = this.clearImage.bind(this);
  }

  componentDidMount = async () => {
        /********** HARDCODED DATA */
        let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjNkMDUyYzkzZGI0MDExYjk2NTU3YzBlIiwicm9sZSI6IkNMSUVOVCIsImhvc3RfbmFtZSI6ImhpbGxzIiwiaWF0IjoxNzA0ODQyNTQzLCJleHAiOjE3ODI2MDI1NTB9.THkdZqGHqOs6Re9Zf-nUeYDjq1XZVerAFd0sJiACtFk';

        await setItem('token', token);
        await setItem('user_id', '60bf8bca86755e442b095415');
        await setItem('partner_id', '61fd4d95cbb0c41ec9705073');
    
        let patient_id = '63d052fc3db4010240557c42';
        /********** END HARDCODED DATA */

    let partner_id = await getItem('partner_id');
    let user_id    = await getItem('user_id');

    let data = {
      type: 'BODY_CONDITION',
      patient_id,
      partner_id
    }

    let health_entries = await PetsController.getHealthEntries(data);

    console.log('health_entries', health_entries);

    health_entries = health_entries && health_entries.health_entries ? health_entries.health_entries : [];

    this.setState({ partner_id, patient_id, user_id, health_entries });
  }

  /*
  patientHealthEntries {
   type: 'BODY_CONDITION',
   patient_id: String,
   client_id: String,
   entry_data: {
     image_url_1: String,
     image_url_2: String,
     image_url_3: String,
     date: DateTime
   },
   has_thread: false,
   partner_id: String
  }
  */

  drawImage(image_url, image_index) {
    return image_url ? 
      <View style={{height: 120, width: 100}}>
        <Image style={{height: 100, width: 100, borderRadius: 10}} resizeMode='cover' source={{uri: image_url}} />
        <TouchableOpacity onPress={()=>this.clearImage(image_index)}><Text>clear</Text></TouchableOpacity>
      </View>
       : 
      <TouchableOpacity onPress={()=>{this.setState({opened_modal: true, image_index})}} style={{height: 100, width: 100, backgroundColor: 'gray', borderRadius: 10}}><Text style={{textAlign: 'center', alignSelf: 'center'}}>Required</Text></TouchableOpacity>
  }

  async addImage(media_object) {

    console.log('media_object', media_object)

    let { images, image_index } = this.state;

    images = images.filter(image=>!!image)

    let has_two_images = images.length === 2;

    if(has_two_images) {
      images[image_index] = media_object.url;
    } else {
      images.push(media_object.url)
    }

    this.setState({images, opened_modal: false})
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

      console.log('health_entries', health_entries);
      
      let health_entries = await PetsController.getHealthEntries(data);

      console.log('health_entries', health_entries);

      health_entries = health_entries && health_entries.health_entries ? health_entries.health_entries : [];

      this.setState({ health_entries });
    }

  }

  drawPastImage(image_url) {
    return image_url ? 
      <Image style={{height: 50, width: 50, borderRadius: 10}} resizeMode='cover' source={{uri: image_url}} /> : null
  }

  drawRecord(record) {

    console.log('record', record);

    let { entry_data } = record;
    let { date } = entry_data;

    date = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));

    let images = record.entry_data;

    return <View style={{flexDirection: 'column'}}>
      <Text>{date}</Text>
      <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
        {this.drawPastImage(images.image_url_1)}
        {this.drawPastImage(images.image_url_2)}
      </View>
    </View>
  }

  clearImage(index) {
    let { images } = this.state;

    images.splice(index, 1);

    this.setState({images});
  }

  render() {

    //uploadMediaFromLibrary

    let { images, opened_modal, health_entries } = this.state;

    while (images.length < 2) {
      images.push(null);
    }

    return <Screen scroll={true} title='Body Condition' navigation={this.props.navigation}>
          <View style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
          {images.map(this.drawImage)}
          </View>
          <MediaModal display={opened_modal}
                       button_title='Add Image'
                       close_action={ () => {
                         this.setState({ opened_modal: false })
                       }}
                       media_action={ (media_object) => {
                         if (media_object && media_object.type === 'image') {
                           this.addImage(media_object)
                         }
                       }} />
          <Button title='Submit'
                style={{ borderRadius: 40, marginTop: 10, width: 200, alignSelf: 'flex-end' }}
                loading={this.state.loading_sending_email}
                onPress={this.addHealthEntry}/>


      {health_entries && health_entries.length ? <View style={{flexDirection: 'column'}}>
        <Text>Past Records</Text>
        <View style={{flexDirection: 'column', marginTop: 10}}>
          {health_entries.map(this.drawRecord)}
        </View>
      </View> : null}
    </Screen>
  }
}

export default HealthBodyConditionScreen;

const styles = StyleSheet.create({

});
