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
                          onPress={ () => { this.props.navigation.push('HealthWeight') }}>
          <Text>Add Weight</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ borderWidth: 1, padding: 15, borderColor: '#e7e7e7', borderRadius: 12, marginBottom: 5 }}
                          onPress={ () => { this.props.navigation.push('HealthGiPics') }}>
          <Text>Add GI Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ borderWidth: 1, padding: 15, borderColor: '#e7e7e7', borderRadius: 12 }}
                          onPress={ () => { this.props.navigation.push('HealthBodyCondition') }}>
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

/*
<View style={{ padding: 20 }}>
  <Text>Bezier Line Chart</Text>
  <LineChart
    data={{
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          data: [ 65, 72, 75, 70, 65, 67 ]
        }
      ]
    }}
    width={ Dimensions.get("window").width - 40 } // from react-native
    height={220}
    yAxisSuffix="lbs"
    yAxisInterval={1} // optional, defaults to 1
    chartConfig={{
      backgroundColor: "#e26a00",
      backgroundGradientFrom: "#fb8c00",
      backgroundGradientTo: "#ffa726",
      decimalPlaces: 0, // optional, defaults to 2dp
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: "4",
        strokeWidth: "1",
        stroke: "#ffa726"
      }
    }}
    bezier
    style={{
      marginVertical: 8,
      borderRadius: 16
    }}
  />
</View>
*/

export default HealthTab
