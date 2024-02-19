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

    let type    = this.props && this.props.route && this.props.route.params && this.props.route.params.type    ? this.props.route.params.type    : '';
    let pet_id  = this.props && this.props.route && this.props.route.params && this.props.route.params.pet_id  ? this.props.route.params.pet_id  : '';
    let add_new = this.props && this.props.route && this.props.route.params && this.props.route.params.add_new ? this.props.route.params.add_new : false;

    this.state = {
      display_section: type, // new, bio, diet, health_issues, medications
      pet_id: pet_id,
      add_new: add_new,
      pet: {},
      original_pet: {},
      pet_breed_selected: false,
      started_animation: false,
      loading_screen: false,
      loading_button: false,
      add_new_diet: false,
      pet_food_list: { cat_food_products: [], dog_food_products: [] },
      pet_food_suggestions: [],
      pet_type: '',
      pet_food: '',
      food_selected: false,
      pet_food_type: '',
      pet_food_cups: 0,
      pet_food_times: 0,
      pet_food_notes: '',
      health_issues: []
    }
  }

  componentDidMount = async () => {
    let t = setInterval(this._onEverySecondProvider, 200);

    this.get_pet_food_list();
    this.get_pet();
    this.get_pet_diet();

    this.setState({ timer_interval: t });
  }

  componentWillUnmount() {
    clearInterval(this.state.timer_interval);
  }

  _onEverySecondProvider = () => {
    if (!this.state.started_animation && this.dog_animation && this.cat_animation) {
      this.dog_animation.play();
      this.cat_animation.play();
      this.setState({ started_animation: true });
    }
    if (this.state.loading_screen && this.loading_dog_animation) {
      this.loading_dog_animation.play();
    }
  }

  render_new_pet = (display) => {
    if (!display) { return null }

    return <View>

    </View>
  }

  render_edit_bio = (display) => {
    if (!display) { return null }

    let pet = this.state.pet;
    let pet_name  = StringUtils.displayName(pet);
        pet_name  = pet_name || 'Your Pet';
    let is_male   = pet.gender === 'MALE';
    let is_female = pet.gender === 'FEMALE';
    let is_dog    = pet.type && pet.type.toLowerCase() === 'dog';
    let is_cat    = pet.type && pet.type.toLowerCase() === 'cat';
    let age_years = pet.age_num_years  ? pet.age_num_years  : 0;
    let age_month = pet.age_num_months ? pet.age_num_months : 0;
    let s_n_title = 'Spayed/Neutered?';
        s_n_title = is_male   ? 'Neutered?' : s_n_title;
        s_n_title = is_female ? 'Spayed?'   : s_n_title;
        s_n_title = 'Is ' + pet_name + ' ' + s_n_title;

    return <View style={{ padding: 20, paddingBottom: 0 }}>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.input_title}>Name</Text>
        <Input value={pet.name} onChangeText={ (text) => { this.update_state_pet('name', text) }}/>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.input_title}>Type</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
           <TouchableOpacity style={ is_dog ? styles.selected_type_selection_button : styles.type_selection_button }   onPress={ () => { this.update_state_pet('type', 'dog') }}>
             <LottieView ref={animation => { this.dog_animation = animation }} style={{ width: 60, height: 60, marginBottom: -5 }} source={require('../../assets/animations/dog-trot.json')} />
             <Text style={ is_dog ? styles.selected_selection_title : styles.selection_title }>Dog</Text>
           </TouchableOpacity>
           <View style={{ width: 8 }} />
           <TouchableOpacity style={ is_cat ? styles.selected_type_selection_button : styles.type_selection_button } onPress={ () => { this.update_state_pet('type', 'cat') }}>
             <LottieView ref={animation => { this.cat_animation = animation }} style={{ width: 55, height: 55, marginLeft: -2 }} source={require('../../assets/animations/cat-tail-wag.json')} />
             <Text style={ is_cat ? styles.selected_selection_title : styles.selection_title }>Cat</Text>
           </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.input_title}>Gender</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity style={ is_male ? styles.selected_selection_button : styles.selection_button }   onPress={ () => { this.update_state_pet('gender', 'MALE') }}>
            <Text style={ is_male ? styles.selected_selection_title : styles.selection_title }>Male</Text>
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity style={ is_female ? styles.selected_selection_button : styles.selection_button } onPress={ () => { this.update_state_pet('gender', 'FEMALE') }}>
            <Text style={ is_female ? styles.selected_selection_title : styles.selection_title }>Female</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.input_title}>Breed</Text>
        <Input value={pet.breed}
               onChangeText={ (text) => {
                 this.update_state_pet('breed', text);
                 this.setState({ pet_breed_selected: false });
               }}/>
        { this.render_breed_suggestions() }
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.input_title}>Age</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: 130, justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={ () => { this.update_state_pet('age_num_years', age_years === 0 ? 0 : age_years - 1) }}>
                <Icon name='minus-circle' color={ Colors.PRIMARY } size={28} />
              </TouchableOpacity>
              <Text style={{ fontSize: 24 }}>{ age_years }</Text>
              <TouchableOpacity onPress={ () => { this.update_state_pet('age_num_years', age_years + 1) }}>
                <Icon name='plus-circle'  color={ Colors.PRIMARY } size={30} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 15, marginTop: 3 }}>Years</Text>
          </View>
          <View style={{ width: 30 }} />
          <View style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', width: 130, justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={ () => { this.update_state_pet('age_num_months', age_month === 0 ? 0 : age_month - 1) }}>
                <Icon name='minus-circle' color={ Colors.PRIMARY } size={28} />
              </TouchableOpacity>
              <Text style={{ fontSize: 24 }}>{ age_month }</Text>
              <TouchableOpacity onPress={ () => { this.update_state_pet('age_num_months', age_month < 11 ? age_month + 1 : age_month) }}>
                <Icon name='plus-circle'  color={ Colors.PRIMARY } size={30} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 15, marginTop: 3 }}>Months</Text>
          </View>
        </View>
      </View>

      <View style={{ marginBottom: 20 }}>
        <Text style={styles.input_title}>{ s_n_title }</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          <TouchableOpacity style={ is_male ? styles.selected_selection_button : styles.selection_button }   onPress={ () => { this.update_state_pet('gender', 'MALE') }}>
            <Text style={ is_male ? styles.selected_selection_title : styles.selection_title }>Yes</Text>
          </TouchableOpacity>
          <View style={{ width: 8 }} />
          <TouchableOpacity style={ is_female ? styles.selected_selection_button : styles.selection_button } onPress={ () => { this.update_state_pet('gender', 'FEMALE') }}>
            <Text style={ is_female ? styles.selected_selection_title : styles.selection_title }>No</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Button title={ 'Save' }
              loading={this.state.loading_button}
              onPress={ async () => {
                let pet_id       = this.state.pet_id;
                let pet          = this.state.pet;
                let patient_info = {
                  patient_id: pet_id,
                  name: pet.name,
                  type: pet.type,
                  gender: pet.gender,
                  breed: pet.breed,
                  age_num_years: pet.age_num_years,
                  age_num_months: pet.age_num_months,
                  spayed: pet.spayed,
                  neutered: pet.neutered
                }

                this.setState({ loading_button: true });
                let pet_save_response = await PetsController.updatePet(patient_info);

                if(pet_save_response.success) {
                  let success_action = this.props && this.props.route && this.props.route.params && this.props.route.params.success_action ? this.props.route.params.success_action   : () => {  };
                  success_action();
                  this.props.navigation.pop();
                  this.setState({ loading_button: false });
                } else {
                  let error_msg = pet_save_response && pet_save_response.error ? pet_save_response.error : '';
                  this.setState({ loading_save_pet: false, error_message: error_msg, loading_button: false });
                }

              }} />

    </View>
  }

  render_breed_suggestions = () => {
    let original_breed = this.state.original_pet && this.state.original_pet.breed ? this.state.original_pet.breed.toLowerCase() : '';
    let new_breed      = this.state.pet          && this.state.pet.breed          ? this.state.pet.breed.toLowerCase()          : '';

    if (original_breed === new_breed || !new_breed || this.state.pet_breed_selected) {
      return null;
    }

    let breeds = dog_breeds;
        breeds = this.state.pet_type && this.state.pet_type.toLowerCase() === 'cat' ? cat_breeds : breeds;

    let typed_breed = this.state.pet.breed || '';
    let suggestions = breeds.filter((suggestion) => { return suggestion.toLowerCase().includes(typed_breed.toLowerCase()) })

    let sugg_rows = suggestions.map((breed, index) => {
      if (index > 11) { return null }
      return <View>
        <TouchableOpacity style={styles.selection_row_container}
                          onPress={ () => {
                            this.setState({ pet_breed_selected: true });
                            this.update_state_pet('breed', breed);
                          }}>
          <Text style={styles.selection_row_title}>{ breed }</Text>
        </TouchableOpacity>
        <Line />
      </View>
    }).filter((row) => { return row });

    return <View>
      { sugg_rows }
    </View>
  }

  render_add_edit_health_issues = (display) => {
    if (!display) { return null }

    let selected_health_issues = this.state.health_issues;

    let health_issue_rows = health_issues.map((health_issue) => {
      let display_check = selected_health_issues.includes(health_issue);
      return <View>
        <TouchableOpacity style={{ paddingTop: 15, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                          onPress={ () => {
                            let selected_issues = [ ...selected_health_issues ];
                            if (selected_issues.indexOf(health_issue) !== -1) {
                              selected_issues.splice(selected_issues.indexOf(health_issue), 1);
                            } else {
                              selected_issues.push(health_issue);
                            }
                            this.setState({ health_issues: selected_issues });
                          }}>
          <Text style={{ fontWeight: 'medium', fontSize: 16 }}>{ health_issue }</Text>
          { display_check ? <Icon name='check-circle' size={18} color={Colors.PRIMARY} /> : null }
        </TouchableOpacity>
        <Line />
      </View>
    })

    return <View>
      <Text style={styles.section_title}>{ 'Any Health Issues?' }</Text>
      <Line style={{ marginTop: 20 }}/>
      { health_issue_rows }
      <Button title={ 'Next' }
              style={{ marginTop: 20 }}
              onPress={ () => { this.setState({ display_section: 'medications' }) }} />
    </View>
  }

  render_add_edit_medications = (display) => {
    if (!display) { return null }

    return <View>

    </View>
  }

  render_loading_animation = () => {

    return <View style={{ alignItems: 'center', marginTop: 50 }}>
      <LottieView ref={animation => { this.loading_dog_animation = animation }} style={{ width: 130, height: 130 }} source={require('../../assets/animations/dog-trot.json')} />
    </View>
  }

  render_food_name_suggestions = () => {
    let food_names  = this.state.pet_food_suggestions || [];
    let typed_food  = this.state.pet_food || '';
    let suggestions = food_names.filter((suggestion) => { return suggestion.toLowerCase().includes(typed_food.toLowerCase()) })

    let food_suggestion_rows = suggestions.map((food_name) => {
      return <View>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.setState({ pet_food: food_name, food_selected: true }) }}>
          <Text style={styles.selection_row_title}>{ food_name }</Text>
        </TouchableOpacity>
        <Line />
      </View>
    })

    if (food_suggestion_rows.length === 0 && typed_food) {
      food_suggestion_rows.push(<View>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.setState({ pet_food: typed_food, food_selected: true }) }}>
          <Text style={styles.selection_row_title}>{ typed_food }</Text>
        </TouchableOpacity>
        <Line />
      </View>)
    }

    return <View>
      { food_suggestion_rows }
    </View>
  }

  render_food_name_input = () => {
    if (this.state.food_selected) {
      return null;
    }

    return <View>
      <View style={{ height: 15 }} />
      <Input label='Pet Food'
             value={this.state.pet_food}
             style={{ }}
             onChangeText={ (text) => {
               let pet_food_suggestions = this.diet_search_action(text);
               this.setState({ ...this.state, pet_food: text, pet_food_suggestions: pet_food_suggestions });
             }}/>
      <Line style={{ marginTop: 20 }}/>
      { this.render_food_name_suggestions() }
    </View>
  }

  render_diet_quantity_details = () => {
    if (!this.state.food_selected) {
      return null;
    }

    let food_name  = this.state.pet_food;
    let is_dry     = this.state.pet_food_type === 'dry';
    let is_canned  = this.state.pet_food_type === 'canned';

    let cups       = this.state.pet_food_cups;
    let cups_int   = Math.trunc(cups);
    let cups_frac  = Number((cups - cups_int).toFixed(2));
    let frac_str   = cups_frac === 0.25 ? '1/4' : '';
        frac_str   = cups_frac === 0.50 ? '1/2' : frac_str;
        frac_str   = cups_frac === 0.75 ? '3/4' : frac_str;

    let one_time    = this.state.pet_food_times === 1;
    let two_times   = this.state.pet_food_times === 2;
    let three_times = this.state.pet_food_times === 3;
    let four_times  = this.state.pet_food_times === 4;

    return <View style={{ marginBottom: 40 }}>
      <TouchableOpacity onPress={ () => { this.setState({ food_selected: false, pet_food: '' }) }}>
        <Text style={{ fontSize: 16, marginTop: 15 }}>{ food_name }</Text>
        <Text style={{ fontSize: 16, color: Colors.PRIMARY, marginTop: 15 }}>Change Food</Text>
      </TouchableOpacity>
      <Line style={{ marginTop: 20, marginBottom: 20 }} />
      <Text style={styles.input_title}>Food Type</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
        <TouchableOpacity style={ [ is_dry ? styles.selected_diet_selection_button : styles.diet_selection_button, { flex: 1 }] } onPress={ () => { this.setState({ pet_food_type: 'dry' }) }}>
          <Text style={{ fontWeight: 'semibold', fontSize: 15, color: is_dry ? 'white' : '#4c4c4c' }}>Dry</Text>
        </TouchableOpacity>
        <View style={{ width: 10 }} />
        <TouchableOpacity style={ [ is_canned ? styles.selected_diet_selection_button : styles.diet_selection_button, { flex: 1 }] } onPress={ () => { this.setState({ pet_food_type: 'canned' }) }}>
          <Text style={{ fontWeight: 'semibold', fontSize: 15, color: is_canned ? 'white' : '#4c4c4c' }}>Canned</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.input_title}>Cups</Text>
        <View style={{ height: 5 }} />
        <View style={{ flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10, padding: 10, borderRadius: 20, backgroundColor: '#e7e7e7' }}
                              onPress={ () => {
                                this.setState({ pet_food_cups: cups > 0 ? cups - 0.25 : 0 })
                              }}>
              <Icon name='minus-circle' color={ Colors.PRIMARY } size={17} />
              <Text style={{ marginLeft: 5, fontSize: 12 }}>1/4</Text>
            </TouchableOpacity>
            <Icon name='minus-circle' color={ Colors.PRIMARY } size={37} onPress={ () => { this.setState({ pet_food_cups: cups > 0 ? cups - 1 : 0 }) }} />
            <View style={{ flexDirection: 'row', width: 80, justifyContent: 'center' }}>
              <Text style={{ fontSize: 32, width: 30, textAlign: 'center', fontWeight: 'light' }}>{ cups_int.toString() }</Text>
              <Text style={{ fontSize: 18, textAlign: 'center', fontWeight: 'light', marginTop: 15 }}>{ frac_str }</Text>
            </View>
            <Icon name='plus-circle' color={ Colors.PRIMARY } size={40} onPress={ () => { this.setState({ pet_food_cups: cups + 1 }) }} />
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10, padding: 10, borderRadius: 20, backgroundColor: '#e7e7e7' }}
                              onPress={ () => {
                                this.setState({ pet_food_cups: cups + 0.25 })
                              }}>
              <Icon name='plus-circle' color={ Colors.PRIMARY } size={17} />
              <Text style={{ marginLeft: 5, fontSize: 12 }}>1/4</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View>
        <Text style={styles.input_title}>Times A Day</Text>
        <View style={{ flexDirection: 'row', marginBottom: 30 }}>
          <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: one_time ? Colors.PRIMARY : '#e7e7e7', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }} onPress={ () => { this.setState({ pet_food_times: 1 }) }}><Text style={{ color: one_time ? 'white' : '#4c4c4c', fontSize: 15, fontWeight: 'semibold' }}>1</Text></TouchableOpacity>
          <View style={{ width: 5 }} />
          <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: two_times ? Colors.PRIMARY : '#e7e7e7', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }} onPress={ () => { this.setState({ pet_food_times: 2 }) }}><Text style={{ color: two_times ? 'white' : '#4c4c4c', fontSize: 15, fontWeight: 'semibold' }}>2</Text></TouchableOpacity>
          <View style={{ width: 5 }} />
          <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: three_times ? Colors.PRIMARY : '#e7e7e7', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }} onPress={ () => { this.setState({ pet_food_times: 3 }) }}><Text style={{ color: three_times ? 'white' : '#4c4c4c', fontSize: 15, fontWeight: 'semibold' }}>3</Text></TouchableOpacity>
          <View style={{ width: 5 }} />
          <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: four_times ? Colors.PRIMARY : '#e7e7e7', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }} onPress={ () => { this.setState({ pet_food_times: 4 }) }}><Text style={{ color: four_times ? 'white' : '#4c4c4c', fontSize: 15, fontWeight: 'semibold' }}>4</Text></TouchableOpacity>
        </View>
      </View>
      <View>
        <Text style={styles.input_title}>Notes</Text>
        <Input value={this.state.pet_food_notes}
               style={{  }}
               onChangeText={ (text) => {
                 this.setState({ ...this.state, pet_food_notes: text });
               }}/>
        <Button title={ 'Save' }
                style={{ marginTop: 20 }}
                loading={this.state.loading_button}
                onPress={ async () => {
                  let pet_id       = this.state.pet_id;
                  let diet_details = {
                    patient_id: pet_id,
                    food_name: this.state.pet_food,
                    food_type: this.state.pet_food_type,
                    food_quantity_cups: this.state.pet_food_cups,
                    food_times_a_day: this.state.pet_food_times
                  }

                  this.setState({ loading_button: true });

                  if (this.state.add_new) {
                    let diet_create_res = await PetsController.createPetDiet(diet_details);
                    let is_success      = diet_create_res && diet_create_res.success ? true : false;
                    if (is_success) {
                      let success_action = this.props && this.props.route && this.props.route.params && this.props.route.params.success_action ? this.props.route.params.success_action   : () => {  };
                      success_action();
                      this.props.navigation.pop();
                    } else {

                    }
                  } else {
                    let diet_save_res = await PetsController.updatePetDiet(diet_details);
                    let is_success    = diet_save_res && diet_save_res.success ? true : false;
                    if (is_success) {
                      let success_action = this.props && this.props.route && this.props.route.params && this.props.route.params.success_action ? this.props.route.params.success_action   : () => {  };
                      success_action();
                      this.props.navigation.pop();
                    } else {

                    }
                  }

                  this.setState({ loading_button: false });
                }} />
      </View>
    </View>
  }

  render_add_edit_diet = (display) => {
    if (!display) { return null }

    return <View style={{ paddingRight: 20, paddingLeft: 20 }}>
      { this.render_food_name_input()       }
      { this.render_diet_quantity_details() }
    </View>
  }

  render() {

    let screen_title = this.get_screen_title();

    if (this.state.loading_screen) {
      return <Screen title={ screen_title } scroll={true} modal={true} navigation={this.props.navigation}>
        { this.render_loading_animation() }
      </Screen>
    }

    return <Screen title={ screen_title } scroll={true} modal={true} navigation={this.props.navigation}>
      { this.render_new_pet(this.state.display_section       === 'new')  }
      { this.render_edit_bio(this.state.display_section      === 'bio')  }
      { this.render_add_edit_diet(this.state.display_section === 'diet') }
      { this.render_add_edit_health_issues(this.state.display_section === 'health_issues') }
      { this.render_add_edit_medications(this.state.display_section   === 'medications')   }
    </Screen>
  }

  update_state_pet = (key, value) => {
    let updated_pet  = Object.assign({}, this.state.pet);
    updated_pet[key] = value;
    this.setState({ pet: updated_pet });
  }

  get_screen_title = () => {
    let title = 'Pet';
        title = this.state.display_section === 'new'  ? 'Add Pet'  : title;
        title = this.state.display_section === 'bio'  ? 'Pet Bio'  : title;
        title = this.state.display_section === 'diet' ? 'Pet Diet' : title;
        title = this.state.display_section === 'health_issues' ? 'Pet Health Issues' : title;
        title = this.state.display_section === 'medications'   ? 'Pet Medications'   : title;
    return title;
  }

  get_pet = async () => {
    this.setState({ loading_screen: true });
    let pet_id  = this.state.pet_id;
    let pet_res = await PetsController.getPet(pet_id);
    if (pet_res && pet_res.success) {
      let pet  = pet_res && pet_res.data && pet_res.data.pet ? pet_res.data.pet : {};
      let type = pet && pet.type ? pet.type : '';
      this.setState({ pet: pet, original_pet: pet, pet_type: type });
    }
    this.setState({ loading_screen: false });
  }

  get_pet_diet = async () => {
    if (this.state.display_section !== 'diet') { return }
    this.setState({ loading_screen: true });
    let pet_id   = this.state.pet_id;
    let diet_res = await PetsController.getPetDiet({ patient_id: pet_id });

    if (diet_res && diet_res.success) {
      let pet_diet = diet_res && diet_res.data && diet_res.data.pet_diet ? diet_res.data.pet_diet : {};
      this.setState({
        pet_food_notes: '',
        pet_food: pet_diet.food_name,
        pet_food_times: pet_diet.food_times_a_day,
        pet_food_cups: pet_diet.food_quantity_cups,
        pet_food_type: pet_diet.food_type,
        food_selected: true
      });
    }

    this.setState({ loading_screen: false });
  }

  get_pet_food_list = async () => {
    if (this.state.display_section === 'diet') {
      let pet_food_list = await getItem('pet_food_list');
      if(typeof pet_food_list === 'string') {
        pet_food_list = JSON.parse(pet_food_list);
      }
      this.setState({ pet_food_list: pet_food_list });
    }
  }

  diet_search_action = (search_text) => {
    let pet_food_list = this.state.pet_food_list;

          search_text  = search_text.toLowerCase();
    let search_tokens  = search_text.split(' ');
    let search_results = [];

    let search_results_cat = pet_food_list.cat_food_products.filter(obj => {
        return search_tokens.every(term => obj.toLowerCase().includes(term));
    });

    let search_results_dog = pet_food_list.dog_food_products.filter(obj => {
      return search_tokens.every(term => obj.toLowerCase().includes(term));
    });

    if (this.state.pet_type && this.state.pet_type.toLowerCase() === 'dog') {
      search_results = [ ...search_results_dog ];
    }

    if (this.state.pet_type && this.state.pet_type.toLowerCase() === 'cat') {
      search_results = [ ...search_results_cat ];
    }

    if (!this.state.pet_type) {
      search_results = [ ...search_results_dog, ...search_results_cat ];
    }

    search_results.sort((a,b) => { return a < b ? -1 : 1 });

    return search_results;
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
  diet_selection_button: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#e7e7e7',
    padding: 15,
    borderRadius: 12,
    overflow: 'hidden',
    width: '40%'
  },
  selected_diet_selection_button: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    padding: 15,
    overflow: 'hidden',
    width: '40%'
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
  input_title: {
    fontWeight: 'semibold',
    fontSize: 16,
    marginBottom: 10
  },
  selected_type_selection_button: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    height: 95,
    paddingTop: 5
  },
  type_selection_button: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#e7e7e7',
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    height: 95,
    paddingTop: 5
  },
  selected_selection_button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    height: 50
  },
  selection_button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e7e7e7',
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
    height: 50
  },
  selection_title: {
    fontWeight: 'medium',
    fontSize: 15,

    color: '#4c4c4c'
  },
  selected_selection_title: {
    fontWeight: 'medium',
    fontSize: 15,

    color: 'white'
  },
  selection_row_container: {
    flex: 1,
    padding: 20,
    paddingLeft: 0
  },
  selection_row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 30
  },
  selection_row_title: {
    fontSize: 15,
    fontWeight: 'medium',
    color: '#4c4c4c'
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

let health_issues = [
  "Allergies",
  "Eye issues",
  "Dental Disease",
  "Airway issues",
  "Heart disease",
  "Gastrointestinal/Digestive issues",
  "Urinary issues",
  "Kidney Disease",
  "Liver Disease",
  "Diabetes",
  "Cushing’s Disease",
  "Addison’s Disease",
  "Thyroid Disease",
  "Skin Disease",
  "Joint disease",
  "Neck and back issues",
  "Neurological issues"
]

let dog_breeds = [
// 'Select Breed',
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
  // 'Select Breed',
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
