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
      partner_id: '',
      patient_id: '',
      user_id: '',
      weight: 0,
      health_entries: []
    }
  }

  componentDidMount = async () => {
    let patient_id = this.props && this.props.route && this.props.route.params && this.props.route.params.pet_id ? this.props.route.params.pet_id : '';
    let partner_id = await getItem('partner_id');
    let user_id    = await getItem('user_id');

    this.pull_past_entries(patient_id);

    this.setState({ partner_id: partner_id, patient_id: patient_id, user_id: user_id });
  }

  render_weight_input_section = () => {
    return <View style={{ padding: 20 }}>
      <Text style={styles.section_title}>Add Weight</Text>
      <Input keyboardType='decimal-pad' value={this.state.weight} onChangeText={ (weight) => {  this.setState({ weight: weight }) }} />
      <Button title='Submit'
              style={{ borderRadius: 40, marginTop: 10, width: 200, alignSelf: 'flex-end' }}
              loading={this.state.loading_submit_weight}
              onPress={ () => { this.add_health_entry() }}/>
    </View>
  }

  render_weight_entries = () => {
    let health_entries = this.state.health_entries;
    let entry_rows = health_entries.map((entry, idx) => {
      let entry_data = entry && entry.entry_data ? entry.entry_data : {};
      let weight     = entry_data.weight || 0;
      let date       = entry_data.date ? DateUtils.getLongMonth(entry_data.date) + ' ' + DateUtils.getDateNumber(entry_data.date) : '';

      return <View style={{ flexDirection: 'column' }}>
        <View style={{ flexDirection: 'column' }}>
          <Text style={{ fontSize: 20 }}>{ weight } lbs</Text>
          <Text style={{ fontSize: 15, color: 'grey' }}>{ date   }</Text>
        </View>
        <Line style={{ marginTop: 15, marginBottom: 15 }} />
      </View>
    })

    return <View style={{ flexDirection: 'column', padding: 20, paddingTop: 0 }}>
      <Text style={styles.section_title}>Past Entries</Text>
      { entry_rows }
    </View>
  }

  render() {
    return <Screen scroll={true} title='Weight' navigation={this.props.navigation}>
      { this.render_weight_input_section() }
      { this.render_weight_entries()       }
    </Screen>
  }

  add_health_entry = async () => {

    let weight     = this.state.weight;
    let client_id  = this.state.user_id;
    let patient_id = this.state.patient_id;
    let partner_id = this.state.partner_id;

    if (weight) {
      this.setState({ loading_submit_weight: true });

      let request_data = {
        type: 'WEIGHT',
        patient_id: patient_id,
        client_id: client_id,
        partner_id: partner_id,
        entry_data: {
          weight: parseFloat(weight),
          date: new Date()
        }
      }

      let create_res = await PetsController.createHealthEntry(request_data);
      let is_success = create_res.success === true ? true : false;

      this.setState({ weight: '', loading_submit_weight: false });
      this.pull_past_entries(patient_id);
    }
  }

  pull_past_entries = async (patient_id) => {
    let partner_id = await getItem('partner_id');
    let user_id    = await getItem('user_id');

    let request_data   = { type: 'WEIGHT', patient_id: patient_id, partner_id: partner_id }
    let health_entries = await PetsController.getHealthEntries(request_data);
        health_entries = health_entries && health_entries.health_entries ? health_entries.health_entries : [];

    this.setState({ health_entries: health_entries })
  }

}

export default HealthWeightScreen;

const styles = StyleSheet.create({
  section_title: {
    fontSize: 18,
    fontWeight: 'medium',
    marginBottom: 15
  }
});
