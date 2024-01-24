import LottieView from 'lottie-react-native';
import analytics  from '@react-native-firebase/analytics';
import { Component } from "react";
import { Video     } from 'expo-av';
import { DateUtils, StringUtils } from '../utils';
import { StyleSheet, View, ScrollView, SafeAreaView, StatusBar, Image, Platform, TouchableOpacity, TextInput, KeyboardAvoidingView, FlatList, Modal } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Icon, Button, Text, Line, Input, Screen, Checkbox, Cards, Tabs, Colors, MediaModal } from '../components';
import { CareTab, HomeTab, HealthTab, ShopTab } from '../containers';
import { ConsultationController }   from '../controllers';
import { WebView } from 'react-native-webview';

class ConsultationThreadScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      thread_id: '',
      messages: [],
      display_pdf: false,
      loading_send_message: false,
      display_attachment_modal: false
    }
  }

  componentDidMount = async () => {
    let thread_id    = this.props && this.props.route && this.props.route.params && this.props.route.params.thread_id    ? this.props.route.params.thread_id    : '';
    let back_to_home = this.props && this.props.route && this.props.route.params && this.props.route.params.back_to_home ? this.props.route.params.back_to_home : false;
    let user_id      = await getItem('user_id');
    this.pull_messages(thread_id);
    this.setState({ thread_id: thread_id, user_id: user_id, back_to_home: back_to_home });
  }

  // DETAILS AT THE TOP OF THE THREADS SCROLLING SECTION

  get_message_row_item = (message, idx) => {
    let sender_name  = message.sender ? StringUtils.displayName(message.sender) : '';
    let sent_date    = DateUtils.getShortMonth(message.created_at) + ' ' + DateUtils.getDateNumber(message.created_at) + ', ' + DateUtils.getTime(message.created_at)
    let message_text = message.content.text;
    let media_url    = message && message.content && message.content.url ? message.content.url : '';
    let is_text      = message.type === 'TEXT';
    let is_image     = message.type === 'IMAGE';
    let is_video     = message.type === 'VIDEO';
    let is_pdf       = message.type === 'PDF';
    let bg_color     = message.from === this.state.user_id ? '#f5f5f5' : 'white';
    return <View style={{ backgroundColor: bg_color }}>
      <View style={{ paddingLeft: 15, paddingRight: 15, paddingTop: 20, paddingBottom: 20 }}>
        <Text style={{ fontSize: 16, marginBottom: 2  }}>{ sender_name }</Text>
        <Text style={{ color: 'grey', marginBottom: 10}}>{ sent_date   }</Text>
        { is_text  ? <Text style={{ fontSize: 16, color: 'grey' }}>{message_text }</Text> : null }
        { is_image ? <TouchableOpacity style={styles.image_message}
                        onPress={ () => {
                          this.setState({ display_pdf: true, pdf_url: media_url })
                        }}>
                        <Image style={styles.image_message} source={{ uri: media_url }} />
                     </TouchableOpacity> : null }
        { is_video ? <View style={styles.video_message_content_container}>
                        <Video style={styles.video_message}
                               source={{ uri: media_url }}
                               useNativeControls
                               resizeMode="contain"
                               isLooping />
                      </View>   : null }
        { is_pdf   ?  <TouchableOpacity style={styles.pdf_message_content_container}
                        onPress={ () => {
                          this.setState({ display_pdf: true, pdf_url: media_url })
                        }}>
                        <Icon name='file-pdf' solid={true} size={50} color={'#ff6262'} />
                        <Text style={{ fontWeight: '500', marginTop: 5 }}>PDF</Text>
                      </TouchableOpacity> : null }
      </View>
      <Line hide={idx === 0} />
    </View>
  }

  render_messages_section = () => {
    let messages = this.state.messages;

    return <View style={{ flex: 1 }}>
      <FlatList
         data={messages}
         style={{ flex: 1 }}
         keyExtractor={ (message) => { message._id }}
         inverted={true}
         renderItem ={ ({ item, index }) => {
           return this.get_message_row_item(item, index);
         }}
       />
    </View>
  }

  render_input_section = () => {
    return <View style={{ height: 150, padding: 15, paddingTop: 5, paddingBottom: 5, flexDirection: 'row' }}>
      <TextInput
        style={styles.message_text_input}
        value={this.state.message_text}
        maxHeight={110}
        autoCorrect={true}
        onChangeText={ (text) => {
          this.setState({ message_text: text });
        }}
        multiline={true}
      />
      <View style={{ marginTop: 15, marginBottom: 15, justifyContent: 'center' }}>
        <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}
                          onPress={ () => { this.send_text_message_action() }}>
          { this.state.loading_send_message ? <LottieView autoPlay style={{ width: 15, height: 15 }} source={ require('../../assets/animations/white-spinner.json') } />
                                            : <Icon name='arrow-up' size={18} color='white' /> }
        </TouchableOpacity>
        <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center', marginLeft: 12, marginTop: 5 }}
                          onPress={ () => { this.setState({ display_attachment_modal: true }) }}>
          <Icon name='paperclip' size={18} color='white' />
        </TouchableOpacity>
      </View>
    </View>
  }

  render() {

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;

    return <Screen title='Direct Message' navigation={this.props.navigation} back_to_home={this.state.back_to_home}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={ Platform.OS === 'ios' ? 'padding' : 'height' }
        keyboardVerticalOffset={ Platform.OS === 'ios' || Platform.OS === 'android' ? 100 : 0 }
        >
        <SafeAreaView style={{ flex: 1 }}>
          { this.render_messages_section() }
          <Line />
          { this.render_input_section()    }
          { this.render_pdf_modal()        }
          { this.render_attachment_modal() }
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Screen>
  }

  render_pdf_modal = () => {
    return <Modal
      animationType="slide"
      transparent={true}
      visible={ this.state.display_pdf }
      onRequestClose={() => {
        this.setState({ display_pdf: false, pdf_url: '' })
      }}>
        <Screen navigation={this.props.navigation} title={'PDF'} right_action={ () => { this.setState({ display_pdf: false, pdf_url: '' }) }} modal={true}>
          <WebView
            style={styles.pdf_view_container}
            source={{ uri: this.state.pdf_url }}
          />
        </Screen>
    </Modal>
  }

  render_attachment_modal = () => {
    return <MediaModal display={this.state.display_attachment_modal}
                       button_title='Send Attachment'
                       close_action={ () => {
                         this.setState({ display_attachment_modal: false })
                       }}
                       media_action={ (media_object) => {
                         if (media_object && media_object.type === 'image') {
                           this.send_image_attachment(media_object)
                         }

                         if (media_object && media_object.type === 'video') {
                           this.send_video_attachment(media_object)
                         }
                       }} />
  }

  send_image_attachment = async (media_object) => {
    let message_request_data = {
       content: {
         url: media_object.url,
       },
       consultation_id: this.state.thread_id,
       type: 'IMAGE'
     }

     let message_send_res = await ConsultationController.sendThreadMessage(message_request_data);
     is_success           = message_send_res && message_send_res.success && message_send_res.success === true ? true : false;

     if (is_success) {
       this.pull_messages(this.state.thread_id);
       this.setState({ display_attachment_modal: false })
     }
  }

  send_video_attachment = async (media_object) => {
    let message_request_data = {
       content: {
         url: media_object.url,
       },
       consultation_id: this.state.thread_id,
       type: 'VIDEO'
     }

     let message_send_res = await ConsultationController.sendThreadMessage(message_request_data);
     is_success           = message_send_res && message_send_res.success && message_send_res.success === true ? true : false;

     if (is_success) {
       this.pull_messages(this.state.thread_id);
       this.setState({ display_attachment_modal: false })
     }
  }

  send_text_message_action = async () => {
    let message_text = this.state.message_text;
    let thread_id    = this.state.thread_id;
    let is_success   = false;

    this.setState({ loading_send_message: true });

    if (message_text) {
      let message_request_data = { consultation_id: thread_id, type: 'TEXT', content: { text: message_text } }
      let message_send_res     = await ConsultationController.sendThreadMessage(message_request_data);
      is_success               = message_send_res && message_send_res.success && message_send_res.success === true ? true : false;
    }

    if (is_success) {
      this.pull_messages(thread_id);
      this.setState({ message_text: '', loading_send_message: false })
    }
  }

  pull_messages = async (thread_id) => {
    let request_data     = { consultation_id: thread_id }
    let get_messages_res = await ConsultationController.getThreadMessages(request_data);
    let messages         = get_messages_res && get_messages_res.data && get_messages_res.data.messages ? get_messages_res.data.messages : [];
    this.setState({ messages: messages });
  }

}

export default ConsultationThreadScreen;

const styles = StyleSheet.create({
  message_text_input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    paddingTop: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e7e7e7',
    fontSize: 15,
    height: 110,
    marginTop: 15
  },
  image_message: {
    height: 300,
    width: '100%',
    borderRadius: 10
  },
  video_message_content_container: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7e7e7'
  },
  video_message: {
    height: 200,
    width: '100%',
    borderRadius: 10
  },
  pdf_view_container: {
    flex: 1
  },
  pdf_message_content_container: {
    width: 100,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7e7e7',
    justifyContent: 'center',
    alignItems: 'center'
  }
});