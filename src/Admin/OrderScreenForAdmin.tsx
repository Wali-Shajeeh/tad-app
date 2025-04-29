import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { AxiosError, AxiosResponse } from 'axios';
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

import { GetAllOrdersResponse } from '@/types/api';
import { AuthPayload } from '@/types/auth';
import { AppStackParamList } from '@/types/navigation';
import { User } from '@/types/schema';
import log from '@/utils/log';
import { deleteAuthToken, getAuthToken } from '@/utils/storage';
import Drawer from './Drawer';
import api from '../services/api';

const ListProduct: React.FC<{ item: GetAllOrdersResponse[number]; userId: string }> = ({
  item,
  userId,
}) => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const totalItems = item.products.reduce(
    (x, y) => x + y.quantity,
    0,
  );

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
        <FontAwesome6 name="naira-sign" size={15} color={'#222'} />
        <Text style={{ fontWeight: 'bold', fontSize: 22, color: '#222' }}>
          {item.totalPrice}
        </Text>
      </View>
    </Pressable>
  );
};

const OrderScreenForAdmin: React.FC = () => {
  // const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [data, setData] = useState<GetAllOrdersResponse>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const drawer = useRef<DrawerLayout>(null);
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [refreshing, setRefreshing] = useState(false);

  async function logOut(): Promise<void> {
    await deleteAuthToken();
    navigation.navigate('login');
  }

  function showAlert(): void {
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

  async function getDataWithoutInterrupting(): Promise<void> {
    try {
      setRefreshing(true);
      const response = await api.public.get<object, AxiosResponse<GetAllOrdersResponse>>('/all-orders');

      if (response.status !== 200) {
        throw new Error('Failed to fetch orders');
      }
      log.debug(`Orders data: ${JSON.stringify(response.data)}`);
      setData(response.data);
      setRefreshing(false);
    } catch (error) {
      setData([]);
      if (error instanceof AxiosError && error.response) {
        if (error.response.status == 404) {
        } else if (error.response.status == 500) {
          Alert.alert('Something went wrong. Probably the network');
        } else {
          Alert.alert(
            'Error',
            (error.response?.data as { message: string })?.message ||
            'Something went wrong',
          );
        }
      } else if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
      setRefreshing(false);
      setData([]);
    }
  }



  const getUserId = async (): Promise<void> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No token found');
      }
      const decoded = jwtDecode<AuthPayload>(token);
      const response = await api.public.get<object, AxiosResponse<User>>(
        `/users/${decoded.userId}`,
      );
      if (response.status !== 200) {
        throw new Error('Failed to fetch user data');
      }
      log.debug(`User data: ${JSON.stringify(response.data)}`);

      setUserData(response.data);
    } catch (error) {
      log.debug(error);
      if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
      setUserData(null);
    }
  };

  const getAllOrders = async (): Promise<void> => {
    try {
      setDataLoading(true);
      const response = await api.public.get<object, AxiosResponse<GetAllOrdersResponse>>('/all-orders');
      if (response.status == 200) {
        setDataLoading(false);
        log.debug(`Orders data: ${JSON.stringify(response.data)}`);

        setData(response.data);
        return;
      }

      if (response.status >= 400) {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        if (error.response.status == 404) {
          setDataLoading(false);
          setData([]);
        } else if (error.response.status == 500) {
          setDataLoading(false);
          Alert.alert('Something went wrong. Probably the network');
        } else {
          Alert.alert(
            'Error',
            (error.response?.data as { message: string })?.message ||
            'Something went wrong',
          );
        }
      } else if (error instanceof Error) {
        Alert.alert('Error', error.message);
      }
      setDataLoading(false);
    }
  };

  useEffect(() => {
    void getUserId();
    void getAllOrders();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const getAllOrders = async (): Promise<void> => {
        try {
          await api.public.get<object, AxiosResponse<GetAllOrdersResponse>>('/all-orders')
            .then((response) => {
              if (response.status == 200) {
                setData(response.data);
              }
            });
        } catch (error) {
          log.debug(error);
        }
      };
      void getAllOrders();
    }, []),
  );

  return (
    <SafeAreaView style={{ backgroundColor: '#fff', flex: 1 }}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DrawerLayout
          ref={drawer}
          drawerWidth={300}
          drawerPosition={'left'}
          renderNavigationView={() => <Drawer userData={userData} showAlert={showAlert} />}
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
              <FontAwesome6 name="bars-staggered" size={25} color="#222" />
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
                    <ListProduct
                      {...{ item }}
                      userId={userData?._id as string}
                    />
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
