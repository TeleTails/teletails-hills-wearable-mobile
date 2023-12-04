import { Component } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { PetsController }   from '../controllers';
import { setItem, getItem } from '../../storage';
import { Text } from '../components';

class HealthTab extends Component {

  constructor(props) {
    super(props);
    this.state = {

    }
  }

  componentDidMount = async () => {
    let pets_res = await PetsController.getPets();
  }

  render() {

    return <View style={{  }}>
      <Text style={{ height: 100 }}>Health Tab</Text>
    </View>
  }

}

const styles = StyleSheet.create({

});

export default HealthTab
