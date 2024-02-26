import { Component } from 'react';
import LottieView    from 'lottie-react-native';
import { DateUtils, StringUtils } from '../utils';
import { StyleSheet, View, TouchableOpacity, Platform, FlatList, Image, Modal } from 'react-native';
import { Icon, Text, Screen, Colors } from '../components';
import { Video } from 'expo-av';
import { WebView } from 'react-native-webview';

class MessageList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      display_pdf: false,
      animation_started: false,
    }
  }

  componentDidUpdate() {
    if (!this.state.animation_started && this.props.display_bubble && this.typing_animation) {
      this.typing_animation.play();
      this.setState({ animation_started: true })
    }
    if (this.state.animation_started && !this.props.display_bubble && this.typing_animation) {
      this.setState({ animation_started: false })
    }
  }

  render_text_message = (message) => {
    let message_obj     = this.get_cleaned_msg_obj(message);
    let container_style = message_obj.position === 'left' ? styles.message_content_container_left : [styles.message_content_container_right, { backgroundColor: Colors.PRIMARY }];
    let text_style      = message_obj.position === 'left' ? styles.text_message_left : styles.text_message_right;
    let text_color      = message_obj.position === 'left' ? '#575762' : 'white';

    return <View style={styles.message_row_container}>
      <View style={{ flex: message_obj.position === 'left'  ? 0 : 1 }}>
        { message_obj.position === 'left' ?  null : <Text style={{ ...styles.date_text_style, fontSize: 12, marginLeft: 5, color: '#a6a6a6' }}>{ message_obj.date }</Text> }
      </View>
      <View style={container_style}>
        <Text style={{ ...text_style, color: text_color }}>{ message_obj.text }</Text>
      </View>
      <View style={{ flex: message_obj.position === 'right' ? 0 : 1, alignItems: 'flex-end' }}>
        { message_obj.position === 'right' ? null : <Text style={{ ...styles.date_text_style, fontSize: 12, marginLeft: 5, color: '#a6a6a6' }}>{ message_obj.date }</Text> }
      </View>
    </View>
  }

  render_image_message = (message) => {
    let message_obj = this.get_cleaned_msg_obj(message);

    let uri;

    if(message_obj && message_obj.url) {
      uri = message_obj.url;
    }

    return uri ? <View style={styles.message_row_container}>
      <View style={{ flex: message_obj.position === 'left'  ? 0 : 1 }}>
        { message_obj.position === 'left' ?  null : <Text style={styles.date_text_style}>{ message_obj.date }</Text> }
      </View>
      <View style={styles.image_message_content_container}>
        <Image style={styles.image_message} source={{ uri }} />
      </View>
      <View style={{ flex: message_obj.position === 'right' ? 0 : 1, alignItems: 'flex-end' }}>
        { message_obj.position === 'right' ? null : <Text style={styles.date_text_style}>{ message_obj.date }</Text> }
      </View>
    </View> : null
  }

  render_video_message = (message) => {
    let message_obj = this.get_cleaned_msg_obj(message);

    return <View style={styles.message_row_container}>
      <View style={{ flex: message_obj.position === 'left'  ? 0 : 1 }}>
        { message_obj.position === 'left' ?  null : <Text style={styles.date_text_style}>{ message_obj.date }</Text> }
      </View>
      <View style={styles.video_message_content_container}>
        <Video style={styles.video_message}
               source={{ uri: message_obj.url }}
               useNativeControls
               resizeMode="contain"
               isLooping />
      </View>
      <View style={{ flex: message_obj.position === 'right' ? 0 : 1, alignItems: 'flex-end' }}>
        { message_obj.position === 'right' ? null : <Text style={styles.date_text_style}>{ message_obj.date }</Text> }
      </View>
    </View>
  }

  render_pdf_message = (message) => {
    let message_obj = this.get_cleaned_msg_obj(message);

    return <View style={styles.message_row_container}>
      <View style={{ flex: message_obj.position === 'left'  ? 0 : 1 }} />
      <TouchableOpacity style={styles.pdf_message_content_container}
                        onPress={ () => {
                          this.setState({ display_pdf: true, pdf_url: message_obj.url })
                        }}>
        <Icon name='file-pdf' solid={true} size={50} color={'#ff6262'} />
        <Text style={{ fontWeight: '500', marginTop: 5 }}>PDF</Text>
      </TouchableOpacity>
      <View style={{ flex: message_obj.position === 'right' ? 0 : 1 }} />
      { this.render_pdf_modal() }
    </View>
  }

  render_bubble_message = (message) => {
    let is_mobile = Platform.OS == 'android' || Platform.OS === 'ios';
    return <View style={styles.message_row_container}>
      <View style={{ flex: 0 }} />
        <View style={{ borderWidth: 1, borderColor: '#e7e7e7', borderRadius: 12, paddingRight: 8, paddingLeft: 8 }}>
          { is_mobile ? <LottieView ref={animation => { this.typing_animation = animation }} style={{ height: 35 }} source={require('../../assets/animations/typing.json')} />
                      : <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12, paddingBottom: 12 }}>
                          <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: '#e7e7e7' }} />
                          <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: '#e7e7e7', marginRight: 3, marginLeft: 3 }} />
                          <View style={{ height: 6, width: 6, borderRadius: 3, backgroundColor: '#e7e7e7' }} />
                        </View> }
        </View>
      <View style={{ flex: 1 }} />
    </View>
  }

  get_message_row_item = (message) => {
    let message_type = message.type;
    let message_row  = null;
        message_row  = message_type === 'TEXT'   ? this.render_text_message(message)   : message_row;
        message_row  = message_type === 'IMAGE'  ? this.render_image_message(message)  : message_row;
        message_row  = message_type === 'VIDEO'  ? this.render_video_message(message)  : message_row;
        message_row  = message_type === 'PDF'    ? this.render_pdf_message(message)    : message_row;
        message_row  = message_type === 'BUBBLE' ? this.render_bubble_message(message) : message_row;
    return message_row;
  }

  render() {
    let message = this.props.messages || [];
    let bubble  = this.props.display_bubble;

    if (bubble && message.length && message[0] && message[0].type !== 'BUBBLE') {
      message = [ { type: 'BUBBLE' }, ...message ];
    }

    return <FlatList
             data={message}
             style={styles.message_scroll_list}
             keyExtractor={ (message) => { message._id }}
             inverted={true}
             renderItem ={ ({ item }) => {
               return this.get_message_row_item(item);
             }}
           />
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

  get_cleaned_msg_obj = (message) => {
    let cleaned_obj  = {};
    let user_id      = this.props.user_id;
    let message_type = message && message.type ? message.type : '';
    let display_date = message && message.created_at ? DateUtils.getTime(message.created_at) : '';
    let sender_name  = message && message.sender  && StringUtils.displayName(message.sender) ? StringUtils.displayName(message.sender) : '';
    let sender_id    = message && message.sender  && message.sender._id   ? message.sender._id   : '';
        sender_id    = !sender_id ? message.from  : sender_id;
    let text_message = message && message.content && message.content.text ? message.content.text : '';
    let image_url    = message && message.content && message.content.url  ? message.content.url  : '';
    let video_url    = message && message.content && message.content.url  ? message.content.url  : '';
    let pdf_url      = message && message.content && message.content.url  ? message.content.url  : '';
    let is_sender    = sender_id    === user_id ? true : false;
    let message_url  = message_type === 'IMAGE' ? image_url : '';
        message_url  = message_type === 'VIDEO' ? video_url : message_url;
        message_url  = message_type === 'PDF'   ? pdf_url   : message_url;
    let position     = is_sender ? 'right' : 'left';

    cleaned_obj = {
      _id: message && message._id ? message._id : display_date,
      url: message_url,
      sender_name: sender_name,
      text: text_message,
      date: display_date,
      position: position
    }

    return cleaned_obj;
  }

}

const styles = StyleSheet.create({
  date_text_style: {
    marginLeft: 5,
    marginTop: 8,
    color: '#a6a6a6',
    fontSize: 12
  },
  message_scroll_list: {
     backgroundColor: 'white'
  },
  image_message_content_container: {
    width: 250,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7e7e7',
  },
  image_message: {
    height: 300,
    width: '100%',
    borderRadius: 10
  },
  main_container: {
    backgroundColor: 'pink',
  },
  message_row_container: {
    marginBottom: 6,
    flexDirection: 'row',
    paddingRight: 8,
    paddingLeft: 8
  },
  text_message_left: {
    color: '#575762',
    fontSize: 16,
  },
  text_message_right: {
    color: 'white',
    fontSize: 16,
  },
  message_content_container_left: {
    maxWidth: '80%',
    backgroundColor: '#F7F8FA',
    padding: 15,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 10,
  },
  message_content_container_right: {
    maxWidth: '80%',
    backgroundColor: '#21B1FB',
    padding: 15,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 10,
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
  },
  pdf_view_container: {
    flex: 1
  },
  video_message_content_container: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7e7e7'
  },
  video_message: {
    height: 200,
    width: '100%',
    borderRadius: 10
  }
});

export default MessageList
