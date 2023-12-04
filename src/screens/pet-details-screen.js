import { Component }   from "react";
import LottieView      from 'lottie-react-native';
import { StringUtils } from '../utils';
import { Picker }      from '@react-native-picker/picker';
import { StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { Screen, Line, Text, Icon, Button, Input, Checkbox, Colors } from '../components';
import { setItem, getItem } from '../../storage';
import { PetsController }   from '../controllers';

class PetDetailsScreen extends Component {

  constructor(props) {
    super(props);

    let pet_id = this.props && this.props.route && this.props.route.params && this.props.route.params.pet_id ? this.props.route.params.pet_id : '';

    this.state = {
      pet_id: pet_id,
      display_section: 'pet_details', // 'pet_details' 'pet_edit_inputs'
      pet_details: {},
      loading_save_pet: false,
      error_message: ''
    }
  }

  componentDidMount = async () => {
    let pet_id  = this.state.pet_id;
    let pet_res = await PetsController.getPet(pet_id);

    if (pet_res && pet_res.success) {
      let pet = pet_res && pet_res.data && pet_res.data.pet ? pet_res.data.pet : {};
      this.setState({ ...pet, pet_id: pet_id });
    }
  }

  save_pet = async () => {
    let pet_id     = this.state.pet_id
    let patient_weight = this.state.weight && parseInt(this.state.weight) ? parseInt(this.state.weight) : 0;

    let patient_info = {
      patient_id: pet_id,
      name: this.state.name,
      breed: this.state.breed,
      type: this.state.type,
      birthday: this.state.birthday,
      gender: this.state.gender,
      spayed: this.state.spayed,
      neutered: this.state.neutered,
      weight: patient_weight
    }

    if (patient_info.breed) {
      patient_info.breed = patient_info.breed === 'other' && this.state.pet_other_breed  ? this.state.pet_other_breed : patient_info.breed;
      patient_info.breed = patient_info.breed === 'other' && !this.state.pet_other_breed ? 'Other' : patient_info.breed;
      patient_info.breed = patient_info.breed !== 'other' ? StringUtils.keyToDisplayString(patient_info.breed) : patient_info.breed;
    }

    this.setState({ loading_save_pet: true });

    let pet_save_response = await PetsController.updatePet(patient_info)

    if(pet_save_response.success) {
      let pet   = pet_save_response && pet_save_response.data && pet_save_response.data.pet ? pet_save_response.data.pet : {};
      let breed = pet && pet.breed ? StringUtils.displayStringToKey(pet.breed) : '';

      // let tags_response = await UserController.refreshUserTags({});

      this.setState({
        ...pet,
        breed: breed,
        pet_id: pet_id,
        display_section: 'pet_details',
        loading_save_pet: false,
        error_message: ''
      })
    } else {
      let error_msg = pet_save_response && pet_save_response.error ? pet_save_response.error : '';
      this.setState({ loading_save_pet: false, error_message: error_msg });
    }
  }

  render_pet_details_label_value = (label, value) => {
    let check_icon = label === 'Spayed' || label === 'Neutered' ? true : false;
    return <View style={styles.pet_details_row}>
      <View style={styles.label_container}>
        <Text style={styles.label_text}>{ label }</Text>
      </View>
      <View>
        { check_icon ? <Icon name='check-circle' size={18} color={Colors.GREEN} />
                     : <Text style={styles.value_text}>{ value }</Text> }
      </View>
    </View>
  }

  render_pet_details = () => {
    if (this.state.display_section !== 'pet_details') {
      return null;
    }

    let name   = this.state.name   ? StringUtils.sentenceCase(this.state.name.toLowerCase())   : '';
    let breed  = this.state.breed  ? StringUtils.sentenceCase(this.state.breed.toLowerCase())  : '';
    let type   = this.state.type   ? StringUtils.sentenceCase(this.state.type.toLowerCase())   : '';
    let gender = this.state.gender ? StringUtils.sentenceCase(this.state.gender.toLowerCase()) : '';
    let weight = this.state.weight || 0;
        weight = weight.toString() + ' lbs';

    let is_male   = this.state.gender === 'MALE';
    let is_female = this.state.gender === 'FEMALE';

    return <View style={{ padding: 20 }}>

      { this.render_pet_details_label_value('Name',     name)     }
      { this.render_pet_details_label_value('Breed',    breed)    }
      { this.render_pet_details_label_value('Type',     type)     }
      { this.render_pet_details_label_value('Birthday', this.state.birthday) }
      { this.render_pet_details_label_value('Gender',   gender)   }
      { this.render_pet_details_label_value('Weight',   weight)   }

      { is_female && this.state.spayed   ? this.render_pet_details_label_value('Spayed', 'True')   : null }
      { is_male   && this.state.neutered ? this.render_pet_details_label_value('Neutered', 'True') : null }

      <View style={{ height: 20 }} />
      <Button title='Edit Pet' onPress={ () => { this.setState({ display_section: 'pet_edit_inputs' }) }} />
    </View>
  }

  render_pet_gender_selection = () => {
    return <View style={{ marginTop: 10, marginBottom: 10 }}>
      <Text style={{ fontSize: 15, color: Colors.TEXT_GREY }}>Pet Gender</Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>

        <Checkbox label='Male'   style={styles.checkbox} checked={this.state.gender === 'MALE'}   onPress={ () => { this.setState({ gender: 'MALE' }) }} />
        <Checkbox label='Female' style={styles.checkbox} checked={this.state.gender === 'FEMALE'} onPress={ () => { this.setState({ gender: 'FEMALE' }) }} />

      </View>

      <View style={{ marginBottom: 5 }}>
        <Text style={{ fontSize: 15, color: Colors.TEXT_GREY }}>Is your pet spayed or neutered?</Text>
        <View style={{ flexDirection: 'row' }}>
          <Checkbox label='Yes' style={styles.checkbox} checked={this.state.spayed  ||  this.state.neutered} onPress={ () => { this.setState({ neutered: true,  spayed: true }) }} />
          <Checkbox label='No'  style={styles.checkbox} checked={!this.state.spayed && !this.state.neutered} onPress={ () => { this.setState({ neutered: false, spayed: false })}} />
        </View>
      </View>
    </View>
  }

  render_pet_edit_inputs = () => {
    if (this.state.display_section !== 'pet_edit_inputs') {
      return null;
    }

    return <View style={{ padding: 20 }}>
       <Input label='Pet Name'
              value={this.state.name}
              style={{ marginBottom: 12 }}
              onChangeText={ (text) => {
                this.setState({ ...this.state, name: text });
              }}/>

       <Input label='Pet Type'
              value={this.state.type}
              style={{ marginBottom: 12 }}
              onChangeText={ (text) => {
                this.setState({ ...this.state, type: text });
              }}/>

      <Input label='Pet Weight (in lbs)'
             value={this.state.weight.toString()}
             placeholder='0.0'
             keyboardType='number-pad'
             style={{ marginBottom: 12 }}
             onChangeText={ (text) => {
               this.setState({ ...this.state, weight: text });
             }}/>

       <Input label='Pet Birthday'
              placeholder='MM/DD/YYYY'
              style={{ marginBottom: 12 }}
              type='date-mmddyyyy'
              value={this.state.birthday}
              onChangeText={ (text) => {
                this.setState({ ...this.state, birthday: text });
              }}/>

        { this.render_breed_input() }

        { this.render_pet_gender_selection() }

        { this.render_error_message() }

        <Button title='Save Pet'
                loading={this.state.loading_save_pet}
                onPress={ () => { this.save_pet() }}/>
      </View>
  }

  render_error_message = () => {
    let error_message_str = this.state.error_message;

    if (!error_message_str) {
      return null;
    }

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

    if (this.state.type && (this.state.type.toLowerCase() === 'dog' || this.state.type.toLowerCase() === 'cat')) {
      let is_dog = this.state.type.toLowerCase() === 'dog';
      let is_cat = this.state.type.toLowerCase() === 'cat';

      return <View style={{ paddingTop: 8, marginBottom: 15 }}>
          <View style={{ marginLeft: 10, height: 18, backgroundColor: 'white', position: 'absolute', zIndex: 3, elevation: 0, paddingRight: 8, paddingLeft: 8 }}>
              <Text style={{ color: Colors.TEXT_GREY }}>{ 'Pet Breed' }</Text>
          </View>
          <View style={styles.breed_container}>
          <Picker
            style={{ borderRadius: 10, backgroundColor: 'white' }}
            selectedValue={this.state.breed}
            onValueChange={ (selected_breed) => {
              this.setState({ breed: selected_breed })
            }}>
              { is_dog ? dog_breed_rows : null }
              { is_cat ? cat_breed_rows : null }
          </Picker>
        </View>

        { this.state.breed === 'other' ? <View style={{ paddingTop: 15 }}>
          <Input label='Other Breed Name'
                 value={this.state.pet_other_breed}
                 style={{  }}
                 onChangeText={ (text) => {
                   this.setState({ ...this.state, pet_other_breed: text });
                 }}/>
        </View> : null }
      </View>
    }

    return <Input label='Pet Breed'
                  value={this.state.breed}
                  style={{ marginBottom: 12 }}
                  onChangeText={ (text) => {
                    this.setState({ ...this.state, breed: text });
                  }}/>

  }

  render() {
    return <Screen title='Pet Details' scroll={true} navigation={this.props.navigation}>
      { this.render_pet_details()     }
      { this.render_pet_edit_inputs() }
    </Screen>
  }


}

export default PetDetailsScreen;

const styles = StyleSheet.create({
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
  pet_details_row: {
    flexDirection: 'row',
    paddingLeft: 10
  },
  label_container: {
    width: 120,
    marginBottom: 15,
  },
  label_text: {
    fontSize: 16,
    color: '#575762'
  },
  value_text: {
    fontSize: 16,
    color: '#040415'
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
