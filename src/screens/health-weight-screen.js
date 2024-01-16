import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { DateUtils, StringUtils } from '../utils';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Image, Platform, TouchableOpacity, TextInput, KeyboardAvoidingView, FlatList, Modal } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors, MediaModal } from '../components';
import { ConsultationController }   from '../controllers';

class HealthWeightScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount = async () => {
    let partner_id = await getItem('partner_id');
    let user_id    = await getItem('user_id');

    this.setState({ partner_id: partner_id, user_id: user_id });
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

  render() {

    return <Screen scroll={true} title='Weight' navigation={this.props.navigation}>

    </Screen>
  }
}

export default HealthWeightScreen;

const styles = StyleSheet.create({

});
