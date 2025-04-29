import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { jwtDecode } from 'jwt-decode';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'core-js/stable/atob';
import styles from './styles';
import { AuthPayload } from './types/auth';
import log from './utils/log';

SplashScreen.preventAutoHideAsync().catch((reason) =>
  console.error(`Couldn't prevent hiding the splash screen ${reason}`),
);

const Render: React.FC<{
  Navigation: React.FC<{ initialRouteName: string | null }>;
}> = ({ Navigation }) => {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  const checkLoginStatus = async (): Promise<string> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return 'onboarding';
      const decoded = jwtDecode<AuthPayload>(token);
      console.log({ decoded });
      if (decoded.role == 'admin') {
        return 'orderScreenForAdmin';
      }
      return 'mainScreens';
    } catch (error) {
      log.debug('error', error);
      return 'onboarding';
    }
  };

  async function requestPermissions(): Promise<void> {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== Notifications.PermissionStatus.GRANTED) {
      Alert.alert('Notification permissions denied!');
    }
  }

  const prepare = async (): Promise<void> => {
    try {
      await requestPermissions();
      await Promise.all([
        Font.loadAsync(Entypo.font),
        Font.loadAsync(Ionicons.font),
      ]);
      const route = await checkLoginStatus();
      console.log(route);
      setInitialRoute(route);
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      });
    } catch (e) {
      throw e;
    } finally {
      setAppIsReady(true);
    }
  };

  useEffect(() => {
    prepare()
      .then(() => log.debug('App is ready!'))
      .catch((error) => console.error(error));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  return appIsReady && initialRoute ? (
    <SafeAreaView style={styles.safeArea} onLayout={onLayoutRootView}>
      <Navigation initialRouteName={initialRoute} />
    </SafeAreaView>
  ) : null;
};

export default Render;
