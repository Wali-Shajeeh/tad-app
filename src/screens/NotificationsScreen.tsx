/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-native/split-platform-components */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  Text,
  View,
  ToastAndroid,
} from 'react-native';

import { AuthPayload } from '@/types/auth';
import log from '@/utils/log';
import Header from '../components/Header';
import { useTheme } from '../context/themeContext';
import api from '../services/api';

const NotificationsList = ({ item }: { item: any }): React.JSX.Element => {
  const { currentTextColor, theme } = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme == 'light' ? '#F8F8F8' : '#222',
        borderColor: currentTextColor,
        height: 'auto',
        paddingHorizontal: 15,
        paddingVertical: 10,
        width: '100%',
        borderRadius: 10,
        gap: 10,
      }}
    >
      <Text
        style={{ color: currentTextColor, fontSize: 22, fontWeight: 'bold' }}
      >
        {item.header}
      </Text>
      <Text
        style={{
          color: currentTextColor,
          fontSize: 20,
          fontWeight: '500',
          lineHeight: 25,
        }}
        numberOfLines={2}
      >
        {item.message}
      </Text>
      <Text
        style={{ color: currentTextColor, fontSize: 14, fontWeight: '400' }}
      >
        {item.timestamp}
      </Text>
    </View>
  );
};

const NotificationsScreen = (): React.JSX.Element => {
  const { currentBgColor, currentTextColor } = useTheme();
  const [notifications, setNotifications] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState<any>(false);

  const showToastWithGravity = (text: string): void => {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };
  useEffect(() => {
    const getNotifications = async (): Promise<void> => {
      try {
        setDataLoading(true);
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const decoded = jwtDecode<AuthPayload>(token);
          const userId = decoded.userId;
          const response = await api.public.get(
            `/users/${userId}/notifications`,
          );
          if (response.status == 200) {
            setNotifications(response.data);
            setDataLoading(false);
          } else if (response.status == 404) {
            setNotifications([]);
            setDataLoading(false);
          } else if (response.status == 500) {
            showToastWithGravity('Server error');
            setDataLoading(false);
          }
        }
      } catch (error) {
        log.debug(error);
      }
    };
    void getNotifications();
  }, []);

  // update notifications on every mount
  useFocusEffect(
    React.useCallback(() => {
      const getNotifications = async (): Promise<void> => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            const decoded = jwtDecode<AuthPayload>(token);
            const userId = decoded.userId;
            const response = await api.public.get(
              `/users/${userId}/notifications`,
            );
            if (response.status == 200) {
              setNotifications(response.data);
            }
          }
        } catch (error) {
          log.debug(error);
        }
      };
      void getNotifications();
    }, []),
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentBgColor }}>
      <View
        style={{
          borderColor: currentTextColor,
          borderBottomWidth: 0.5,
          paddingBottom: 15,
        }}
      >
        <Header name="Notifications" showCart={false} />
      </View>

      {notifications?.length == 0 && !dataLoading && (
        <Text style={{ color: currentTextColor, fontSize: 20 }}>
          No Notifications to show
        </Text>
      )}
      {dataLoading && (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator color={currentTextColor} size={30} />
        </View>
      )}
      {!dataLoading && (
        <FlatList
          contentContainerStyle={{ padding: 15, gap: 15 }}
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <NotificationsList {...{ item }} />}
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;
