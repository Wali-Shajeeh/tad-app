/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
// this is the order details display for admin. this should be in another app
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// this is the order display for admin. this should be in another app
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from 'react-native';
import {
  DrawerLayout,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { AuthPayload } from '@/types/auth';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import api from '../services/api';

const ListProduct: React.FC<{ item: any, userId: string }> = ({ item, userId }) => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const totalItems = item.products.reduce((x: any, y: { quantity: any; }) => x + y.quantity, 0);

  return (
    <Pressable
      onPress={() => navigation.navigate('orderDisplay', { item, userId })}
      style={{
        height: 'auto',
        borderWidth: 1,
        borderColor: '#222',
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
        <Text style={{ color: '#222', fontSize: 22, fontWeight: '400' }}>
          {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
        </Text>
        <Text style={{ color: '#222', fontSize: 20, fontWeight: '400' }}>
          By {item.user.firstName + ' ' + item.user.lastName}
        </Text>
        <Text style={{ color: '#222', fontSize: 14, fontWeight: '400' }}>
          {item.createdAt}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="naira-sign" size={15} color={'#222'} />
        <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#222' }}>
          {item.totalPrice}
        </Text>
      </View>
    </Pressable>
  );
};

const OrderScreenForAdmin = () => {
  // const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<Partial<{ _id: string; firstName: string; email: string; lastName: string }>>({});
  const [data, setData] = useState<any>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const drawer = useRef<DrawerLayout>(null);
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  async function logOut() {
    try {
      await AsyncStorage.removeItem('authToken');
      navigation.navigate('login');
    } catch (error) {
      log.debug('error', error);
    }
  }

  function showAlert() {
    Alert.alert(
      'Log Out',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: logOut,
        },
      ],
      { cancelable: false },
    );
  }

  async function getDataWithoutInterrupting() {
    try {
      setRefreshing(true);
      await api.public
        .get('/all-orders')
        .then((response) => {
          if (response.status == 200) {
            setRefreshing(false);
            // log.debug(response.data);
            setData(response.data);
          }
        })
        .catch((error) => {
          if (error.response.status == 404) {
            setRefreshing(false);
            setData([]);
          } else if (error.response.status == 500) {
            setRefreshing(false);
            Alert.alert('Something went wrong. Probably the network');
          }
        });
    } catch (error) {
      log.debug(error);
      setRefreshing(false);
      Alert.alert('Something went wrong.');
    }
  }

  const RenderDrawer = () => (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 15, gap: 15 }}>
        <View
          style={{
            width: '100%',
            height: 'auto',
            backgroundColor: '#f1f3f2',
            borderRadius: 10,
            padding: 15,
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 22, color: '#222', fontWeight: '500' }}>
            {userData?.firstName + ' ' + userData?.lastName}
          </Text>
          <Text style={{ fontSize: 20, color: '#222', fontWeight: '400' }}>
            {userData?.email}
          </Text>
        </View>
        <Pressable
          onPress={showAlert}
          style={{
            width: '100%',
            height: 'auto',
            backgroundColor: '#f1f3f2',
            borderRadius: 10,
            padding: 15,
            gap: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 22, color: '#222', fontWeight: '500' }}>
              Logout
            </Text>
            <Icon name="chevron-right" size={20} color="#222" />
          </View>
        </Pressable>
      </View>
    </View>
  );

  const getUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<AuthPayload>(token);
        // setUserId(decoded.userId);
        await api.public
          .get(`/users/${decoded.userId}`)
          .then((response) => {
            if (response.status === 200) {
              setUserData(response.data);
            }
          })
          .catch(() => {
            Alert.alert('Something went wrong');
          });
      }
    } catch (error) {
      log.debug(error);
    }
  };

  const getAllOrders = async () => {
    try {
      setDataLoading(true);
      await api.public
        .get('/all-orders')
        .then((response) => {
          if (response.status == 200) {
            setDataLoading(false);
            // log.debug(response.data);
            setData(response.data);
          }
        })
        .catch((error) => {
          if (error.response.status == 404) {
            setDataLoading(false);
            setData([]);
          } else if (error.response.status == 500) {
            setDataLoading(false);
            Alert.alert('Something went wrong. Probably the network');
          }
        });
    } catch (error) {
      log.debug(error);
      setDataLoading(false);
      Alert.alert('Something went wrong.');
    }
  };

  useEffect(() => {
    void getUserId();
    void getAllOrders();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const getAllOrders = async () => {
        try {
          await api.public.get('/all-orders').then((response) => {
            if (response.status == 200) {
              setData(response.data);
            }
          });
        } catch (error) {
          log.debug(error);
        }
      };
      void getAllOrders();
    }, [data]),
  );
  return (
    <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DrawerLayout
          ref={drawer}
          drawerWidth={300}
          drawerPosition={'left'}
          renderNavigationView={() => <RenderDrawer />}
          drawerBackgroundColor={'#fff'}
          onDrawerSlide={() => null}
        >
          <View
            style={{
              borderBottomWidth: 0.5,
              borderColor: '#222',
              padding: 15,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-between',
            }}
          >
            <Pressable onPress={() => drawer?.current?.openDrawer()}>
              <Icon name="bars-staggered" size={25} color="#222" />
            </Pressable>
            <Text style={{ fontSize: 25, color: '#222', fontWeight: '500' }}>
              Orders ({data.length})
            </Text>
            <Pressable>
              {/* <Icon name="right-from-bracket" color={'#222'} size={20} /> */}
            </Pressable>
          </View>
          {dataLoading && (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ActivityIndicator color={'#222'} size={30} />
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
                <Text>No orders for now</Text>
              </View>
            ) : (
              <>
                <FlatList
                  contentContainerStyle={{ padding: 15, gap: 15 }}
                  data={data}
                  keyExtractor={(item) => item._id}
                  refreshing={refreshing}
                  onRefresh={getDataWithoutInterrupting}
                  renderItem={({ item }) => (
                    <ListProduct {...{ item }} userId={userData?._id as string} />
                  )}
                />
              </>
            ))}
        </DrawerLayout>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
};

export default OrderScreenForAdmin;
