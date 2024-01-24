import { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { PetsController }   from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text }   from '../components';
import { SignIn } from '../containers';
// import { LineChart } from "react-native-chart-kit";

class HealthTab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      is_signed_in: false
    }
  }

  componentDidMount = async () => {
    let pets_res = await PetsController.getPets();
    let token    = await getItem('token');

    this.setState({ is_signed_in: token ? true : false })
  }

  render() {

    return <View style={{  }}>
      <Text style={{ height: 30 }}>Health Tab</Text>
      <View style={{ padding: 20 }}>
        <TouchableOpacity style={{ borderWidth: 1, padding: 15, borderColor: '#e7e7e7', borderRadius: 12, marginBottom: 5 }}
                          onPress={ () => { this.props.navigation.push('HealthWeight', { pet_id: '63d052fc3db4010240557c42' }) }}>
          <Text>Add Weight</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ borderWidth: 1, padding: 15, borderColor: '#e7e7e7', borderRadius: 12, marginBottom: 5 }}
                          onPress={ () => { this.props.navigation.push('HealthGiPics', { pet_id: '63d052fc3db4010240557c42' }) }}>
          <Text>Add GI Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ borderWidth: 1, padding: 15, borderColor: '#e7e7e7', borderRadius: 12 }}
                          onPress={ () => { this.props.navigation.push('HealthBodyCondition', { pet_id: '63d052fc3db4010240557c42' }) }}>
          <Text>Add Body Condition Images</Text>
        </TouchableOpacity>
      </View>
      <Text>{ this.state.is_signed_in ? 'Signed In' : 'Not Signed In' }</Text>
      <SignIn />
    </View>
  }

}

const styles = StyleSheet.create({

});

export default HealthTab
