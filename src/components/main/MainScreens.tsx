/* eslint-disable @typescript-eslint/explicit-function-return-type */
import notifee, { EventType } from '@notifee/react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { AuthPayload } from '@/types/auth';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import { getAuthToken } from '@/utils/storage';
import { useTheme } from '../../context/themeContext';
import Home from '../../screens/Home';
import HomeSearchScreen from '../../screens/HomeSearchScreen';
import Likes from '../../screens/Likes';
import NotificationsScreen from '../../screens/NotificationsScreen';
import BottomTabs from '../BottomTabs';
import RenderDrawer from '../Drawer';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TabNavigator = () => (
  <Tab.Navigator tabBar={(props) => <BottomTabs {...props} />}>
    <Tab.Screen name="Home" component={Home} options={{ headerShown: false }} />
    <Tab.Screen
      name="homeSearch"
      component={HomeSearchScreen}
      options={{ headerShown: false }}
    />
    <Tab.Screen
      name="Likes"
      component={Likes}
      options={{ headerShown: false }}
    />
    <Tab.Screen
      name="notifications"
      component={NotificationsScreen}
      options={{ headerShown: false }}
    />
  </Tab.Navigator>
);

const MainScreens = () => {
  const { currentBgColor } = useTheme();
  const [userData, setUserData] = useState<
    Partial<{
      firstName: string;
      lastName: string;
    }>
  >({});
  const [dataLoading, setDataLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const getData = async () => {
    try {
      setDataLoading(true);
      const token = await getAuthToken();
      if (token) {
        const decoded = jwtDecode<AuthPayload>(token);
        const userId = decoded.userId;
        await api.public
          .get(`/users/${userId}`)
          .then((response) => {
            if (response.status === 200) {
              setUserData(response.data as typeof userData);
              setDataLoading(false);
            }
          })
          .catch((error) => {
            if (error instanceof AxiosError) {
              if (error?.response?.status === 404) {
                log.debug('something went wrong');
                setDataLoading(false);
              } else if (error?.response?.status === 500) {
                log.debug('internal server error');
                setDataLoading(false);
              }
            }
          });
      }
    } catch (error) {
      log.debug(error);
      setDataLoading(false);
    }
  };

  async function getInitialNotification() {
    const initialNotification = await notifee.getInitialNotification();
    if (initialNotification) {
      if (
        initialNotification.notification.android &&
        initialNotification.notification.android.channelId === 'orders'
      ) {
        navigation.navigate('MyOrders');
      }
    }
  }

  // Find out which notification opened the app
  useEffect(() => {
    notifee.onForegroundEvent(async ({ type, detail }) => {
      if (!detail?.notification || !detail?.notification?.id) return;
      switch (type) {
        case EventType.PRESS:
          if (
            detail.notification &&
            detail.notification.android &&
            detail.notification.android.channelId &&
            ['order-cancelled', 'order-delivered', 'order-received'].includes(
              detail.notification.android.channelId,
            )
          ) {
            navigation.navigate('MyOrders');
          }
          log.debug('User pressed notification', detail?.notification?.android);
          await notifee.cancelNotification(detail.notification.id);
          break;
        default:
          break;
      }
    });

    void getInitialNotification();
    void getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Drawer.Navigator
        drawerContent={(props) => (
          <RenderDrawer
            {...props}
            dataLoading={dataLoading}
            userName={
              userData.firstName && userData.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : '...'
            }
          />
        )}
        screenOptions={{
          drawerStyle: {
            backgroundColor: currentBgColor,
            width: 300,
          },
          drawerPosition: 'left',
        }}
      >
        <Drawer.Screen
          name="Tabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </>
  );
};

export default MainScreens;
