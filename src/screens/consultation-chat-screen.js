import { Component }    from 'react';
import LottieView       from 'lottie-react-native';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, View, TextInput, ActivityIndicator, SafeAreaView, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
import { Screen, Button, Input, Line, Icon, Text, Colors, MediaModal } from '../components';
import { MessageList, ConsultationFeedbackForm } from '../containers';
import { StringUtils } from '../utils';
import { AuthController, ConsultationController, UtilitiesController, MediaController } from '../controllers';
import { config } from '../../config';
import { setItem, getItem } from '../../storage';

class ConsultationChatScreen extends Component {

  constructor(props) {
    super(props);

    let care_consultation_id = this.props && this.props.route && this.props.route.params && this.props.route.params.care_consultation_id ? this.props.route.params.care_consultation_id : '';
    let back_to_home         = this.props && this.props.route && this.props.route.params && this.props.route.params.back_to_home ? this.props.route.params.back_to_home : false;

    this.state = {
      consultation_id: care_consultation_id,
      back_to_home: back_to_home,
      message_text: '',
      care_consultation: null,
      display_attachment_modal: false,
      loading_send_attachment: false,
      messages: [],
      loading_submit_feedback: false,
      display_options_modal: false,
      resolve_loading: false,
      time_elapsed: 0,
      bubble_seconds: 0
    }

    this.socket = null;
    this.consultation_socket = null;
  }

  socket_connect(consultation_id) {
    return UtilitiesController.getSocket({name: `consultation_${consultation_id}`, query: 'consultation_id=' + consultation_id})
  }

  consultation_socket_connect(consultation_id) {
    return UtilitiesController.getSocket({name: `consultation_${consultation_id}`, query: 'notification=' + consultation_id, notification: true})
  }

  componentWillUnmount() {
    clearInterval(this.timer_ref);
  }

  componentDidMount = async () => {
    let consultation_id      = this.state.consultation_id;
    let back_to_home         = this.state.back_to_home;
    let care_consultation_id = consultation_id;
    let user_id              = await getItem('user_id');

    this.setState({ loading_consultation: true, back_to_home, consultation_id, user_id }, async () => {
      let care_consultation_response = await ConsultationController.getCareConsultationDetails(care_consultation_id);
      let care_consultation          = care_consultation_response && care_consultation_response.data && care_consultation_response.data.care_consultation && care_consultation_response.data.care_consultation.care_consultation_details ? care_consultation_response.data.care_consultation.care_consultation_details : {};

      let consultation_messages_res  = await this.get_consultation_messages(care_consultation_id);
      let user                       = await AuthController.getUser(true);
      let is_partner_provider_linked = await ConsultationController.checkProviderPartnerLink({ partner_id: care_consultation.partner_id, provider_id: care_consultation.provider_id });
      let prev_provider_still_linked = is_partner_provider_linked && is_partner_provider_linked.success && is_partner_provider_linked.data && is_partner_provider_linked.data.linked ? is_partner_provider_linked.data.linked : false;

      let messages         = consultation_messages_res && consultation_messages_res.success && consultation_messages_res.data && consultation_messages_res.data.messages ? consultation_messages_res.data.messages : [];
      let provider         = care_consultation && care_consultation.provider ?  care_consultation.provider : {};
      let welcome_messages = care_consultation && care_consultation.partner  && care_consultation.partner.welcome_messages ? care_consultation.partner.welcome_messages : [];
      let is_resolved      = care_consultation && care_consultation.status   && care_consultation.status === 'RESOLVED' ? true : false;
      let display_feedback = care_consultation && care_consultation._id      && !care_consultation.feedback_data && is_resolved ? true : false;

      if (care_consultation) {

        if (!this.consultation_socket) {
          this.consultation_socket = this.consultation_socket_connect(care_consultation._id);
        }

        if (!this.socket) {
          this.socket = this.socket_connect(care_consultation_id);
        }

        this.socket.on('care_chat_message', async (msg) => {
          let re_pull_response   = await this.get_consultation_messages(care_consultation_id);
          let re_pulled_messages = re_pull_response && re_pull_response.success && re_pull_response.data && re_pull_response.data.messages ? re_pull_response.data.messages : [];

          this.setState({ messages: re_pulled_messages.reverse() })
        });

        this.consultation_socket.on('care_consultation_updated', async () => {
          let care_consultation_response = await ConsultationController.getCareConsultationDetails(care_consultation_id);
          let care_consultation          = care_consultation_response.care_consultation_details;
          let is_resolved                = care_consultation && care_consultation.status   && care_consultation.status === 'RESOLVED' ? true : false;
          let display_feedback           = care_consultation && care_consultation._id      && !care_consultation.feedback_data && is_resolved ? true : false;
          this.setState({ care_consultation: care_consultation, display_feedback: display_feedback, is_resolved: is_resolved })
        });

        this.socket.on('typing_bubble', (bubble_data) => {
          this.toggle_chat_bubble(bubble_data);
        })

        this.setState({ loading_consultation: false, care_consultation: care_consultation, user: user, messages: messages.reverse(), provider: provider, welcome_messages: welcome_messages, display_feedback: display_feedback, is_resolved: is_resolved, prev_provider_still_linked: prev_provider_still_linked })
      } else {
        this.setState({ loading_consultation: false, user: user, prev_provider_still_linked: prev_provider_still_linked })
      }

    });

    this.timer_ref = setInterval(this._onEverySecond, 1000);
  }

  _onEverySecond = () => {
    let time_elapsed   = this.state.time_elapsed;
        time_elapsed   = time_elapsed + 1;

    let bubble_seconds = this.state.bubble_seconds;
        bubble_seconds = bubble_seconds > 0 ? bubble_seconds - 1 : bubble_seconds;

    let display_bubble = false;

    if (bubble_seconds > 0) {
      display_bubble = true;
    }

    if (time_elapsed % 15 === 0) {
      this.pull_new_messages()
    }

    this.setState({ ...this.state, time_elapsed: time_elapsed, bubble_seconds: bubble_seconds, display_type_bubble: display_bubble });
  }

  pull_new_messages = async () => {
    let care_consultation    = this.state.care_consultation;
    let care_consultation_id = care_consultation._id;

    if (!care_consultation_id) {
      return;
    }

    let re_pull_response     = await this.get_consultation_messages(care_consultation_id);
    let re_pulled_messages   = re_pull_response && re_pull_response.success && re_pull_response.data && re_pull_response.data.messages ? re_pull_response.data.messages : [];

    this.setState({ messages: re_pulled_messages.reverse() })
  }

  toggle_chat_bubble = (bubble_data) => {
    let typer_id        = bubble_data.typer_id;
    let consultation_id = bubble_data.consultation_id;
    let current_user_id = this.state.user && this.state.user._id ? this.state.user._id : '';
    let bubble_seconds  = this.state.bubble_seconds;
    let display_bubble  = this.state.display_type_bubble;

    if (typer_id && current_user_id !== typer_id) {
      bubble_seconds  = 4;
      display_bubble = true;
    }

    this.setState({ ...this.state, display_type_bubble: display_bubble, bubble_seconds: bubble_seconds })
  };

  render_start_another_chat = (provider_name) => {
    let provider_id = this.state.provider && this.state.provider._id ? this.state.provider._id : '';
    let is_resolved = this.state.is_resolved;
    let is_linked   = this.state.prev_provider_still_linked;

    if (provider_id && is_resolved && is_linked) {
      return <View style={{ paddingRight: 20, paddingLeft: 20, marginBottom: 15 }}>
        <Line hide={true} />
        <TouchableOpacity style={{ paddingBottom: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', borderRadius: 12, paddingLeft: 20, paddingRight: 20 }}
                          onPress={ () => {
                            this.props.navigation.push('ConsultationStart', { is_rechat: true, provider_id })
                          }}>
          <View>
            <Text style={{ fontWeight: '500', fontSize: 15 }}>Start Another Chat</Text>
            <Text style={{ color: 'grey' }}>{ provider_name }</Text>
          </View>
          <Icon name='chevron-circle-right' size={20} />
        </TouchableOpacity>
        <Line hide={true}  />
      </View>
    }
  }

  render_provider_info = () => {
    let provider_name = this.state.provider && StringUtils.displayName(this.state.provider) ? StringUtils.displayName(this.state.provider) : 'TeleTails Provider';
    let profile_pic   = this.state.provider && this.state.provider.photo_url ? this.state.provider.photo_url : '';
    let provider_cert = 'Registered Vet Nurse';

    return <View>
      <View style={{ padding: 20, paddingTop: 10, flexDirection: 'row', alignItems: 'center' }}>
        { profile_pic ? <View style={{ marginRight: 10 }}>
                          <Image style={{ height: 40, width: 40, borderRadius: 20 }} source={{ uri: profile_pic }} />
                        </View>
                      : <View style={{ height: 50, width: 50, backgroundColor: '#e7e7e7', borderRadius: 25, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>
                          <Icon name='user' size={23} />
                        </View> }
        <View style={{  }}>
          <Text style={{ fontWeight: '500', fontSize: 15, color: '#575762' }}>{ provider_name }</Text>
          <Text style={{ color: 'grey' }}>{ provider_cert }</Text>
        </View>
      </View>
      { this.render_start_another_chat(provider_name) }
    </View>
  }

  render_message_list = () => {
    let messages = this.state.messages || [];
    let user_id  = this.state.user && this.state.user._id ? this.state.user._id : '';
    let welcome_messages = this.get_welcome_messages();

    return <View style={styles.message_list_container}>
      <MessageList messages={welcome_messages} user_id={user_id} display_bubble={this.state.display_type_bubble} />
    </View>
  }

  render_input_section = () => {

    if (this.state.is_resolved) {
      return <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <Icon name='check-circle' color={Colors.GREEN} />
        <Text style={{ marginLeft: 8, fontSize: 15, fontWeight: '500', color: '#575762' }}>Completed</Text>
      </View>
    }

    return <View style={styles.input_section_container}>
      <TextInput
        style={styles.message_text_input}
        value={this.state.message_text}
        maxHeight={120}
        autoCorrect={true}
        onChangeText={ (text) => {
          let user_id         = this.state.user && this.state.user._id ? this.state.user._id : '';
          let consultation_id = this.state.care_consultation && this.state.care_consultation._id ? this.state.care_consultation._id : '';

          if (user_id && consultation_id) {
            this.socket.emit('typing_bubble', {
              typer_id: user_id,
              consultation_id: consultation_id
            });
          }

          this.setState({ message_text: text });
        }}
        multiline={true}
      />
      { this.state.message_text  ? <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}
                                                     onPress={ async () => {

                                                       if (this.state.loading_send_message) {
                                                         return;
                                                       }

                                                       this.setState({ loading_send_message: true }, async () =>  {

                                                         let message_data = {
                                                            content: {
                                                              text: this.state.message_text,
                                                            },
                                                            consultation_id: this.state.care_consultation._id,
                                                            type: 'TEXT'
                                                          }
                                                         let send_msg_res = await ConsultationController.sendCareConsultationMessage(message_data);
                                                         let send_success = send_msg_res && send_msg_res.success ? true : false;

                                                         let messages_res = await this.get_consultation_messages(this.state.care_consultation._id)
                                                         let messages     = messages_res && messages_res.success && messages_res.data && messages_res.data.messages ? messages_res.data.messages : [];

                                                         this.setState({ loading_send_message: false, messages: messages.reverse(), message_text: send_success ? '' : this.state.message_text })
                                                       });
                                                     }}>
                                     { this.state.loading_send_message ? <LottieView autoPlay style={{ width: 15, height: 15 }} source={ require('../../assets/animations/white-spinner.json') } />
                                                                       : <Icon name='arrow-up' size={18} color='white' /> }
                                   </TouchableOpacity>
                                 : null }
      { !this.state.message_text ? <TouchableOpacity style={{ height: 40, width: 40, borderRadius: 20, backgroundColor: Colors.PRIMARY, alignItems: 'center', justifyContent: 'center', marginLeft: 12 }}
                                                     onPress={ async () => {
                                                       this.setState({ display_attachment_modal: true });
                                                     }}>
                                    <Icon size={20} color={'white'} name='paperclip' />
                                   </TouchableOpacity>
                                 : null }
    </View>
  }

  render_feedback_section = () => {
    return <Screen navigation={this.props.navigation} title='Consultation Details'>
      <ScrollView style={[ styles.main_scrollview_container, { padding: 20, paddingTop: 20 } ]}>
        <Button title='View Consultation Details' style={{ marginTop: 20 }} onPress={ () => { this.setState({ display_feedback: false }) }}/>
        <Line style={{ marginTop: 20, marginBottom: 20 }} />
        <ConsultationFeedbackForm
          consultation={ this.state.care_consultation }
          submit_action={ () => { this.setState({ display_feedback: false }) }}
        />
      </ScrollView>
    </Screen>
  }

  render() {

    if (this.state.display_feedback === true) {
      return this.render_feedback_section();
    }

    return (
      <Screen navigation={this.props.navigation} title='Chat Consultation' back_to_home={this.state.back_to_home} right_action={ () => { this.display_options_modal() }} right_icon='ellipsis-h' right_btn_color={Colors.PRIMARY}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={ Platform.OS === 'ios' ? 'padding' : 'height' }
          keyboardVerticalOffset={ Platform.OS === 'ios' || Platform.OS === 'android' ? 100 : 0 }
          >
          <SafeAreaView style={{ flex: 1 }}>
            { this.render_provider_info() }
            { this.render_message_list()  }
            { this.render_input_section() }
            { this.render_attachment_modal() }
            { this.render_options_modal()    }
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  display_options_modal = () => {
    this.setState({ display_options_modal: true })
  }

  render_options_modal = () => {
    return <Modal
      animationType="fade"
      transparent={true}
      visible={ this.state.display_options_modal }
      onRequestClose={() => {
        this.setState({ display_options_modal: false })
      }}>

      <TouchableWithoutFeedback onPress={ () => { this.setState({ display_options_modal: false }) }}>
        <View style={styles.outer_container}>
          <TouchableWithoutFeedback onPress={ () => {  }}>
            <View style={styles.content_container}>
              <TouchableOpacity style={styles.close_button_container} onPress={ () => { this.setState({ display_options_modal: false }) }}>
                <Icon name='close' />
              </TouchableOpacity>

              { this.state.is_resolved  ? <View style={{ paddingTop: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
                                            <Icon name='check-circle' solid={true} color={ Colors.GREEN } />
                                            <Text style={{ fontSize: 18, fontWeight: '500', marginLeft: 10 }}>Consultation Resolved</Text>
                                          </View>
                                        : <TouchableOpacity style={{ paddingTop: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center' }}
                                                          onPress={ async () => {
                                                            let care_consultation_id = this.state.consultation_id;

                                                            let request_data = {
                                                              care_consultation_id: care_consultation_id,
                                                            }

                                                            this.setState({ resolve_loading: true });
                                                            let resolve_response  = await ConsultationController.getClientResolveConsultation(request_data);
                                                            let care_consultation = Object.assign({}, this.state.care_consultation);
                                                            let is_resolved       = care_consultation && care_consultation.status === 'RESOLVED' ? true : false;
                                                            if (resolve_response.success === true) {
                                                              let care_consultation_response = await ConsultationController.getCareConsultationDetails(care_consultation_id);
                                                                  care_consultation          = care_consultation_response.care_consultation_details;
                                                                  is_resolved                = care_consultation && care_consultation.status === 'RESOLVED' ? true : false;
                                                            }
                                                            this.setState({ resolve_loading: false, care_consultation: care_consultation, is_resolved: is_resolved, display_options_modal: false });
                                                          }}>
                                          { this.state.resolve_loading ? <Icon name='home' /> : <Icon name='chevron-circle-left' /> }
                                          <Text style={{ fontSize: 18, fontWeight: '500', marginLeft: 10 }}>Resolve Consultation</Text>
                                        </TouchableOpacity> }

              <Line />

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

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

  send_image_attachment = (media_object) => {
    this.setState({ display_attachment_modal: false, loading_send_attachment: true }, async () => {

      let message_data = {
         content: {
           url: media_object.url,
         },
         consultation_id: this.state.care_consultation._id,
         type: 'IMAGE'
       }

      await ConsultationController.sendCareConsultationMessage(message_data);

      let messages_res = await this.get_consultation_messages(this.state.care_consultation._id)
      let messages     = messages_res && messages_res.success && messages_res.data && messages_res.data.messages ? messages_res.data.messages : [];

      this.setState({ loading_send_attachment: false, messages: messages.reverse() })

    });
  }

  send_video_attachment = (media_object) => {
    this.setState({ display_attachment_modal: false, loading_send_attachment: true }, async () => {

      let message_data = {
         content: {
           url: media_object.url,
         },
         consultation_id: this.state.care_consultation._id,
         type: 'VIDEO'
       }

      await ConsultationController.sendCareConsultationMessage(message_data);

      let messages_res = await this.get_consultation_messages(this.state.care_consultation._id)
      let messages     = messages_res && messages_res.success && messages_res.data && messages_res.data.messages ? messages_res.data.messages : [];

      this.setState({ loading_send_attachment: false, messages: messages.reverse() })

    });
  }

  get_consultation_messages = async (consultation_id) => {
    let messages = await ConsultationController.getConsultationChatMessages(consultation_id);
    return messages;
  }

  get_welcome_messages = () => {
    let care_consultation = this.state.care_consultation;
    let messages          = this.state.messages;
    let display_welcome   = care_consultation && messages && messages.length < 3 ? true : false;
    let profile_pic       = care_consultation && care_consultation.provider && care_consultation.provider.photo_url ? care_consultation.provider.photo_url : '';
    let provider_bio      = care_consultation && care_consultation.provider && care_consultation.provider.bio       ? care_consultation.provider.bio       : '';
    let full_messages     = [];

    if (display_welcome) {
      let async_welcome_1 = 'Hi! Thanks for reaching out to DodoVet. Our care team is busy helping other pet parents at the moment, but we’ll be with you as soon as possible.'
      let async_welcome_2 = 'You will get a notification when your provider joins the session shortly.'
      let online_welcome  = "Welcome! We’re looking forward to chatting with you. We will be with you momentarily. In the meantime, feel free to add a brief summary of your questions/concerns today or any additional information, photos or videos you feel is important.";
      let base_msg_fields = { consultation_id: care_consultation._id, from: 'system', type: "TEXT", created_at: care_consultation.created_at, updated_at: care_consultation.created_at }
      let is_async        = care_consultation && care_consultation.is_async && care_consultation.is_async === true ? true : false;

      let first_message   = { ...base_msg_fields, content: { text: is_async ? async_welcome_1 : online_welcome } };
      let second_message  = { ...base_msg_fields, content: { text: async_welcome_2 } };

      let first_message_arr = is_async ? [first_message, second_message] : [first_message];

      if (this.state.welcome_messages && this.state.welcome_messages.length > 0 && !is_async) {
        let custom_welcome_messages = this.state.welcome_messages.map((message_text) => { return { ...base_msg_fields, content: {text: message_text } } });
        first_message_arr = [ ...custom_welcome_messages ];
      }

      if (care_consultation && care_consultation.provider && care_consultation.provider.bio) {
        let pic_message_arr = [];

        if (profile_pic) {
          let pic_message = { ...base_msg_fields, content: {url: profile_pic }, type: "IMAGE" }
          pic_message_arr = [ pic_message ];
        }

        let bio_message     = { ...base_msg_fields, content: { text: provider_bio } }
        let bio_message_arr = [ bio_message ];

        if (is_async) {
          first_message_arr = [ ...pic_message_arr, ...first_message_arr, ...bio_message_arr ];
        } else {
          first_message_arr = [ ...pic_message_arr, ...first_message_arr, ...bio_message_arr ];
        }
      }

      first_message_arr.reverse();

      full_messages = [  ...messages, ...first_message_arr ];
    } else {
      full_messages = [ ...messages ];
    }

    return full_messages;
  }
}

const styles = StyleSheet.create({
  input_section_container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10
  },
  main_scrollview_container: {

  },
  message_text_input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    paddingTop: 14,
    flex: 1,
    borderWidth: 1,
    borderColor: '#e7e7e7',
    fontSize: 15
  },
  main_container: {

  },
  message_list_container: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#e7e7e7',
  },
  close_button_container: {
    alignItems: 'flex-end'
  },
  content_container: {
    backgroundColor: 'white',
    height: 380,
    width: '90%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#e7e7e7',
    borderRadius: 20,
    overflow: 'hidden',
    padding: 20
  },
  outer_container: {
    backgroundColor: 'rgba(0,0,0, 0.2)',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
});

export default ConsultationChatScreen
