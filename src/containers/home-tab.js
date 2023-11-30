import { Component } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { config }           from '../../config';
import { Text, Button }     from '../components';
import { AuthController }   from '../controllers';
import { setItem, getItem } from '../../storage';

class HomeTab extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  render() {
    return <View><Text>Home Tab</Text></View>
    // return <View style={{  }}>
    //   <Text>Home Tab</Text>
    //   <Button title='Send Sign In Email' onPress={ async () => {
    //     await AuthController.singleEmailSignUpSignIn({ email: '', host_name: config.SELECTED_PARTNER, short_code: true });
    //   }} />
    //   <Button title='Send Verification Code' onPress={ async () => {
    //     await AuthController.singleEmailSignUpSignInCodeVerify({ email: '', host_name: config.SELECTED_PARTNER, code: '' });
    //   }} />
    //   <Button title='Pull User Data' onPress={ async () => {
    //     let user = await AuthController.getUser();
    //   }} />
    // </View>
  }

}

const styles = StyleSheet.create({

});

export default HomeTab
