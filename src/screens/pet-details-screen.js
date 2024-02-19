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
      pet_diet: {},
      add_new_diet: false,
      add_new_health: false,
      loading_save_pet: false,
      diet_loaded: false,
      health_loaded: false,
      error_message: ''
    }
  }

  componentDidMount = async () => {
    let pet_id  = this.state.pet_id;
    let pet_res = await PetsController.getPet(pet_id);

    if (pet_res && pet_res.success) {
      this.get_pet_diet(pet_id);
      this.get_pet_health(pet_id);
      let pet = pet_res && pet_res.data && pet_res.data.pet ? pet_res.data.pet : {};
      this.setState({ ...pet, pet_id: pet_id });
    }
  }

  render_pet_details_label_value = (label, value) => {
    let check_icon = label === 'Spayed' || label === 'Neutered' ? true : false;
    return <View style={styles.pet_details_row}>
      <View style={styles.label_container}>
        <Text style={styles.label_text}>{ label }</Text>
      </View>
      <View style={{ flex: 1 }}>
        { check_icon ? <Icon name='check-circle' size={18} style={{ alignSelf: 'flex-start' }} color={Colors.GREEN} />
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
    let pet_id = this.state.pet_id;

    let is_male   = this.state.gender === 'MALE';
    let is_female = this.state.gender === 'FEMALE';

    let age_months = this.state.age_num_months;
    let age_years  = this.state.age_num_years;
    let age_str    = age_years + ' yr ' + age_months + ' mo';
        age_str    = age_months === 0 ? age_years + ' years' : age_str;

    return <View style={{ padding: 20 }}>
      <View style={styles.section_title_container}>
        <Text style={styles.section_title}>Bio</Text>
        <TouchableOpacity style={styles.edit_button}
                          onPress={ () => {
                            this.props.navigation.push('PetDetailsEdit', { pet_id: this.state.pet_id, type: 'bio', success_action: () => { this.get_pet_bio(this.state.pet_id)  } });
                          }}>
          <Text style={styles.edit_button_title}>Edit</Text>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 20, backgroundColor: 'white', borderRadius: 12, paddingRight: 20, paddingLeft: 20, paddingBottom: 10, marginTop: 15 }}>
        { this.render_pet_details_label_value('Name',     name)     }
        { this.render_pet_details_label_value('Breed',    breed)    }
        { this.render_pet_details_label_value('Type',     type)     }
        { this.render_pet_details_label_value('Age',      age_str)  }
        { this.render_pet_details_label_value('Gender',   gender)   }

        { is_female && this.state.spayed   ? this.render_pet_details_label_value('Spayed', 'True')   : null }
        { is_male   && this.state.neutered ? this.render_pet_details_label_value('Neutered', 'True') : null }
      </View>
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

  render_pet_diet = () => {
    if (!this.state.diet_loaded) { return null }

    let add_new_diet = this.state.add_new_diet;
    let pet_diet     = this.state.pet_diet;

    let food_name          = pet_diet.food_name;
    let food_type          = pet_diet.food_type ? StringUtils.sentenceCase(pet_diet.food_type.toLowerCase()) : '';
    let food_quantity_cups = pet_diet.food_quantity_cups + ' cups';
    let food_times_a_day   = pet_diet.food_times_a_day + ' times a day';
    let food_notes         = '';

    return <View style={{ padding: 20, paddingTop: 10 }}>
      <View style={styles.section_title_container}>
        <Text style={styles.section_title}>Diet</Text>
        { !add_new_diet ? <TouchableOpacity style={styles.edit_button}
                                       onPress={ () => {
                                         this.props.navigation.push('PetDetailsEdit', { pet_id: this.state.pet_id, type: 'diet', success_action: () => { this.get_pet_diet(this.state.pet_id) } });
                                       }}>
                       <Text style={styles.edit_button_title}>Edit</Text>
                     </TouchableOpacity> : null }
      </View>
      <View style={styles.section_container}>
        { !add_new_diet ? <View>
                            { this.render_pet_details_label_value('Food',   food_name)    }
                            <View style={{ height: 15 }} />
                            { this.render_pet_details_label_value('Type',   food_type)     }
                            { this.render_pet_details_label_value('Amount', food_quantity_cups)  }
                            { this.render_pet_details_label_value('Times',  food_times_a_day)   }
                          </View>
                        : null }

        { add_new_diet ? <TouchableOpacity style={styles.add_button}
                                        onPress={ () => {
                                          this.props.navigation.push('PetDetailsEdit', { pet_id: this.state.pet_id, add_new: true, type: 'diet', success_action: () => { this.get_pet_diet(this.state.pet_id) } });
                                        }}>
                        <Icon name='plus-circle' color='white' size={18} />
                        <Text style={styles.add_button_title}>ADD DIET</Text>
                      </TouchableOpacity> : null }
      </View>
    </View>
  }

  render_pet_health_issues = () => {
    if (!this.state.health_loaded) { return null }

    let pet_health        = this.state.pet_health;
    let pet_health_id     = pet_health && pet_health._id ? pet_health._id : '';
    let health_issues     = pet_health && pet_health.health_issues ? pet_health.health_issues : [];
    let has_health_issues = health_issues.length > 0 ? true : false;

    let health_issue_rows = health_issues.map((health_issue, index) => {
      let bottom_margin = index === health_issues.length - 1 ? 0 : 10;
      return <Text style={[styles.value_text, { marginBottom: 15 }]}>{ health_issue }</Text>
    })

    return <View style={{ padding: 20, paddingTop: 10 }}>
      <View style={styles.section_title_container}>
        <Text style={styles.section_title}>Health Issues</Text>
        { has_health_issues ? <TouchableOpacity style={styles.edit_button}
                                                onPress={ () => {
                                                  this.props.navigation.push('PetDetailsEdit', { pet_id: this.state.pet_id, type: 'health_issues', success_action: () => { this.get_pet_health(this.state.pet_id) } });
                                                }}>
                                <Text style={styles.edit_button_title}>Edit</Text>
                              </TouchableOpacity> : null }
      </View>
      <View style={styles.section_container}>
        { has_health_issues  ? <View>
                                { health_issue_rows }
                               </View> : null }
        { !has_health_issues ? <TouchableOpacity style={styles.add_button}
                                                 onPress={ () => {
                                                   this.props.navigation.push('PetDetailsEdit', { pet_id: this.state.pet_id, type: 'health_issues', success_action: () => { this.get_pet_health(this.state.pet_id) } });
                                                 }}>
                                 <Icon name='plus-circle' color='white' size={18} />
                                 <Text style={styles.add_button_title}>ADD HEALTH ISSUES</Text>
                               </TouchableOpacity> : null }
      </View>
    </View>
  }

  render_pet_medications = () => {
    if (!this.state.health_loaded) { return null }

    let pet_health      = this.state.pet_health;
    let pet_health_id   = pet_health && pet_health._id ? pet_health._id : '';
    let medications     = pet_health && pet_health.medications ? pet_health.medications : [];
    let has_medications = medications.length > 0 ? true : false;

    let medication_rows = medications.map((medication, index) => {
      let bottom_margin = index === medications.length - 1 ? 0 : 10;
      let display_name  = medication ? StringUtils.sentenceCase(medication.toLowerCase()) : '';
      return <Text style={[styles.value_text, { marginBottom: 15 }]}>{ display_name }</Text>
    })

    return <View style={{ padding: 20, paddingTop: 10 }}>
      <View style={styles.section_title_container}>
        <Text style={styles.section_title}>Medications</Text>
        { has_medications ? <TouchableOpacity style={styles.edit_button}
                                              onPress={ () => {
                                                this.props.navigation.push('PetDetailsEdit', { pet_id: this.state.pet_id, type: 'medications', success_action: () => { this.get_pet_health(this.state.pet_id) } });
                                              }}>
                              <Text style={styles.edit_button_title}>Edit</Text>
                            </TouchableOpacity> : null }
      </View>
      <View style={styles.section_container}>
        { has_medications  ? <View>
                               { medication_rows }
                             </View>
                           : null }
        { !has_medications ? <TouchableOpacity style={styles.add_button}
                                               onPress={ () => {
                                                 this.props.navigation.push('PetDetailsEdit', { pet_id: this.state.pet_id, type: 'medications', success_action: () => { this.get_pet_health(this.state.pet_id) } });
                                               }}>
                               <Icon name='plus-circle' color='white' size={18} />
                               <Text style={styles.add_button_title}>ADD MEDICATIONS</Text>
                             </TouchableOpacity> : null }
      </View>
    </View>
  }

  render() {
    let pet_name = this.state ? StringUtils.displayName(this.state) : 'Pet Info';
    return <Screen title={ pet_name } scroll={true} navigation={this.props.navigation} style={{ backgroundColor: Colors.BACKGROUND_GREY }}>
      { this.render_pet_details()       }
      { this.render_pet_diet()          }
      { this.render_pet_health_issues() }
      { this.render_pet_medications()   }
    </Screen>
  }

  get_pet_bio = async (pet_id) => {
    let pet_res = await PetsController.getPet(pet_id);

    if (pet_res && pet_res.success) {
      let pet = pet_res && pet_res.data && pet_res.data.pet ? pet_res.data.pet : {};
      this.setState({ ...pet, pet_id: pet_id });
    }
  }

  get_pet_diet = (pet_id) => {
    PetsController.getPetDiet({ patient_id: pet_id }).then((response) => {
      let is_success = response && response.success;
      if (is_success) {
        let pet_diet = response && response.data && response.data.pet_diet;
        this.setState({ pet_diet: pet_diet, diet_loaded: true });
      } else {
        this.setState({ add_new_diet: true, diet_loaded: true });
      }
    })
  }

  get_pet_health = (pet_id) =>{
    PetsController.getPetHealth({ patient_id: pet_id }).then((response) => {
      let is_success = response && response.success;
      if (is_success) {
        let pet_health = response && response.data && response.data.pet_health;
        this.setState({ pet_health: pet_health, health_loaded: true });
      } else {
        this.setState({ health_loaded: true });
      }
    })
  }

}

export default PetDetailsScreen;

const styles = StyleSheet.create({
  add_button: {
    alignSelf: 'center',
    marginBottom: 30,
    marginTop: 20,
    flexDirection: 'row',
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 30,
    width: 230,
    justifyContent: 'center',
    alignItems: 'center'
  },
  add_button_title: {
    fontSize: 13,
    fontWeight: 'semibold',
    color: 'white',
    marginLeft: 8
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
  edit_button: {
    backgroundColor: Colors.PRIMARY,
    height: 35,
    width: 75,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12
  },
  edit_button_title: {
    fontSize: 15,
    fontWeight: 'semibold',
    color: 'white'
  },
  pet_details_row: {
    flexDirection: 'row',
    paddingLeft: 10,
    flex: 1
  },
  label_container: {
    width: 90,
    marginBottom: 15,
  },
  label_text: {
    fontSize: 15,
    color: '#575762'
  },
  section_container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingRight: 20,
    paddingLeft: 20,
    paddingBottom: 10,
    marginTop: 15
  },
  section_title: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'medium',
    color: '#0054A4'
  },
  section_title_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  value_text: {
    fontSize: 15,
    color: '#040415',
    flex: 1
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
