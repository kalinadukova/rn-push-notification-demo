import messaging from '@react-native-firebase/messaging';
import {
  NavigationContainer,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
} from 'react-native';

type RootStackParamList = {
  Home: undefined;
  Second: undefined;
};

function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View style={styles.screen}>
      <Text>Home Screen</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Second')}>
        <Text>Second Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

function SecondScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.screen}>
      <Text>Second Screen</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text>Home Screen</Text>
      </TouchableOpacity>
    </View>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const getToken = async () => {
    const token = await messaging().getToken();
    console.log('token', token);
  };

  useEffect(() => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    getToken();
  }, []);

  messaging().setBackgroundMessageHandler(async notification => {
    if (notification) {
      console.log('App is closed', notification);
    }
  });

  // The app runs in background
  messaging().onNotificationOpenedApp(notification => {
    if (notification) {
      console.log('Notification when app runs in background: ', notification);
    }
  });

  // The app is closed, it doesn't run in background
  messaging()
    .getInitialNotification()
    .then(notification => {
      if (notification) {
        console.log(
          "Notification when app doesn't run in background: ",
          notification,
        );
      }
    });

  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Second" component={SecondScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {flex: 1, alignItems: 'center', justifyContent: 'center'},
});
