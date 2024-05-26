import { Component } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { AuthController, PetsController, WearablesController }   from '../controllers';
import { StringUtils    }   from '../utils';
import { setItem, getItem } from '../../storage';
import { Text, Line, Icon, Colors, Input } from '../components';
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
      weight_history: {}
    }
  }

  pull_pets = async () => {
    let user_pets_response = await WearablesController.getUserPets({});
    let pets               = user_pets_response && user_pets_response.data && user_pets_response.data.pets ? user_pets_response.data.pets : [];
    let selected_pet       = pets && pets.length > 0 && pets[0] ? pets[0] : {};

    if (this.state.selected_pet && this.state.selected_pet.petID) {
      selected_pet = this.state.selected_pet;
    }

    let pet_id = selected_pet && selected_pet.petID ? selected_pet.petID : '';

    this.pull_selected_pet_data(pet_id);

    this.setState({ pets: pets, selected_pet: selected_pet })
  }

  pull_selected_pet_data = async (pet_id) => {
    this.setState({ loading_behavior_data: true });

    let behavior_response = await WearablesController.getPetBehavior({ pet_id: pet_id });
    let behavior_data     = behavior_response && behavior_response.data && behavior_response.data.bahavior_data && behavior_response.data.bahavior_data.forwardMotionInfo ? behavior_response.data.bahavior_data : {};

    let weight_response   = await WearablesController.getPetWeightHistory({ pet_id: pet_id });
    let weight_history    = weight_response && weight_response.data && weight_response.data.weight_history ? weight_response.data.weight_history : {};

    this.setState({ behavior_data: behavior_data, weight_history: weight_history, loading_behavior_data: false })
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
    this.setState({ display_pet_selection: false, selected_pet: pet });
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
            <Text style={{ fontWeight: 'bold', fontSize: 20, color: 'white' }}>{ pet_name }</Text>
            <Text style={{ fontSize: 16, color: 'white' }}>{ single_pet ? '' : switch_ttl }</Text>
          </TouchableOpacity>
          { this.render_pet_selection_list()    }
        </View>
      </View>
    </View>
  }

  render_forward_motion_bar_chart = () => {
    let behavior_data = this.state.behavior_data;

    let yesterday     = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.previousDayForwardMotion ? behavior_data.forwardMotionInfo.previousDayForwardMotion : 19300;
    let today_so_far  = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.todayForwardMotionSofar  ? behavior_data.forwardMotionInfo.todayForwardMotionSofar  : 12300;

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

    let yesterday     = behavior_data.sleepInfo && behavior_data.sleepInfo.previousDayTotalSleep ? behavior_data.sleepInfo.previousDayTotalSleep : 20300;
    let today_so_far  = behavior_data.sleepInfo && behavior_data.sleepInfo.todayTotalSleepSofar  ? behavior_data.sleepInfo.todayTotalSleepSofar  : 8002;

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
    let walking       = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.walking ? behavior_data.forwardMotionInfo.walking : 8300;
    let running       = behavior_data.forwardMotionInfo && behavior_data.forwardMotionInfo.running ? behavior_data.forwardMotionInfo.running : 4020;

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
    const data=[
      { value: 14, label: 'Mon' },
      { value: 20, label: 'Tue', showStrip: false, stripHeight: 190 },
      { value: 18, label: 'Wed', dataPointText: '90' },
      { value: 25, label: 'Thu' }
    ]

    return <View style={{ marginTop: 30 }}>
      <LineChart
        data={data}
        initialSpacing={20}
        spacing={90}
        curved={true}
        textShiftY={-8}
        textFontSize={13}
        color={Colors.PRIMARY}
        thickness={3}
        xAxisColor={Colors.PRIMARY}
        yAxisColor={Colors.PRIMARY}
        hideRules
      />
    </View>
  }

  render() {

    return <View style={{  }}>
      <View>
        { this.render_pet_section()              }
        { this.render_forward_motion_bar_chart() }
        { /* this.render_data_squares()       */ }
        { this.render_walking_running()          }
        { this.render_sleep_bar_chart()          }
        { this.render_weight_graph()             }
      </View>
    </View>
  }

  getPet = async (petId) => {
    let weight_history = await WearablesController.getPetWeightHistory({pet_id: petId});
    console.log('weight_history1', JSON.stringify(weight_history));
    weight_history = weight_history && weight_history.data && weight_history.data.weight_history && weight_history.data.weight_history.petWeightHistories ? weight_history.data.weight_history.petWeightHistories : [];

    console.log('weight_history', JSON.stringify(weight_history));

    this.setState({weight_history, selected_wearables_pet_id: petId});
  }

  addWeight = async () => {
    let { weight_input, selected_wearables_pet_id, wearables_user_id, weight_history } = this.state;

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    let petWeightId;

    if(weight_history && weight_history.length) {
      petWeightId = weight_history[weight_history.length - 1].petWeightId++;
    } else {
      petWeightId = 0
    }

    let pet_weight_data = {
        petWeightId,
        "petId": selected_wearables_pet_id,
        "userId": wearables_user_id,
        "weight": weight_input,
        "weightUnit": "lbs",
        "addDate": `${year}-${month}-${day}`
    }

    console.log('dpet_weight_dataata', pet_weight_data)

    let res = await WearablesController.addPetWeight({pet_weight_data});
    console.log('res', JSON.stringify(res));
    await getPet(selected_wearables_pet_id)
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
