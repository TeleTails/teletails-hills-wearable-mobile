import { Component } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { setItem, getItem } from '../../storage';
import { Text   } from '../components';
import { SignIn } from '../containers';

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

    return <View style={{  }}>
      <Text style={{ height: 100 }}>Shop Tab</Text>
      <Text>{ this.state.is_signed_in ? 'Signed In' : 'Not Signed In' }</Text>
      <SignIn />
    </View>
  }

}

const styles = StyleSheet.create({

});

export default ShopTab
