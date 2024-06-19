import { Component } from 'react';
import LottieView    from 'lottie-react-native';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { AuthController, PetsController, WearablesController }   from '../controllers';
import { StringUtils    }   from '../utils';
import { setItem, getItem } from '../../storage';
import { Picker      } from '@react-native-picker/picker';
import { Text, Line, Icon, Colors, Input, Button } from '../components';
import { BarChart, LineChart, PieChart, PopulationPyramid } from "react-native-gifted-charts";
import { SignIn } from '../containers';
import Svg, { Circle, Path } from 'react-native-svg';

class HealthTab extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pets: [],
      selected_pet: {},
      display_pet_selection: false,
      behavior_data: {},
      weight_history: {},
      pet_weight: 0,
      display_weight_input: false,
      behavior_data_loaded: false,
      loading_add_weight: false,
      loading_pull_pets: false
    }
  }

  pull_pets = async () => {
    this.setState({ loading_pull_pets: true });

    let user_pets_response = await WearablesController.getUserPets({});
    let pets               = user_pets_response && user_pets_response.data && user_pets_response.data.pets ? user_pets_response.data.pets : [];
    let selected_pet       = pets && pets.length > 0 && pets[0] ? pets[0] : {};

    if (this.state.selected_pet && this.state.selected_pet.petID) {
      selected_pet = this.state.selected_pet;
    }

    let pet_id = selected_pet && selected_pet.petID ? selected_pet.petID : '';

    this.pull_selected_pet_data(pet_id);

    this.setState({ pets: pets, selected_pet: selected_pet, loading_pull_pets: false })
  }

  pull_selected_pet_data = async (pet_id) => {
    this.setState({ loading_behavior_data: true });

    this.getIntakeData(pet_id);

    let behavior_response = await WearablesController.getPetBehavior({ pet_id: pet_id });
    let behavior_data     = behavior_response && behavior_response.data && behavior_response.data.bahavior_data && behavior_response.data.bahavior_data.forwardMotionInfo ? behavior_response.data.bahavior_data : {};

    let weight_response   = await WearablesController.getPetWeightHistory({ pet_id: pet_id });
    let weight_history    = weight_response && weight_response.data && weight_response.data.weight_history ? weight_response.data.weight_history : {};

    this.setState({ behavior_data: behavior_data, weight_history: weight_history, loading_behavior_data: false, behavior_data_loaded: true })
  }

  getIntakeData = async (pet_id) => {
    let today = new Date();

    let { selected_pet } = this.state;

    if(!pet_id) {
      pet_id = selected_pet.petID;
    }

    let diet_data = {
      pet_id, 
      date: `${today.getFullYear()}-${today.getMonth() < 9 ? '0' : ''}${today.getMonth() + 1}-${today.getDate()}`
    }

    let recommended_diet = await WearablesController.getRecommendedDiet(diet_data);

    recommended_diet = recommended_diet && recommended_diet.data && recommended_diet.data.recommended_diet ? recommended_diet.data.recommended_diet : [];

    console.log('recommended_diet', recommended_diet)

    let intake_data = {
      toDate: `${today.getFullYear()}-${today.getMonth() < 9 ? '0' : ''}${today.getMonth() + 1}-${today.getDate()}`,
      pet_id
    }

    let intake = await WearablesController.getPetIntake(intake_data);

    let intake_config = await WearablesController.getPetIntakeConfig(intake_data);
    //{"data": {"config": {"dietFeedback": [Array], "measurementUnits": [Array], "otherFoods": [Array], "recommendedDiet": [Array]}}, "success": true}
    //console.log('intake_config', intake_config);
    intake_config = intake_config && intake_config.data && intake_config.data.config ? intake_config.data.config : null;

    let intake_measurement_units = intake_config && intake_config.measurementUnits ? intake_config.measurementUnits : [];

    let intake_other_foods = intake_config && intake_config.otherFoods ? intake_config.otherFoods : [];

    let intake_diet_feedback = intake_config && intake_config.dietFeedback ? intake_config.dietFeedback : [];

    /* console.log('intake_measurement_units', JSON.stringify(intake_measurement_units));
    console.log('intake_other_foods', JSON.stringify(intake_other_foods));
    console.log('intake_diet_feedback', JSON.stringify(intake_diet_feedback));
 */
    //{ "data": { "get_intake_config_res": { "data": [Object], "success": true }, "get_intake_history_res": { "data": [Object], "success": true }, "get_intake_list_res": { "data": [Object], "success": true } }, "success": true }

    let intake_history = intake && intake.data && intake.data.intake_history ? intake.data.intake_history : [];

    let intake_list = intake && intake.data && intake.data.intake_list ? intake.data.intake_list : []

    //console.log('intake2', intake_list);

    this.setState({recommended_diet, intake_history, intake_measurement_units, intake_other_foods, intake_diet_feedback, intake_data_loaded: true, intake_list, display_diet_input: false, loading_add_diet: false });
  }

  removeIntake = async (intake, intakeDate) => {
    console.log('intake', intake)

    let { selected_pet } = this.state;

    let { intakeId } = intake

    let pet_id = selected_pet.petID;

    let intake_data = {
      foodIntakeHistory: {
        ...intake,
        isDeleted: 1
      },
      intakeId,
      pet_id,
      intakeDate
    }

    console.log('intake_data', intake_data)

    let intake_res = await WearablesController.deletePetIntake(intake_data);
console.log('intake_res', JSON.stringify(intake_res))
    if(intake_res && intake_res.success) {
      this.getIntakeData();
    } else {
      this.setState({intake_error_message: "There was an error adding your intake"})
    }
  }

  addIntake = async () => {
    this.setState({loading_add_diet: true}, async ()=>{
      let { 
        otherFoodTypeName,
        foodName,
        isOtherFood,
        intake_other_foods,
        otherFoodSelectedIndex,
        percentConsumed, 
        selected_pet,
        recommendedDietSelectedIndex,
        recommended_diet, 
        quantityOffered, 
        quantityConsumed } = this.state;

      let pet_id = selected_pet.petID;

      let intake_data = {};

      console.log('isOtherFood', isOtherFood)
      if(isOtherFood) {
        otherFoodSelectedIndex = otherFoodSelectedIndex ? otherFoodSelectedIndex : 0;
        let food = intake_other_foods[otherFoodSelectedIndex];

        otherFoodTypeId = food.otherFoodId;
        otherFoodTypeName = food.otherFoodType;

        intake_data = { 
          pet_id,
          otherFoodTypeName,
          foodName,
          isOtherFood,
          otherFoodTypeId,
          percentConsumed };
      } else {
        recommendedDietSelectedIndex = recommendedDietSelectedIndex ? recommendedDietSelectedIndex : 0;
        let selected_recommended_diet = recommended_diet[recommendedDietSelectedIndex];

        console.log('selected_recommended_diet', selected_recommended_diet)

        intake_data = { 
          pet_id,
          isOtherFood: false,
          quantityOffered,
          percentConsumed,
          quantityConsumed,
          ...selected_recommended_diet
        };
      }

      console.log('intake_data2', intake_data)

      let intake = await WearablesController.addPetIntake(intake_data);
  console.log('intake_res', intake)
      if(intake && intake.success) {
        this.getIntakeData();
      } else {
        this.setState({intake_error_message: "There was an error adding your intake", loading_add_diet: false})
      }
    });
  }

  componentDidMount = async () => {
    this.pull_pets();
    let user              = await AuthController.getUser(true);
    let wearables_user_id = user && user.wearables_user_id || '';
    this.setState({ wearables_user_id: wearables_user_id })
  }

  pet_selected_action = async (pet) => {
    let pet_id = pet && pet.petID ? pet.petID : '';
    this.pull_selected_pet_data(pet_id);
    this.setState({ display_pet_selection: false, selected_pet: pet, diet: null });
  }

  render_pet_selection_list = () => {
    let pets            = this.state.pets;
    let selected_pet_id = this.state.selected_pet && this.state.selected_pet.petID ? this.state.selected_pet.petID : '';

    if (!this.state.display_pet_selection) {
      return null;
    }

    let pet_rows = pets.map((pet, idx) => {
      let pet_id      = pet.petID;
      let is_selected = selected_pet_id === pet_id;
      let pet_name    = pet.petName;
      return <View key={pet_id}>
        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 }}
                                 onPress={ () => {
                                   this.pet_selected_action(pet);
                                 }}>
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

  render_pet_section = () => {
    let pet        = this.state.selected_pet;
    let pets       = this.state.pets;
    let pet_name   = pet.petName;
    let single_pet = pets && pets.length === 1;
    let switch_ttl = this.state.display_pet_selection ? 'Done' : 'Switch Pet';

    return <View>
      <View>
        <View style={{ backgroundColor: Colors.PRIMARY, padding: 20, paddingBottom: 0, borderTopRightRadius: 15, borderTopLeftRadius: 15 }}>
          <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 20, alignItems: 'center' }}
                            onPress={ () => { this.setState({ display_pet_selection: !this.state.display_pet_selection }) }}>
           { this.state.loading_pull_pets ? <LottieView autoPlay style={{ width: 25, height: 25 }} source={ require('../../assets/animations/white-spinner.json') } />
                                          : <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'white' }}>{ pet_name }</Text> }
            <Text style={{ fontSize: 16, color: 'white' }}>{ single_pet ? '' : switch_ttl }</Text>
          </TouchableOpacity>
          { this.render_pet_selection_list()    }
        </View>
      </View>
    </View>
  }

  render_forward_motion_bar_chart = () => {
    let behavior_data = this.state.behavior_data;

    let yesterday     = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.previousDayForwardMotion ? behavior_data.forwardMotionInfo.previousDayForwardMotion : 0;
    let today_so_far  = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.todayForwardMotionSofar  ? behavior_data.forwardMotionInfo.todayForwardMotionSofar  : 0;

    let yest_minutes  = (yesterday/60).toFixed(1);
    let toda_minutes  = (today_so_far/60).toFixed(1);

    let yest_string   = this.seconds_to_hms(yesterday);
    let toda_string   = this.seconds_to_hms(today_so_far);

    let window        = Dimensions.get('window');
    let window_width  = window && window.width  ? window.width : 300;
    let window_height = window && window.height ? window.height : 300;

    yest_minutes = parseFloat(yest_minutes);
    toda_minutes = parseFloat(toda_minutes);

    let barData = [
        { spacing: window_width/5, value: 0, frontColor: '#ED6665'},
        { value: yest_minutes, spacing: 2, labelTextStyle: {color: 'gray'}, frontColor: '#ED6665' },
        { value: toda_minutes, frontColor: '#177AD5' },
        { spacing: window_width/5, value: 0, frontColor: '#ED6665'},
    ];

    return <View>
        <View style={{ margin: 20, backgroundColor: 'white', borderRadius: 12, padding: 10, paddingTop: 20 }}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, marginBottom: 5, color: Colors.DARK_GREY }}>Total Forward Motion</Text>
          <Text style={{ fontWeight: 'medium', fontSize: 12, color: 'grey', marginLeft: 3, marginBottom: 10 }}>Mins</Text>
          <BarChart
              data={barData}
              barWidth={18}
              spacing={24}
              roundedTop
              roundedBottom
              hideRules={false}
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: 'gray' }}
              noOfSections={4}
              height={140}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5 }}>
              <View style={{ alignItems: 'center', width: 130 }}>
                <View style={{ backgroundColor: '#ED6665', height: 12, width: 12, borderRadius: 6, marginBottom: 5 }} />
                <Text style={{ fontWeight: 'medium', fontSize: 13 }}>Total Yesterday</Text>
                <Text style={{ fontSize: 13 }}>{ yest_string }</Text>
              </View>
              <View style={{ width: 20 }} />
              <View style={{ alignItems: 'center', width: 130 }}>
                <View style={{ backgroundColor: '#177AD5', height: 12, width: 12, borderRadius: 6, marginBottom: 5 }} />
                <Text style={{ fontWeight: 'medium', fontSize: 13 }}>Today So Far</Text>
                <Text style={{ fontSize: 13 }}>{ toda_string }</Text>
              </View>
            </View>
        </View>
    </View>
  }

  render_sleep_bar_chart = () => {
    let behavior_data = this.state.behavior_data;

    let yesterday     = behavior_data.sleepInfo && behavior_data.sleepInfo.previousDayTotalSleep ? behavior_data.sleepInfo.previousDayTotalSleep : 0;
    let today_so_far  = behavior_data.sleepInfo && behavior_data.sleepInfo.todayTotalSleepSofar  ? behavior_data.sleepInfo.todayTotalSleepSofar  : 0;

    let yest_minutes  = (yesterday/60).toFixed(1);
    let toda_minutes  = (today_so_far/60).toFixed(1);

    let yest_string   = this.seconds_to_hms(yesterday);
    let toda_string   = this.seconds_to_hms(today_so_far);

    let window        = Dimensions.get('window');
    let window_width  = window && window.width  ? window.width : 300;
    let window_height = window && window.height ? window.height : 300;

    let barData = [
        { spacing: window_width/5, value: 0, frontColor: '#ED6665'},
        { value: parseInt(yest_minutes), spacing: 2, labelTextStyle: {color: 'gray'}, frontColor: '#ED6665' },
        { value: parseInt(toda_minutes), frontColor: '#177AD5' },
        { spacing: window_width/5, value: 0, frontColor: '#ED6665'},
    ];

    return <View>
        <View style={{ margin: 20, marginTop: 0, marginBottom: 0, backgroundColor: 'white', borderRadius: 12, padding: 10, paddingTop: 20 }}>
          <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, marginBottom: 5, color: Colors.DARK_GREY }}>Total Sleep</Text>
          <Text style={{ fontWeight: 'medium', fontSize: 12, color: 'grey', marginLeft: 3, marginBottom: 10 }}>Mins</Text>
          <BarChart
              data={barData}
              barWidth={18}
              spacing={24}
              roundedTop
              roundedBottom
              hideRules={false}
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: 'gray' }}
              noOfSections={4}
              height={140}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 5 }}>
              <View style={{ alignItems: 'center', width: 130 }}>
                <View style={{ backgroundColor: '#ED6665', height: 12, width: 12, borderRadius: 6, marginBottom: 5 }} />
                <Text style={{ fontWeight: 'medium', fontSize: 13 }}>Total Yesterday</Text>
                <Text style={{ fontSize: 13 }}>{ yest_string }</Text>
              </View>
              <View style={{ width: 20 }} />
              <View style={{ alignItems: 'center', width: 130 }}>
                <View style={{ backgroundColor: '#177AD5', height: 12, width: 12, borderRadius: 6, marginBottom: 5 }} />
                <Text style={{ fontWeight: 'medium', fontSize: 13 }}>Today So Far</Text>
                <Text style={{ fontSize: 13 }}>{ toda_string }</Text>
              </View>
            </View>
        </View>
    </View>
  }

  render_data_squares = () => {

    let behavior_data = this.state.behavior_data;
    let walking       = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.walking ? behavior_data.forwardMotionInfo.walking : 9300;
    let running       = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.running ? behavior_data.forwardMotionInfo.running : 1900;

    let walking_str = this.seconds_to_hms(walking);
    let running_str = this.seconds_to_hms(running);

    return <View style={{ marginTop: 0, marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        <View style={{ height: 100, width: '45%', backgroundColor: Colors.PRIMARY, borderRadius: 25, padding: 20, paddingTop: 15 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Walking</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 16 }}>{ walking_str }</Text>
          </View>
        </View>
        <View style={{ width: 10 }} />
        <View style={{ height: 100, width: '45%', backgroundColor: Colors.PRIMARY, borderRadius: 25, padding: 20, paddingTop: 15 }}>
          <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }}>Running</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text style={{ color: 'white', fontSize: 16 }}>{ running_str }</Text>
          </View>
        </View>
      </View>
    </View>
  }

  render_walking_running = () => {

    let behavior_data = this.state.behavior_data;
    let walking       = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.walking ? behavior_data.forwardMotionInfo.walking : 0;
    let running       = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.running ? behavior_data.forwardMotionInfo.running : 0;

    let walking_str   = this.seconds_to_hms(walking);
    let running_str   = this.seconds_to_hms(running);

    return <View style={{ marginTop: 0, marginBottom: 20, backgroundColor: 'white', marginRight: 20, marginLeft: 20, borderRadius: 12, padding: 20, paddingTop: 15 }}>
      <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, marginBottom: 10, color: Colors.DARK_GREY }}>Today's Activity</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ borderRadius: 25, padding: 20, paddingTop: 15, flex: 1 }}>
          <Text style={{ fontWeight: 'medium', fontSize: 13, textAlign: 'center', marginBottom: 4 }}>Walking</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 15, color: Colors.DARK_GREY }}>{ walking_str }</Text>
          </View>
        </View>
        <View style={{ width: 1, height: '80%', backgroundColor: '#e7e7e7', marginRight: 10, marginLeft: 10 }} />
        <View style={{ borderRadius: 25, padding: 20, paddingTop: 15, flex: 1 }}>
          <Text style={{ fontWeight: 'medium', fontSize: 13, textAlign: 'center', marginBottom: 4 }}>Running</Text>
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text style={{ fontSize: 15, color: Colors.DARK_GREY }}>{ running_str }</Text>
          </View>
        </View>
      </View>
    </View>
  }

  render_weight_graph = () => {

    let window        = Dimensions.get('window');
    let window_width  = window && window.width  ? window.width  : 300;
    let window_height = window && window.height ? window.height : 300;
    let chart_width   = window_width - (40 + 30 + 60);

    let weight_hist   = this.state.weight_history && this.state.weight_history.petWeightHistories ? this.state.weight_history.petWeightHistories : [];
    let chart_data    = [];

    weight_hist.forEach((weight_data, i) => {
      let weight_value = weight_data.weightKgs || 0;
      let js_date      = new Date(weight_data.addDate);
      var dayOfMonth   = js_date.getDate();
      var month        = js_date.toLocaleString('default', { month: 'short' });
      let lbl_date_str = month + ' ' + dayOfMonth;
      let weight_label = weight_value.toString();
      let data_object  = { value: weight_value, label: lbl_date_str, dataPointText: weight_label };
      if (i < 5) {
        chart_data.push(data_object);
      }
    });

    chart_data.reverse();

    return <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 20, padding: 15 }}>
      <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 18, marginBottom: 5, color: Colors.DARK_GREY }}>Weight</Text>
      <Text style={{ fontWeight: 'medium', fontSize: 12, color: 'grey', marginLeft: 5, marginBottom: 15 }}>Kgs</Text>
      <LineChart
        data={chart_data}
        width={chart_width}
        spacing={chart_width/4.9}
        initialSpacing={20}
        curved={true}
        textShiftY={-8}
        textFontSize={13}
        color={Colors.PRIMARY}
        thickness={4}
        xAxisThickness={0}
        yAxisThickness={0}
        noOfSections={4}
        xAxisLabelTextStyle={{ width: chart_width/4.0, fontWeight: 'bold', fontSize: 12, color: Colors.DARK_GREY }}
        yAxisTextStyle={{ fontWeight: 'bold', fontSize: 12, color: Colors.DARK_GREY }}
        hideRules={false}
      />
    </View>
  }

  render_weight_entries = () => {
    let weight_hist = this.state.weight_history && this.state.weight_history.petWeightHistories ? this.state.weight_history.petWeightHistories : [];
    let disp_input  = this.state.display_weight_input;

    let weight_rows = weight_hist.map((weight_data, i) => {
      let weight_value = weight_data.weightKgs || 0;
      let js_date      = new Date(weight_data.addDate);
      var dayOfMonth   = js_date.getDate();
      var month        = js_date.toLocaleString('default', { month: 'short' });
      let date_string  = month + ' ' + dayOfMonth;
      return <View>
        <View style={{ flexDirection: 'row', justifyContent:  'space-between', alignItems: 'center', paddingTop: 15, paddingBottom: 15 }}>
          <View style={{ }}>
            <Text style={{ fontSize: 16 }}>{ weight_value }</Text>
            <Text style={{ fontSize: 12, fontWeight: 'medium'}}>{ 'KGS' }</Text>
          </View>
          <View style={{ alignItems: 'center', marginRight: 5 }}>
            <Text style={{ fontSize: 16 }}>{ dayOfMonth }</Text>
            <Text style={{ fontSize: 12, fontWeight: 'medium'}}>{ month }</Text>
          </View>
        </View>
        <Line hide={ i === weight_hist.length - 1} />
      </View>
    })

    return <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 20, padding: 20, marginTop: 0 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.DARK_GREY }}>Weight Entries</Text>
        <TouchableOpacity style={{ paddingRight: 5, paddingLeft: 10 }}>
          <Icon name={ disp_input ? 'close' : 'plus-circle' } size={25} color={Colors.PRIMARY} onPress={ () => { this.setState({ display_weight_input: !this.state.display_weight_input }) }}/>
        </TouchableOpacity>
      </View>
      { disp_input ? <View style={{ marginTop: 20, marginBottom: 20 }}>
                       <Input value={this.state.pet_weight}
                              style={{ alignSelf: 'center', width: 130, textAlign: 'center' }}
                              keyboardType='decimal-pad'
                              placeholder='0.0 (Kgs)'
                              onChangeText={ (text) => {
                                this.setState({ ...this.state, pet_weight: text });
                              }}/>
                        <Button style={{ marginTop: 10 }}
                                title='Add New Entry'
                                loading={this.state.loading_add_weight}
                                onPress={()=>{
                                  this.add_weight();
                                }} />
                     </View> : null }
      <Line hide={!this.state.display_weight_input} />
      <View style={{ marginTop: 5 }}>
        { weight_rows }
      </View>
    </View>
  }

  render_diet_entries = () => {
    let { recommended_diet, display_diet_input, diet_list, intake_history, intake_diet_feedback, intake_measurement_units, intake_other_foods, diet, otherFoodTypeId, foodName, percentConsumed, intake_data_loaded, otherFoodSelectedIndex, intake_error_message, intake_list, recommendedDietSelectedIndex, quantityOffered, loading_add_diet } = this.state;

    diet_list = diet_list ? diet_list : [];

    // recommended_diet
    //[{"dietId": 364, "dietName": "SD Healthy Advantage Puppy Dry 12L", "feedingScheduledId": 32799, "recommendedAmountCups": 0, "recommendedAmountGrams": 0, "recommendedRoundedCups": "0", "recommendedRoundedGrams": "0", "unit": "cup", "unitId": 4}]

    /* 
 LOG  intake_diet_feedback [{"feedbackId":1,"feedbackCategory":"Food Recommendation Feedback","description":"The recommended amount is way too much for my dog"},{"feedbackId":2,"feedbackCategory":"Food Recommendation Feedback","description":"The recommended amount is a little too much for my dog"},{"feedbackId":3,"feedbackCategory":"Food Recommendation Feedback","description":"The recommended amount is just right for my dog"},{"feedbackId":4,"feedbackCategory":"Food Recommendation Feedback","description":"The recommended amount is a little too low for my dog"},{"feedbackId":5,"feedbackCategory":"Food Recommendation Feedback","description":"The recommended amount is way too low for my dog"},{"feedbackId":6,"feedbackCategory":"Food Recommendation Feedback","description":"Other feedback (specify)"},{"feedbackId":7,"feedbackCategory":"Pet Behaviour Feedback","description":"My dog has no behaviour issues related to food"},{"feedbackId":8,"feedbackCategory":"Pet Behaviour Feedback","description":"My dog is not interested in food"},{"feedbackId":9,"feedbackCategory":"Pet Behaviour Feedback","description":"My dog is begging for food"},{"feedbackId":10,"feedbackCategory":"Pet Behaviour Feedback","description":"My dog is becoming aggressive around food"},{"feedbackId":11,"feedbackCategory":"Pet Behaviour Feedback","description":"My dog is eating food from other pets or people"},{"feedbackId":12,"feedbackCategory":"Pet Behaviour Feedback","description":"Other feedback (specify)"}] */

 console.log('otherFoodTypeId', otherFoodTypeId)

 recommendedDietSelectedIndex = recommendedDietSelectedIndex ? recommendedDietSelectedIndex : 0

 let selected_recommended_diet = recommended_diet[recommendedDietSelectedIndex];

    let diet_input = <View style={{ marginTop: 20, marginBottom: 20 }}>
      
      {recommended_diet.length !== 0 ? <>
        <Text>Add from... </Text>
          <Button style={{ marginTop: 10 }}
                  title='Other Diet'
                  loading={this.state.loading_add_weight}
                  onPress={()=>{ this.setState({diet: 0, isOtherFood: true, foodName: null}) }} />
          <Button style={{ marginTop: 10 }}
                  title='Recommended Diet'
                  loading={this.state.loading_add_weight}
                  onPress={()=>{ this.setState({diet: 1, isOtherFood: false, foodName: null}) }} />

    </> : null}
      {diet === 0 ? <View>
        <Picker
              style={{ borderRadius: 10, backgroundColor: 'white', padding: 10, paddingTop: 15 }}
              selectedValue={otherFoodSelectedIndex}
              onValueChange={ (otherFoodSelectedIndex) => {
                otherFoodSelectedIndex = parseInt(otherFoodSelectedIndex);
                let food = intake_other_foods[otherFoodSelectedIndex];
                console.log('food', food)
                this.setState({ otherFoodSelectedIndex, otherFoodTypeId: food.otherFoodId, otherFoodTypeName: food.otherFoodType })
              }}>
                {intake_other_foods.map((a, i) => {
                  //[{"otherFoodId":1,"otherFoodType":"Wet Food","description":"Including cans, pouches, refrigerated fresh pet foods, single-serve entrees, etc."},{"otherFoodId":2,"otherFoodType":"Dry Food"},{"otherFoodId":3,"otherFoodType":"Purchased Food","description":"Store-bought Raw food, BARF (Bones and Raw Food), etc."},{"otherFoodId":4,"otherFoodType":"Human Food","description":"(raw or cooked), homemade pet food recipes, homemade treats, etc."},{"otherFoodId":5,"otherFoodType":"Treats"},{"otherFoodId":6,"otherFoodType":"Other","description":"Please specify"}]
                  //
                  return <Picker.Item value={i} key={i} label={a.otherFoodType} />
                })}
            </Picker>

            <View style={{flexDirection: 'column'}}>
              <Text>Food Name</Text>
              <Input type={'number'} value={foodName} onChangeText={foodName=>{this.setState({foodName})}} />
            </View>

            <View style={{flexDirection: 'column'}}>
              <Text>Percentage Consumed</Text>
              <Input keyboardType={'number-pad'} value={percentConsumed} onChangeText={percentConsumed=>{this.setState({percentConsumed})}} />
            </View>
            {intake_error_message ? <Text style={{color: 'red'}}>{intake_error_message}</Text> : null}
            <Button style={{ marginTop: 10 }}
              title='Add Intake'
              loading={this.state.loading_add_diet}
              onPress={this.addIntake} />
      </View> : null}
      {diet === 1 ? <View>
        <Picker
              style={{ borderRadius: 10, backgroundColor: 'white', padding: 10, paddingTop: 15 }}
              selectedValue={recommendedDietSelectedIndex}
              onValueChange={ (recommendedDietSelectedIndex) => {
                recommendedDietSelectedIndex = parseInt(recommendedDietSelectedIndex);
                let food = recommended_diet[recommendedDietSelectedIndex];
                console.log('food', food)
                this.setState({ recommendedDietSelectedIndex })
              }}>
                {recommended_diet.map((a, i) => {
                  //[{"dietId": 364, "dietName": "SD Healthy Advantage Puppy Dry 12L", "feedingScheduledId": 32802, "recommendedAmountCups": 0, "recommendedAmountGrams": 0, "recommendedRoundedCups": "0", "recommendedRoundedGrams": "0", "unit": "cup", "unitId": 4}]
                  //
                  return <Picker.Item value={i} key={i} label={a.dietName} />
                })}
            </Picker>

            <View style={{flexDirection: 'column'}}>
              <Text>Quantity Offered ({selected_recommended_diet.unit}s)</Text>
              <Input keyboardType={'number-pad'} value={quantityOffered} onChangeText={quantityOffered=>{this.setState({quantityOffered})}} />
            </View>

            <View style={{flexDirection: 'column'}}>
              <Text>Percentage Consumed</Text>
              <Input keyboardType={'number-pad'} value={percentConsumed} onChangeText={percentConsumed=>{this.setState({percentConsumed})}} />
            </View>
            {intake_error_message ? <Text style={{color: 'red'}}>{intake_error_message}</Text> : null}
            <Button style={{ marginTop: 10 }}
              title='Add Intake'
              loading={this.state.loading_add_diet}
              onPress={this.addIntake} />
      </View> : null}
    </View>

    let recommended_diet_rows = <View>
      <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.DARK_GREY }}>Today's Recommended Diet</Text>
      <View>{recommended_diet.length === 0 ? <Text>No diet recommended yet</Text> : null}
        {recommended_diet.map(a=>{
          let unit = a.unit;
          return <View style={{flexDirection: 'column'}}>
            <View><Text>Name: {a.dietName}</Text></View>
            <View><Text>{unit}: {unit === 'cups' ? a.recommendedAmountCups : a.recommendedAmountGrams}</Text></View>
            </View>
        })}
      </View>
    </View>

    console.log('intake_history', intake_history)

    // intake_history
    //{"dietList": [{"dietId": 365, "dietName": "PD Canine c/d, Dry", "isDietSelected": 1}], "foodIntakeHistory": [{"intakeComparision": [Array], "intakeDate": "2024-06-01", "intakeDistribution": [Array]}, {"intakeComparision": [Array], "intakeDate": "2024-06-02", "intakeDistribution": [Array]}, {"intakeComparision": [Array], "intakeDate": "2024-06-03", "intakeDistribution": [Array]}, {"intakeComparision": [Array], "intakeDate": "2024-06-04", "intakeDistribution": [Array]}, {"intakeComparision": [Array], "intakeDate": "2024-06-05", "intakeDistribution": [Array]}, {"intakeComparision": [Array], "intakeDate": "2024-06-06", "intakeDistribution": [Array]}]}

    let intake_dates = Object.keys(intake_list);

    let intake_list_rows = intake_dates.map((date, i) => {

      let intake_data = intake_list[date];
      let other_foods = intake_data.other_foods;
      let recommended_foods = intake_data.recommended_foods;

      let intake_foods = other_foods.concat(recommended_foods);

      console.log('intake_data', intake_data)
      console.log('other_foods', other_foods)
      console.log('recommended_foods', recommended_foods)

      let data_value = '';

      let js_date      = new Date(date + ' 23:00:00');
      var dayOfMonth   = js_date.getDate();
      var month        = js_date.toLocaleString('default', { month: 'short' });

      return intake_foods.map(a=>{
        console.log('a', a)
        return a.foodIntakeHistory.map(b=>{
          data_value = `${b.foodName ? b.foodName : b.dietName} - ${b.percentConsumed}% consumed`
          return <View>
            <View style={{ flexDirection: 'row', justifyContent:  'space-between', alignItems: 'center', paddingTop: 15, paddingBottom: 15 }}>
              <View style={{ flex: 10}}>
                <Text style={{ fontSize: 16 }}>{ data_value }</Text>
              </View>
              <View style={{ alignItems: 'center', marginRight: 5, flex: 1 }}>
                <Text style={{ fontSize: 16 }}>{ dayOfMonth }</Text>
                <Text style={{ fontSize: 12, fontWeight: 'medium'}}>{ month }</Text>
              </View>
              <TouchableOpacity style={{ paddingRight: 5, paddingLeft: 10, flex: 1 }}>
                <Icon name={ 'close' } size={25} color={Colors.PRIMARY} onPress={ () => { this.removeIntake(b, date) }}/>
              </TouchableOpacity>
            </View>
            <Line hide={ i === intake_list.length - 1} />
          </View>
        })
      })
    })

    return <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 20, padding: 20, marginTop: 0 }}>
      {recommended_diet_rows}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.DARK_GREY }}>Diet Entries</Text>
        <TouchableOpacity style={{ paddingRight: 5, paddingLeft: 10 }}>
          <Icon name={ display_diet_input ? 'close' : 'plus-circle' } size={25} color={Colors.PRIMARY} onPress={ () => { this.setState({ display_diet_input: !this.state.display_diet_input, diet: recommended_diet.length === 0 ? 0 : null }) }}/>
        </TouchableOpacity>
      </View>
      { display_diet_input ? diet_input : null }
      <Line hide={!display_diet_input} />
      <View style={{ marginTop: 5 }}>
        { intake_list_rows }
      </View>
    </View>
  }

  render() {
    let { behavior_data_loaded,  intake_data_loaded } = this.state;

    if (!behavior_data_loaded) {
      return <View>
        { this.render_pet_section()              }
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <View style={{ backgroundColor: Colors.PRIMARY, flexDirection: 'row', alignItems: 'center', paddingRight: 15, paddingLeft: 15, borderRadius: 10, padding: 10, marginTop: -15, marginBottom: 5 }}>
            <LottieView autoPlay style={{ width: 15, height: 15 }} source={ require('../../assets/animations/white-spinner.json') } />
            <Text style={{ marginLeft: 8, fontSize: 14, color: 'white', fontWeight: 'medium' }}>Loading Pet Data ...</Text>
          </View>
        </View>
      </View>
    }

    return <View style={{  }}>
      <View>
        { this.render_pet_section()              }
        { this.render_forward_motion_bar_chart() }
        { this.render_walking_running()          }
        { this.render_sleep_bar_chart()          }
        { this.render_weight_graph()             }
        { this.render_weight_entries()           }
        { intake_data_loaded ? this.render_diet_entries()   : null          }
      </View>
    </View>
  }

  add_weight = async () => {
    this.setState({ loading_add_weight: true });

    let selected_pet_id   = this.state.selected_pet && this.state.selected_pet.petID ? this.state.selected_pet.petID : '';
    let wearables_user_id = this.state.wearables_user_id;
    let weight_input      = this.state.pet_weight;

    let date  = new Date();
    let year  = date.getFullYear();
    let month = date.getMonth() + 1;
    let day   = date.getDate();

    let pet_weight_data = {
      "petWeightId": 0,
      "petId": selected_pet_id,
      "userId": wearables_user_id,
      "weight": weight_input,
      "weightUnit": "kgs",
      "addDate": `${year}-${month}-${day}`
    }

    let add_weight_res = await WearablesController.addPetWeight({ pet_weight_data: pet_weight_data });

    if (add_weight_res && add_weight_res.success) {
      this.pull_selected_pet_data(selected_pet_id);
      this.setState({ loading_add_weight: false, pet_weight: 0, display_weight_input: false });
    } else {
      this.setState({ loading_add_weight: false, pet_weight: 0, display_weight_input: false });
    }
  }

  seconds_to_hms = (seconds) => {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var remainingSeconds = seconds % 60;

    var timeString = '';
    if (hours > 0) {
      timeString += hours + ' hr ';
    }
    if (minutes > 0 || hours > 0) {
      timeString += minutes + ' min ';
    }
    if (remainingSeconds > 0 || (minutes === 0 && hours === 0)) {
      // timeString += remainingSeconds + ' sec';
    }

    return timeString.trim();
  }

}

const styles = StyleSheet.create({

});

export default HealthTab
