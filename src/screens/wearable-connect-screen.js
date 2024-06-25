import React, { Component } from "react";
import LottieView from 'lottie-react-native';
import { StyleSheet, View, NativeModules,
  NativeEventEmitter, TouchableOpacity, Linking, PermissionsAndroid, Platform, PERMISSIONS, Image, Dimensions } from 'react-native';
import { Screen, Line, Text, Icon, Input, Colors, Button } from '../components';
import { setItem, getItem } from '../../storage';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Network from 'expo-network';
import { Marker } from 'react-native-maps';
import { ScrollView } from "react-native-gesture-handler";
import { BleManager as BleManagerPlx } from 'react-native-ble-plx';
import BleManager from 'react-native-ble-manager';
import { Picker } from '@react-native-picker/picker';
import { Video }  from 'expo-av';
import { stringToBytes, bytesToString } from "convert-string";
import { PetsController, WearablesController } from "../controllers";
import { StringUtils }       from '../utils';

var Buffer = require("buffer/").Buffer;

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

class WearableConnectScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      screen: 0,
      loading_pets: false,
      peripherals: [],
      device_types: [{ name: 'AGL2', value: 'Sensor###AGL2' }, { name: 'AGL3', value: 'Sensor###AGL3' }, { name: 'HPN1', value: 'Sensor###HPN1' }],
      deviceType: { name: 'AGL3', value: 'Sensor###AGL3' },
      bluetooth_scan_started: false,
      error_codes: [
        "Sync Successful!",
        "No SSID, Wifi connection was not attempted",
        "Invalid Wi-Fi Network Name (SSID) or Password. Please check and try again.",
        "Invalid Wi-Fi Network Name (SSID). Please check and try again",
        "Invalid Password. Please check and try again. ",
        "Timed Out Access Point Connection Attempt, failed Wifi access point connection",
        "Failed Rudp server connection",
        "Wifi connection aborted due to low bandwidth between Sensor and Rudp server.",
        "Wifi connection aborted due to Sensor low battery condition detected during Rudp upload.",
        "Remote server error, please try again."
      ]
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

    this.validateSensor = this.validateSensor.bind(this);
    this.checkBluetoothState = this.checkBluetoothState.bind(this);

    this.completeDeviceSetup = this.completeDeviceSetup.bind(this);
  }

  async componentDidMount() {
    try {
      let bluetooth_state = await this.checkBluetoothState();

      //Linking.openSettings();

      this.setState({ loading_pets: true, bluetooth_state });

      let user_pets_response = await WearablesController.getUserPets({});
      let pets               = user_pets_response && user_pets_response.data && user_pets_response.data.pets ? user_pets_response.data.pets : [];

      console.log('user_pets_response', user_pets_response.data.pets)

      this.setState({ pets: pets, loading_pets: false });

      console.log('Platform', Platform)

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

    } catch(err) {
      this.setState({bluetooth_state: false})
    }
  }

  async checkBluetoothState(user_initiated) {
    return new Promise(async (resolve, reject) => {

      if (Platform.OS === 'android') {
        if (Platform.OS === 'android' && Platform.Version >= 31) {
          PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]).then(result => {
            if (result) {
              BleManager.enableBluetooth().then(result=>{
                console.log('bluetooth enabled result', result)
                BleManager.checkState().then(the_state=>{
                  console.log('the_state', the_state)
                  switch(the_state) {
                    case "unauthorized":
                    case "off":
                    case "unknown":
                      resolve(false);
                      break;
                    default:
                      resolve(true);
                    break;
                  }});
              }).catch(err=>{
                resolve(false);
              })
              console.debug(
                '[handleAndroidPermissions] User accepts runtime permissions android 12+',
              );
            } else {
              resolve(false);
              console.error(
                '[handleAndroidPermissions] User refuses runtime permissions android 12+',
              );
            }
          });
        } else if (Platform.OS === 'android' && Platform.Version >= 23) {
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(result => {
            console.log('asking permissions', result)
            if (result) {
              BleManager.enableBluetooth().then(result=>{
                console.log('bluetooth enabled result', result)
                BleManager.checkState().then(the_state=>{
                  console.log('the_state', the_state)
                  switch(the_state) {
                    case "unauthorized":
                    case "off":
                    case "unknown":
                      resolve(false);
                      break;
                    default:
                      resolve(true);
                    break;
                  }});
              }).catch(err=>{
                resolve(false);
              })
            } else {
              PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
              ).then(result => {
                if (result) {
                  BleManager.enableBluetooth().then(result=>{
                    console.log('bluetooth enabled result', result)
                    BleManager.checkState().then(the_state=>{
                      console.log('the_state', the_state)
                      switch(the_state) {
                        case "unauthorized":
                        case "off":
                        case "unknown":
                          resolve(false);
                          break;
                        default:
                          resolve(true);
                        break;
                      }});
                  }).catch(err=>{
                    resolve(false);
                  })
                } else {
                  resolve(false);
                }
              });
            }
          });
        } else {
          BleManager.enableBluetooth().then(result=>{
            console.log('bluetooth enabled result', result)
            BleManager.checkState().then(the_state=>{
              console.log('the_state', the_state)
              switch(the_state) {
                case "unauthorized":
                case "off":
                case "unknown":
                  resolve(false);
                  break;
                default:
                  resolve(true);
                break;
              }});
          }).catch(err=>{
            resolve(false);
          })
        }
      }

      if (Platform.OS === 'ios') {
        if(user_initiated) {
          Linking.openURL('app-settings:');
        } else {
          const manager = new BleManagerPlx();
          console.log('manager', manager)

          const subscription = manager.onStateChange((state) => {
            let enabled = state === 'PoweredOn';
            resolve(enabled);
            this.setState({bluetooth_state: enabled})
          }, true);
          manager.state();
        }
      }
    });
  }

  startScan() {
    let { isScanning } = this.state;

    if (!isScanning) {
        BleManager.scan([], 5, true)
        .then(() => {
          console.log('start scan')
          this.setState({ isScanning: true, bluetooth_scan_started: true });
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
      }).catch((error) => { console.log("==== ERROR ===="); console.log(error) })
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
      screen: 4,
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

        wifiCount = 10;

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
            this.setState({ wifi_list: wifi_list })
          }
        }

        this.setState({retrievingWifi: false})
      }
    })

  }

  async forceSync() {
    let { wifi_name, password, connected_peripheral, is_update, oldDeviceNumber, deviceNumber, deviceType, petId } = this.state;

    this.setState({syncing: true, eventLogType: null, error_message: null})

    let peripheral_id = connected_peripheral.id;
    console.log('wifi_name', wifi_name)
    console.log('password', password)
    password = password ? password : "";

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


    let writeVal = [1];
    // sync
    console.log('----------- write sync ---------')
   await this.write(peripheral_id, COMM_SERVICE,COMMAND_CHAR,writeVal);

   console.log('----------- read event log ---------')
   let raw_event_lot = await this.read(peripheral_id, EVENT_SERVICE,EVENT_SEVERLOG_CHAR, true);
    console.log('raw_event_lot', raw_event_lot)
   const buffer = Buffer.from(raw_event_lot);
   const eventLogType = buffer.readUInt8(0, true);

   console.log('eventLogType', eventLogType, typeof eventLogType);

  if(eventLogType) {
    this.setState({
      eventLogType,
      syncing: false
    })
  } else {
    let assign_response;

    console.log('in update or assign', is_update)

    let data = {
      deviceNumber, 
      deviceType: deviceType.value, 
      wifi_name,
      petId, 
      oldDeviceNumber: oldDeviceNumber ? oldDeviceNumber : deviceNumber
    }
 
    console.log('data', data)

    console.log('is_update', is_update)

    if(is_update) {
      assign_response = await WearablesController.updateSensor(data).catch(err=>{console.log('err', err)})
    } else {
      assign_response = await WearablesController.assignSensor(data);
    }

    console.log('assign_response', JSON.stringify(assign_response));

    /* { 
      "success": false, 
      "error": { 
        "status": { "success": false, "httpStatus": 400 }, 
        "errors": [{ "code": "WEARABLES_INVAL_ERR_010", "message": "Please select valid device number", "key": "service.asset.invalid.deviceNumber" }] 
      } 
    } */

    if(assign_response && assign_response.success) {
      this.setState({
        error_message: null,
        eventLogType,
        syncing: false
      })
    } else {
      let error_message = assign_response.error && assign_response.error.errors && assign_response.error.errors.length ? assign_response.error.errors[0].message : null;

      let error_key = assign_response.error && assign_response.error.errors && assign_response.error.errors.length ? assign_response.error.errors[0].key : null;

      let show_device_number_edit = error_key === 'service.asset.invalid.deviceNumber'
      
      this.setState({
        eventLogType: 9,
        error_message,
        syncing: false,
        show_device_number_edit,
        screen: show_device_number_edit ? 2 : this.state.screen
      })
    }
  }
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
    console.log('pet', pet)

    let screen = pet && pet.devices && pet.devices.length && pet.devices[0].isDeviceSetupDone ? 1 : .5

    this.setState({
      petId: pet.petID,
      selected_pet: pet,
      screen
    })
  }

  render_pet_selection() {
    let pets = this.state.pets || [];
    let is_loading_pets = this.state.loading_pets;

    let pet_rows = pets.map((pet) => {
      let pet_name = pet.petName;
      return <View key={pet._id}>
        <TouchableOpacity style={styles.selection_row_container} onPress={ () => { this.pet_selection_action(pet) }}>
          <Text style={styles.selection_row_title}>{ pet_name }</Text>
        </TouchableOpacity>
        <Line />
      </View>
    })

    return <View style={styles.section_container}>
      <Text style={styles.section_title}>Select a pet</Text>
      { is_loading_pets ? <View style={{ alignItems: 'center', marginTop: 10 }}>
        <LottieView autoPlay style={{ width: 100, height: 100 }} source={ require('../../assets/animations/dog-trot.json') } />
        <Text style={{ fontWeight: 'medium' }}>Loading Pets</Text>
      </View> : null }
      { pet_rows }
      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}
                        onPress={ () => {
                          this.props.navigation.push('AddPetFlow');
                        }}>
        <Icon name='plus-circle' color={Colors.PRIMARY} />
        <View style={{ marginLeft: 15 }}>
          <Text style={{ fontSize: 15, fontWeight: 'medium', color: '#535353' }}>{ 'Add A New Pet' }</Text>
          <Text style={{ fontSize: 14, color: '#575762', marginTop: 3 }}>{ 'Add another pet to your account' }</Text>
        </View>
      </TouchableOpacity>
    </View>
  }

  async validateSensor(is_update) {

    let { deviceNumber, deviceType, device_types } = this.state;

    deviceType = deviceType ? deviceType : device_types[0].value;

    let data = {
      deviceNumber
    }

    this.setState({ loading_validate_num: true });

    console.log('data', data)

    let res             = await WearablesController.validateSensorNumber(data);
    console.log('res', JSON.stringify(res))
    let is_number_valid = res && res.data && res.data.validate_device_response && res.data.validate_device_response.data && res.data.validate_device_response.data.isValidDeviceNumber ? true : false;

    if (deviceNumber && is_number_valid) {
      this.setState({ screen: 3, loading_validate_num: false, is_update })
    } else {
      this.setState({ device_setup_error: "The device number is invalid", loading_validate_num: false })
    }
  }

  render_pet_selection_screen = () => {
    if (this.state.screen !== 0 || !this.state.bluetooth_state) {
      return null;
    }

    return this.render_pet_selection();
  }

  async completeDeviceSetup(device, selected_pet) {
    let { deviceNumber, deviceType } = device;

    let petId = selected_pet.petID;

    let data = { deviceNumber, deviceType, petId };

    let assign_response = await WearablesController.completeManually(data).catch(err=>{console.log('err', err)})

    console.log('assign_response', JSON.stringify(assign_response))

    let user_pets_response = await WearablesController.getUserPets({});
    let pets               = user_pets_response && user_pets_response.data && user_pets_response.data.pets ? user_pets_response.data.pets : [];

    console.log('user_pets_response', user_pets_response.data.pets)

    this.setState({ pets: pets, loading_pets: false });
  }

  render_video_screen = () => {
    if (this.state.screen !== 0.5) {
      return null;
    }

    return <View style={{ padding: 20 }}>
      <Text style={styles.section_title}>Welcome!</Text>
      <Text style={{ fontWeight: 'medium', fontSize: 16, marginTop: 5, marginBottom: 20 }}>Here’s what to expect:</Text>
      <Video style={{ width: '100%', height: 300, borderRadius: 5 }}
             source={{ uri: 'https://4728109.fs1.hubspotusercontent-na1.net/hubfs/4728109/PetFit%20in-app.mov' }}
             useNativeControls
             resizeMode="contain"
             shouldPlay={true}
             isLooping={true}
           />
      <Button style={{ padding: 20, marginTop: 20 }}
              title='Continue'
              onPress={()=>{ this.setState({ screen: 1 }) }} />
    </View>
  }

  render_pet_device_screen = () => {
    if (this.state.screen !== 1) {
      return null;
    }

    let selected_pet = this.state.selected_pet;
    let pet_devices  = selected_pet && selected_pet.devices ? selected_pet.devices : [];
    let has_devices  = pet_devices.length > 0;

    let device_rows  = pet_devices.map((device) => {
      console.log('device', device);
      let { isDeviceSetupDone } = device;
      return <View style={{ alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 16 }}>{ device.deviceNumber }</Text>
            <Text style={{ fontSize: 13, fontWeight: 'medium', color: Colors.DARK_GREY }}>Device Number</Text>
          </View>
          <View style={{ width: 20 }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 16 }}>{ 'AGL3' }</Text>
            <Text style={{ fontSize: 13, fontWeight: 'medium', color: Colors.DARK_GREY }}>Device Model</Text>
          </View>
        </View>
        {/* <Button style={{padding: 20 }}
                title='Update Device'
                onPress={()=>{
                  this.setState({ is_update: true, screen: 2, deviceNumber: device.deviceNumber, oldDeviceNumber: device.deviceNumber });
                }} /> */}

        { !isDeviceSetupDone ? <Button style={{padding: 20 }}
                                       title='Complete Device Setup'
                                       onPress={ ()=> { 
                                       this.setState({ 
                                        screen: 3, 
                                        is_update: true,
                                        deviceNumber: device.deviceNumber
                                      }) }} />
                             : null }
      </View>
    })

    return <View>
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Image style={{ height: 40, width: '100%', borderRadius: 20, marginTop: 15, marginBottom: 15 }} resizeMode='contain' source={ require('../../assets/images/bluetooth.png') } />
        <Text style={styles.section_title} >{ selected_pet.petName }'s Device</Text>
        <View>
          { has_devices ? <View>{ device_rows }</View>
                        : <View>
                            <Text style={{ fontSize: 16, marginTop: 20, marginBottom: 20 }}>{selected_pet.petName} doesn't have any devices set up</Text>
                            <Button style={{padding: 20 }}
                                    title='Setup Device'
                                    onPress={ () => {
                                      this.setState({ screen: 2, is_update: false })
                                    }} />
                          </View> }
        </View>
      </View>
    </View>
  }

  render_device_number_input = () => {
    if (this.state.screen !== 2) {
      return null;
    }

    let device_setup_error   = this.state.device_setup_error;
    let loading_validate_num = this.state.loading_validate_num;
    let show_device_number_edit = this.state.show_device_number_edit;

    return <View>
      <View style={{ padding: 20 }}>
        <View>
          {show_device_number_edit ? <Text style={{color: 'red', textAlign: 'center', marginTop: 15, fontSize: 16, marginBottom: 15}}>The current device number could not be associated. Please make sure this number is correct and is not assigned to another pet.</Text> : null}
          <Image style={{ height: 200, width: '100%', marginBottom: 15, borderRadius: 20 }} resizeMode='cover' source={ require('../../assets/images/device-number.png') } />
          <Text style={{ textAlign: 'center', fontSize: 16, fontWeight: 'medium', marginBottom: 5 }}>What’s your device number?</Text>
          <Text style={{ textAlign: 'center', fontSize: 15, marginBottom: 5 }}>This is found on the back of your device and listed after “DN:” at the top.</Text>
          <View style={{ height: 10 }} />
          <Input type={'text'} value={this.state.deviceNumber} placeholder={'Device Number'} onChangeText={(deviceNumber) => { 
            this.setState({ 
              oldDeviceNumber: !this.state.oldDeviceNumber ? deviceNumber : this.state.oldDeviceNumber,
              deviceNumber: deviceNumber.toUpperCase()})
            }} />
          { device_setup_error ? <Text style={{ color: 'red', marginTop: 10, textAlign: 'center' }}>{ device_setup_error }</Text> : null }
          <Button title='Continue'
                  style={{ marginTop: 10, padding: 20 }}
                  loading={loading_validate_num}
                  onPress={()=>this.validateSensor(show_device_number_edit)} />
        </View>
      </View>
    </View>
  }

  render_bluetooth_scan = () => {
    if (this.state.screen !== 3) {
      return null;
    }

    let peripherals = this.peripherals;
    let is_scanning = this.state.isScanning;
    let bluetooths  = peripherals && peripherals.length ? peripherals : [];
    let scan_strtd  = this.state.bluetooth_scan_started;

    let bluetooth_rows = bluetooths.map( (a) => {
      return <TouchableOpacity onPress={()=>{this.connectPeripheral(a)}}>
               <Text style={{ padding: 20 }}>{ a.name }</Text>
               <Line />
             </TouchableOpacity>
    })

    if (!scan_strtd) {
      return <View style={{flexDirection: 'column', padding: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.section_title}>Bluetooth Device Scan</Text>
          <Image style={{ height: 100, width: '100%', borderRadius: 20, marginTop: 15, marginBottom: 15 }} resizeMode='contain' source={ require('../../assets/images/bluetooth.png') } />
          <Text style={{ fontWeight: 'medium', fontSize: 16 }}>Let’s find your device!</Text>
          <Text style={{ color: 'grey', fontSize: 16, textAlign: 'center', marginTop: 5 }}>Please make sure your device has been charged for at least 30 minutes. Unplug your device and position it near your phone for pairing.</Text>
          <Button title={ 'Scan Devices' }
                  style={{ padding: 20, marginTop: 20, width: '100%' }}
                  onPress={this.startScan} />
        </View>
      </View>
    }

    return <View style={{flexDirection: 'column', padding: 20 }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 16, fontWeight: 'medium', textAlign: 'center' }}>Select your device below. Your device name will start with “AGL3.”</Text>
        { is_scanning ? <View style={{ alignItems: 'center' }}>
                          <LottieView autoPlay style={{ width: 140, height: 140, marginTop: -2 }} source={ require('../../assets/animations/dog-trot.json') } />
                          <View style={{ backgroundColor: '#3276b6', flexDirection: 'row', alignItems: 'center', paddingRight: 15, paddingLeft: 15, borderRadius: 10, padding: 10, marginTop: -15, marginBottom: 5 }}>
                            <LottieView autoPlay style={{ width: 15, height: 15 }} source={ require('../../assets/animations/white-spinner.json') } />
                            <Text style={{ marginLeft: 8, fontSize: 14, color: 'white', fontWeight: 'medium' }}>Scanning ...</Text>
                          </View>
                        </View>
                      : <Button title={ 'Re-Scan for Device' }
                                style={{ padding: 20, marginTop: 15, width: 300 }}
                                onPress={this.startScan} /> }
      </View>

      { bluetooth_rows.length ? <View style={{flexDirection: 'column'}}>
                                  <Line style={{ marginTop: 15, marginBottom: 15 }} />
                                  <Text style={{ color: 'grey', marginBottom: 15, fontSize: 15 }}>Don’t see your device? Make sure your device is charged and try shaking it like you are mixing a margherita at 5pm on a Friday 💃.</Text>
                                  { bluetooth_rows }
                                </View>
                              : null }
    </View>
  }

  render_wifi_scan = () => {
    if (this.state.screen !== 4) {
      return null;
    }

    if (this.state.connection_error) {
      return <View style={{ padding: 20, alignItems: 'center' }}>
         <Text style={{ fontWeight: 'medium', fontSize: 18 }}>Connection error</Text>
         <Text style={{ fontSize: 16, color: 'grey', textAlign: 'center', marginTop: 5, marginBottom: 15 }}>Please shake the device and try connecting again</Text>
         <Button title='Re-connect'
                 style={{ width: '100%' }}
                 onPress={() => {
                   this.connectPeripheral(connected_peripheral)
                 }} />
       </View>
    }

    let connected_peripheral = this.state.connected_peripheral || { name: 'No Device Selected' };
    let wifi_list            = this.state.wifi_list || [];
    let wifi_name            = this.state.wifi_name;
    let password             = this.state.password;
    let retrievingWifi       = this.state.retrievingWifi;
    let syncing              = this.state.syncing;
    let eventLogType         = this.state.eventLogType;
    let error_codes          = this.state.error_codes;
    let error_message        = this.state.error_message;

    let wifi_rows = wifi_list.map((a) => {
      let is_selected = wifi_name && wifi_name === a;
      return <View>
        <TouchableOpacity onPress={()=>{this.selectWifi(a)}}>
          <Text style={{ padding: 20, fontSize: 16 }}>{ a }</Text>
        </TouchableOpacity>
        { is_selected ? <View>
                          <Input value={password} type={'password'} placeholder={'Enter WiFi Password'} onChangeText={this.updatePassword} />
                          <Button title='Connect & Sync'
                                  loading={syncing}
                                  style={{ marginTop: 10, marginBottom: 20 }}
                                  onPress={this.forceSync} />
                        </View>
                      : null }
        <Line />
      </View>
    })

    if (eventLogType === 0) {
      let window        = Dimensions.get('window');
      let window_height = window && window.height ? window.height : 300;
      return <View style={{ padding: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <View style={{ height: window_height / 2 - 250, width: '100%' }} />
          <Icon name='check-circle' size={60} color={Colors.GREEN} />
          <Text style={{ marginTop: 10, fontWeight: 'medium', fontSize: 16 }}>Synced</Text>
          <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center', marginBottom: 20 }}>
            <Image style={{ height: 25, width: 25, marginRight: 8 }} resizeMode='contain' source={ require('../../assets/images/bluetooth.png') } />
            <Text style={{ fontSize: 16 }}>{ connected_peripheral.name }</Text>
          </View>
        </View>
        <Button title='Back To Home'
                onPress={ () => { this.props.navigation.pop(); }}/>
      </View>
    }

    return <View style={{ padding: 20 }}>
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontWeight: 'medium', fontSize: 15 }}>Bluetooth Device Connected</Text>
        <View style={{ flexDirection: 'row', marginTop: 10, alignItems: 'center' }}>
          <Image style={{ height: 25, width: 25, marginRight: 8 }} resizeMode='contain' source={ require('../../assets/images/bluetooth.png') } />
          <Text style={{ fontSize: 16 }}>{ connected_peripheral.name }</Text>
        </View>
      </View>
      <Line style={{ marginTop: 30, marginBottom: 20 }} />
      <Text style={{ fontWeight: 'medium', fontSize: 15, textAlign: 'center' }}>WiFi Networks</Text>
      { wifi_rows }
      { retrievingWifi && !syncing ? <View style={{ backgroundColor: Colors.PRIMARY, flexDirection: 'row', alignItems: 'center', paddingRight: 15, paddingLeft: 15, borderRadius: 10, padding: 10, marginTop: 20, alignSelf: 'center' }}>
                                       <LottieView autoPlay style={{ width: 15, height: 15 }} source={ require('../../assets/animations/white-spinner.json') } />
                                       <Text style={{ marginLeft: 8, fontSize: 14, color: 'white', fontWeight: 'medium' }}>Scanning WiFi Networks ...</Text>
                                     </View>
                                   : null }
      { syncing ? <View style={{ backgroundColor: Colors.GREEN, flexDirection: 'row', alignItems: 'center', paddingRight: 15, paddingLeft: 15, borderRadius: 10, padding: 10, marginTop: 20, alignSelf: 'center' }}>
                    <LottieView autoPlay style={{ width: 15, height: 15 }} source={ require('../../assets/animations/white-spinner.json') } />
                    <Text style={{ marginLeft: 8, fontSize: 14, color: 'white', fontWeight: 'medium' }}>Syncing Device ...</Text>
                  </View>
                : null }
      { eventLogType && eventLogType !== 0 ? <Text style={{ color: 'red', textAlign: 'center', marginTop: 15, fontSize: 16 }}>{ error_message ? error_message : error_codes[eventLogType] }</Text> : null }
    </View>
  }

  render_enable_bluetooth = () => {
    if (this.state.bluetooth_state) {
      return null;
    }

    const checkB = async () => {
      let bluetooth_state = await this.checkBluetoothState(true);

      this.setState({ bluetooth_state })
    }

    return <View style={{ padding: 20, alignItems: 'center' }}>
      <Image style={{ height: 100, width: '100%', borderRadius: 20, marginTop: 15, marginBottom: 15 }} resizeMode='contain' source={ require('../../assets/images/bluetooth.png') } />
      <Text style={{ fontWeight: 'medium', fontSize: 18 }}>Bluetooth Is Disabled</Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginTop: 5, color: 'grey' }}>Please enable Bluetooth on your device to continue</Text>
      <Button style={{ marginTop: 10 }}
              title='Open Settings'
              onPress={checkB} />
    </View>
  }

  render() {
    let { screen, isScanning, connected_peripheral, wifi_list, wifi_name, retrievingWifi, eventLogType, syncing, connection_error, password, device_setup_error, error_codes } = this.state;

    /*
      export const SENSOR_FAIL_1 = "No SSID, Wifi connection was not attempted";
      export const SENSOR_FAIL_2 ="Invalid Wi-Fi Network Name (SSID) or Password. Please check and try again.";
      export const SENSOR_FAIL_3 ="Invalid Wi-Fi Network Name (SSID). Please check and try again";
      export const SENSOR_FAIL_4 = "Invalid Password. Please check and try again. ";
      export const SENSOR_FAIL_5 ="Timed Out Access Point Connection Attempt, failed Wifi access point connection";
      export const SENSOR_FAIL_6 = "Failed Rudp server connection";
      export const SENSOR_FAIL_7 ="Wifi connection aborted due to low bandwidth between Sensor and Rudp server.";
      export const SENSOR_FAIL_8 ="Wifi connection aborted due to Sensor low battery condition detected during Rudp upload.";
    */

    return <Screen title='Connect Device' scroll={true} navigation={this.props.navigation}>
      <ScrollView style={{ flex: 1 }}>
        { this.render_enable_bluetooth()     }
        { this.render_pet_selection_screen() }
        { this.render_video_screen()         }
        { this.render_pet_device_screen()    }
        { this.render_device_number_input()  }
        { this.render_bluetooth_scan()       }
        { this.render_wifi_scan()            }
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
