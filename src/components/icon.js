import { Component } from "react";
import { StyleSheet, Text, View } from 'react-native';

class Icon extends Component {
  
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text onPress={ () => {  }}>ICON!</Text>
      </View>
    );
  }

}

export default Icon;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
