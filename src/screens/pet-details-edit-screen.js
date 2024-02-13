import { Component }   from "react";
import LottieView      from 'lottie-react-native';
import { StringUtils } from '../utils';
import { Picker }      from '@react-native-picker/picker';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Screen, Line, Text, Icon, Button, Input, Checkbox, Colors } from '../components';
import { setItem, getItem } from '../../storage';
import { PetsController }   from '../controllers';

class PetDetailsEditScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      display_section: 'pet_inputs', // 'pet_type', 'pet_inputs'
      pet_name: '',
      pet_type: 'Dog',
      pet_birthday: '',
      pet_breed: '',
      pet_other_breed: '',
      pet_gender: '',
      pet_weight: '',
      pet_is_spayed: false,
      pet_is_neutered: false,
      started_animation: false,
      timer_interval: null,
      error_message: ''
    }
  }

  componentDidMount = async () => {
    var t = setInterval(this._onEverySecondProvider, 200);
    this.setState({ timer_interval: t });
  }

  componentWillUnmount() {
    clearInterval(this.state.timer_interval);
  }

  _onEverySecondProvider = () => {

  if (!this.state.started_animation && this.dog_animation && this.cat_animation && this.cow_animation) {
      this.dog_animation.play();
      this.cat_animation.play();
      this.cow_animation.play();
      this.setState({ started_animation: true });
    }
  }

  savePet = async () => {
    let patient_weight = this.state.pet_weight && parseInt(this.state.pet_weight) ? parseInt(this.state.pet_weight) : 0;

    let patient_info = {
      name: this.state.pet_name,
      breed: this.state.pet_breed,
      type: this.state.pet_type,
      birthday: this.state.pet_birthday,
      gender: this.state.pet_gender,
      spayed: this.state.pet_is_spayed,
      neutered: this.state.pet_is_neutered,
      weight: patient_weight
    }

    if (patient_info.breed) {
      patient_info.breed = patient_info.breed === 'other' && this.state.pet_other_breed  ? this.state.pet_other_breed : patient_info.breed;
      patient_info.breed = patient_info.breed === 'other' && !this.state.pet_other_breed ? 'Other' : patient_info.breed;
      patient_info.breed = patient_info.breed !== 'other' ? StringUtils.keyToDisplayString(patient_info.breed) : patient_info.breed;
    }

    let pet_add_return = await PetsController.addPet(patient_info);

    if(pet_add_return.success) {
      // let tags_response = await UserController.refreshUserTags({});
      let success_action = this.props && this.props.route && this.props.route.params && this.props.route.params.success_action ? this.props.route.params.success_action : () => {  };
      if (success_action) {
        success_action();
      }
      this.props.navigation.pop();
    } else {
      let error_msg = pet_add_return && pet_add_return.message && pet_add_return.message.message ? pet_add_return.message.message : '';
      this.setState({ error_message: error_msg });
    }
  }

  render_pet_type_section = () => {

    return <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>What Type of Pet?</Text>
      <Text style={{ fontSize: 16, color: 'grey', marginBottom: 15 }}>Choose your pet type</Text>

      <TouchableOpacity style={ this.state.pet_type === 'Dog' ? styles.selected_pet_type_button : styles.pet_type_button }
                        onPress={ () => {
                          this.setState({ pet_type: 'Dog', display_section: 'pet_inputs' });
                        }}>
        <View style={{ flex: 1, paddingLeft: 30 }}>
          <LottieView ref={animation => { this.dog_animation = animation }} style={{ width: 120, height: 120, backgroundColor: 'white', }} source={require('../../assets/animations/dog-trot.json')} />
        </View>
        <View style={{ width: '50%' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Add a Dog</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={ this.state.pet_type === 'Cat' ? styles.selected_pet_type_button : styles.pet_type_button }
                        onPress={ () => {
                          this.setState({ pet_type: 'Cat', display_section: 'pet_inputs' });
                        }}>
        <View style={{ flex: 1, paddingLeft: 0 }}>
          <LottieView ref={animation => { this.cat_animation = animation }} style={{ width: 120, height: 120, backgroundColor: 'white', }} source={require('../../assets/animations/cat-tail-wag.json')} />
        </View>
        <View style={{ width: '50%' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Add a Cat</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={ this.state.pet_type === '' ? styles.selected_pet_type_button : styles.pet_type_button }
                        onPress={ () => {
                          this.setState({ pet_type: '', display_section: 'pet_inputs' });
                        }}>
        <View style={{ flex: 1, paddingLeft: 40 }}>
          <LottieView ref={animation => { this.cow_animation = animation }} style={{ width: 70, height: 70, backgroundColor: 'white', }} source={require('../../assets/animations/cow-eating.json')} />
        </View>
        <View style={{ width: '50%' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Other Pet</Text>
        </View>
      </TouchableOpacity>

    </View>
  }

  render_pet_inputs_section = () => {


    return <View style={{ padding: 20 }}>

      { this.render_pet_type_section()   }

      <Input label='Pet Type'
             value={this.state.pet_type}
             style={{ marginBottom: 12 }}
             onChangeText={ (text) => {
               this.setState({ ...this.state, pet_type: text });
             }}/>

       <Input label='Pet Name'
              value={this.state.pet_name}
              style={{ marginBottom: 12 }}
              onChangeText={ (text) => {
                this.setState({ ...this.state, pet_name: text });
              }}/>

      <Input label='Pet Weight (in lbs)'
             value={this.state.pet_weight}
             placeholder='Pet weight in lbs'
             placeholder='0.0'
             keyboardType='number-pad'
             style={{ marginBottom: 12 }}
             onChangeText={ (text) => {
               this.setState({ ...this.state, pet_weight: text });
             }}/>

       <Input type={'masked'}
              label='Pet Birthday (MM/DD/YYYY)'
              placeholder='MM/DD/YYYY'
              type='date-mmddyyyy'
              value={this.state.pet_birthday}
              style={{ marginBottom: 12 }}
              onChangeText={ (text) => {
                this.setState({ ...this.state, pet_birthday: text });
              }}/>

        { this.render_breed_input() }

        { this.render_pet_gender_selection() }

        { this.render_error_message() }

        <Button title='Save Pet'
                onPress={this.savePet}/>

    </View>
  }

  render_error_message = () => {
    let error_message_str = this.state.error_message;

    if (!error_message_str) {
      return null;
    }

    error_message_str = error_message_str.includes('Birthday') ? error_message_str : 'All fields are required. Try again once all fields have been added.';

    return <View style={{ marginTop: 10, marginBottom: 20 }}>
      <Text style={{ color: Colors.RED, fontSize: 16 }}>{ error_message_str }</Text>
    </View>
  }

  render_breed_input = () => {

    let dog_breed_rows = dog_breeds.map((breed) => {
      let breed_label = breed;
      let value       = StringUtils.displayStringToKey(breed);
      return <Picker.Item key={breed_label} label={breed_label} value={value} />
    })

    let cat_breed_rows = cat_breeds.map((breed) => {
      let breed_label = breed;
      let value       = StringUtils.displayStringToKey(breed);
      return <Picker.Item key={breed_label} label={breed_label} value={value} />
    })

    if (this.state.pet_type && (this.state.pet_type.toLowerCase() === 'dog' || this.state.pet_type.toLowerCase() === 'cat')) {
      let is_dog = this.state.pet_type.toLowerCase() === 'dog';
      let is_cat = this.state.pet_type.toLowerCase() === 'cat';

      return <View style={{ paddingTop: 8, marginBottom: 15 }}>
          <View style={{ marginLeft: 10, height: 18, backgroundColor: 'white', position: 'absolute', zIndex: 3, elevation: 0, paddingRight: 8, paddingLeft: 8 }}>
              <Text style={{ color: Colors.TEXT_GREY }}>{ 'Pet Breed Selector' }</Text>
          </View>
          <View style={styles.breed_container}>
            <Picker
              style={{ borderRadius: 10, backgroundColor: 'white', padding: 10, paddingTop: 15 }}
              selectedValue={this.state.pet_breed}
              onValueChange={ (selected_breed) => {
                this.setState({ pet_breed: selected_breed })
              }}>
                { is_dog ? dog_breed_rows : null }
                { is_cat ? cat_breed_rows : null }
            </Picker>
          </View>

        { this.state.pet_breed === 'other' ? <View style={{ paddingTop: 15 }}>
                                                <Input label='Other Breed Name'
                                                       value={this.state.pet_other_breed}
                                                       style={{  }}
                                                       onChangeText={ (text) => {
                                                         this.setState({ ...this.state, pet_other_breed: text });
                                                       }}/>
                                             </View>
                                           : null }
      </View>
    }

    return <Input label='Pet Breed'
                  value={this.state.pet_breed}
                  style={{ marginBottom: 12 }}
                  onChangeText={ (text) => {
                    this.setState({ ...this.state, pet_breed: text });
                  }}/>
  }

  render_pet_gender_selection = () => {
    let unselected_style = styles.unselected_gender_container;
    let selected_style   = styles.selected_gender_container;

    let male_container    = this.state.pet_gender === 'MALE'   ? selected_style : unselected_style;
    let female_container  = this.state.pet_gender === 'FEMALE' ? selected_style : unselected_style;
    let s_n_yes_container = this.state.pet_is_spayed  ||  this.state.pet_is_neutered ? selected_style : unselected_style;
    let s_n_no_container  = !this.state.pet_is_spayed && !this.state.pet_is_neutered ? selected_style : unselected_style;

    return <View>
      <Text style={{ fontSize: 14, color: Colors.TEXT_GREY }}>Pet Gender</Text>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>

        <Checkbox label='Male'   style={styles.checkbox} checked={this.state.pet_gender === 'MALE'}   onPress={ () => { this.setState({ pet_gender: 'MALE' }) }} />
        <Checkbox label='Female' style={styles.checkbox} checked={this.state.pet_gender === 'FEMALE'} onPress={ () => { this.setState({ pet_gender: 'FEMALE' }) }} />

      </View>

      { this.state.pet_gender ? <View style={{ marginBottom: 12}}>
        <Text style={{ fontSize: 14, color: Colors.TEXT_GREY }}>Is your pet spayed or neutered?</Text>
        <View style={{ flexDirection: 'row' }}>

          <Checkbox label='Yes' style={styles.checkbox} checked={this.state.pet_is_spayed  ||  this.state.pet_is_neutered} onPress={ () => { this.setState({ pet_is_neutered: true,  pet_is_spayed: true }) }} />
          <Checkbox label='No'  style={styles.checkbox} checked={!this.state.pet_is_spayed && !this.state.pet_is_neutered} onPress={ () => { this.setState({ pet_is_neutered: false, pet_is_spayed: false })}} />

        </View>
      </View> : null }
    </View>
  }

  render() {

    return <Screen title='Pets' scroll={true} modal={true} navigation={this.props.navigation}>
      { this.render_pet_inputs_section() }
    </Screen>
  }


}

export default PetDetailsEditScreen;

const styles = StyleSheet.create({
  settings_row_container: {
    flex: 1,
    padding: 20
  },
  checkbox: {
    padding: 10,
    paddingLeft: 0,
    width: 120
  },
  breed_container: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: '#bbbbc0',
    overflow: 'hidden'
  },
  pet_type_button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DFE3E4',
    borderRadius: 16,
    overflow: 'hidden',
    height: 110,
    marginBottom: 8
  },
  selected_pet_type_button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 16,
    overflow: 'hidden',
    height: 110,
    marginBottom: 8
  },
  selected_gender_container: {
    borderWidth: 2,
    borderColor: '#1dc2ff',
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 10,
    flex: 1,
    backgroundColor: 'white'
  },
  unselected_gender_container: {
    borderWidth: 2,
    borderColor: 'grey',
    padding: 10,
    marginTop: 5,
    marginBottom: 5,
    borderRadius: 10,
    flex: 1,
    backgroundColor: 'white'
  }
});


let dog_breeds = [
'Select Breed',
'Other',
'Magnificent Mix',
'Affenpinscher',
'Afghan Hound',
'Airedale Terrier',
'Akita',
'Alaskan Klee Kai',
'Alaskan Malamute',
'American Bulldog',
'American English Coonhound',
'American Cocker Spaniel',
'American Eskimo Dog',
'American Foxhound',
'American Hairless Terrier',
'American Leopard Hound',
'American Staffordshire Terrier',
'American Water Spaniel',
'Anatolian Shepherd',
'Appenzeller Sennenhund',
'Australian Cattle Dog',
'Australian Kelpie',
'Australian Shepherd',
'Australian Stumpy Tail Cattle Dog',
'Australian Terrier',
'Azawakh',
'Barbado da Terceira',
'Barbet',
'Basenji',
'Basset Fauve de Bretagne',
'Basset Hound',
'Bavarian Mountain Scent Hound',
'Beagle',
'Bearded Collie',
'Beauceron',
'Bedlington Terrier',
'Belgian Laekenois',
'Belgian Malinois',
'Belgian Sheepdog',
'Belgian Tervuren',
'Bergamasco Sheepdog',
'Berger Picard',
'Bernese Mountain Dog',
'Bichon Frise',
'Biewer Terrier',
'Black and Tan Coonhound',
'Black Russian Terrier',
'Bluetick Coonhound',
'Bloodhound',
'Boerboel',
'Bohemian Shepherd',
'Bolognese',
'Border Collie',
'Border Terrier',
'Borzoi',
'Boston Terrier',
'Bouvier des Flandres',
'Boxer',
'Boykin Spaniel',
'Bracco Italiano',
'Braque du Bouebonnais',
'Braque Francais Pyrenean',
'Briard',
'Brittany Spaniel',
'Broholmer',
'Brussels Griffon',
'Bull Terrier',
'Bulldog',
'Bullmastiff',
'Cairn Terrier',
'Canaan Dog',
'Cane Corso',
'Cardigan Welsh Corgi',
'Carolina Dog',
'Catahoula Leopard Dog',
'Caucasian Shepherd Dog',
'Cavalier King Charles Spaniel',
'Central Asian Shepherd Dog',
'Cesky Terrier',
'Chesapeake Bay Retriever',
'Chihuahua',
'Chinese Crested',
'Chinese Shar-Pei',
'Chinook',
'Chow Chow',
'Cirnenco dell’Etna',
'Clumber Spaniel',
'Collie',
'Coton de Tulear',
'Croatian Sheepdog',
'Curly-Coated Retriever',
'Czechoslovakian Vlcak',
'Dachshund',
'Dalmatian',
'Dandie Dinmont Terrier',
'Danish-Swedish Farmdog',
'Deutscher Wachtelhund',
'Doberman Pinscher',
'Dogo Argentino',
'Dogue de Bordeaux',
'Doodle Mix',
'Drentsche Patrijshond',
'Drever',
'Dutch Shepherd',
'English Bulldog',
'English Cocker Spaniel',
'English Coonhound',
'English Foxhound',
'English Pointer',
'English Setter',
'English Shepherd',
'English Springer Spaniel',
'English Toy Spaniel',
'Entlebucher Mountain Dog',
'Estrela Mountain Dog',
'Eurasier',
'Field Spaniel',
'Finnish Lapphund',
'Finnish Spitz',
'Flat-Coated Retriever',
'French Bulldog',
'French Spaniel',
'German Longhaired Pointer',
'German Pinscher',
'German Shepherd Dog',
'German Shorthaired Pointer',
'German Spitz',
'German Wirehaired Pointer',
'Giant Schnauzer',
'Glen of Imaal Terrier',
'Golden Retriever',
'Gordon Setter',
'Grand Basset Griffon Vendeen',
'Great Dane',
'Great Pyrenees',
'Greater Swiss Mountain Dog',
'Greyhound',
'Hamiltonstovare',
'Hanoverian Scenthound',
'Harrier',
'Havanese',
'Hokkaido',
'Hovawart',
'Ibizan Hound',
'Icelandic Sheepdog',
'Irish Setter',
'Irish Terrier',
'Irish Water Spaniel',
'Irish Wolfhound',
'Italian Greyhound',
'Jack Russell Terrier',
'Jagdterrier',
'Japanese Akitainu',
'Japanese Chin',
'Japanese Spitz',
'Japanese Terrier',
'Jindo',
'Kai Ken',
'Karelian Bear Dog',
'Keeshond',
'Kerry Blue Terrier',
'Kishu Ken',
'Komondor',
'Kromfohrlander',
'Kuvasz',
'Labrador Retriever',
'Lagotto Romagnolo',
'Lakeland Terrier',
'Lancashire Heeler',
'Lapponian Herder',
'Large Munsterland',
'Leonberger',
'Lhasa Apso',
'Lowchen',
'Lurcher',
'Maltese',
'Manchester Terrier',
'Marmemma Sheepdog',
'Mastiff',
'Miniature American Shepherd',
'Miniature Bull Terrier',
'Miniature Dachshund',
'Miniature Pinscher',
'Miniature Poodle',
'Miniature Schnauzer',
'Mountain Cur',
'Mudi',
'Neapollitan Mastiff',
'Nederlande Kooikerhondje',
'Newfoundland',
'Norfolk Terrier',
'Norrbottenspets',
'Norwegian Buhund',
'Norwegian Elkhound',
'Norwegian Lundehund',
'Norwich Terrier',
'Nova Scotia Duck Tolling Retriever',
'Old English Sheepdog',
'Otterhound',
'Papillon',
'Parson Russell Terrier',
'Patterdale Terrier',
'Pekingese',
'Pembroke Welsh Corgi',
'Perro de Presa Canario',
'Peruvian Inca Orchid',
'Petits Bassets Griffons Vendeen',
'Pharaoh Hound',
'Pit Bull',
'Plott Hound',
'Polish Lowland Sheepdog',
'Pomeranian',
'Poodle',
'Porcelaine',
'Portuguese Podengo',
'Portuguese Podengo Pequeno',
'Portuguese Pointer',
'Portuguese Sheepdog',
'Portuguese Water Dog',
'Pudelpointer',
'Pug',
'Puli',
'Pumi',
'Pyrenean Mastiff',
'Pyrenean Shepherd',
'Rafeiro do Alentejo',
'Rat Terrier',
'Redbone Coonhound',
'Rhodesian Ridgeback',
'Romanian Carpathia Shepherd',
'Romanian Mioritic Shepherd Dog',
'Rottweiler',
'Russell Terrier',
'Russian Toy',
'Russian Tsvetnaya',
'Saint Bernard',
'Saluki',
'Samoyed',
'Sarplaninac',
'Schapendoes',
'Schipperke',
'Scottish Deerhound',
'Scottish Terrier',
'Sealyham Terrier',
'Segugio Italio',
'Sheltie',
'Shetland Sheepdog',
'Shiba Inu',
'Shih Tzu',
'Shikoku',
'Shollie',
'Siberian Husky',
'Silky Terrier',
'Skye Terrier',
'Sloughi',
'Slovakian Wirehaired Pointer',
'Slovensky Cuvac',
'Slovensky Kopov',
'Small Munsterlander',
'Smooth Fox Terrier',
'Spanish Water Dog',
'Soft Coated Wheaten Terrier',
'Spanish Mastiff',
'Spanish Water Dog',
'Spinone Italiano',
'Stabyhoun',
'Staffordshire Bull Terrier',
'Standard Schnauzer',
'Sussex Spaniel',
'Swedish Lapphund',
'Swedish Vallhund',
'Taiwan Dog',
'Teddy Roosevelt Terrier',
'Thai Ridgeback',
'Tibetan Mastiff',
'Tibetan Spaniel',
'Tibetan Terrier',
'Tornjak',
'Tosa',
'Toy Fox Terrier',
'Toy Manchester Terrier',
'Translyvanian Hound',
'Treeing Tennessee Brindle',
'Treeing Walker Coonhound',
'Vizsla',
'Volpino Italiano',
'Weimaraner',
'Welsh Springer Spaniel',
'Welsh Terrier',
'West Highland White Terrier',
'Wetterhhound',
'Wheaten Terrier',
'Whippet',
'Wire Fox Terrier',
'Wirehaired Pointing Griffon',
'Wirehaired Vizsla',
'Working Kelpie',
'Xoloitzcuintli/Mexican Hairless',
'Yakutian Laika',
'Yorkshire Terrier',
]

let cat_breeds = [
  'Select Breed',
  'Other',
  'Abyssinian',
  'American Bobtail',
  'American Curl',
  'American Shorthair',
  'American Wirehair',
  'Balinese',
  'Bengal',
  'Birman',
  'Bombay',
  'British Shorthair',
  'Burmese',
  'Burmilla',
  'Calico',
  'Chartreux',
  'Chausie',
  'Colorpoint Shorthair',
  'Cornish Rex',
  'Cymric',
  'Devon Rex',
  'Domestic Long Hair',
  'Domestic Medium Hair',
  'Domestic Shorthair',
  'Egyptian Mau',
  'European Burmese',
  'Exotic',
  'Havana Brown',
  'Himalayan',
  'Japanese Bobtail',
  'Javanese',
  'Khao Manee',
  'Korat',
  'LaPerm',
  'Lykoi',
  'Maine Coon',
  'Manx',
  'Munchkin',
  'Nebelung',
  'Norwegian Forest Cat',
  'Ocicat',
  'Oriental',
  'Persian',
  'Pixiebob',
  'RagaMuffin',
  'Ragdoll',
  'Russian Blue',
  'Scottish Fold',
  'Selkirk Rex',
  'Siamese',
  'Siberian',
  'Singapura',
  'Snowshoe',
  'Somali',
  'Sphynx',
  'Tabby',
  'Tonkinese',
  'Tortoiseshell',
  'Toybob',
  'Toyger',
  'Turkish Angora',
  'Turkish Van',
  'Tuxedo',
  'York Chocolate',
]
