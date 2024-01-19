import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { DateUtils, StringUtils } from '../utils';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Image, Platform, TouchableOpacity, TextInput, KeyboardAvoidingView, FlatList, Modal } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors, MediaModal } from '../components';
import { ConsultationController, PetsController }   from '../controllers';

class HealthWeightScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }

    this.updateStateValue = this.updateStateValue.bind(this);
    this.addHealthEntry = this.addHealthEntry.bind(this);
    this.drawRecord = this.drawRecord.bind(this);
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
      type: 'WEIGHT',
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
   type: 'GI_PICS',
   patient_id: String,
   client_id: String,
   entry_data: {
     weight: Number,
     date: DateTime
   },
   has_thread: false,
   partner_id: String
  }
  */

  async addHealthEntry() {
    let { update_weight, partner_id, patient_id, user_id } = this.state;

    update_weight = update_weight ? update_weight.trim() : "";

    if(update_weight !== "") {
      let data = {
        type: 'WEIGHT', 
        patient_id, 
        client_id: user_id, 
        partner_id, 
        entry_data: {
          weight: parseFloat(update_weight),
          date: new Date()
        }
      }
      
      await PetsController.createHealthEntry(data);

      data = {
        type: 'WEIGHT',
        patient_id,
        partner_id
      }

      let health_entries = await PetsController.getHealthEntries(data);

      console.log('health_entries', health_entries);

      health_entries = health_entries && health_entries.health_entries ? health_entries.health_entries : [];

      this.setState({ health_entries });
    }

  }

  updateStateValue(name, value) {
    this.setState({
      [name]: value
    })
  }

  drawRecord(record) {

    console.log('record', record);

    let { entry_data } = record;
    let { weight, date } = entry_data;

    date = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));

    return <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <Text>{date}</Text>
      <Text>{weight} lbs</Text>
    </View>
  }

  render() {
    let { health_entries } = this.state;

    return <Screen scroll={true} title='Weight' navigation={this.props.navigation}>
      <Input type={'text'} onChangeText={(event)=>this.updateStateValue('update_weight', event)} />
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

export default HealthWeightScreen;

const styles = StyleSheet.create({

});
