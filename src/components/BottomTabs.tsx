/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { useFocusEffect } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  Keyboard,
} from 'react-native';

// eslint-disable-next-line import/default
import IconBadge from 'react-native-icon-badge';

import Icon2 from 'react-native-vector-icons/Ionicons';
import { AuthPayload } from '@/types/auth';
import log from '@/utils/log';
import { getAuthToken } from '@/utils/storage';
import { useTheme } from '../context/themeContext';
import api from '../services/api';

// these are the tab icons when they're not focused
const tabIcons = {
  Home: 'home-outline',
  Settings: 'gear',
  Likes: 'heart-outline',
  homeSearch: 'search-outline',
  notifications: 'notifications-outline',
};

// these are the tab icons when they're focused
const tabIconsSolid = {
  Home: 'home',
  Settings: 'gear',
  Likes: 'heart',
  homeSearch: 'search',
  notifications: 'notifications',
};

// this is the component that would show the length of unseen notifications

const Badge: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const { themeColor } = useTheme();

  const [notificaionData, setNotifications] = useState<any[]>([]);
  useFocusEffect(
    React.useCallback(() => {
      const getNotifications = async () => {
        try {
          const token = await getAuthToken();
          if (token) {
            const decoded = jwtDecode<AuthPayload>(token);
            const userId = decoded.userId;
            const response = await api.public.get(
              `/users/${userId}/notifications`,
            );
            if (response.status == 200) {
              setNotifications(
                response.data.filter(
                  (item: { seen: boolean }) => item.seen === false,
                ),
              );
            } else if (response.status == 404) {
              setNotifications([]);
            } else if (response.status == 500) {
              log.debug('internal server error');
            }
          }
        } catch (error) {
          log.debug(error);
        }
      };
      void getNotifications();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notificaionData]),
  );
  return (
    <IconBadge
      MainElement={<View>{children}</View>}
      BadgeElement={
        <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
          {notificaionData?.length}
        </Text>
      }
      IconBadgeStyle={{
        position: 'absolute',
        top: -7,
        right: -9,
        minWidth: 21,
        height: 21,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        display: notificaionData?.length > 0 ? 'flex' : 'none',
        backgroundColor: themeColor,
      }}
    />
  );
};

const BottomTabs: React.FC<any> = ({ state, descriptors, navigation }) => {
  const { currentBgColor, currentTextColor } = useTheme();
  const window = useWindowDimensions();

  const [keyboardStatus, setKeyboardStatus] = useState(false);

  // useffect to hide bottom tab when the keyboard is active

  useEffect(() => {
    const showTab = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardStatus(true);
    });
    const hideTab = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardStatus(false);
    });

    return () => {
      showTab.remove();
      hideTab.remove();
    };
  }, []);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: currentBgColor,
        bottom: 0,
        justifyContent: 'center',
        width: window.width,
        display: keyboardStatus ? 'none' : 'flex',
      }}
    >
      {state.routes.map(
        (
          route: { key: string | number; name: any; params: any },
          index: React.Key | null | undefined,
        ) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              accessibilityRole="button"
              key={index}
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                marginVertical: 20,
              }}
            >
              {tabIcons[label as keyof typeof tabIcons] ==
              'notifications-outline' ? (
                <Badge>
                  <Icon2
                    name={
                      isFocused
                        ? tabIconsSolid[label as keyof typeof tabIconsSolid]
                        : tabIcons[label as keyof typeof tabIcons]
                    }
                    size={27}
                    color={currentTextColor}
                  />
                </Badge>
              ) : (
                <Icon2
                  name={
                    isFocused
                      ? tabIconsSolid[label as keyof typeof tabIconsSolid]
                      : tabIcons[label as keyof typeof tabIcons]
                  }
                  size={27}
                  color={currentTextColor}
                />
              )}
            </TouchableOpacity>
          );
        },
      )}
    </View>
  );
};

export default BottomTabs;
