import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { Component, useState, useEffect, useRef } from "react";
import { NavigationContainer  } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Device  from 'expo-device';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import {
  HomeScreen,
  AddPetScreen,
  ConsultationStartScreen,
  ConsultationChatScreen,
  ConsultationVideoAppointmentScreen,
  PetDetailsScreen,
  PetsScreen,
  SettingsScreen,
  VetLocatorScreen
} from './src/screens';

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (true || Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token.data;
}

const Stack = createStackNavigator();

export default function App() {

  const notificationListener = useRef();
  const responseListener = useRef();

  const [fontsLoaded, fontError] = useFonts({
      'Poppins-Thin':       require('./assets/fonts/Poppins-Thin.ttf'),
      'Poppins-ExtraLight': require('./assets/fonts/Poppins-ExtraLight.ttf'),
      'Poppins-Light':      require('./assets/fonts/Poppins-Light.ttf'),
      'Poppins-Regular':    require('./assets/fonts/Poppins-Regular.ttf'),
      'Poppins-Medium':     require('./assets/fonts/Poppins-Medium.ttf'),
      'Poppins-SemiBold':   require('./assets/fonts/Poppins-SemiBold.ttf'),
      'Poppins-Bold':       require('./assets/fonts/Poppins-Bold.ttf'),
      'Poppins-ExtraBold':  require('./assets/fonts/Poppins-ExtraBold.ttf'),
      'Poppins-Black':      require('./assets/fonts/Poppins-Black.ttf')
    });

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => { console.log(token) } );

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Received Notification')
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home"       component={ HomeScreen }       />
        <Stack.Screen name='AddPet'     component={ AddPetScreen } options={{ presentation: 'modal' }} />
        <Stack.Screen name='ConsultationStart' component={ ConsultationStartScreen } />
        <Stack.Screen name='ConsultationChat'  component={ ConsultationChatScreen } />
        <Stack.Screen name='ConsultationVideoAppointment' component={ ConsultationVideoAppointmentScreen } />
        <Stack.Screen name='PetDetails' component={ PetDetailsScreen } />
        <Stack.Screen name='Pets'       component={ PetsScreen }       />
        <Stack.Screen name="Settings"   component={ SettingsScreen }   />
        <Stack.Screen name='VetLocator' component={ VetLocatorScreen } />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
