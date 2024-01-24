import { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { PetsController }   from '../controllers';
import { StringUtils    }   from '../utils';
import { setItem, getItem } from '../../storage';
import { Text, Line, Icon, Colors } from '../components';
import { SignIn } from '../containers';

class HealthTab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pets: [],
      selected_pet: {},
      display_pet_selection: false
    }
  }

  componentDidMount = async () => {
    let pets_res     = await PetsController.getPets();
    let pets         = pets_res && pets_res.data && pets_res.data.pets ? pets_res.data.pets : [];
    let selected_pet = pets && pets.length > 0 && pets[0] ? pets[0] : {};

    this.setState({ pets: pets, selected_pet: selected_pet })
  }

  render_pet_selection_list = () => {
    let pets            = this.state.pets;
    let selected_pet_id = this.state.selected_pet && this.state.selected_pet._id ? this.state.selected_pet._id : '';

    if (!this.state.display_pet_selection) {
      return null;
    }

    let pet_rows = pets.map((pet) => {
      let pet_id      = pet._id;
      let is_selected = selected_pet_id === pet_id;
      let pet_name    = StringUtils.displayName(pet);
      return <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 10 }}
                               onPress={ () => { this.setState({ display_pet_selection: false, selected_pet: pet }) }}>
        <Text style={{ fontSize: 18 }}>{ pet_name }</Text>
        { is_selected ? <Icon name='check-circle' size={22} color={Colors.GREEN} />
                      : <View style={{ borderWidth: 2, borderColor: '#e7e7e7', height: 24, width: 24, borderRadius: 13 }} /> }
      </TouchableOpacity>
    })

    return <View style={{ paddingBottom: 10 }}>
      { pet_rows }
    </View>
  }

  render_pet_section = () => {
    let pet        = this.state.selected_pet;
    let pets       = this.state.pets;
    let pet_name   = StringUtils.displayName(pet);
    let single_pet = pets && pets.length === 1;

    return <View>
      <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 20, alignItems: 'center' }}
                        onPress={ () => { this.setState({ display_pet_selection: !this.state.display_pet_selection }) }}>
        <Text style={{ fontWeight: 'bold', fontSize: 26 }}>{ pet_name }</Text>
        <Text style={{ fontSize: 16, color: 'blue' }}>{ single_pet ? '' : 'Switch Pet' }</Text>
      </TouchableOpacity>
      { this.render_pet_selection_list() }
      <Line style={{ marginBottom: 20 }} />
    </View>
  }

  render_entry_buttons = () => {
    let selected_pet_id = this.state.selected_pet && this.state.selected_pet._id ? this.state.selected_pet._id : '';

    if (!selected_pet_id) {
      return null;
    }

    return <View>
      <TouchableOpacity style={styles.entry_button_container}
                        onPress={ () => { this.props.navigation.push('HealthWeight', { pet_id: selected_pet_id }) }}>
        <Text style={styles.entry_button_title}>Weight</Text>
        <View style={styles.entry_button_cta_container}>
          <Text style={styles.entry_button_cta_title}>Add Weight</Text>
          <Icon name='chevron-circle-right' size={18} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.entry_button_container}
                        onPress={ () => { this.props.navigation.push('HealthGiPics', { pet_id: selected_pet_id }) }}>
        <Text style={styles.entry_button_title}>GI Images</Text>
        <View style={styles.entry_button_cta_container}>
          <Text style={styles.entry_button_cta_title}>Add Images</Text>
          <Icon name='chevron-circle-right' size={18} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.entry_button_container}
                        onPress={ () => { this.props.navigation.push('HealthBodyCondition', { pet_id: selected_pet_id }) }}>
        <Text style={styles.entry_button_title}>Body Condition Images</Text>
        <View style={styles.entry_button_cta_container}>
          <Text style={styles.entry_button_cta_title}>Add Images</Text>
          <Icon name='chevron-circle-right' size={18} />
        </View>
      </TouchableOpacity>
    </View>
  }

  render() {

    return <View style={{  }}>
      <View style={{ padding: 20 }}>
        { this.render_pet_section()   }
        { this.render_entry_buttons() }
      </View>
    </View>
  }

}

const styles = StyleSheet.create({
  entry_button_container: {
    backgroundColor: '#e7e7e7',
    height: 120,
    borderRadius: 25,
    marginBottom: 15,
    padding: 25,
    paddingTop: 15,
    paddingBottom: 15,
    paddingRight: 15,
    justifyContent: 'space-between'
  },
  entry_button_title: {
    fontWeight: 'bold',
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

export default HealthTab
