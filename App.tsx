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
  Linking,
} from 'react-native';

type RootStackParamList = {
  Home: undefined;
  Second: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const NAVIGATION_IDS = ['home', 'second'];

function buildDeepLinkFromNotificationData(data: any): string | null {
  const navigationId = data?.eventType;
  if (!NAVIGATION_IDS.includes(navigationId)) {
    // console.warn('Unverified navigationId', navigationId);
    // return null;
    return 'myapp://second';
  }
  if (navigationId === 'home') {
    return 'myapp://home';
  }
  if (navigationId === 'second') {
    return 'myapp://second';
  }

  // const chatId = data?.chatId;
  // if (typeof chatId === 'string') {
  //   return `myapp://second/${chatId}`;
  // }
  console.warn('Missing chatId');
  return null;
}

const linking = {
  prefixes: ['myapp://'],
  config: {
    initialRouteName: 'Home' as const,
    screens: {
      Home: 'home',
      Second: 'second',
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (typeof url === 'string') {
      return url;
    }
    //getInitialNotification: When the application is opened from a quit state.
    const message = await messaging().getInitialNotification();
    const deeplinkURL = buildDeepLinkFromNotificationData(message?.data);
    if (typeof deeplinkURL === 'string') {
      return deeplinkURL;
    }
  },
  subscribe(listener: (url: string) => void) {
    const onReceiveURL = ({url}: {url: string}) => listener(url);

    // Listen to incoming links from deep linking
    const linkingSubscription = Linking.addEventListener('url', onReceiveURL);

    //onNotificationOpenedApp: When the application is running, but in the background.
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      const url = buildDeepLinkFromNotificationData(remoteMessage.data);
      if (typeof url === 'string') {
        listener(url);
      }
    });

    return () => {
      linkingSubscription.remove();
      unsubscribe();
    };
  },
};

function HomeScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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
    <View style={styles.screen}>
      <Text>Home Screen</Text>
      <TouchableOpacity
        onPress={() => {
          console.log('[pressing');
          navigation.navigate('Second');
        }}>
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

function App() {
  // const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  // const getToken = async () => {
  //   const token = await messaging().getToken();
  //   console.log('token', token);
  // };

  // useEffect(() => {
  //   PermissionsAndroid.request(
  //     PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  //   );
  //   getToken();
  // }, []);

  // messaging().setBackgroundMessageHandler(async notification => {
  //   if (notification) {
  //     console.log('App is closed', notification);
  //   }
  // });

  // // The app runs in background
  // messaging().onNotificationOpenedApp(notification => {
  //   if (notification) {
  //     console.log('Notification when app runs in background: ', notification);
  //     if (notification?.data?.eventType === 'birthday') {
  //       navigation.navigate('Second');
  //     }
  //   }
  // });

  // // The app is closed, it doesn't run in background
  // messaging()
  //   .getInitialNotification()
  //   .then(notification => {
  //     if (notification) {
  //       console.log(
  //         "Notification when app doesn't run in background: ",
  //         notification,
  //       );
  //     }
  //   });

  return (
    <SafeAreaView style={styles.container}>
      <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
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
