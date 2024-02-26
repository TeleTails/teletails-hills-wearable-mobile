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

  pull_pets = async () => {
    let pets_res     = await PetsController.getPets();
    let pets         = pets_res && pets_res.data && pets_res.data.pets ? pets_res.data.pets : [];
    let selected_pet = pets && pets.length > 0 && pets[0] ? pets[0] : {};

    if (this.state.selected_pet && this.state.selected_pet._id) {
      selected_pet = this.state.selected_pet;
    }

    this.setState({ pets: pets, selected_pet: selected_pet })
  }

  componentDidMount = async () => {
    this.pull_pets();
  }

  render_pet_selection_list = () => {
    let pets            = this.state.pets;
    let selected_pet_id = this.state.selected_pet && this.state.selected_pet._id ? this.state.selected_pet._id : '';

    if (!this.state.display_pet_selection) {
      return null;
    }

    let pet_rows = pets.map((pet, idx) => {
      let pet_id      = pet._id;
      let is_selected = selected_pet_id === pet_id;
      let pet_name    = StringUtils.displayName(pet);
      return <View key={pet_id}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 }}
                                 onPress={ () => { this.setState({ display_pet_selection: false, selected_pet: pet }) }}>
          <Text style={{ fontSize: 15 }}>{ pet_name }</Text>
          { is_selected ? <Icon name='check-circle' size={22} color={Colors.PRIMARY} />
                        : <View style={{ borderWidth: 2, borderColor: '#e7e7e7', height: 24, width: 24, borderRadius: 13 }} /> }
        </TouchableOpacity>
        <Line hide={ idx === pets.length - 1 } />
      </View>
    })

    return <View style={{ backgroundColor: 'white', borderRadius: 15, marginBottom: 20 }}>
      { pet_rows }
    </View>
  }

  render_add_button_padding = () => {
    if (this.state.display_pet_selection) {
      return null;
    }

    return <View style={{ height: 30 }} />
  }

  render_add_button_components = () => {
    if (this.state.display_pet_selection) {
      return null;
    }

    return <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', borderRadius: 30, borderColor: 'grey', height: 55, width: 140, position: 'absolute', alignSelf: 'center', marginTop: 40 }}
                             onPress={ () => { this.props.navigation.push('PetDetailsEdit', { type: 'bio', add_new: true, success_action: () => { this.pull_pets() }}) }}>
      <Icon name='plus-circle' size={22} color={Colors.PRIMARY} />
      <Text style={{ fontWeight: 'semibold', marginLeft: 8 }}>Add a pet</Text>
    </TouchableOpacity>
  }
  render_pet_section = () => {
    let pet        = this.state.selected_pet;
    let pets       = this.state.pets;
    let pet_name   = StringUtils.displayName(pet);
    let single_pet = pets && pets.length === 1;
    let switch_ttl = this.state.display_pet_selection ? 'Done' : 'Switch Pet';

    return <View>
    <View>
      <View style={{ backgroundColor: Colors.PRIMARY, padding: 20, paddingBottom: 0, borderTopRightRadius: 15, borderTopLeftRadius: 15 }}>
        <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 20, alignItems: 'center' }}
                          onPress={ () => { this.setState({ display_pet_selection: !this.state.display_pet_selection }) }}>
          <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'white' }}>{ pet_name }</Text>
          <Text style={{ fontSize: 16, color: 'white' }}>{ single_pet ? '' : switch_ttl }</Text>
        </TouchableOpacity>
        { this.render_pet_selection_list()    }
      </View>
      { this.render_add_button_padding() }
    </View>
    { this.render_add_button_components() }
    </View>
  }

  render_entry_buttons = () => {
    let selected_pet_id = this.state.selected_pet && this.state.selected_pet._id ? this.state.selected_pet._id : '';

    if (!selected_pet_id) {
      return null;
    }

    return <View style={{ padding: 20 }}>
      <TouchableOpacity style={styles.entry_button_container}
                        onPress={ () => { this.props.navigation.push('HealthWeight', { pet_id: selected_pet_id }) }}>
        <Text style={styles.entry_button_title}>Weight</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 15 }}>
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: 20, backgroundColor: Colors.PRIMARY }}><Text style={{ fontSize: 9, fontWeight: 'bold', color: 'white' }}>FEB</Text><Text style={{ fontSize: 9, fontWeight: 'bold', color: 'white' }}>07</Text></View>
          <View style={{ height: 2, borderRadius: 4, flex: 1, backgroundColor: Colors.PRIMARY, marginRight: 5, marginLeft: 5 }} />
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: 20, backgroundColor: Colors.PRIMARY }}><Text style={{ fontSize: 9, fontWeight: 'bold', color: 'white' }}>FEB</Text><Text style={{ fontSize: 9, fontWeight: 'bold', color: 'white' }}>08</Text></View>
          <View style={{ height: 2, borderRadius: 4, flex: 1, backgroundColor: Colors.PRIMARY, marginRight: 5, marginLeft: 5 }} />
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: 20, backgroundColor: Colors.PRIMARY }}><Text style={{ fontSize: 9, fontWeight: 'bold', color: 'white' }}>FEB</Text><Text style={{ fontSize: 9, fontWeight: 'bold', color: 'white' }}>09</Text></View>
          <View style={{ height: 2, borderRadius: 4, flex: 1, backgroundColor: Colors.PRIMARY, marginRight: 5, marginLeft: 5 }} />
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: 20, backgroundColor: Colors.PRIMARY }}><Text style={{ fontSize: 9, fontWeight: 'bold', color: 'white' }}>FEB</Text><Text style={{ fontSize: 9, fontWeight: 'bold', color: 'white' }}>10</Text></View>
          <View style={{ height: 2, borderRadius: 4, flex: 1, backgroundColor: Colors.PRIMARY, marginRight: 5, marginLeft: 5 }} />
          <View style={{ justifyContent: 'center', alignItems: 'center', height: 40, width: 40, borderRadius: 20, backgroundColor: Colors.PRIMARY }}><Icon name='plus-circle' color='white' /></View>
        </View>
        <View style={styles.entry_button_cta_container}>
          <Text style={styles.entry_button_cta_title}>Add Weight</Text>
          <Icon name='chevron-circle-right' size={18} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.entry_button_container}
                        onPress={ () => { this.props.navigation.push('HealthGiPics', { pet_id: selected_pet_id }) }}>
        <Text style={styles.entry_button_title}>GI Images</Text>
        <View style={{ height: 50 }}></View>
        <View style={styles.entry_button_cta_container}>
          <Text style={styles.entry_button_cta_title}>Add Images</Text>
          <Icon name='chevron-circle-right' size={18} />
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.entry_button_container}
                        onPress={ () => { this.props.navigation.push('HealthBodyCondition', { pet_id: selected_pet_id }) }}>
        <Text style={styles.entry_button_title}>Body Condition Images</Text>
        <View style={{ height: 50 }}></View>
        <View style={styles.entry_button_cta_container}>
          <Text style={styles.entry_button_cta_title}>Add Images</Text>
          <Icon name='chevron-circle-right' size={18} />
        </View>
      </TouchableOpacity>
    </View>
  }

  render() {

    return <View style={{  }}>
      <View>
        { this.render_pet_section()        }
        { this.render_entry_buttons()      }
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

export default HealthTab
