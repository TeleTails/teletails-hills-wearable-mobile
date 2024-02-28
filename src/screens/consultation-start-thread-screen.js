import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component }   from "react";
import { StringUtils } from '../utils';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Platform, TouchableOpacity, TextInput } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors } from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';
import { PetsController, ConsultationController }   from '../controllers';

class ConsultationStartThreadScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pets: [],
      current_section: 'pets',
      selected_pet: {},
      selected_pet_id: '',
      subject: '',
      message_text: '',
      loading_start_thread: false,
      provider_id: '',
      is_rechat: false
    }
  }

  componentDidMount = async () => {
    let is_rechat   = this.props && this.props.route && this.props.route.params && this.props.route.params.is_rechat   && this.props.route.params.is_rechat === true ? true : false;
    let provider_id = this.props && this.props.route && this.props.route.params && this.props.route.params.provider_id ?  this.props.route.params.provider_id : '';

    this.pull_pets();

    this.setState({ is_rechat: is_rechat, provider_id: provider_id })
  }

  render_progress_bar = () => {
    let section    = this.state.current_section;
    let percentage = '20%';
        percentage = section === 'pets'         ? '33%' : percentage;
        percentage = section === 'subject'      ? '66%' : percentage;
        percentage = section === 'confirmation' ? '100%' : percentage;

    return <View style={styles.progress_bar_container}>
      <View style={styles.progress_bar}>
        <View style={{ height: '100%', width: percentage, backgroundColor: Colors.PRIMARY, borderRadius: 20 }}></View>
      </View>
    </View>
  }

  render_pet_list = () => {
    if (this.state.current_section !== 'pets') {
      return null;
    }

    let pets = this.state.pets || [];

    let pet_rows = pets.map((pet, index) => {
      let is_last = index === pets.length - 1;
          is_last = false;
      let pet_id  = pet._id;
      let name    = StringUtils.displayName(pet);
      let gender  = StringUtils.sentenceCase(pet.gender.toLowerCase());
      let type    = StringUtils.sentenceCase(pet.type.toLowerCase());
      let descrpt = gender + ' ' + type;
      let age     = '';

      if (pet.age) {
        age = ', Age ' + pet.age;
      }

      if (pet.birthday) {
        age = ', Age ' + StringUtils.displayBirthdayAge(pet.birthday)
      }

      return <View key={pet_id}>
        <TouchableOpacity style={{ paddingTop: 20, paddingBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                          onPress={ () => { this.setState({ selected_pet_id: pet_id, selected_pet: pet, current_section: 'subject' }) }}>
         <View>
           <Text style={styles.selection_row_title}>{ name }</Text>
         </View>
        </TouchableOpacity>
        <Line hide={is_last} />
      </View>
    })

    return <View style={{ padding: 20, paddingTop: 0 }}>
      <Text style={styles.section_title}>Select a pet</Text>
      { pet_rows }
    </View>
  }

  render_message_interface = () => {
    if (this.state.current_section !== 'subject') {
      return null;
    }

    return <View style={{ padding: 20, paddingBottom: 0, paddingTop: 0 }}>
      <Text style={styles.section_title}>Enter a Subject</Text>
      <Input value={ this.state.subject }
             style={{ marginBottom: 20, marginTop: 10, fontSize: 16, height: 50, paddingTop: 10, paddingBottom: 10, borderWidth: 2 }}
             border_color='#e7e7e7'
             onChangeText={(input_text)=>{
               this.setState({ subject: input_text });
             }}/>
      <Text style={styles.section_title}>Enter a message</Text>
      <TextInput
        style={styles.message_text_input}
        value={this.state.message_text}
        maxHeight={120}
        autoCorrect={true}
        onChangeText={ (text) => {
          this.setState({ message_text: text });
        }}
        multiline={true}
      />
      <Text style={{ fontSize: 16, color: 'grey', marginTop: 16 }}>By continuing, I acknowledge that this is not an emergency.</Text>
      <Button title='Send Message' loading={this.state.loading_start_thread} style={{ marginTop: 20 }} onPress={ () => { this.create_thread_action() }}/>
    </View>
  }

  render_confirmation = () => {
    if (this.state.current_section !== 'confirmation') {
      return null;
    }

    return <View style={{ padding: 20, paddingBottom: 0, paddingTop: 0 }}>
      <Text style={styles.section_title}>Confirmation</Text>
      <Button title='Add Info' style={{ marginTop: 20 }} onPress={ () => { this.props.navigation.push('ConsultationThread', { thread_id: this.state.thread_id, back_to_home: true }) }}/>
      <Button title='Back To Home' style={{ marginTop: 20 }} onPress={ () => { this.props.navigation.pop(); }}/>
    </View>
  }

  render() {

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;

    return <Screen title='New Message' scroll={true} navigation={this.props.navigation} left_action={this.back_button_action}>
      { this.render_progress_bar()      }
      { this.render_pet_list()          }
      { this.render_message_interface() }
      { this.render_confirmation()      }
    </Screen>
  }

  back_button_action = () => {
    let current_display_section = this.state.current_section;

    let new_display_section = current_display_section === 'subject'  ? 'pets'     : new_display_section;

    if (current_display_section === 'pets'|| current_display_section === 'confirmation') {
      this.props.navigation.pop();
    } else {
      this.setState({ current_section: new_display_section })
    }
  }

  create_thread_action = async () => {
    let user_id    = await getItem('user_id');
    let partner_id = await getItem('partner_id');

    let thread_success  = false;
    let message_success = false;

    if (!this.state.subject || !this.state.message_text) {
      return null;
    }

    this.setState({ loading_start_thread: true });

    let request_data = {
      patient_id: this.state.selected_pet_id,
      client_id: user_id,
      partner_id: partner_id,
      category: '',
      subject: this.state.subject
    }

    if (this.state.is_rechat && this.state.provider_id) {
      request_data['is_rechat']   = true;
      request_data['provider_id'] = this.state.provider_id;
    }

    let new_thread_res = await ConsultationController.createThread(request_data);
        thread_success = new_thread_res && new_thread_res.success;
    let thread_id      = thread_success && new_thread_res.data && new_thread_res.data.care_consultation && new_thread_res.data.care_consultation._id ? new_thread_res.data.care_consultation._id : '';

    if (thread_success && thread_id && this.state.message_text ) {
      let message_request_data = { consultation_id: thread_id, type: 'TEXT', content: { text: this.state.message_text } }
      let new_message_res      = await ConsultationController.sendThreadMessage(message_request_data);
          message_success      = new_message_res && new_message_res.success;
    }

    if (thread_success && message_success) {
      this.setState({ thread_id: thread_id, current_section: 'confirmation' })
    }

    this.setState({ loading_start_thread: false });
  }

  pull_pets = async () => {
    let pets_response = await PetsController.getPets();
    let is_success    = pets_response && pets_response.success;
    let pets          = is_success && pets_response.data && pets_response.data.pets ? pets_response.data.pets : [];
    this.setState({ pets: pets });
  }

}

export default ConsultationStartThreadScreen;

const styles = StyleSheet.create({
  section_title: {
    fontSize: 18,
    fontWeight: 'medium',
    color: '#0054A4'
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
  selection_row_title: {
    fontSize: 15,
    fontWeight: 'medium'
  },
  message_text_input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    paddingTop: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e7e7e7',
    fontSize: 16,
    height: 120,
    marginTop: 15
  },
  progress_bar_container: {
    paddingRight: 20,
    paddingLeft: 20,
    marginTop: 20,
    marginBottom: 20
  },
  progress_bar: {
    height: 10,
    borderRadius: 20,
    backgroundColor: '#e7e7e7'
  }
});
