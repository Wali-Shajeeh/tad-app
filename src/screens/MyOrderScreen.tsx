/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/split-platform-components */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ToastAndroid,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome6';
import api from '@/services/api';
import { AuthPayload } from '@/types/auth';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import Header from '../components/Header';
import { useTheme } from '../context/themeContext';

const RenderOrders = ({ item }: { item: any }): React.JSX.Element => {
  const { currentTextColor, theme } = useTheme();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const totalItems = item.products.reduce((x: any, y: { quantity: any; }) => x + y.quantity, 0);

  const statusColor = (): string | undefined => {
    if (item.status == 'Pending') {
      return '#B89928';
    } if (item.status == 'Delivered') {
      return '#43AA2C';
    } if (item.status == 'Failed') {
      return 'red';
    }
    return undefined;
  };

  return (
    <Pressable
      onPress={() => navigation.navigate('myOrderDetail', { item })}
      style={{
        backgroundColor: theme == 'light' ? '#F8F8F8' : '#222',
        height: 'auto',
        borderColor: currentTextColor,
        paddingHorizontal: 15,
        paddingVertical: 10,
        width: '100%',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ gap: 5, flex: 1 }}>
        <Text
          style={{ color: currentTextColor, fontSize: 22, fontWeight: '500' }}
        >
          {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name="naira-sign" size={15} color={currentTextColor} />
          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 22,
              color: currentTextColor,
            }}
          >
            {item.totalPrice}
          </Text>
        </View>
        <Text
          style={{ color: currentTextColor, fontSize: 14, fontWeight: '400' }}
        >
          {item.createdAt}
        </Text>
      </View>
      <View>
        <Text style={{ fontSize: 18, fontWeight: '500', color: statusColor() }}>
          {item.status}
        </Text>
      </View>
    </Pressable>
  );
};

const MyOrderScreen = (): React.JSX.Element => {
  const [dataLoading, setDataLoading] = useState(false);
  const [data, setData] = useState<any>([]);
  const [filterBtn, setFilterBtn] = useState<string>('Pending');
  const { currentBgColor, currentTextColor, theme, themeColor } =
    useTheme()

  const showToastWithGravity = (text: string): void => {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };
  const getData = async (): Promise<void> => {
    try {
      setDataLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<AuthPayload>(token);
        await api.public
          .get(`/${decoded.userId}/orders`)
          .then((response: { status: number; data: React.SetStateAction<never[]>; }) => {
            if (response.status == 200) {
              setDataLoading(false);
              setData(response.data);
            }
          })
          .catch((error: { response: { status: number; }; }) => {
            if (error.response.status == 404) {
              showToastWithGravity('Something went wrong');
              setDataLoading(false);
            } else if (error.response.status == 500) {
              showToastWithGravity('Server error');
              setDataLoading(false);
            }
          });
      }
    } catch (error) {
      log.debug(error);
      setDataLoading(false);
    }
  };

  // useffect to get orders
  useEffect(() => {
    void getData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const getData = async (): Promise<void> => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            const decoded = jwtDecode<AuthPayload>(token);
            await api.public
              .get(`/${decoded.userId}/orders`)
              .then((response: { status: number; data: React.SetStateAction<never[]>; }) => {
                if (response.status == 200) {
                  setData(response.data);
                }
              });
          }
        } catch (error) {
          log.debug(error);
        }
      };
      void getData();
    }, [data]),
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentBgColor }}>
      <View
        style={{
          borderBottomWidth: 0.5,
          borderColor: currentTextColor,
          paddingBottom: 15,
        }}
      >
        <Header name={'My Orders'} showCart={false} />
      </View>
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

      {!dataLoading &&
        (data.length == 0 ? (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text>You haven&apos;t ordered anything</Text>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                alignItems: 'center',
                paddingHorizontal: 15,
                paddingVertical: 15,
              }}
            >
              <Pressable
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor:
                      filterBtn === 'Pending'
                        ? themeColor
                        : theme == 'light'
                          ? '#f1f3f2'
                          : '#222',
                  },
                ]}
                onPress={() =>
                  filterBtn == 'Pending' ? null : setFilterBtn('Pending')
                }
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '400',
                    color: filterBtn === 'Pending' ? '#fff' : currentTextColor,
                  }}
                >
                  Pending
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor:
                      filterBtn === 'Delivered'
                        ? themeColor
                        : theme == 'light'
                          ? '#f1f3f2'
                          : '#222',
                  },
                ]}
                onPress={() =>
                  filterBtn == 'Delivered' ? null : setFilterBtn('Delivered')
                }
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '400',
                    color:
                      filterBtn === 'Delivered' ? '#fff' : currentTextColor,
                  }}
                >
                  Delivered
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.filterBtn,
                  {
                    backgroundColor:
                      filterBtn === 'Failed'
                        ? themeColor
                        : theme == 'light'
                          ? '#f1f3f2'
                          : '#222',
                  },
                ]}
                onPress={() =>
                  filterBtn == 'Failed' ? null : setFilterBtn('Failed')
                }
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '400',
                    color: filterBtn === 'Failed' ? '#fff' : currentTextColor,
                  }}
                >
                  Failed
                </Text>
              </Pressable>
            </View>
            <FlatList
              contentContainerStyle={{ padding: 15, paddingTop: 5, gap: 15 }}
              data={data.filter((item: any) => item.status === filterBtn)}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <RenderOrders {...{ item }} />}
            />
          </>
        ))}
    </SafeAreaView>
  );
};

export default MyOrderScreen;

const styles = StyleSheet.create({
  filterBtn: {
    alignItems: 'center',
    backgroundColor: '#F2F1F3',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 7,
  },
});
