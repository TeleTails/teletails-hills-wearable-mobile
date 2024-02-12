import { Component }   from "react";
import LottieView      from 'lottie-react-native';
import { StringUtils } from '../utils';
import { StyleSheet, View, TouchableOpacity }       from 'react-native';
import { Screen, Line, Text, Icon, Button, Colors } from '../components';
import { setItem, getItem } from '../../storage';
import { PetsController }   from '../controllers';

class PetsScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pets: []
    }
  }

  componentDidMount = async () => {
    if (this.cat_animation) {
     this.cat_animation.play();
    }

    this.pull_pets();

    this.props.navigation.addListener('focus', async () => {
      this.pull_pets();
    });
  }

  open_pet_details = (pet_id) => {
    this.props.navigation.push('PetDetails', { pet_id: pet_id })
  }

  render_pets_list = () => {
     let pets     = this.state.pets || [];

     let pet_rows = pets.map((pet, index) => {
       let is_last = index === pets.length - 1;
           is_last = false;
       let pet_id  = pet._id;
       let name    = StringUtils.displayName(pet);
       let gender  = StringUtils.sentenceCase(pet.gender.toLowerCase());
       let type    = StringUtils.sentenceCase(pet.type.toLowerCase());
       let descrpt = gender + ' ' + type;
       let age     = '';

       if (pet.age) {
         age = ', Age ' + pet.age;
       }

       if (pet.birthday) {
         age = ', Age ' + StringUtils.displayBirthdayAge(pet.birthday)
       }

       return <View key={pet_id}>
         <TouchableOpacity style={{ marginTop: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                           onPress={ () => { this.open_pet_details(pet_id) }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: 'medium', color: '#040415' }}>{ name }</Text>
            <Text style={{ fontSize: 14, color: '#575762', marginTop: 3 }}>{ descrpt + age }</Text>
          </View>
          <Icon name='chevron-right' solid={true} size={13} color={'#cccccc'} />
         </TouchableOpacity>
         <Line hide={is_last} />
       </View>
     })

     let no_pets_message = pet_rows && pet_rows.length === 0 ? true : false;
     let is_mobile       = Platform.OS === 'ios' || Platform.OS === 'android' ? true : false;

     return <View style={{ marginBottom: 10 }}>
      { no_pets_message ? <View style={{ alignItems: 'center' }}>
                            <LottieView ref={animation => { this.cat_animation = animation }} style={{ width: 140, height: 140 }} source={require('../../assets/animations/cat-tail-wag.json')} />
                            <Text style={{ fontSize: 18, fontWeight: '500', textAlign: 'center', color: '#040415', paddingTop: 2 }}>{ 'No pets added' }</Text>
                            <Text style={{ fontSize: 16, textAlign: 'center', color: '#575762', paddingBottom: 20 }}>{ "Let's add your first pet" }</Text>
                          </View>
                        : pet_rows }
     </View>
  }

  render_add_pet_button = () => {
    return <View style={{ marginTop: 5 }}>
      <TouchableOpacity onPress={ () => { this.props.navigation.push('AddPet') }} style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name='plus-circle' color={ Colors.PRIMARY } />
        <View style={{ marginLeft: 15 }}>
          <Text style={{ fontSize: 15, fontWeight: 'medium', color: '#535353' }}>{ 'Add A New Pet' }</Text>
          <Text style={{ fontSize: 14, color: '#575762', marginTop: 3 }}>{ 'Add another pet to your account' }</Text>
        </View>
      </TouchableOpacity>
    </View>
  }

  render_back_to_home = () => {
    return <View>
      <Line style={{ marginTop: 15, marginBottom: 15 }} />
      <Button title={ 'Back To Home' }
              onPress={ async () => {
                this.props.navigation.navigate('Home');
              }}/>
    </View>
  }

  render() {
    return <Screen title='Pets' scroll={true} navigation={this.props.navigation}>
      <View style={{ padding: 20 }}>
        { this.render_pets_list() }
        { this.render_add_pet_button() }
      </View>
    </Screen>
  }

  pull_pets = async () => {
    let pets_response = await PetsController.getPets();
    let is_success    = pets_response && pets_response.success;
    let pets          = is_success && pets_response.data && pets_response.data.pets ? pets_response.data.pets : [];

    this.setState({ pets: pets });
  }

}

export default PetsScreen;

const styles = StyleSheet.create({
  settings_row_container: {
    flex: 1,
    padding: 20
  }
});
