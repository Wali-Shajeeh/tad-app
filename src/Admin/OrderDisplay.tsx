import Icon from '@expo/vector-icons/FontAwesome6';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { AxiosError, AxiosResponse } from 'axios';
import React, { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Dimensions,
  Alert,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { ConfirmOrderBody, ConfirmOrderResponse } from '@/types/api';
import { AppStackParamList } from '@/types/navigation';
import { User } from '@/types/schema';
import log from '@/utils/log';
import LoadingModal from './LoadingModal';
import api from '../services/api';

const themeColor = '#6236FF';


const OrderDisplay: React.FC<object> = () => {
  const route = useRoute<RouteProp<Pick<AppStackParamList, 'orderDisplay'>>>();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const window = useWindowDimensions();
  // const { item, userId } = route?.params;
  const item = route?.params?.item;

  const userId = route?.params?.userId;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const totalItems = item.products.reduce((x, y) => x + (y?.quantity || 0), 0);

  const totalPrice = item.products.reduce((x, y) => x + (y?.price || 0), 0);

  const scrollToPage = (pageNumber: number): void => {
    if (scrollRef.current) {
      const offsetX = pageNumber * Dimensions.get('window').width;
      scrollRef?.current?.scrollTo({ x: offsetX, animated: true });
    }
  };

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ): void => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(
      contentOffset / Dimensions.get('window').width,
    );
    setActiveIndex(currentIndex);
  };


  function showConfirmAlert(): void {
    Alert.alert(
      'Confirm order',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => changeOrderStatus(true),
        },
      ],
      { cancelable: false },
    );
  }

  const _sendNotification = async (user: User, type: 'order-delivered' | 'order-cancelled'): Promise<void> => {
    try {
      if (!user.deviceToken) {
        throw new Error('Device token is not available');
      }
      const response = await api.public.get(
        `/sendMessage/${user.deviceToken}/${user._id}/${type}`,
      );

      if (response.status !== 200) {
        throw new Error('Failed to send notification');
      }

      log.debug('Notification sent successfully:', response.data);
    } catch (error) {
      log.debug('Error sending notification:', error);
      let message = 'Something went wrong. Probably the network';

      if (error instanceof AxiosError) {
        log.debug('Error:', error?.response?.data);
        message =
          (error.response?.data as { message: string })?.message ||
          'Something went wrong';
      } else if (error instanceof Error) {
        message = error.message;
      }

      throw new Error(message);
    }
  };

  const changeOrderStatus = async (confirmed: boolean): Promise<void> => {
    try {
      const type = confirmed ? 'confirmed' : 'terminated';
      const notificationType = confirmed ? 'order-delivered' : 'order-cancelled' as const;
      setModalVisible(true);

      log.debug({ type, notificationType });

      const response = await api.public.post<
        ConfirmOrderBody,
        AxiosResponse<ConfirmOrderResponse>
      >('/orderConfirmation', {
        orderId: item._id,
        adminId: userId,
        userId: item.user._id,
        confirmed,
      });

      if (response.status !== 200) {
        throw new Error(`Failed to ${type} order`);
      }

      // await sendNotification(item.user, notificationType);
      Alert.alert(`Order ${type}`, `Order ${type} successfully`);
      navigation.navigate('orderScreenForAdmin');
    } catch (error) {
      let message = 'Something went wrong. Probably the network';
      if (error instanceof AxiosError) {
        log.debug('Error:', error?.response?.data);
        message =
          (error.response?.data as { message: string })?.message ||
          'Something went wrong';
      } else if (error instanceof Error) {
        message = error.message;
      }

      Alert.alert(`Error`, message);
    } finally {
      setModalVisible(false);
    }
  };

  function showTerminateAlert(): void {
    Alert.alert(
      'Terminate order',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => changeOrderStatus(false),
        },
      ],
      { cancelable: false },
    );
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <LoadingModal modalVisible={modalVisible} />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15,
          gap: 10,
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#222" />
        </Pressable>

        <Text style={{ color: '#222', fontSize: 24, fontWeight: '500' }}>
          Order details
        </Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <Pressable
          style={[
            styles.scrollPageSelector,
            { borderBottomWidth: activeIndex == 0 ? 2 : 0 },
          ]}
          onPress={() => scrollToPage(0)}
        >
          <Text style={{ fontSize: 20, fontWeight: '500', color: '#222' }}>
            Details
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.scrollPageSelector,
            { borderBottomWidth: activeIndex == 1 ? 2 : 0 },
          ]}
          onPress={() => scrollToPage(1)}
        >
          <Text style={{ fontSize: 20, fontWeight: '500', color: '#222' }}>
            Products
          </Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{ backgroundColor: '#f8f8f8' }}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ref={scrollRef}
      >
        {/* page 1 */}
        <View style={{ width: window.width, padding: 15 }}>
          <ScrollView
            contentContainerStyle={{ gap: 15 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.detailsBox}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="naira-sign" size={20} color={'#222'} />
                <Text
                  style={{ fontWeight: 'bold', fontSize: 30, color: '#222' }}
                >
                  {totalPrice + (item?.shippingPrice || 0)}
                </Text>
              </View>
              <View style={{ gap: 15 }}>
                <View style={styles.text_between}>
                  <Text style={styles.text_between_header}>Total Items</Text>
                  <Text
                    style={{ fontSize: 20, fontWeight: '400', color: '#222' }}
                  >
                    {totalItems}
                  </Text>
                </View>
                <View style={styles.text_between}>
                  <Text style={styles.text_between_header}>Subtotal</Text>
                  <View style={styles.text_between_price}>
                    <Icon name="naira-sign" size={12} color={'#222'} />
                    <Text style={styles.text_between_price_number}>
                      {totalPrice}
                    </Text>
                  </View>
                </View>
                <View style={styles.text_between}>
                  <Text style={styles.text_between_header}>Shipping price</Text>
                  <View style={styles.text_between_price}>
                    <Icon name="naira-sign" size={12} color={'#222'} />
                    <Text style={styles.text_between_price_number}>
                      {item.shippingPrice}
                    </Text>
                  </View>
                </View>
                <View style={styles.text_between}>
                  <Text style={styles.text_between_header}>Total price</Text>
                  <View style={styles.text_between_price}>
                    <Icon name="naira-sign" size={12} color={'#222'} />
                    <Text style={styles.text_between_price_number}>
                      {totalPrice + (item?.shippingPrice || 0)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.detailsBox, { gap: 15 }]}>
              <View style={styles.text_between}>
                <Text style={styles.text_between_header}>User</Text>
                <Text style={styles.text_between_price_number}>
                  {item.user.firstName +
                    ' ' +
                    (item.user.lastName ? item.user.lastName : '')}
                </Text>
              </View>
              <View style={styles.text_between}>
                <Text style={styles.text_between_header}>Phone No.</Text>
                <Text style={styles.text_between_price_number}>
                  {item.shippingAddress.mobileNo}
                </Text>
              </View>
              <View style={[styles.text_between, { gap: 20 }]}>
                <Text style={styles.text_between_header}>House Address</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.text_between_price_number}>
                    {item.shippingAddress.houseAddress}
                  </Text>
                </View>
              </View>
              <View style={[styles.text_between, { gap: 20 }]}>
                <Text style={styles.text_between_header}>Street</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.text_between_price_number}>
                    {item.shippingAddress.street}
                  </Text>
                </View>
              </View>
              <View style={[styles.text_between, { gap: 20 }]}>
                <Text style={styles.text_between_header}>City</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.text_between_price_number}>
                    {item.shippingAddress.city}
                  </Text>
                </View>
              </View>
              {item.shippingAddress.landmark && (
                <View style={[styles.text_between, { gap: 20 }]}>
                  <Text style={styles.text_between_header}>Landmark</Text>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={styles.text_between_price_number}>
                      {item.shippingAddress.landmark}
                    </Text>
                  </View>
                </View>
              )}
              <View style={[styles.text_between, { gap: 20 }]}>
                <Text style={styles.text_between_header}>Postal Code</Text>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Text style={styles.text_between_price_number}>
                    {item.shippingAddress.postalCode}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.detailsBox}>
              <View>
                <View style={styles.text_between}>
                  <Text style={styles.text_between_header}>Payment method</Text>
                  <Text style={styles.text_between_price_number}>
                    {item.paymentMethod}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.detailsBox}>
              <View style={styles.text_between}>
                <Text style={styles.text_between_header}>Order ID</Text>
                <View style={{ flex: 0 }}>
                  <Text style={styles.text_between_price_number}>
                    {item._id}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
        {/* page 2 */}
        <View style={{ width: window.width }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ padding: 15, gap: 15 }}>
              {item.products.map((product, index) => (
                <View key={index} style={styles.detailsBox}>
                  <View style={{ gap: 15 }}>
                    <Image
                      source={{ uri: product.image }}
                      style={{
                        height: 120,
                        width: 120,
                        borderRadius: 10,
                        alignSelf: 'center',
                      }}
                      resizeMode="cover"
                    />
                    <View style={styles.text_between}>
                      <Text style={styles.text_between_header}>Name</Text>
                      <Text style={styles.text_between_price_number}>
                        {product.name}
                      </Text>
                    </View>
                    <View style={styles.text_between}>
                      <Text style={styles.text_between_header}>Price</Text>
                      <View style={styles.text_between_price}>
                        <Icon name="naira-sign" size={12} color={'#222'} />
                        <Text style={styles.text_between_price_number}>
                          {product.price}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.text_between}>
                      <Text style={styles.text_between_header}>Gender</Text>
                      <Text style={styles.text_between_price_number}>
                        {(product?.gender || [])?.join(', ')}
                      </Text>
                    </View>
                    <View style={styles.text_between}>
                      <Text style={styles.text_between_header}>Color</Text>
                      <Text style={styles.text_between_price_number}>
                        {product.color}
                      </Text>
                    </View>
                    <View style={styles.text_between}>
                      <Text style={styles.text_between_header}>Size</Text>
                      <Text style={styles.text_between_price_number}>
                        {product.size}
                      </Text>
                    </View>
                    <View style={styles.text_between}>
                      <Text style={styles.text_between_header}>Quantity</Text>
                      <Text style={styles.text_between_price_number}>
                        {product.quantity}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
      <View style={{ padding: 15, borderColor: '#222', borderTopWidth: 0.5 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            style={styles.confirm_terminate_btn}
            onPress={showConfirmAlert}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
              Confirm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={showTerminateAlert}
            style={[styles.confirm_terminate_btn, { backgroundColor: 'red' }]}
          >
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
              Terminate
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default OrderDisplay;

const styles = StyleSheet.create({
  confirm_terminate_btn: {
    alignItems: 'center',
    backgroundColor: themeColor,
    borderRadius: 10,
    flex: 1,
    height: 50,
    justifyContent: 'center',
  },

  detailsBox: {
    backgroundColor: '#Fff',

    borderColor: '#222',
    borderRadius: 10,
    height: 'auto',
    padding: 10,
    paddingVertical: 20,
    width: '100%',
  },
  scrollPageSelector: {
    alignItems: 'center',
    borderBottomWidth: 2,

    borderColor: themeColor,
    flex: 1,
    height: 50,
    justifyContent: 'center',
  },
  text_between: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text_between_header: { color: '#222', fontSize: 20, fontWeight: '400' },
  text_between_price: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text_between_price_number: { color: '#222', fontSize: 20, fontWeight: '500' },
});
