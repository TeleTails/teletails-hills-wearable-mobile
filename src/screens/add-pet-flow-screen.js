import { Component }   from "react";
import LottieView      from 'lottie-react-native';
import { StringUtils } from '../utils';
import { Picker      } from '@react-native-picker/picker';
import { StyleSheet, View, TouchableOpacity, Platform, FlatList, Dimensions } from 'react-native';
import { Screen, Line, Text, Icon, Button, Input, Checkbox, Colors } from '../components';
import { setItem, getItem } from '../../storage';
import { PetsController }   from '../controllers';

class AddPetFlowScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      display_section: '', // 'sign_in', 'pet_name', 'pet_type', 'pet_breed', 'pet_age', 'spayed_neutered', 'greeting_one', 'diet', 'health_issues', 'medications', 'preventatives', 'conclusion', 'calculating', 'final'
      pet_name: '',
      pet_type: '',
      pet_gender: '',
      pet_breed: '',
      pet_age_years: 0,
      pet_age_months: 0,
      pet_is_spayed: '',
      pet_is_neutered: '',
      pet_food: '',
      food_selected: false,
      pet_food_type: '',
      pet_food_cups: 0,
      pet_food_times: 0,
      pet_food_notes: '',
      health_issues: [],
      has_medications: false,
      medication_name: '',
      medications: [],
      pounce_animation_started: false
    }
  }

  componentDidMount = async () => {
    let t               = setInterval(this._onEverySecondProvider, 200);
    let display_section = 'sign_in';
    let token           = await getItem('token');
    let user_id         = await getItem('user_id');

    display_section = token && user_id ? 'pet_name' : 'sign_in';
    // display_section = 'conclusion'

    this.setState({ display_section: display_section, timer_interval: t });
  }

  componentDidUpdate() {
    if (!this.state.pounce_animation_started && this.pounce_animation) {
      this.pounce_animation.play();
      this.setState({ pounce_animation_started: true });
    }
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
  }

  render_progress_bar = () => {
    let section    = this.state.display_section;
    let percentage = '10%';
        percentage = section === 'sign_in'         ? '10%' : percentage;
        percentage = section === 'pet_name'        ? '20%' : percentage;
        percentage = section === 'pet_type'        ? '30%' : percentage;
        percentage = section === 'pet_breed'       ? '40%' : percentage;
        percentage = section === 'pet_age'         ? '50%' : percentage;
        percentage = section === 'spayed_neutered' ? '55%' : percentage;
        percentage = section === 'greeting_one'    ? '60%' : percentage;
        percentage = section === 'diet'            ? '70%' : percentage;
        percentage = section === 'health_issues'   ? '80%' : percentage;
        percentage = section === 'medications'     ? '90%' : percentage;
        percentage = section === 'conclusion'      ? '95%' : percentage;

    return <View style={styles.progress_bar_container}>
      <View style={styles.progress_bar}>
        <View style={{ height: '100%', width: percentage, backgroundColor: Colors.PRIMARY, borderRadius: 20 }}></View>
      </View>
    </View>
  }

  render_sign_in = () => {
    return <View>

    </View>
  }

  render_pet_name = () => {
    if (this.state.display_section !== 'pet_name') { return null }

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Enter Pet Name</Text>
      <Input value={this.state.pet_name}
             style={{ marginTop: 15 }}
             onChangeText={ (text) => {
               this.setState({ ...this.state, pet_name: text });
             }}/>
      <Button title={ 'Next' }
              style={{ marginTop: 20 }}
              onPress={ () => {
                if (this.state.pet_name) {
                  this.setState({ display_section: 'pet_type' })
                }
              }} />
    </View>
  }

  render_pet_gender = () => {
    if (!this.state.pet_type) {
      return null;
    }

    return <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <TouchableOpacity style={ styles.pet_type_button }
                        onPress={ () => {
                          this.setState({ pet_gender: 'MALE', display_section: 'pet_breed' });
                        }}>
        <View>
          <Text style={{ fontWeight: 'medium', fontSize: 15, margin: 20 }}>Male</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={ styles.pet_type_button }
                        onPress={ () => {
                          this.setState({ pet_gender: 'FEMALE', display_section: 'pet_breed' });
                        }}>
        <View style={{  }}>
          <Text style={{ fontWeight: 'medium', fontSize: 15, margin: 20 }}>Female</Text>
        </View>
      </TouchableOpacity>
    </View>
  }

  render_pet_type = () => {
    if (this.state.display_section !== 'pet_type') { return null }

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Select Pet Type</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
        <TouchableOpacity style={ this.state.pet_type === 'Dog' ? styles.selected_pet_type_button : styles.pet_type_button }
                          onPress={ () => {
                            this.setState({ pet_type: 'Dog' });
                          }}>
          <View style={{ flex: 1 }}>
            <LottieView ref={animation => { this.dog_animation = animation }} style={{ width: 120, height: 120, backgroundColor: 'white' }} source={require('../../assets/animations/dog-trot.json')} />
          </View>
          <View>
            <Text style={{ fontWeight: 'medium', fontSize: 15, marginBottom: 20 }}>Dog</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={ this.state.pet_type === 'Cat' ? styles.selected_pet_type_button : styles.pet_type_button }
                          onPress={ () => {
                            this.setState({ pet_type: 'Cat' });
                          }}>
          <View style={{ flex: 1 }}>
            <LottieView ref={animation => { this.cat_animation = animation }} style={{ width: 120, height: 120, backgroundColor: 'white' }} source={require('../../assets/animations/cat-tail-wag.json')} />
          </View>
          <View style={{  }}>
            <Text style={{ fontWeight: 'medium', fontSize: 15, marginBottom: 20 }}>Cat</Text>
          </View>
        </TouchableOpacity>
      </View>
      { this.render_pet_gender() }
    </View>
  }

  render_breed_suggestions = () => {
    let breeds = dog_breeds;
        breeds = this.state.pet_type && this.state.pet_type.toLowerCase() === 'cat' ? cat_breeds : breeds;

    let typed_breed = this.state.pet_breed || '';
    let suggestions = breeds.filter((suggestion) => { return suggestion.toLowerCase().includes(typed_breed.toLowerCase()) })

    let sugg_rows = suggestions.map((breed) => {
      return <View>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.setState({ pet_breed: breed, display_section: 'pet_age' }) }}>
          <Text style={styles.selection_row_title}>{ breed }</Text>
        </TouchableOpacity>
        <Line />
      </View>
    })

    if (sugg_rows.length === 0) {
      sugg_rows.push(<View>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.setState({ pet_breed: typed_breed, display_section: 'pet_age' }) }}>
          <Text style={styles.selection_row_title}>{ typed_breed }</Text>
        </TouchableOpacity>
        <Line />
      </View>)
    }

    return <View>
      { sugg_rows }
    </View>
  }

  render_pet_breed = () => {
    if (this.state.display_section !== 'pet_breed') { return null }

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Select Pet Breed</Text>

      <Input value={this.state.pet_breed}
             style={{ marginTop: 15 }}
             onChangeText={ (text) => {
               this.setState({ ...this.state, pet_breed: text });
             }}/>

      <Line style={{ marginTop: 20, marginBottom: 0 }} />
      { this.render_breed_suggestions() }
    </View>
  }

  render_pet_age = () => {
    if (this.state.display_section !== 'pet_age') { return null }

    let pet_age_years  = this.state.pet_age_years;
    let pet_age_months = this.state.pet_age_months;

    return <View style={[ styles.section_container, { marginTop: '35%', alignItems: 'center' } ]}>
      <Text style={styles.section_title}>Select Pet Age</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginBottom: 30 }}>
        <TouchableOpacity onPress={ () => { this.setState({ pet_age_years: this.state.pet_age_years > 0 ? this.state.pet_age_years - 1 : 0 }) }}>
          <Icon name='minus-circle' color={ Colors.PRIMARY } size={28} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', width: 80, paddingTop: 18 }}>
          <Text style={{ fontSize: 40, fontWeight: 'light' }}>{ pet_age_years }</Text>
          <Text style={{ fontSize: 15 }}>Years</Text>
        </View>
        <TouchableOpacity onPress={ () => { this.setState({ pet_age_years: this.state.pet_age_years + 1 }) }}>
          <Icon name='plus-circle' color={ Colors.PRIMARY } size={30} />
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
        <TouchableOpacity onPress={ () => { this.setState({ pet_age_months: this.state.pet_age_months > 0 ? this.state.pet_age_months - 1 : 0 }) }}>
          <Icon name='minus-circle' color={ Colors.PRIMARY } size={28} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center', width: 80, paddingTop: 18 }}>
          <Text style={{ fontSize: 40, fontWeight: 'light' }}>{ pet_age_months }</Text>
          <Text style={{ fontSize: 15 }}>Months</Text>
        </View>
        <TouchableOpacity onPress={ () => { this.setState({ pet_age_months: this.state.pet_age_months < 11 ? this.state.pet_age_months + 1 : 11 }) }}>
          <Icon name='plus-circle'  color={ Colors.PRIMARY } size={30} />
        </TouchableOpacity>
      </View>
      { this.state.pet_age_years > 0 || this.state.pet_age_months > 0 ? <Button title={ 'Next' } style={{ marginTop: 40 }} onPress={ () => { this.setState({ display_section: 'spayed_neutered' }) }} /> : null }
    </View>
  }

  render_spayed_neutered = () => {
    if (this.state.display_section !== 'spayed_neutered') { return null }

    let is_male   = this.state.pet_gender === 'MALE';
    let is_female = this.state.pet_gender === 'FEMALE';
    let spayed_neutered_title = is_male ? 'Is ' + this.state.pet_name +' Neutered?' : 'Is ' + this.state.pet_name + ' Spayed?';

    return <View style={[ styles.section_container, { marginTop: '50%', alignItems: 'center' } ]}>
      <Text style={styles.section_title}>{ spayed_neutered_title }</Text>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 15 }}>
        <TouchableOpacity style={ styles.pet_type_button }
                          onPress={ () => { this.setState({ pet_is_spayed: true, pet_is_neutered: true, display_section: 'greeting_one' }) }}>
          <View>
            <Text style={{ fontWeight: 'medium', fontSize: 15, margin: 15 }}>Yes</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={ styles.pet_type_button }
                          onPress={ () => { this.setState({ pet_is_spayed: false, pet_is_neutered: false, display_section: 'greeting_one' }) }}>
          <View style={{  }}>
            <Text style={{ fontWeight: 'medium', fontSize: 15, margin: 15 }}>No</Text>
          </View>
        </TouchableOpacity>
      </View>

    </View>
  }

  render_greeting_one = () => {
    if (this.state.display_section !== 'greeting_one') { return null }

    let window        =  Dimensions.get('window');
    let window_height = window && window.height ? window.height - 200 : 800;

    return <View style={[ styles.section_container, { height: window_height } ]}>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <LottieView loop={true} ref={animation => { this.pounce_animation = animation }} style={{ width: 200, height: 200, alignSelf: 'center' }} source={require('../../assets/animations/dog-pouncing.json')} />
      </View>
      <View style={{ height: 130, alignItems: 'center' }}>
        <Text style={{ textAlign: 'center', fontSize: 19, fontWeight: 'semibold' }}>{ "We can't wait to meet " + this.state.pet_name }</Text>
        <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'regular', marginTop: 10 }}>Sharing more details ensures our team delivers personalized care. It'll only take a moment!</Text>
      </View>
      <Button title={ 'Continue' } onPress={ () => { this.setState({ display_section: 'diet' }) }} />
    </View>
  }

  render_food_name_suggestions = () => {
    let food_names = [
      "Hill's Science Diet Adult Perfect Weight Hearty Vegetable & Chicken Stew Canned Dog Food",
      "Hill's Science Diet Adult Perfect Weight Small & Mini Chicken Recipe Dry Dog Food",
      "Hill's Prescription Diet ONC Care Dry Dog Food"
    ]

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

    if (food_suggestion_rows.length === 0) {
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

  render_diet_food_name = (display) => {
    if (!display) { return null }

    return <View>
      <View style={{ height: 15 }} />
      <Input label='Pet Food'
             value={this.state.pet_food}
             style={{ }}
             onChangeText={ (text) => {
               this.setState({ ...this.state, pet_food: text });
             }}/>
      <Line style={{ marginTop: 20, marginBottom: 20 }}/>
      { this.render_food_name_suggestions() }
    </View>
  }

  render_diet_quantity = (display) => {
    if (!display) { return null }

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

    let display_next = (is_dry || is_canned) && cups && this.state.pet_food_times && this.state.food_selected;

    return <View>
      <TouchableOpacity onPress={ () => { this.setState({ food_selected: false, pet_food: '' }) }}>
        <Text style={{ fontSize: 16, marginTop: 15 }}>{ food_name }</Text>
        <Text style={{ fontSize: 16, color: Colors.PRIMARY, marginTop: 15 }}>Change Food</Text>
      </TouchableOpacity>
      <Line style={{ marginTop: 20, marginBottom: 20 }} />
      <Text style={styles.food_quantity_titles}>Food Type</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
        <TouchableOpacity style={ [ is_dry ? styles.selected_diet_selection_button : styles.diet_selection_button, { flex: 1 }] } onPress={ () => { this.setState({ pet_food_type: 'dry' }) }}>
          <Text style={{ fontWeight: 'semibold', fontSize: 15, color: is_dry ? 'white' : '#4c4c4c' }}>Dry</Text>
        </TouchableOpacity>
        <View style={{ width: 10 }} />
        <TouchableOpacity style={ [ is_canned ? styles.selected_diet_selection_button : styles.diet_selection_button, { flex: 1 }] } onPress={ () => { this.setState({ pet_food_type: 'canned' }) }}>
          <Text style={{ fontWeight: 'semibold', fontSize: 15, color: is_canned ? 'white' : '#4c4c4c' }}>Canned</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.food_quantity_titles}>Cups</Text>
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
      <Text style={styles.food_quantity_titles}>Times A Day</Text>
      <View style={{ flexDirection: 'row', marginBottom: 30 }}>
        <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: one_time ? Colors.PRIMARY : '#e7e7e7', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }} onPress={ () => { this.setState({ pet_food_times: 1 }) }}><Text style={{ color: one_time ? 'white' : '#4c4c4c', fontSize: 15, fontWeight: 'semibold' }}>1</Text></TouchableOpacity>
        <View style={{ width: 5 }} />
        <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: two_times ? Colors.PRIMARY : '#e7e7e7', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }} onPress={ () => { this.setState({ pet_food_times: 2 }) }}><Text style={{ color: two_times ? 'white' : '#4c4c4c', fontSize: 15, fontWeight: 'semibold' }}>2</Text></TouchableOpacity>
        <View style={{ width: 5 }} />
        <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: three_times ? Colors.PRIMARY : '#e7e7e7', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }} onPress={ () => { this.setState({ pet_food_times: 3 }) }}><Text style={{ color: three_times ? 'white' : '#4c4c4c', fontSize: 15, fontWeight: 'semibold' }}>3</Text></TouchableOpacity>
        <View style={{ width: 5 }} />
        <TouchableOpacity style={{ flex: 1, padding: 12, backgroundColor: four_times ? Colors.PRIMARY : '#e7e7e7', alignItems: 'center', justifyContent: 'center', borderRadius: 12 }} onPress={ () => { this.setState({ pet_food_times: 4 }) }}><Text style={{ color: four_times ? 'white' : '#4c4c4c', fontSize: 15, fontWeight: 'semibold' }}>4</Text></TouchableOpacity>
      </View>
      <Text style={styles.food_quantity_titles}>Notes</Text>
      <Input value={this.state.pet_food_notes}
             style={{  }}
             onChangeText={ (text) => {
               this.setState({ ...this.state, pet_food_notes: text });
             }}/>
       { display_next ? <Button title={ 'Next' }
                                style={{ marginTop: 20 }}
                                onPress={ () => { this.setState({ display_section: 'health_issues' }) }} />
                      : null }
    </View>
  }

  render_diet = () => {
    if (this.state.display_section !== 'diet') { return null }

    let section_title = this.state.pet_name + "'s Diet";

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>{ section_title }</Text>
      { this.render_diet_food_name(!this.state.food_selected) }
      { this.render_diet_quantity(this.state.food_selected)  }
    </View>
  }

  render_health_issues = () => {
    if (this.state.display_section !== 'health_issues') { return null }

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
          { display_check ? <Icon name='check-circle' size={17} /> : null }
        </TouchableOpacity>
        <Line />
      </View>
    })

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>{ 'Any Health Issues?' }</Text>
      <Line />
      { health_issue_rows }
      <Button title={ 'Next' }
              style={{ marginTop: 20 }}
              onPress={ () => { this.setState({ display_section: 'medications' }) }} />
    </View>
  }

  render_medication_list = () => {
    if (!this.state.has_medications) { return null }

    let medications  = this.state.medications || [];
    let display_next = medications.length > 0 ? true : false;

    let med_name_rows = medications.map((medication_name, idx) => {
      return <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 20, paddingBottom: 20, justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 16, fontWeight: 'medium' }}>{ medication_name }</Text>
          <Icon name='close'
                size={18}
                onPress={ () => {
                  let medications_arr = [ ...medications ];
                  medications_arr.splice(idx, 1);
                  this.setState({ medications: medications_arr });
                }}/>
        </View>
        <Line />
      </View>
    })

    return <View style={{ paddingTop: 15 }}>
      <Input value={this.state.medication_name}
             label='Medication Name'
             style={{  }}
             onChangeText={ (text) => {
               this.setState({ ...this.state, medication_name: text });
             }}/>
      <Button title={ 'Add' }
              style={{ marginTop: 10, alignSelf: 'flex-end' }}
              onPress={ () => {
                if (this.state.medication_name) {
                  let meds_array = [ ...this.state.medications ];
                  meds_array.push(this.state.medication_name)
                  this.setState({ medications: meds_array, medication_name: '' })
                }
              }} />
      <Line style={{ marginTop: 20 }} />
      { med_name_rows }
      { display_next ? <Button title={ 'Next' }
                               style={{ marginTop: 20 }}
                               onPress={ () => { this.setState({ display_section: 'conclusion' }) }} /> : null }
    </View>
  }

  render_medications = () => {
    if (this.state.display_section !== 'medications') { return null }

    let display_next = false;
    let display_meds = false;

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>{ 'Medications?' }</Text>

      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <TouchableOpacity style={ [ this.state.has_medications ? styles.selected_diet_selection_button : styles.diet_selection_button, { flex: 1 } ] }
                          onPress={ () => { this.setState({ has_medications: true }) }}>
          <View>
            <Text style={{ fontWeight: 'semibold', fontSize: 15, color: this.state.has_medications ? 'white' : '#4c4c4c' }}>Yes</Text>
          </View>
        </TouchableOpacity>
        <View style={{ width: 5 }} />
        <TouchableOpacity style={ [ styles.diet_selection_button, { flex: 1 } ] }
                          onPress={ () => { this.setState({ display_section: 'conclusion', has_medications: false }) }}>
          <View style={{  }}>
            <Text style={{ fontWeight: 'semibold', fontSize: 15, color: '#4c4c4c' }}>No</Text>
          </View>
        </TouchableOpacity>
      </View>

      { this.render_medication_list() }

      { display_next ? <Button title={ 'Next' }
                               style={{ marginTop: 20 }}
                               onPress={ () => { this.setState({  }) }} /> : null }
    </View>
  }

  render_conclusion = () => {
    if (this.state.display_section !== 'conclusion') { return null }

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>{ 'Conclusion' }</Text>
      <View style={{ marginTop: 240 }}>
        <Icon name='check-circle' size={50} color={Colors.GREEN} />
      </View>
    </View>
  }

  render() {
    return <Screen title='Add Pet' scroll={true} navigation={this.props.navigation} left_action={this.back_button_action}>
      { this.render_progress_bar()    }
      { this.render_sign_in()         }
      { this.render_pet_name()        }
      { this.render_pet_type()        }
      { this.render_pet_breed()       }
      { this.render_pet_age()         }
      { this.render_spayed_neutered() }
      { this.render_greeting_one()    }
      { this.render_diet()            }
      { this.render_health_issues()   }
      { this.render_medications()     }
      { this.render_conclusion()      }
    </Screen>
  }

  back_button_action = () => {
    let current_display_section = this.state.display_section;

    let new_display_section = current_display_section === 'pet_type'  ? 'pet_name'  : new_display_section;
        new_display_section = current_display_section === 'pet_breed' ? 'pet_type'  : new_display_section;
        new_display_section = current_display_section === 'pet_age'   ? 'pet_breed' : new_display_section;
        new_display_section = current_display_section === 'spayed_neutered' ? 'pet_age'           : new_display_section;
        new_display_section = current_display_section === 'greeting_one'    ? 'spayed_neutered'   : new_display_section;
        new_display_section = current_display_section === 'diet'            ? 'greeting_one'      : new_display_section;
        new_display_section = current_display_section === 'health_issues'   ? 'diet'              : new_display_section;
        new_display_section = current_display_section === 'medications'     ? 'health_issues'     : new_display_section;
        new_display_section = current_display_section === 'conclusion'      ? 'medications'       : new_display_section;

    if (current_display_section === 'pet_name' || current_display_section === 'sign_in') {
      this.props.navigation.pop();
    } else {
      this.setState({ display_section: new_display_section, started_animation: false })
    }
  }

}

export default AddPetFlowScreen;

const styles = StyleSheet.create({
  food_quantity_titles: {
    fontWeight: 'semibold',
    fontSize: 16,
    marginBottom: 10
  },
  pet_type_button: {
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DFE3E4',
    borderRadius: 16,
    overflow: 'hidden',
    width: '40%',
    margin: 5
  },
  selected_pet_type_button: {
    flexDirection: 'column',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
    borderRadius: 16,
    overflow: 'hidden',
    width: '40%',
    margin: 5
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
  progress_bar_container: {
    paddingRight: 20,
    paddingLeft: 20,
    marginTop: 20,
    marginBottom: 20
  },
  progress_bar: {
    height: 10,
    borderRadius: 20,
    backgroundColor: '#e7e7e7'
  },
  section_container: {
    paddingRight: 20,
    paddingLeft: 20
  },
  section_title: {
    fontSize: 18,
    fontWeight: 'medium',
    color: '#0054A4'
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
    fontWeight: 'medium'
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
  'Affenpinscher',
  'Afghan Hound',
  'Airedale Terrier',
  'Akbash',
  'Akita',
  'Alaskan Malamute',
  'American Eskimo Dog',
  'American Pit Bull Terrier',
  'American Staffordshire Terrier',
  'American Water Spaniel',
  'Anatolian Shepherd',
  'Australian Cattle Dog',
  'Australian Kelpie',
  'Australian Shepherd',
  'Australian Terrier',
  'Basenji',
  'Basset Hound',
  'Beagle',
  'Bearded Collie',
  'Bedlington Terrier',
  'Belgian Malinois',
  'Belgian Sheepdog',
  'Belgian Tervuren',
  'Bernese Mountain Dog',
  'Bichon Frise',
  'Black and Tan Coonhound',
  'Bloodhound',
  'Boerboel',
  'Border Collie',
  'Border Terrier',
  'Borzoi',
  'Boston Terrier',
  'Bouvier des Flandres',
  'Boxer',
  'Briard',
  'Brittany',
  'Brussels Griffon',
  'Bull Terrier',
  'Bulldog',
  'Bullmastiff',
  'Cairn Terrier',
  'Canaan Dog',
  'Cavalier King Charles Spaniel',
  'Chesapeake Bay Retriever',
  'Chihuahua',
  'Chinese Crested',
  'Chinese Shar-Pei',
  'Chow Chow',
  'Clumber Spaniel',
  'Cocker Spaniel',
  'Collie',
  'Curly-Coated Retriever',
  'Dachshund',
  'Dalmatian',
  'Doberman Pinscher',
  'English Cocker Spaniel',
  'English Setter',
  'English Springer Spaniel',
  'English Toy Spaniel',
  'Field Spaniel',
  'Finnish Spitz',
  'Flat-Coated Retriever',
  'Fox Terrier (Smooth)',
  'Fox Terrier (Wire)',
  'Foxhound (American)',
  'Foxhound (English)',
  'French Bulldog',
  'German Pinscher',
  'German Shepherd Dog',
  'German Shorthaired Pointer',
  'German Spitz Klein',
  'German Wirehaired Pointer',
  'Giant Schnauzer',
  'Golden Retriever',
  'Gordon Setter',
  'Great Dane',
  'Great Pyrenees',
  'Greater Swiss Mountain Dog',
  'Greyhound',
  'Harrier',
  'Havanese',
  'Ibizan Hound',
  'Icelandic Sheepdog',
  'Irish Setter',
  'Irish Terrier',
  'Irish Water Spaniel',
  'Irish Wolfhound',
  'Italian Greyhound',
  'Jack Russell Terrier',
  'Japanese Chin',
  'Keeshond',
  'Kerry Blue Terrier',
  'Komondor',
  'Kooikerrhondje',
  'Kuvasz',
  'Labrador Retriever',
  'Lakeland Terrier',
  'Lhasa Apso',
  'Lowchen',
  'Maltese',
  'Manchester Terrier',
  'Mastiff',
  'Miniature Bull Terrier',
  'Miniature Pinscher',
  'Miniature Schnauzer',
  'Mixed Breed Large - Over 25kg',
  'Mixed Breed Medium - 10-25kg / 22-55 lbs',
  'Mixed Breed Small - Under 10kg / 22 lbs',
  'Newfoundland',
  'Norfolk Terrier',
  'Norwegian Elkhound',
  'Norwegian Lundehund',
  'Norwich Terrier',
  'Old English Sheepdog',
  'Otterhound',
  'Papillon',
  'Pekingese',
  'Petits Bassets Griffons Vendeen',
  'Pharaoh Hound',
  'Plott Hound',
  'Pointer',
  'Polish Lowland Sheepdog',
  'Pomeranian',
  'Poodle',
  'Portuguese Water Dog',
  'Pug',
  'Puli',
  'Redbone Coonhound',
  'Rhodesian Ridgeback',
  'Rottweiler',
  'Saint Bernard',
  'Saluki',
  'Samoyed',
  'Schipperke',
  'Schnauzer',
  'Scottish Deerhound',
  'Scottish Terrier',
  'Sealyham Terrier',
  'Shar Pei',
  'Shetland Sheepdog',
  'Shiba Inu',
  'Shih Tzu',
  'Siberian Husky',
  'Silky Terrier',
  'Skye Terrier',
  'Soft Coated Wheaten Terrier',
  'Spinone Italiano',
  'Staffordshire Bull Terrier',
  'Standard Schnauzer',
  'Sussex Spaniel',
  'Tibetan Spaniel',
  'Tibetan Terrier',
  'Toy Fox Terrier',
  'Toy Manchester Terrier',
  'Vizsla',
  'Weimaraner',
  'Welsh Corgi (Cardigan)',
  'Welsh Corgi (Pembroke)',
  'Welsh Springer Spaniel',
  'Welsh Terrier',
  'West Highland White Terrier',
  'Whippet',
  'Wirehaired Pointing Griffon',
  'Yorkshire Terrier',
  'Mixed Breed - Under 55 lbs',
  'Mixed Breed - Over 55 lbs'
]

let cat_breeds = [
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
  'Chartreux',
  'Colorpoint Shorthair',
  'Cornish Rex',
  'Devon Rex',
  'Domestic Long Hair',
  'Domestic Short Hair',
  'Egyptian Mau',
  'European Burmese',
  'European Short Hair',
  'Exotic',
  'Havana Brown',
  'Japanese Bobtail',
  'Javanese',
  'Korat',
  'LaPerm',
  'Maine Coon',
  'Manx',
  'Munchkin',
  'Norwegian Forest Cat',
  'Ocicat',
  'Oriental',
  'Persian',
  'Ragdoll',
  'Russian Blue',
  'Scottish Fold',
  'Selkirk Rex',
  'Siamese',
  'Siberian',
  'Singapura',
  'Somali',
  'Sphynx',
  'Tonkinese',
  'Turkish Angora',
  'Turkish Van',
  'Mixed Breed'
]
