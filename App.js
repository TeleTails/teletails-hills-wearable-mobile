import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React, { Component, useState, useEffect, useRef } from "react";
import { AppState, View, Platform } from 'react-native';
import { NavigationContainer  } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Device  from 'expo-device';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { AuthController, PetsController } from './src/controllers';
import { setItem, getItem, deleteItem } from './storage';

import {
  HomeScreen,
  AddPetScreen,
  AddPetFlowScreen,
  ArticleDisplayScreen,
  CompletedConsultationsScreen,
  ConsultationStartScreen,
  ConsultationChatScreen,
  ConsultationThreadScreen,
  ConsultationStartThreadScreen,
  ConsultationVideoAppointmentScreen,
  HealthWeightScreen,
  HealthGiPicsScreen,
  HealthBodyConditionScreen,
  PetDetailsScreen,
  PetDetailsEditScreen,
  PetsScreen,
  SettingsScreen,
  SignInWelcomeScreen,
  SignUpInfoScreen,
  SignUpLandingScreen,
  SignUpSignInScreen,
  UserProfileScreen,
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
      'Montserrat-Thin':       require('./assets/fonts/Montserrat-Thin.ttf'),
      'Montserrat-ExtraLight': require('./assets/fonts/Montserrat-ExtraLight.ttf'),
      'Montserrat-Light':      require('./assets/fonts/Montserrat-Light.ttf'),
      'Montserrat-Regular':    require('./assets/fonts/Montserrat-Regular.ttf'),
      'Montserrat-Medium':     require('./assets/fonts/Montserrat-Medium.ttf'),
      'Montserrat-SemiBold':   require('./assets/fonts/Montserrat-SemiBold.ttf'),
      'Montserrat-Bold':       require('./assets/fonts/Montserrat-Bold.ttf'),
      'Montserrat-ExtraBold':  require('./assets/fonts/Montserrat-ExtraBold.ttf'),
      'Montserrat-Black':      require('./assets/fonts/Montserrat-Black.ttf')
    });

  let [user, setUser] = useState(null);

  AppState.addEventListener('change', async (nextAppState)=> {

  });

  useEffect(() => {
    console.log('Component re-rendered with user:', user);
  }, [user]);

  useEffect(() => {
    // registerForPushNotificationsAsync().then(token => { console.log(token) } );

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

  console.log('re-rendering?', user)

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={'SignUpLanding'} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home"       component={ HomeScreen }       />
        <Stack.Screen name="SignInWelcomeScreen"       component={ SignInWelcomeScreen }       />
        <Stack.Screen name="SignUpLanding"       component={ SignUpLandingScreen }       />
        <Stack.Screen name="SignUpSignInScreen"       component={ SignUpSignInScreen }       />
        <Stack.Screen name="SignUpInfoScreen"       component={ SignUpInfoScreen }       />
        <Stack.Screen name='AddPet'     component={ AddPetScreen } options={{ presentation: 'modal' }} />
        <Stack.Screen name='AddPetFlow' component={ AddPetFlowScreen } />
        <Stack.Screen name='ArticleDisplay' component={ ArticleDisplayScreen } />
        <Stack.Screen name='CompletedConsultations' component={ CompletedConsultationsScreen } />
        <Stack.Screen name='ConsultationStart' component={ ConsultationStartScreen } />
        <Stack.Screen name='ConsultationChat'  component={ ConsultationChatScreen } />
        <Stack.Screen name='ConsultationStartThread'      component={ ConsultationStartThreadScreen } />
        <Stack.Screen name='ConsultationThread'           component={ ConsultationThreadScreen } />
        <Stack.Screen name='ConsultationVideoAppointment' component={ ConsultationVideoAppointmentScreen } />
        <Stack.Screen name='HealthWeight'        component={ HealthWeightScreen } />
        <Stack.Screen name='HealthGiPics'        component={ HealthGiPicsScreen } />
        <Stack.Screen name='HealthBodyCondition' component={ HealthBodyConditionScreen } />
        <Stack.Screen name='PetDetails' component={ PetDetailsScreen } />
        <Stack.Screen name='PetDetailsEdit' component={ PetDetailsEditScreen } options={{ presentation: 'modal' }} />
        <Stack.Screen name='Pets'       component={ PetsScreen }       />
        <Stack.Screen name="Settings"   component={ SettingsScreen }   />
        <Stack.Screen name='UserProfile'component={ UserProfileScreen }/>
        <Stack.Screen name='VetLocator' component={ VetLocatorScreen } />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
