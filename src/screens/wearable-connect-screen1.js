import React, {useState, useEffect} from 'react';
import {
  Text,
  Alert,
  View,
  FlatList,
  Platform,
  StatusBar,
  SafeAreaView,
  NativeModules,
  NativeEventEmitter,
  useColorScheme,
  TouchableOpacity,
  PermissionsAndroid,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { stringToBytes, bytesToString } from "convert-string";
import { ScrollView } from 'react-native-gesture-handler';

var Buffer = require("buffer/").Buffer;

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const WearableConnectScreen = () => {
  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);

  const [wifiList, setWifiList] = useState([]);

  const handleGetConnectedDevices = () => {
    BleManager.getBondedPeripherals([]).then(results => {
      for (let i = 0; i < results.length; i++) {
        let peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
      }
    });
  };
  useEffect(() => {
    BleManager.enableBluetooth().then(() => {
      console.log('Bluetooth is turned on!');
    });
    BleManager.start({showAlert: false}).then(() => {
      console.log('BleManager initialized');
      handleGetConnectedDevices();
    });
    let stopDiscoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      peripheral => {
        if(peripheral.name) {
          peripherals.set(peripheral.id, peripheral);
          setDiscoveredDevices(Array.from(peripherals.values()));
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
        setIsScanning(false);
        console.log('scan stopped');
      },
    );
    if (Platform.OS === 'android' && Platform.Version >= 23) {
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
    return () => {
      stopDiscoverListener.remove();
      stopConnectListener.remove();
      stopScanListener.remove();
    };
  }, []);
  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 5, true)
        .then(() => {
          console.log('Scanning...');
          setIsScanning(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const retrieveServices = async (id) => {
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

  const connectDevice = async (id) => {
    return new Promise((resolve, reject) => {
      BleManager.connect(id).then((peripheralInfo) => {
        setTimeout(() => {
          console.log('periperal connected')
          resolve(peripheralInfo)
        }, 1500)}).catch(err=>{
          console.log('err', err);
        });
    })
  }

  const write = async (id, serviceId, charId, val ) => {
    return new Promise(async (resolve, reject) => {
      console.log('writing val ', val)
      await checkConnectionConnect(id);
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

  const checkConnectionConnect = async (id) => {
    return new Promise(async (resolve, reject) => {
      BleManager.isPeripheralConnected(id, []).then((isConnected)=>{
        console.log('isConnected', isConnected)
        if(isConnected) {
          resolve(true)
        } else {
          console.log('reconnecting1')
          connectDevice(id).then(a=>{
            console.log('reconnected')
            retrieveServices(id).then(b=>{
              console.log('retrieving services')
              resolve(true)
            })
          }).catch(err=>{
            console.log('err', err)
          })
        }
      })
    })
  }

  const read = async (id, serviceId, charId, getRaw) => {
    return new Promise(async (resolve, reject) => {
      await checkConnectionConnect(id);
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

  const connectSaved = () => {
    console.log('connecting to saved device ', saved_device)
    const saved_device = 'caf5676d-175b-7073-3add-86cc0f2e4a4b';
    connectToPeripheral({id: saved_device})
    /* {"advertising": {"isConnectable": 1, "kCBAdvDataRxPrimaryPHY": 129, "kCBAdvDataRxSecondaryPHY": 0, "kCBAdvDataTimestamp": 736171774.286013, "localName": "AGL3-01:2C:9C", "txPowerLevel": 8}, "connected": false, "id": "23478caa-6ff3-bfdb-acca-4a3ea7caa204", "name": "AGL3-01:2C:9C", "rssi": -77} */

    /* {"advertising": {"isConnectable": 1, "kCBAdvDataRxPrimaryPHY": 129, "kCBAdvDataRxSecondaryPHY": 0, "kCBAdvDataTimestamp": 736172836.055449, "localName": "AGL3-01:2C:94", "txPowerLevel": 8}, "id": "caf5676d-175b-7073-3add-86cc0f2e4a4b", "name": "AGL3-01:2C:94", "rssi": -55} */
  }

  // pair with device first before connecting to it
  const connectToPeripheral = async peripheral => {
    console.log('peripheral', peripheral)
    let peripheral_id = peripheral.id;

    console.log('connecting')
    await checkConnectionConnect(peripheral_id);
    console.log('connected')

    peripheral.connected = true;
    peripherals.set(peripheral.id, peripheral);
    setConnectedDevices(Array.from(peripherals.values()));
    setDiscoveredDevices(Array.from(peripherals.values()));

    await retrieveServices(peripheral_id)

    // when reading first, cannot find this service
    const WIFI_SERVICE = 'A172D0D1-A5B8-11E5-A837-0800200C9A66';
    let wifi_count_char = 'a1731ef0-a5b8-11e5-a837-0800200c9a66'; //
    let wifi_list = 'a1736d12-a5b8-11e5-a837-0800200c9a66';
    let WIFI_LATCH_CHAR = 'A1734606-A5B8-11E5-A837-0800200C9A66';
    let writeVal_wifi_count = [1, 60];
    let writeVal_wifi_count_agl = [5];

    let COMM_SERVICE = 'A173E240-A5B8-11E5-A837-0800200C9A66';
    let COMMAND_CHAR = 'A173E241-A5B8-11E5-A837-0800200C9A66';

    // could not find service
    let HPN1_WIFI_COMMAND_SERVICE = '00000001-AE46-4691-8124-71AF917f0CDA';
    let HPN1_WIFI_SCAN_CHAR = '00000100-AE46-4691-8124-71AF917f0CDA';

    const SCAN_SERVICE = 'A172D0D0-A5B8-11E5-A837-0800200C9A66';
const EVENT_SERVICE = 'A173E242-A5B8-11E5-A837-0800200C9A66';
const EVENT_SEVERLOG_CHAR = 'A173E243-A5B8-11E5-A837-0800200C9A66';

const WIFI_DHCP_CHAR = 'A172D0D2-A5B8-11E5-A837-0800200C9A66';
const WIFI_SSID_CHAR = 'A172F7E1-A5B8-11E5-A837-0800200C9A66';
const WIFI_PSD_CHAR = 'A172F7E2-A5B8-11E5-A837-0800200C9A66';
const WIFI_SECT_CHAR = 'A172F7E3-A5B8-11E5-A837-0800200C9A66';


    // could not find service
    //await write(peripheral_id, HPN1_WIFI_COMMAND_SERVICE, HPN1_WIFI_SCAN_CHAR, writeVal_wifi_count)
    /* let characteristic_write = await write(peripheral_id, COMM_SERVICE, COMMAND_CHAR, writeVal_wifi_count_agl)
    console.log('characteristic_write', characteristic_write) */

    /* await read(peripheral_id, WIFI_SERVICE, wifi_count_char);
    await read(peripheral_id, WIFI_SERVICE, wifi_list);
    await read(peripheral_id, WIFI_SERVICE, WIFI_LATCH_CHAR);
    await read(peripheral_id, COMM_SERVICE, COMMAND_CHAR); */

    /* await read(peripheral_id, WIFI_SERVICE, WIFI_DHCP_CHAR);
    await read(peripheral_id, WIFI_SERVICE, WIFI_SSID_CHAR);
    await read(peripheral_id, WIFI_SERVICE, WIFI_PSD_CHAR);
    await read(peripheral_id, WIFI_SERVICE, WIFI_SECT_CHAR); */

    // write to get num of wifi
    let cService = 'A173E240-A5B8-11E5-A837-0800200C9A66';
    let cCharacteristic = 'A173E241-A5B8-11E5-A837-0800200C9A66';
    await write(peripheral_id, cService, cCharacteristic, [5]);
    //await retrieveServices(peripheral_id)
    setTimeout(()=>{console.log('waiting')}, 3000);
    console.log('tiemout passed')
    let wifiCount = await read(peripheral_id, cService, cCharacteristic, true);

    let buffer_wifi = Buffer.from(wifiCount);
  wifiCount = buffer_wifi.readUInt8(0, true);

   console.log('---------wifiCount--------', wifiCount)

    if(wifiCount && Array.isArray(wifiCount)) {
      console.log('wifi is array', wifiCount)
      wifiCount = wifiCount[0]
    }
    console.log('typepo wifiCount', typeof wifiCount, `"${wifiCount}"`);


    /* if(wifiCount) {
      console.log('reading wifiCount', wifiCount);
      let readWriteWifiNameService = 'A172D0D1-A5B8-11E5-A837-0800200C9A66';
      let writeWifiNameChar = 'A1734606-A5B8-11E5-A837-0800200C9A66';
      let readWifiNameChar = 'a1736d12-a5b8-11e5-a837-0800200c9a66';

      wifiCount = 10
      for(var i = 0; i < wifiCount; i++) {
        console.log('--------reading wifi index---------: ', i)
        let result = await write(peripheral_id, readWriteWifiNameService, writeWifiNameChar, [i]);
        console.log('write result', result)
        setTimeout(()=>{console.log('waiting')}, 3000);
        let read_result = await read(peripheral_id, readWriteWifiNameService, readWifiNameChar);
        setTimeout(()=>{console.log('waiting')}, 3000);
        console.log('read_result', read_result)

        setWifiList(wifiList.push(read_result))
      }
    } */

    // write wifiname
    //requestWriteSensorHandler(bleUUID.WIFI_SERVICE,bleUUID.WIFI_SSID_CHAR,[ssid]); 
    //let ssid = stringToBytes('FiOS-ZC90M');
    //WiFi-2.4 GHz
    //WiFi-5GHz
    let ssid = stringToBytes('WiFi-2.4 GHz');

    console.log('----------- write wifi name ---------')
    let result = await write(peripheral_id, WIFI_SERVICE,WIFI_SSID_CHAR,ssid); 
    console.log('result name', result)

    console.log('----------- write wifi password ---------')
    //let psdVal = stringToBytes('wire35okay0210mix');
    //let psdVal = stringToBytes('E8450@Milford190!#5');
    let psdVal = stringToBytes('E8450@Milford190!#24');
    result = await write(peripheral_id, WIFI_SERVICE,WIFI_PSD_CHAR,psdVal);
    console.log('result password', result)

    console.log('----------- write wifi security ---------')
    let wep = [1];
    await write(peripheral_id, WIFI_SERVICE,WIFI_SECT_CHAR,wep);
    console.log('result security', result);

    console.log('----------- write rdup dns ---------')
    const url = stringToBytes(`tst.wearablesclinicaltrials.com`);
    await write(peripheral_id, "A172D0D1-A5B8-11E5-A837-0800200C9A66","A172F7E0-A5B8-11E5-A837-0800200C9A66",url);

    let writeVal = [1];
    // sync
    console.log('----------- write sync ---------')
   await write(peripheral_id, COMM_SERVICE,COMMAND_CHAR,writeVal);

   console.log('----------- read event log ---------')
   let raw_event_lot = await read(peripheral_id, EVENT_SERVICE,EVENT_SEVERLOG_CHAR, true);
    console.log('raw_event_lot', raw_event_lot)
   const buffer = Buffer.from(raw_event_lot);
   const eventLogType = buffer.readUInt8(0, true);

   console.log('eventLogType', eventLogType);

  };
  // disconnect from device
  const disconnectFromPeripheral = peripheral => {
    BleManager.disconnect(peripheral.id)
      .then(() => {

      })
      .catch((err) => {
        console.log('err', err)
        console.log('fail to remove the bond');
      });

      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setConnectedDevices(Array.from(peripherals.values()));
      setDiscoveredDevices(Array.from(peripherals.values()));
      Alert.alert(`Disconnected from ${peripheral.name}`);
  };
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: 'white'
  };
  // render list of bluetooth devices
  return (
    <SafeAreaView style={[backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView>
      <View style={{paddingHorizontal: 20, paddingBottom: 200, flex: 1}}>
        <Text
          style={[
            {color: 'white'},
          ]}>
          React Native BLE Manager Tutorial
        </Text>
        <TouchableOpacity
          style={{backgroundColor: 'black', padding: 20}}
          activeOpacity={0.5}
          onPress={connectSaved}>
          <Text style={{color: 'white'}}>
            {'connect to saved device'}
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            {color: 'black'},
          ]}>
          Connected Devices:
        </Text>
        {connectedDevices.length > 0 ? (
              <FlatList
                data={connectedDevices}
                renderItem={({item}) => (
                  
                    <View style={{backgroundColor: 'black', margin: 20}}>
                      <View >
                        <Text style={{color: 'white'}}>{item.name}</Text>
                        <Text style={{color: 'white'}} >RSSI: {item.rssi}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          item.connected ? disconnectFromPeripheral(item) : connectToPeripheral(item)
                        }>
                        <Text
                          style={[
                            {fontWeight: 'bold', fontSize: 16, color: 'white'},
                          ]}>
                          {item.connected ? 'Disconnect' : 'Connect'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  
                )}
                keyExtractor={item => item.id}
              />
            )
         : (
          <Text>No connected devices</Text>
        )}


<Text
          style={[
            {color: 'black'},
          ]}>
          Wifi List:
        </Text>
        {wifiList.length > 0 ? (
              <FlatList
                data={wifiList}
                renderItem={({item}) => (
                  
                    <View style={{backgroundColor: 'black', margin: 20}}>
                      <View >
                        <Text style={{color: 'white'}}>{item}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>{}}>
                        <Text
                          style={[
                            {fontWeight: 'bold', fontSize: 16, color: 'white'},
                          ]}>
                        </Text>
                      </TouchableOpacity>
                    </View>
                  
                )}
                keyExtractor={item => item}
              />
            )
         : (
          <Text>No Wifi</Text>
        )}

        <TouchableOpacity
          style={{backgroundColor: 'black', padding: 20, marginTop: 20}}
          activeOpacity={0.5}
          onPress={startScan}>
          <Text style={{color: 'white'}}>
            {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            {color: 'white'},
          ]}>
          Discovered Devices:
        </Text>
        {discoveredDevices.length > 0 ? (
          <FlatList
            data={discoveredDevices}
            renderItem={({item}) => (
              
                <View style={{backgroundColor: 'black', margin: 20}}>
                  <View >
                    <Text style={{color: 'white'}}>{item.name}</Text>
                    <Text style={{color: 'white'}} >RSSI: {item.rssi}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      item.connected ? disconnectFromPeripheral(item) : connectToPeripheral(item)
                    }>
                    <Text
                      style={[
                        {fontWeight: 'bold', fontSize: 16, color: 'white'},
                      ]}>
                      {item.connected ? 'Disconnect' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                </View>
              
            )}
            keyExtractor={item => item.id}
          />
        ) : (
          <Text>No Bluetooth devices found</Text>
        )}
        
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default WearableConnectScreen;