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
      selected_pet: {},
      selected_pet_id: '',
      selected_category: '',
      message_text: '',
      loading_start_thread: false
    }
  }

  componentDidMount = async () => {
    this.pull_pets();
  }

  render_pet_list = () => {
    if (this.state.selected_pet_id && this.state.selected_category) {
      return null;
    }

    let pets     = this.state.pets || [];

    let pet_rows = pets.map((pet, index) => {
      let is_last = index === pets.length - 1;
          is_last = false;
      let pet_id  = pet._id;
      let name    = StringUtils.displayName(pet);
      let gender  = StringUtils.sentenceCase(pet.gender.toLowerCase());
      let type    = StringUtils.sentenceCase(pet.type.toLowerCase());
      let descrpt = gender + ' ' + type;
      let age     = '';
      let selected= pet_id === this.state.selected_pet_id;

      if (pet.age) {
        age = ', Age ' + pet.age;
      }

      if (pet.birthday) {
        age = ', Age ' + StringUtils.displayBirthdayAge(pet.birthday)
      }

      return <View key={pet_id}>
        <TouchableOpacity style={{ marginTop: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                          onPress={ () => { this.setState({ selected_pet_id: pet_id, selected_pet: pet }) }}>
         <View>
           <Text style={{ fontSize: 16, fontWeight: '500', color: '#040415' }}>{ name }</Text>
           <Text style={{ fontSize: 14, color: '#575762', marginTop: 3 }}>{ descrpt + age }</Text>
         </View>
         { selected ? <Icon name='check-circle' solid={true} size={20} color={Colors.GREEN} />  : null }
        </TouchableOpacity>
        <Line hide={is_last} />
      </View>
    })

    return <View style={{ padding: 20 }}>
      <Text style={styles.section_title}>Select a pet</Text>
      { pet_rows }
    </View>
  }

  render_category_selection = () => {
    if (this.state.selected_pet_id && this.state.selected_category) {
      return null;
    }

    let categories    = [ 'allergies', 'anxiety', 'behavior', 'dental', 'general_advice', 'joint_health', 'nutrition', 'sensitive_stomach', 'skin_and_ears' ];
    let category_rows = categories.map((category) => {
      let display_category = StringUtils.keyToDisplayString(category);
      let is_selected      = category === this.state.selected_category;
      return <View>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.setState({ selected_category: category }) }}>
          <Text style={styles.selection_row_title}>{ display_category }</Text>
          { is_selected ? <Icon name='check-circle' solid={true} size={20} color={Colors.GREEN} />  : null }
        </TouchableOpacity>
        <Line />
      </View>
    })

    return <View style={{ padding: 20, paddingTop: 0 }}>
      <Text style={styles.section_title}>Select a category</Text>
      { category_rows }
    </View>
  }

  render_message_interface = () => {
    return <View style={{ padding: 20, paddingBottom: 0 }}>
      <Text style={styles.section_title}>Pet</Text>
      <Text style={styles.selection_row_title} onPress={ () => { this.setState({ selected_pet: {}, selected_pet_id: '' }) } }>{ StringUtils.displayName(this.state.selected_pet) }</Text>
      <Text style={styles.section_title}>Category</Text>
      <Text style={styles.selection_row_title} onPress={ () => { this.setState({ selected_category: '' }) } }>{ StringUtils.keyToDisplayString(this.state.selected_category) }</Text>
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
      <Button title='View Consultation Details' loading={this.state.loading_start_thread} style={{ marginTop: 20 }} onPress={ () => { this.create_thread_action() }}/>
    </View>
  }

  render() {

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;

    return <Screen title='New Message' scroll={true} navigation={this.props.navigation} left_action={this.back_button_action}>
      { this.render_pet_list() }
      { this.render_category_selection() }
      { this.render_message_interface()  }
    </Screen>
  }

  create_thread_action = async () => {
    let user_id    = await getItem('user_id');
    let partner_id = await getItem('partner_id');

    let thread_success  = false;
    let message_success = false;

    this.setState({ loading_start_thread: true });

    let request_data = {
      patient_id: this.state.selected_pet_id,
      client_id: user_id,
      partner_id: partner_id,
      category: this.state.selected_category
    }

    let new_thread_res = await ConsultationController.createThread(request_data);
        thread_success = new_thread_res && new_thread_res.success;
    let thread_id      = is_success && new_thread_res.data && new_thread_res.data.care_consultation && new_thread_res.data.care_consultation._id ? new_thread_res.data.care_consultation._id : '';

    if (is_thread_success && thread_id && this.state.message_text) {
      let message_request_data = { consultation_id: thread_id, type: 'TEXT', content: { text: this.state.message_text } }
      let new_message_res      = await ConsultationController.sendThreadMessage(message_request_data);
          message_success      = new_message_res && new_message_res.success;
    }

    if (thread_success && message_success) {
      this.props.navigation.push('ConsultationThread', { thread_id: thread_id });
    }

    this.setState({ loading_start_thread: false });
  }
  // let thread_id = '65a575a9bc294e8ff2a56788';

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
    fontSize: 22,
    fontWeight: 'semibold'
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
    fontSize: 16,
    fontWeight: '500'
  },
  message_text_input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    paddingTop: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e7e7e7',
    fontSize: 15,
    height: 90,
    marginTop: 15
  }
});
