import LottieView from 'lottie-react-native';
import { Component } from "react";
import { StyleSheet, View, Image, TouchableOpacity, Linking } from 'react-native';
import { Button, Text, Checkbox, Screen, Colors } from '../components';

class SignInWelcomeScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      agreed: false,
      display_agree_error: false
    }
  }

  componentDidMount = () => {
    this.dog_animation.play();
  }

  render() {

    let top_padding = Platform.OS === "android" ? StatusBar.currentHeight : 0;
    let check_color = this.state.display_agree_error ? Colors.RED : '#e7e7e7';

    return (
      <Screen hide_nav_bar={true} style={{ backgroundColor: Colors.PRIMARY, borderRadius: 20 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LottieView loop={true} ref={animation => { this.dog_animation = animation }} style={{ width: 250, height: 250 }} source={require('../../assets/animations/dog-pouncing.json')} />
        </View>
        <View style={{ height: 220, backgroundColor: 'white', borderRadius: 30, padding: 30, marginRight: 10, marginLeft: 10, alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 22 }}>Welcome to PetFit</Text>
          <View style={{ flexDirection: 'row', width: '100%', backgroundColor: 'white', marginBottom: 20, marginTop: 5 }}>
            <Checkbox style={{ marginRight: 5, marginLeft: 20, borderColor: check_color }} checked={this.state.agreed} onPress={ () => { this.setState({ agreed: !this.state.agreed }) }} />
            <Text style={{ flex: 1, color: 'grey', fontWeight: 'medium', fontSize: 16, paddingTop: 10 }}>I agree to PetFit <Text onPress={ () => { Linking.openURL('https://www.teletails.com/tospet') }} style={{ fontWeight: 'medium', color: Colors.PRIMARY }}>Terms & Conditions</Text> and <Text onPress={ () => { Linking.openURL('https://www.teletails.com/privacypolicy') }} style={{ fontWeight: 'medium', color: Colors.PRIMARY }}>Privacy Policy.</Text></Text>
          </View>
          <Button title={'CONTINUE'}
                  style={{ width: 330, marginBottom: 10, borderWidth: 2, borderColor: 'white' }}
                  onPress={ () => { this.continue_action() }}/>
        </View>
      </Screen>
    );
  }

  continue_action() {
    if (!this.state.agreed) {
      this.setState({ display_agree_error: true })
      return;
    }

    this.setState({ display_agree_error: false })
    this.props.navigation.navigate('Home')
  }
}

export default SignInWelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
