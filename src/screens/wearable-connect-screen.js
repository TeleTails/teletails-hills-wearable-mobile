import React, { Component } from "react";
import { StyleSheet, View, NativeModules,
  NativeEventEmitter, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { Screen, Line, Text, Icon, Input, Colors } from '../components';
import { setItem, getItem } from '../../storage';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { ScrollView } from "react-native-gesture-handler";
import BleManager from 'react-native-ble-manager';
import { Picker }      from '@react-native-picker/picker';
import { stringToBytes, bytesToString } from "convert-string";
import { PetsController } from "../controllers";
import { StringUtils }       from '../utils';


var Buffer = require("buffer/").Buffer;

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class WearableConnectScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      screen: 0,
      peripherals: []
    }

    this.peripherals = []

    this.startScan = this.startScan.bind(this);
    this.connectPeripheral = this.connectPeripheral.bind(this);
    this.checkConnectionConnect = this.checkConnectionConnect.bind(this);
    this.retrieveServices = this.retrieveServices.bind(this);
    this.read = this.read.bind(this);
    this.write = this.write.bind(this);
    this.connectDevice = this.connectDevice.bind(this);
    this.selectWifi = this.selectWifi.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.forceSync = this.forceSync.bind(this);

    this.render_pet_selection = this.render_pet_selection.bind(this);
    this.pet_selection_action = this.pet_selection_action.bind(this);
  }

  async componentDidMount() {

    let pets_response = await PetsController.getPets();
    let is_success    = pets_response && pets_response.success;
    let pets          = is_success && pets_response.data && pets_response.data.pets ? pets_response.data.pets : [];
    this.setState({ pets: pets });

    console.log('Platform', Platform)

    if (Platform.OS === 'android'){
      BleManager.enableBluetooth().then(() => {
        console.log('Bluetooth is turned on!');
      });
    }

    BleManager.start({showAlert: false}).then(() => {
      console.log('BleManager initialized');
    });

    let stopDiscoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      peripheral => {
        console.log('discover peripheral', peripheral)

        if(peripheral.name) {
          if(this.peripherals.filter(a=>a.name === peripheral.name).length === 0) {
            this.peripherals.push(peripheral)
          }
        }
      },
    );
    let stopConnectListener = BleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      peripheral => {
        console.log('BleManagerConnectPeripheral:', peripheral);
      },
    );
    let stopScanListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        this.setState({isScanning: false});
        console.log('scan stopped');
      },
    );

    if (Platform.OS === 'android' && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then(result => {
        if (result) {
          console.debug(
            '[handleAndroidPermissions] User accepts runtime permissions android 12+',
          );
        } else {
          console.error(
            '[handleAndroidPermissions] User refuses runtime permissions android 12+',
          );
        }
      });
    } else if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(result => {
        if (result) {
          console.log('Permission is OK');
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(result => {
            if (result) {
              console.log('User accepted');
            } else {
              console.log('User refused');
            }
          });
        }
      });
    }
  }

  startScan() {
    let { isScanning } = this.state;

    if (!isScanning) {
        BleManager.scan([], 5, true)
        .then(() => {
          console.log('start scan')
          this.setState({isScanning: true});
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  async retrieveServices(id) {
    return new Promise((resolve, reject) => {
      console.log('retrieving services')
      BleManager.retrieveServices(id).then(async (peripheralInfo) => {
        setTimeout(() => {
          console.log('services retrieved')
          resolve(peripheralInfo)
        })}).catch(err=>{
          console.log('err', err);
        });
    })
  }

  async connectDevice(id) {
    return new Promise((resolve, reject) => {
      BleManager.connect(id).then((peripheralInfo) => {
        setTimeout(() => {
          console.log('periperal connected')
          resolve(peripheralInfo)
        }, 1500)}).catch(err=>{
          console.log('err', err);
          this.setState({
            connection_error: true
          })
        });
    })
  }

  async write(id, serviceId, charId, val ) {
    return new Promise(async (resolve, reject) => {
      console.log('writing val ', val)
      await this.checkConnectionConnect(id);
      BleManager.write(id,serviceId, charId,val,10000000)
        .then((characteristic) => {console.log('characteristic written', characteristic)})
          /* setTimeout(() => {
            console.log('write result', characteristic);
            resolve(characteristic)
          }, 1500)}) */
        .catch(err=>{
          console.log('err', err);
        });

        setTimeout(() => {
          resolve(true)
        }, 1500)
    })
  }

  async checkConnectionConnect(id) {
    return new Promise(async (resolve, reject) => {
      BleManager.isPeripheralConnected(id, []).then((isConnected)=>{
        console.log('isConnected', isConnected)
        if(isConnected) {
          resolve(true)
        } else {
          console.log('reconnecting1')
          this.connectDevice(id).then(a=>{
            console.log('reconnected')
            this.retrieveServices(id).then(b=>{
              console.log('retrieving services')
              resolve(true)
            })
          }).catch(err=>{
            this.setState({
              connection_error: true
            })
          })
        }
      })
    })
  }

  async read(id, serviceId, charId, getRaw) {
    return new Promise(async (resolve, reject) => {
      await this.checkConnectionConnect(id);
      console.log('reading')
      BleManager.read(id, serviceId, charId).then(async (characteristic) => {
        setTimeout(() => {
          console.log('characteristic read', characteristic)
          console.log("bytes", bytesToString(characteristic))
          console.log("Buffer", Buffer.from(characteristic))

          let result = bytesToString(characteristic);
          if(getRaw) {
            resolve(characteristic)
          } else {
            resolve(result)
          }
        }, 1500)}).catch(err=>{
          console.log('err', err);
        });
    })
  }

  connectPeripheral(connected_peripheral) {
    this.setState({
      connected_peripheral,
      screen: 3,
      connection_error: false,
      retrievingWifi: true
    }, async ()=>{
      let peripheral_id = connected_peripheral.id;

      console.log('connecting')
      await this.checkConnectionConnect(peripheral_id);
      console.log('connected')
  
      await this.retrieveServices(peripheral_id);

      // write to get num of wifi
      let cService = 'A173E240-A5B8-11E5-A837-0800200C9A66';
      let cCharacteristic = 'A173E241-A5B8-11E5-A837-0800200C9A66';
      await this.write(peripheral_id, cService, cCharacteristic, [5]);
      //await retrieveServices(peripheral_id)
      setTimeout(()=>{console.log('waiting')}, 3000);
      console.log('tiemout passed')
      let wifiCount = await this.read(peripheral_id, cService, cCharacteristic, true);

      let buffer_wifi = Buffer.from(wifiCount);
      wifiCount = buffer_wifi.readUInt8(0, true);

      console.log('---------wifiCount--------', wifiCount)
      console.log('typepo wifiCount', typeof wifiCount, `"${wifiCount}"`);

      if(wifiCount) {
        console.log('reading wifiCount', wifiCount);
        let readWriteWifiNameService = 'A172D0D1-A5B8-11E5-A837-0800200C9A66';
        let writeWifiNameChar = 'A1734606-A5B8-11E5-A837-0800200C9A66';
        let readWifiNameChar = 'a1736d12-a5b8-11e5-a837-0800200c9a66';

        wifiCount = 3;
        let wifi_list = [];
        for(var i = 0; i < wifiCount; i++) {
          console.log('--------reading wifi index---------: ', i)
          let result = await this.write(peripheral_id, readWriteWifiNameService, writeWifiNameChar, [i]);
          console.log('write result', result)
          setTimeout(()=>{console.log('waiting')}, 3000);
          let read_result = await this.read(peripheral_id, readWriteWifiNameService, readWifiNameChar);
          setTimeout(()=>{console.log('waiting')}, 3000);
          console.log('read_result', read_result)

          if(read_result && read_result != '') {
            wifi_list.push(read_result)
            this.setState({
              wifi_list
            })
          }
        }

        this.setState({retrievingWifi: false})
      }
    })
    
  }

  async forceSync() {
    let { wifi_name, password, connected_peripheral } = this.state;

    this.setState({syncing: true, eventLogType: null})

    let peripheral_id = connected_peripheral.id;
    console.log('wifi_name', wifi_name)
    console.log('password', password)
    password = password ? password : ""

    const WIFI_SSID_CHAR = 'A172F7E1-A5B8-11E5-A837-0800200C9A66';
    const WIFI_PSD_CHAR = 'A172F7E2-A5B8-11E5-A837-0800200C9A66';
    const WIFI_SECT_CHAR = 'A172F7E3-A5B8-11E5-A837-0800200C9A66';
    const EVENT_SERVICE = 'A173E242-A5B8-11E5-A837-0800200C9A66';
    const EVENT_SEVERLOG_CHAR = 'A173E243-A5B8-11E5-A837-0800200C9A66';
    let COMM_SERVICE = 'A173E240-A5B8-11E5-A837-0800200C9A66';
    let COMMAND_CHAR = 'A173E241-A5B8-11E5-A837-0800200C9A66';
    const WIFI_SERVICE = 'A172D0D1-A5B8-11E5-A837-0800200C9A66';

    let ssid = stringToBytes(wifi_name);

    console.log('----------- write wifi name ---------')
    let result = await this.write(peripheral_id, WIFI_SERVICE,WIFI_SSID_CHAR,ssid); 
    console.log('result name', result)

    console.log('----------- write wifi password ---------')
    let psdVal = stringToBytes(password);
    result = await this.write(peripheral_id, WIFI_SERVICE,WIFI_PSD_CHAR,psdVal);
    console.log('result password', result)

    console.log('----------- write wifi security ---------')
    let wep = [1];
    await this.write(peripheral_id, WIFI_SERVICE,WIFI_SECT_CHAR,wep);
    console.log('result security', result);

    console.log('----------- write rdup dns ---------')
    const url = stringToBytes(`tst.wearablesclinicaltrials.com`);
    await this.write(peripheral_id, "A172D0D1-A5B8-11E5-A837-0800200C9A66","A172F7E0-A5B8-11E5-A837-0800200C9A66",url);


    let interval = setTimeout(()=>{
      this.setState({
        connection_error: true
      })
    }, 10)

    let writeVal = [1];
    // sync
    console.log('----------- write sync ---------')
   await this.write(peripheral_id, COMM_SERVICE,COMMAND_CHAR,writeVal);

   console.log('----------- read event log ---------')
   let raw_event_lot = await this.read(peripheral_id, EVENT_SERVICE,EVENT_SEVERLOG_CHAR, true);
    console.log('raw_event_lot', raw_event_lot)
   const buffer = Buffer.from(raw_event_lot);
   const eventLogType = buffer.readUInt8(0, true);

   console.log('eventLogType', eventLogType);

    clearTimeout(interval)

   this.setState({
    eventLogType,
    syncing: false
   })
  }

  selectWifi(wifi_name) {
    console.log('selected', wifi_name)
    this.setState({
      wifi_name
    })
  }

  updatePassword(password) {
    this.setState({
      password
    })
  }

  pet_selection_action(pet) {
    this.setState({
      selected_pet: pet,
      screen: 1
    })
  }

  render_pet_selection() {
    let pets = this.state.pets || [];

    let pet_rows = pets.map((pet) => {
      let pet_name = StringUtils.displayName(pet);
      return <View key={pet._id}>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.pet_selection_action(pet) }}>
          <Text style={styles.selection_row_title}>{ pet_name }</Text>
        </TouchableOpacity>
        <Line />
      </View>
    })

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Select a pet</Text>
      { pet_rows }
      <TouchableOpacity onPress={ () => { this.props.navigation.push('PetDetailsEdit', { type: 'bio', add_new: true, success_action: () => { this.pull_pets() }}) }} style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <Icon name='plus-circle' color={Colors.PRIMARY} />
        <View style={{ marginLeft: 15 }}>
          <Text style={{ fontSize: 15, fontWeight: 'medium', color: '#535353' }}>{ 'Add A New Pet' }</Text>
          <Text style={{ fontSize: 14, color: '#575762', marginTop: 3 }}>{ 'Add another pet to your account' }</Text>
        </View>
      </TouchableOpacity>
    </View>
  }

  render() {
    let { screen, isScanning, connected_peripheral, wifi_list, wifi_name, retrievingWifi, eventLogType, syncing, pet_setup, connection_error, password } = this.state;

    let peripherals = this.peripherals;

    /**
     * export const SENSOR_FAIL_1 = "No SSID, Wifi connection was not attempted";
      export const SENSOR_FAIL_2 ="Invalid Wi-Fi Network Name (SSID) or Password. Please check and try again.";
      export const SENSOR_FAIL_3 ="Invalid Wi-Fi Network Name (SSID). Please check and try again";
      export const SENSOR_FAIL_4 = "Invalid Password. Please check and try again. ";
      export const SENSOR_FAIL_5 ="Timed Out Access Point Connection Attempt, failed Wifi access point connection";
      export const SENSOR_FAIL_6 = "Failed Rudp server connection";
      export const SENSOR_FAIL_7 ="Wifi connection aborted due to low bandwidth between Sensor and Rudp server.";
      export const SENSOR_FAIL_8 ="Wifi connection aborted due to Sensor low battery condition detected during Rudp upload.";

     */

    let codes = [
      "Sync Successful!",
      "No SSID, Wifi connection was not attempted",
      "Invalid Wi-Fi Network Name (SSID) or Password. Please check and try again.",
      "Invalid Wi-Fi Network Name (SSID). Please check and try again",
      "Invalid Password. Please check and try again. ",
      "Timed Out Access Point Connection Attempt, failed Wifi access point connection",
      "Failed Rudp server connection",
      "Wifi connection aborted due to low bandwidth between Sensor and Rudp server.",
      "Wifi connection aborted due to Sensor low battery condition detected during Rudp upload."
    ];

    let device_types = [{ name: 'AGL2', value: 'Sensor###AGL2' }, { name: 'AGL3', value: 'Sensor###AGL3' }, { name: 'HPN1', value: 'Sensor###HPN1' }];

    return <Screen title='Connect Device' scroll={true} navigation={this.props.navigation}>
      <ScrollView style={{flex: 1}}>
        {screen === 0 ? <View>
          {this.render_pet_selection()}
        </View> : null}

        {screen === 1 ? <View>
          {pet_setup ? <View></View> : null}
          {!pet_setup ? <View>
            <Text>Setup Pet's Device</Text>
            <View>
              <Input type={'text'} placeholder={'Device Number'} onChangeText={(deviceNumber)=>{this.setState({deviceNumber})}} />

              <Picker
              style={{ borderRadius: 10, backgroundColor: 'white', padding: 10, paddingTop: 15 }}
              selectedValue={this.state.pet_breed}
              onValueChange={ (deviceType) => {
                this.setState({ deviceType })
              }}>
                {device_types.map(type=><Picker.Item key={type.value} label={type.name} value={type.value} />)}
                
            </Picker>



              <TouchableOpacity style={{padding: 20, backgroundColor: 'blue', margin: 40}} onPress={()=>{this.setState({screen: 2, pet_setup: false})}}><Text style={{ color: 'white' }}>Continue</Text></TouchableOpacity>
            </View>
          </View> : null}
        </View> : null }

        {screen === 2 ? <View style={{flexDirection: 'column'}}>
            {isScanning ? <Text>Scanning ...</Text> :
            <TouchableOpacity style={{backgroundColor: 'blue', padding: 20, margin: 40}} onPress={this.startScan}><Text style={{color: 'white'}}>Scan Devices</Text></TouchableOpacity>}

            {peripherals && peripherals.length ? <View style={{flexDirection: 'column'}}>
              <Text>Bluetooth Devices</Text>
              <Text style={{color: 'red'}}>If you don't see your device listed below, please shake the device and hit the 'Scan Devices' button again.</Text>
              {peripherals.map(a=><TouchableOpacity onPress={()=>{this.connectPeripheral(a)}}><Text style={{backgroundColor: 'blue', color: 'white', padding: 20}}>{a.name}</Text></TouchableOpacity>)}
            </View> : null}
          </View> : null}


        <View>
          {screen === 3 ? 
          <View>
            {connection_error ? <View>
              <Text>Connection error: Please shake the device and try connecting again</Text>
              <TouchableOpacity onPress={()=>{this.connectPeripheral(connected_peripheral)}}><Text style={{color: 'white', backgroundColor: 'green', padding: 20}}>Re-connect</Text></TouchableOpacity>
              </View> : <>
            <Text>Connected to: {connected_peripheral.name}</Text>
            <View style={{flexDirection: 'column'}}>
              <Text>Wifi list</Text>
              {wifi_list ? <View>
                  {wifi_list.map(a=><View><TouchableOpacity onPress={()=>{this.selectWifi(a)}}><Text style={{color: 'white', backgroundColor: 'green', padding: 20}}>{a}</Text></TouchableOpacity>
                  {wifi_name && wifi_name === a ? <View>
                    <Input value={password} type={'password'} placeholder={'type password'} onChangeText={this.updatePassword} />
                    <TouchableOpacity onPress={this.forceSync}><Text style={{color: 'white', backgroundColor: 'black', padding: 20}}>Connect & sync</Text></TouchableOpacity>
                  </View> : null}

                  </View>)}
                </View> : null}
              {retrievingWifi && !syncing ? <Text>Retrieving ...</Text> : null}
              {syncing ? <Text style={{color: 'red'}}>Syncing...</Text> : null}
              {eventLogType || eventLogType === 0 ? <Text style={{color: 'red'}}>Sync result: {codes[eventLogType]}</Text> : null}
            </View></>}
          </View> :
          null}
        </View>
      </ScrollView>
    </Screen>
  }

}

export default WearableConnectScreen;

const styles = StyleSheet.create({
  section_container: {
    paddingRight: 20,
    paddingLeft: 20
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
  },
  section_title_og: {
    fontSize: 22,
    fontWeight: 'semibold'
  },
  section_title: {
    fontSize: 18,
    fontWeight: 'medium',
    color: '#0054A4'
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
  triage_question: {
    fontSize: 15,
    marginTop: 15,
    marginBottom: 15
  },
  triage_buttons_container: {
    flexDirection: 'row'
  },
  triage_button: {
    flex: 1,
    backgroundColor: '#e7e7e7',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12
  },
  triage_button_title: {
    fontWeight: 'semibold',
    fontSize: 15,
    color: '#474747',
  },
  triage_button_selected: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.PRIMARY
  },
  triage_button_title_selected: {
    fontWeight: 'semibold',
    fontSize: 15,
    color: 'white',
  },
  triage_button_buffer: {
    width: 10
  }
});
