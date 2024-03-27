import { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { PetsController }   from '../controllers';
import { StringUtils    }   from '../utils';
import { setItem, getItem } from '../../storage';
import { Text, Line, Icon, Colors } from '../components';
import { SignIn } from '../containers';

class WearableConnect extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pets: [],
      selected_pet: {},
      display_pet_selection: false
    }
  }

  componentDidMount = async () => {
 
  }

  render() {

    return <View style={{  }}>
      <View>
        {/* { this.render_coming_soon()         } */}
      </View>
    </View>
  }

}

const styles = StyleSheet.create({
  entry_button_container: {
    backgroundColor: '#e7e7e7',
    borderRadius: 25,
    marginBottom: 15,
    padding: 25,
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 15,
    justifyContent: 'space-between'
  },
  entry_button_title: {
    fontWeight: 'medium',
    fontSize: 16
  },
  entry_button_cta_container: {
    alignSelf: 'flex-end',
    backgroundColor: 'white',
    width: 160,
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    paddingRight: 15,
    paddingLeft: 20
  },
  entry_button_cta_title: {
    fontWeight: 'medium'
  }
});

export default WearableConnect
