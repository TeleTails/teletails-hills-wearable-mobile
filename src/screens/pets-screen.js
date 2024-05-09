import { Component }   from "react";
import LottieView      from 'lottie-react-native';
import { StringUtils } from '../utils';
import { StyleSheet, View, TouchableOpacity, ImageBackground } from 'react-native';
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

     no_pets_message = true;

     return <View style={{ marginBottom: 10 }}>
      { no_pets_message ? <View style={{ height: 250, marginBottom: 15 }}>
                            <ImageBackground source={ require('../../assets/images/add-pet-cta.png') } resizeMode="contain" style={{ height: '100%' }} imageStyle={{  }}>
                              <Text style={{ marginTop: 80, marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>Add your pet for</Text>
                              <Text style={{ marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>personalized</Text>
                              <Text style={{ marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>care</Text>
                              <TouchableOpacity style={{ backgroundColor: '#F2F3F6', width: 102, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginLeft: 20, marginTop: 20 }} onPress={ () => { this.props.navigation.push('AddPetFlow') }}>
                                <Text style={{ fontSize: 14, fontWeight: 'medium' }}>Add</Text>
                              </TouchableOpacity>
                            </ImageBackground>
                          </View>
                        : pet_rows }
     </View>
  }

  render_add_pet_button = () => {
    return null;

    return <View style={{ marginTop: 5 }}>
      <TouchableOpacity onPress={ () => { this.props.navigation.push('PetDetailsEdit', { type: 'bio', add_new: true, success_action: () => { this.pull_pets() }}) }} style={{ flexDirection: 'row', alignItems: 'center' }}>
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
