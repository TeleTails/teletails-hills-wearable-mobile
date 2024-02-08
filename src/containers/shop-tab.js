import { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ImageBackground, Linking } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Text } from '../components';

class ShopTab extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount = async () => {
    let token = await getItem('token');

    this.setState({ is_signed_in: token ? true : false })
  }

  render() {

    let window        =  Dimensions.get('window');
    let window_height = window && window.height ? window.height - 140 : 800;

    return <View style={{ height: '100%', justifyContent: 'center' }}>
      <View style={{ height: 250, paddingRight: 20, paddingLeft: 20, marginBottom: 15 }}>
        <ImageBackground source={ require('../../assets/images/shop-cta.png') } resizeMode="contain" style={{ height: '100%' }} imageStyle={{  }}>
          <Text style={{ marginTop: 80, marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>Shop for all of</Text>
          <Text style={{ marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>your pet food</Text>
          <Text style={{ marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>needs</Text>
          <TouchableOpacity style={{ backgroundColor: '#F2F3F6', width: 102, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginLeft: 20, marginTop: 20 }}
                            onPress={ () => { Linking.openURL('https://shop.hillspet.com/') }}>
            <Text style={{ fontSize: 14, fontWeight: 'medium' }}>Shop</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </View>
  }

}

const styles = StyleSheet.create({

});

export default ShopTab
