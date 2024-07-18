import { Component } from 'react';
import LottieView    from 'lottie-react-native';
import { View, StyleSheet, TouchableOpacity, Dimensions, Image, ImageBackground } from 'react-native';
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
      loading_pull_pets: false,
      isOtherFood: true
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

    console.log('behavior_response', behavior_response);
    console.log('behavior_data', behavior_data);

    let weight_response   = await WearablesController.getPetWeightHistory({ pet_id: pet_id });
    let weight_history    = weight_response && weight_response.data && weight_response.data.weight_history ? weight_response.data.weight_history : {};

    this.setState({ behavior_data: behavior_data, weight_history: weight_history, loading_behavior_data: false, behavior_data_loaded: true })
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
    let no_pets    = pets && pets.length === 0;
    let switch_ttl = this.state.display_pet_selection ? 'Done' : 'Switch Pet';
        switch_ttl = no_pets ? '' : switch_ttl;

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

    console.log('behavior_data', behavior_data)

    let yesterday     = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.previousDayForwardMotion ? behavior_data.forwardMotionInfo.previousDayForwardMotion : 0;
    let today_so_far  = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.todayForwardMotionSofar  ? behavior_data.forwardMotionInfo.todayForwardMotionSofar  : 0;

    if (yesterday === 0 && today_so_far === 0) {
      return null;
    }

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

    /* {"fmGoalSetting": {"forwardMotionGoalSetText": "30Min ", "forwardMotionGoalSetting": 1800, "overAchieved": 0, "overAchievedText": "0Sec", "tobeAchieved": 1800, "tobeAchievedText": "30Min ", "todayFMSofarText": "0Sec", "todayForwardMotionSofar": 0, "todayForwardMotionVsGoalSettingPercentage": 0}, "forwardMotionInfo": {"lastWeekFMAvgText": "18Min 18Sec", "lastWeekForwardMotionAverage": 1098, "prevDayFMVsLastWeekFMAvgPercentage": 0, "prevDayForwardMotionAtThisTime": 0, "previousDayFMText": "0Sec", "previousDayForwardMotion": 0, "running": 0, "runningText": "0Sec", "todayFMSofarVsLastWeekFMAvgPercentage": 0, "todayFMSofarVsPrevDayFMAtThisTime": 0, "todayForwardMotion": 0, "todayForwardMotionSofar": 0, "todayForwardMotionSofarText": "0Sec", "todayForwardMotionText": "0Sec", "todayVsLastWeekFMAvgPercentage": 0, "walking": 0, "walkingText": "0Sec"}, "petId": 7875, "sleepInfo": {"daySleep": 0, "daySleepText": "0Sec", "lastWeekTotalSleepAverage": 29355, "lastWeekTotalSleepAverageText": "8Hr 9Min 15Sec", "nightSleep": 0, "nightSleepText": "0Sec", "prevDayTSVsLastWeekTSAvgPercentage": 0, "prevDayTotalSleepAtThisTime": 0, "previousDayTotalSleep": 0, "previousDayTotalSleepText": "0Sec", "todaySleep": 0, "todaySleepText": "0Sec", "todayTSSofarVsLastWeekTSAvgPercentage": 0, "todayTSSofarVsPrevDayTSAtThisTime": 0, "todayTotalSleepSofar": 0, "todayTotalSleepSofarText": "0Sec", "todayVsLastWeekSleepAvgPercentage": 0}} */

    console.log('barData', barData)

    return <View>
        <View style={{ margin: 20, backgroundColor: 'white', borderRadius: 12, padding: 10, paddingTop: 20, marginTop: 0 }}>
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

    if (yesterday === 0 && today_so_far === 0) {
      return null;
    }

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

    if (walking === 0 && running === 0) {
      return null;
    }

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

    return <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 20, padding: 15, marginTop: 0 }}>
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

  render_other_food_options = () => {
    let intake_other_foods = this.state.intake_other_foods || [];

    let option_rows = intake_other_foods.map((other_food) => {
      let selected_choice = this.state.otherFoodTypeId;
      let selected_style  = styles.selected_choice;
      let default_style   = styles.default_choice;
      let is_selected     = selected_choice === other_food.otherFoodId;
      let choice_style    = is_selected ? selected_style : default_style;
      return <TouchableOpacity style={choice_style}
                               onPress={ () => {
                                 let other_food_id   = other_food.otherFoodId;
                                 let other_food_name = other_food.otherFoodType;
                                 this.setState({ otherFoodTypeId: other_food_id, otherFoodTypeName: other_food_name });
                               }}>
        <Text style={{ fontSize: 15, textAlign: 'center', color: is_selected ? 'white' : '#474747', fontWeight: 'semibold' }}>{ other_food.otherFoodType }</Text>
      </TouchableOpacity>
    })

    return <View style={{ marginTop: 20 }}>
      <Text style={styles.input_titles}>Food Type</Text>
      { option_rows }
    </View>
  }

  render_other_recommended_switch = () => {
    let recommended_diet = this.state.recommended_diet ? this.state.recommended_diet : [];
    let has_rec_diet     = recommended_diet.length > 0;

    if (!has_rec_diet || !this.state.display_diet_input) { return null }

    let is_other       = this.state.isOtherFood;
    let selected_style = styles.selected_choice;
    let default_style  = styles.default_choice;
    let rec_style      = this.state.diet === 1 ? selected_style : default_style;
    let other_style    = this.state.diet === 0 ? selected_style : default_style

    return <View style={{ flexDirection: 'column', marginTop: 15 }}>
      <TouchableOpacity style={ rec_style } onPress={ () => { this.setState({ diet: 1, isOtherFood: false, foodName: null, intakeDietBehaviourFeedbackIndex: null, intakeDietFoodFeedbackIndex: null, intake_error_message: '' }) }}>
        <Text style={{ fontSize: 15, textAlign: 'center', color: this.state.diet === 1 ? 'white' : '#474747', fontWeight: 'semibold' }}>{ 'Add Recommended Diet' }</Text>
      </TouchableOpacity>
      <TouchableOpacity style={other_style} onPress={ () => { this.setState({ diet: 0, isOtherFood: true, foodName: null, intakeDietBehaviourFeedbackIndex: null, intakeDietFoodFeedbackIndex: null }) }}>
        <Text style={{ fontSize: 15, textAlign: 'center', color: this.state.diet === 0  ? 'white' : '#474747', fontWeight: 'semibold' }}>{ 'Add Other Diet' }</Text>
      </TouchableOpacity>
    </View>
  }

  render_other_diet_inputs = () => {
    if (this.state.diet !== 0 || !this.state.display_diet_input) { return null }

    let foodName             = this.state.foodName;
    let quantityConsumed      = this.state.quantityConsumed;
    let quantityOffered = this.state.quantityOffered;
    let intake_error_message = this.state.intake_error_message;
    let loading_add_diet     = this.state.loading_add_diet;

    return <View>
       { this.render_other_food_options() }
       <View style={{ flexDirection: 'column', marginTop: 15 }}>
         <Text style={styles.input_titles}>Food Name</Text>
         <Input type={'number'} value={foodName} onChangeText={ foodName => { this.setState({ foodName: foodName }) }} />
       </View>

       <View style={{ flexDirection: 'column', marginTop: 15 }}>
        <Text style={styles.input_titles}>Quantity Offered</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Input keyboardType={'number-pad'}
                 style={{ width: 100 }}
                 value={quantityOffered}
                 onChangeText={ quantityOffered => { this.setState({ quantityOffered }) }} />
          <Text style={{ fontSize: 16, fontWeight: 'medium', marginLeft: 8 }}>Cups</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'column', marginTop: 15 }}>
        <Text style={styles.input_titles}>Quantity Consumed</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Input keyboardType={'number-pad'}
                 style={{ width: 100 }}
                 value={quantityConsumed}
                 onChangeText={ quantityConsumed => { this.setState({ quantityConsumed }) }} />
          <Text style={{ fontSize: 16, fontWeight: 'medium', marginLeft: 8 }}>Cups</Text>
        </View>
      </View>

       { intake_error_message ? <Text style={{ color: 'red', marginTop: 10, fontSize: 15 }}>{ intake_error_message }</Text> : null }

       <Button style={{ marginTop: 20 }} title='Add Intake' loading={loading_add_diet} onPress={this.addIntake} />
    </View>
  }

  render_recommended_diet_inputs = () => {
    if (this.state.diet !== 1 || !this.state.display_diet_input) { return null }

    let rec_diets       = this.state.recommended_diet ? this.state.recommended_diet : [];
    let quantityOffered = this.state.quantityOffered  ? this.state.quantityOffered  : 0;
    let quantityConsumed = this.state.quantityConsumed ? this.state.quantityConsumed : 0;

    return <View style={{ marginTop: 15 }}>

      <Text style={styles.input_titles}>Recommended Diet</Text>
      <View style={styles.selected_choice}>
        <Text style={{ fontSize: 15, textAlign: 'center', color: 'white', fontWeight: 'semibold' }}>{ "Hill's Science Diet Adult Perfect Weight & Joint Support" }</Text>
      </View>

      <View style={{ flexDirection: 'column', marginTop: 15 }}>
        <Text style={styles.input_titles}>Quantity Offered</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Input keyboardType={'number-pad'}
                 style={{ width: 100 }}
                 value={quantityOffered}
                 onChangeText={ quantityOffered => { this.setState({ quantityOffered }) }} />
          <Text style={{ fontSize: 16, fontWeight: 'medium', marginLeft: 8 }}>Cups</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'column', marginTop: 15 }}>
        <Text style={styles.input_titles}>Quantity Consumed</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Input keyboardType={'number-pad'}
                 style={{ width: 100 }}
                 value={quantityConsumed}
                 onChangeText={ quantityConsumed => { this.setState({ quantityConsumed }) }} />
          <Text style={{ fontSize: 16, fontWeight: 'medium', marginLeft: 8 }}>Cups</Text>
        </View>
      </View>
    </View>
  }

  render_rec_diet_feedback_inputs = () => {
    if (this.state.diet !== 1) { return null }

    let feedback_arr = this.state.intake_user_diet_feedback || [];
    let food_choices = feedback_arr.filter(a => a.feedbackCategory === 'Food Recommendation Feedback');
    let behv_choices = feedback_arr.filter(a => a.feedbackCategory === 'Pet Behaviour Feedback');
    let intake_err_m = this.state.intake_error_message || '';

    let food_choice_rows = food_choices.map((feedback, fb_index) => {
      let description    = feedback.description;
      let cleaned_str    = description.slice(26);
          cleaned_str    = cleaned_str.slice(0, -11);
          cleaned_str    = StringUtils.sentenceCase(cleaned_str);
      let selected_style = styles.selected_choice;
      let default_style  = styles.default_choice;
      let is_selected    = this.state.intakeDietFoodFeedbackIndex === feedback.feedbackId;
      let choice_style   = is_selected ? selected_style : default_style;
      if (!cleaned_str) { return null }
      return <TouchableOpacity style={choice_style} onPress={ () => { this.setState({ intakeDietFoodFeedbackIndex: feedback.feedbackId }) }}>
        <Text style={{ fontSize: 15, textAlign: 'center', color: is_selected ? 'white' : '#474747', fontWeight: 'semibold' }}>{ cleaned_str }</Text>
      </TouchableOpacity>
    })

    let behavior_choice_rows = behv_choices.map((feedback, fb_index) => {
      let description    = feedback.description;
      let cleaned_str    = description.replace('My dog ', '');
          cleaned_str    = cleaned_str.replace('is ', '');
          cleaned_str    = cleaned_str.replace('has ', '');
          cleaned_str    = StringUtils.sentenceCase(cleaned_str);
      let selected_style = styles.selected_choice;
      let default_style  = styles.default_choice;
      let is_selected    = this.state.intakeDietBehaviourFeedbackIndex === feedback.feedbackId;
      let choice_style   = is_selected ? selected_style : default_style;
      if (feedback.description.includes('specify')) { return null }
      return <TouchableOpacity style={choice_style} onPress={ () => { this.setState({ intakeDietBehaviourFeedbackIndex: feedback.feedbackId }) }}>
        <Text style={{ fontSize: 15, textAlign: 'center', color: is_selected ? 'white' : '#474747', fontWeight: 'semibold' }}>{ cleaned_str }</Text>
      </TouchableOpacity>
    })

    return <View>
      <View style={{ marginTop: 15 }}>
        <Text style={styles.input_titles}>Pet's Food Feedback</Text>
        { food_choice_rows }
      </View>
      <View style={{ marginTop: 15 }}>
        <Text style={styles.input_titles}>Pet's Food Behavior Issues</Text>
        { behavior_choice_rows }
      </View>
      { intake_err_m ? <Text style={{ color: 'red', marginTop: 10, fontSize: 15 }}>{ intake_err_m }</Text> : null }
      <Button style={{ marginTop: 10 }}
              title='Add Intake'
              loading={this.state.loading_add_diet}
              onPress={this.addIntake} />
    </View>
  }

  render_recommended_diet_info = () => {
    let rec_diet  = this.state.recommended_diet;
    let has_rec   = rec_diet && rec_diet.length && rec_diet.length;

    if (!has_rec) {
      return null;
    }

    let diet_name = "Hill's Science Diet Adult Perfect Weight & Joint Support";
    let rec_cups  = rec_diet && rec_diet.length && rec_diet[0] && rec_diet[0].recommendedAmountCups ? rec_diet[0].recommendedAmountCups : 0;
    let rec_str   = rec_cups       ? rec_cups + ' cups of Hill’s Science Diet Adult Perfect Weight & Joint Support per day.' : "Hill's Science Diet Adult Perfect Weight & Joint Support";
        rec_str   = rec_cups === 1 ? rec_cups + ' cup of Hill’s Science Diet Adult Perfect Weight & Joint Support per day.'  : rec_str;

    return <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 20, padding: 20, marginBottom: 0 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.DARK_GREY }}>Food Recommendation</Text>
      <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
        <Image style={{ height: 90, width: 50, borderRadius: 10, alignSelf: 'center' }} resizeMode='contain' source={ require('../../assets/images/recommended-diet.png') } />
        <Text style={{ fontSize: 16, color: Colors.TEXT_GREY, flex: 1, marginLeft: 15, fontWeight: '' }}>{ rec_str }</Text>
      </View>
      <Text style={{ fontSize: 16, marginTop: 15, color: Colors.DARK_GREY, fontWeight: 'medium' }}>{ 'Why we like this food' }</Text>
      <Text style={{ fontSize: 16, marginTop: 5, color: Colors.TEXT_GREY }}>{ 'This food was specially created to help dog’s lose weight and maintain a healthy weight. The high protein, coconut oil enriched, high fiber formulation supports your dog’s metabolism and provides lean muscle support. The added fish oil provides EPA and Omega-3s to help support your dog’s joint health for a healthy and active life.' }</Text>
    </View>
  }

  render_diet_entries = () => {

    let recommended_diet   = this.state.recommended_diet;
    let display_diet_input = this.state.display_diet_input;
    let intake_list        = this.state.intake_list;
    let intake_dates       = Object.keys(intake_list);

    let intake_list_rows = intake_dates.map((date, i) => {

      let intake_data = intake_list[date];
      let other_foods = intake_data.other_foods;
      let recommended_foods = intake_data.recommended_foods;

      let intake_foods = other_foods.concat(recommended_foods);

      let data_value   = '';
      let js_date      = new Date(date + ' 23:00:00');
      var dayOfMonth   = js_date.getDate();
      var month        = js_date.toLocaleString('default', { month: 'short' });

      return intake_foods.map((a, food_ind) => {
        return a.foodIntakeHistory.map(b => {

          // let food_name = `${b.foodName ? b.foodName : b.dietName}`;
          let food_name = `${b.foodName ? b.foodName : "Hill's Science Diet Adult Perfect Weight & Joint Support" }`;
          let consumed  = `${b.percentConsumed}% consumed`;

          return <View>
            <View style={{ flexDirection: 'row', justifyContent:  'space-between', alignItems: 'center', paddingTop: 15, paddingBottom: 15 }}>
              <View style={{ flex: 10 }}>
                <Text style={{ fontSize: 16, marginBottom: 3 }}>{ food_name }</Text>
                <Text style={{ fontSize: 14, fontWeight: 'medium', color: 'grey' }}>{ consumed }</Text>
              </View>
              <View style={{ alignItems: 'center', marginRight: 5, flex: 1 }}>
                <Text style={{ fontSize: 16 }}>{ dayOfMonth }</Text>
                <Text style={{ fontSize: 12, fontWeight: 'medium'}}>{ month }</Text>
              </View>{/* <TouchableOpacity style={{ paddingRight: 5, paddingLeft: 10, flex: 1 }}><Icon name={ 'close' } size={25} color={Colors.PRIMARY} onPress={ () => { this.removeIntake(b, date) }}/></TouchableOpacity> */}
            </View>
            <Line hide={ food_ind === intake_foods.length - 1} />
          </View>
        })
      })
    })

    return <View style={{ backgroundColor: 'white', borderRadius: 12, margin: 20, padding: 20, paddingBottom: intake_list_rows.length ? 0 : 20, marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: Colors.DARK_GREY }}>Daily Feeding Entries</Text>
        <TouchableOpacity style={{ paddingRight: 5, paddingLeft: 10 }}>
          <Icon name={ display_diet_input ? 'close' : 'plus-circle' } size={25} color={Colors.PRIMARY} onPress={ () => { this.setState({ display_diet_input: !this.state.display_diet_input, diet: recommended_diet.length === 0 ? 0 : null }) }}/>
        </TouchableOpacity>
      </View>
      { this.render_other_recommended_switch() }
      { this.render_other_diet_inputs()        }
      { this.render_recommended_diet_inputs()  }
      { this.render_rec_diet_feedback_inputs() }
      <Line hide={!display_diet_input} style={{ marginTop: 15 }}/>
      <View>
        { intake_list_rows }
      </View>
    </View>
  }

  render_add_pets_section = () => {
    let display_add_pets = !this.state.loading_pull_pets && this.state.pets && this.state.pets.length === 0; // this.state.display_add_pets;

    if (!display_add_pets) {
      return null;
    }

    return <View style={{ height: 250, paddingRight: 20, paddingLeft: 20, marginBottom: 25 }}>
      <ImageBackground source={ require('../../assets/images/add-pet-cta.png') } resizeMode="contain" style={{ height: '100%' }} imageStyle={{  }}>
        <Text style={{ marginTop: 80, marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>Add your pets for</Text>
        <Text style={{ marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>personalized</Text>
        <Text style={{ marginLeft: 20, color: 'white', fontWeight: 'bold', fontSize: 20 }}>care</Text>
        <TouchableOpacity style={{ backgroundColor: '#F2F3F6', width: 102, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginLeft: 20, marginTop: 20 }} onPress={ () => { this.props.navigation.push('AddPetFlow') }}>
          <Text style={{ fontSize: 14, fontWeight: 'medium' }}>Add</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  }

  render() {
    let intake_data_loaded   = this.state.intake_data_loaded;
    let behavior_data_loaded = this.state.behavior_data_loaded;
    let display_add_pets     = !this.state.loading_pull_pets && this.state.pets && this.state.pets.length === 0;

    if (!behavior_data_loaded) {
      return <View>
        { this.render_pet_section() }
        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <View style={{ backgroundColor: Colors.PRIMARY, flexDirection: 'row', alignItems: 'center', paddingRight: 15, paddingLeft: 15, borderRadius: 10, padding: 10, marginTop: -15, marginBottom: 5 }}>
            <LottieView autoPlay style={{ width: 15, height: 15 }} source={ require('../../assets/animations/white-spinner.json') } />
            <Text style={{ marginLeft: 8, fontSize: 14, color: 'white', fontWeight: 'medium' }}>Loading Pet Data ...</Text>
          </View>
        </View>
      </View>
    }

    if (display_add_pets) {
      return <View>
        { this.render_pet_section()      }
        { this.render_add_pets_section() }
      </View>
    }

    return <View style={{  }}>
      <View>
        { this.render_pet_section()              }
        { intake_data_loaded ? this.render_recommended_diet_info() : null }
        { intake_data_loaded ? this.render_diet_entries()          : null }
        { this.render_add_pets_section()         }
        { this.render_weight_entries()           }
        { this.render_weight_graph()             }
        { this.render_forward_motion_bar_chart() }
        { this.render_walking_running()          }
        { this.render_sleep_bar_chart()          }
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

  addIntake = async () => {
    this.setState({ loading_add_diet: true }, async ()=>{
      let {
        otherFoodTypeName,
        foodName,
        isOtherFood,
        intake_other_foods,
        otherFoodSelectedIndex,
        selected_pet,
        recommendedDietSelectedIndex,
        recommended_diet,
        quantityOffered,
        quantityConsumed,
        intake_user_diet_feedback,
        intakeDietFoodFeedbackIndex,
        intakeDietBehaviourFeedbackIndex,
        food_recommendation_feedback_text,
        behaviour_recommendation_feedback_text
       } = this.state;

      let pet_id      = selected_pet.petID;
      let intake_data = {};

      let percentConsumed = (quantityConsumed / quantityOffered) * 100;

      if(isOtherFood) {
        otherFoodSelectedIndex = otherFoodSelectedIndex ? otherFoodSelectedIndex : 0;
        let food = intake_other_foods[otherFoodSelectedIndex];

        otherFoodTypeId   = food.otherFoodId;
        otherFoodTypeName = food.otherFoodType;

        intake_data = {
          pet_id,
          otherFoodTypeName,
          foodName,
          isOtherFood,
          otherFoodTypeId,
          percentConsumed
        };

      } else {
        let selected_intake_food_feedback, selected_intake_behaviour_feedback;

        if(intakeDietFoodFeedbackIndex || intakeDietFoodFeedbackIndex === 0) {
          selected_intake_food_feedback = intake_user_diet_feedback[intakeDietFoodFeedbackIndex - 1];
        }

        if(intakeDietBehaviourFeedbackIndex || intakeDietBehaviourFeedbackIndex === 0) {
          selected_intake_behaviour_feedback = intake_user_diet_feedback[intakeDietBehaviourFeedbackIndex - 1];
        }

        recommendedDietSelectedIndex  = 0;
        let selected_recommended_diet = recommended_diet[recommendedDietSelectedIndex];

        let dietFeedback = [];

        if(selected_intake_food_feedback) {
          dietFeedback.push({
            "dietFeedbackId": 0,
            "intakeId": 0,
            "feedbackId": selected_intake_food_feedback.feedbackId,
            "feedbackText": food_recommendation_feedback_text,
            "isDeleted": 0
          })
        }

        if(selected_intake_behaviour_feedback) {
          dietFeedback.push({
            "dietFeedbackId": 0,
            "intakeId": 0,
            "feedbackId": selected_intake_behaviour_feedback.feedbackId,
            "feedbackText": behaviour_recommendation_feedback_text,
            "isDeleted": 0
          })
        }

        intake_data = {
          dietFeedback,
          pet_id,
          isOtherFood: false,
          quantityOffered,
          percentConsumed,
          quantityConsumed,
          ...selected_recommended_diet
        };
      }

      console.log('intake_data', intake_data)

      let intake = await WearablesController.addPetIntake(intake_data);

      if(intake && intake.success) {
        this.getIntakeData();
        this.setState({ percentConsumed: 0, foodName: '', diet: null })
      } else {
        this.setState({intake_error_message: "There was an error adding your intake", loading_add_diet: false})
      }
    });
  }

  getIntakeData = async (pet_id) => {
    let today        = new Date();
    let date_string  = `${today.getFullYear()}-${today.getMonth() < 9 ? '0' : ''}${today.getMonth() + 1}-${today.getDate()}`;
    let selected_pet = this.state.selected_pet;

    if (!pet_id) {
      pet_id = selected_pet.petID;
    }

    let diet_data        = { pet_id: pet_id, date: date_string }
    let recommended_diet = await WearablesController.getRecommendedDiet(diet_data);
        recommended_diet = recommended_diet && recommended_diet.data && recommended_diet.data.recommended_diet ? recommended_diet.data.recommended_diet : [];
    let is_other         = recommended_diet && recommended_diet.length > 0 ? false : true;

    let intake_data      = { toDate: date_string, pet_id: pet_id }
    let intake           = await WearablesController.getPetIntake(intake_data);
    let intake_config    = await WearablesController.getPetIntakeConfig(intake_data);
        intake_config    = intake_config && intake_config.data && intake_config.data.config ? intake_config.data.config : null;

    let intake_measurement_units  = intake_config && intake_config.measurementUnits ? intake_config.measurementUnits : [];
    let intake_other_foods        = intake_config && intake_config.otherFoods       ? intake_config.otherFoods   : [];
    let intake_user_diet_feedback = intake_config && intake_config.dietFeedback     ? intake_config.dietFeedback : [];
    let intake_history            = intake && intake.data && intake.data.intake_history ? intake.data.intake_history : [];
    let intake_list               = intake && intake.data && intake.data.intake_list    ? intake.data.intake_list    : [];

    this.setState({
      recommended_diet: recommended_diet,
      intake_history: intake_history,
      intake_measurement_units: intake_measurement_units,
      intake_other_foods: intake_other_foods,
      intake_user_diet_feedback: intake_user_diet_feedback,
      intake_list: intake_list,
      isOtherFood: is_other,
      intake_data_loaded: true,
      display_diet_input: false,
      loading_add_diet: false
    });
  }

  removeIntake = async (intake, intakeDate) => {
    console.log('intake to delete', intake)
    let selected_pet = this.state.selected_pet;
    let pet_id       = selected_pet.petID;
    let intakeId     = intake.intakeId;

    let intake_data = {
      foodIntakeHistory: {
        ...intake,
        isDeleted: 1
      },
      intakeId: intakeId,
      pet_id: pet_id,
      intakeDate: intakeDate
    }

    console.log('to delete intake_data', intake_data);

    let intake_res = await WearablesController.deletePetIntake(intake_data);

    if(intake_res && intake_res.success) {
      this.getIntakeData();
    } else {
      this.setState({intake_error_message: "There was an error adding your intake"})
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
  selected_choice: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 5,
    backgroundColor: Colors.PRIMARY
  },
  default_choice: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 5,
    backgroundColor: '#e7e7e7'
  },
  input_titles: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: 'medium'
  }
});

export default HealthTab
