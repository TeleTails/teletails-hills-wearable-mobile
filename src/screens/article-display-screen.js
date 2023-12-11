import { Component } from 'react';
import LottieView    from 'lottie-react-native';
import { StyleSheet, View, TextInput, ActivityIndicator, TouchableOpacity, ScrollView, Platform, Modal } from 'react-native';
import { Screen, Button, Input, Text, Line, Icon } from '../components';
import { ArrayUtils, StringUtils, ArticleUtils } from '../utils';
import { ConsultationController } from '../controllers';
import { WebView } from 'react-native-webview';

class ArticleDisplayScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      article_url: ''
    }
  }

  componentDidMount = async () => {
    let article_url = this.props && this.props.route && this.props.route.params && this.props.route.params.url ? this.props.route.params.url : '';
    this.setState({ article_url: article_url })
  }

  render() {
    return (
      <Screen navigation={this.props.navigation} title={"Article"} style={{  }}>
          <WebView
            mediaPlaybackRequiresUserAction={true}
            style={{ backgroundColor: 'white', height: 200 }}
            source={{ uri: this.state.article_url }} />
      </Screen>
    );
  }

}

const styles = StyleSheet.create({

});

export default ArticleDisplayScreen
