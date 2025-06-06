/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-native/no-unused-styles */
/* eslint-disable react-native/split-platform-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NavigationProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

import RBSheet from 'react-native-raw-bottom-sheet';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon2 from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';

import { useMyBottomSheet } from '@/context/bottomSheetContext';
import { AppState } from '@/redux/store';
import api from '@/services/api';
import { AuthPayload } from '@/types/auth';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import AddNewAddress from './AddNewAddress';
import EditAddress from './EditAddress';
import Header from '../components/Header';
import LoadingModal from '../components/LoadingModal';
import { useTheme } from '../context/themeContext';
import { deleteAllCartItem } from '../redux/actions';

// function to show push notification when order has been received
async function showOrderNotification(): Promise<void> {
  await notifee.requestPermission();
  const channelId = await notifee.createChannel({
    id: 'order-received',
    name: 'order-received',
  });
  await notifee.displayNotification({
    title: 'Order Received',
    body: 'Your order has been received.',
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
    },
  });
}

const themeColor = '#6236FF';

// this is the bottom sheet for new address
const BSDisplayForNewAddress: React.FC<object> = () => {
  const { theme } = useTheme();
  const { refRBSheetForAddress } = useMyBottomSheet();
  return (
    <RBSheet
      ref={refRBSheetForAddress}
      // closeOnDragDown={true}
      closeOnPressMask={true}
      // animationType="slide"
      draggable={true}
      customModalProps={{
        animationType: 'slide',
        statusBarTranslucent: true,
      }}
      dragOnContent={true}
      customStyles={{
        wrapper: {
          backgroundColor: 'rgba(0,0,0,0.2)',
        },
        draggableIcon: {
          backgroundColor: theme == 'light' ? '#222' : '#fff',
        },
        container: {
          backgroundColor: theme == 'light' ? '#fff' : '#111',
          height: Dimensions.get('window').height - 10,
        },
      }}
    >
      <AddNewAddress />
    </RBSheet>
  );
};

// this is the bottom sheet to edit address
const BSDisplayForEditAddress: React.FC<React.PropsWithChildren<object>> = ({ children }) => {
  const { theme } = useTheme();
  const { refRBSheetForEditAddress } = useMyBottomSheet();
  return (
    <RBSheet
      ref={refRBSheetForEditAddress}
      // closeOnDragDown={true}
      closeOnPressMask={true}
      // animationType="slide"
      draggable={true}
      customModalProps={{
        animationType: 'slide',
        statusBarTranslucent: true,
      }}
      customStyles={{
        wrapper: {
          backgroundColor: 'rgba(0,0,0,0.2)',
        },
        draggableIcon: {
          backgroundColor: theme == 'light' ? '#222' : '#fff',
        },
        container: {
          backgroundColor: theme == 'light' ? '#fff' : '#111',
          height: Dimensions.get('window').height - 10,
        },
      }}
    >
      {children}
    </RBSheet>
  );
};

const CheckOutPage: React.FC<object> = () => {
  const { currentBgColor, currentTextColor } = useTheme();
  const { refRBSheetForCart, refRBSheetForAddress, refRBSheetForEditAddress } =
    useMyBottomSheet();
  const dispatch = useDispatch();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [progressNo, setProgressNo] = useState(1);
  const [stepOneDone, setStepOneDone] = useState(false);
  const [stepTwoDone, setStepTwoDone] = useState(false);
  const [stepThreeDone] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [pressedAddress, setPressedAddress] = useState<number | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(1);
  const [dataLoading, setDataLoading] = useState(false);
  // const [showPaystack, setShowPaystack] = useState(false);
  const { cart } = useSelector((state: AppState) => state.cartReducer);
  // const [cardNo, setCardNo] = useState('');
  // const [exDate, setExDate] = useState('');
  // const [securityCode, setSecurityCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  // const [deviceToken, setDeviceToken] = useState(null);
  const route = useRoute();

  const showToastWithGravity = (text: string): void => {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };

  // this is a function to verify payment when a refrence has been reveived from paystack

  const verifyPayment = async (): Promise<void> => {
    const { reference, checkOutInfoFromPaystack } = route.params as any;
    setModalVisible(true);
    try {
      await api.public
        .get(`/verify-transaction/${reference}`)
        .then(async (response) => {
          if (response.status == 200) {
            if (response.data.status) {
              await api.public
                .post(`/order`, checkOutInfoFromPaystack)
                .then((response_2) => {
                  if (response_2.status == 200) {
                    deleteAllCartItem()(dispatch)
                    // dispatch(deleteAllCartItem());
                    Alert.alert('Your order has been received.');
                    navigation.navigate('mainScreens');
                    void showOrderNotification();
                  }
                })
                .catch((error) => {
                  if (error.response.status == 404) {
                    showToastWithGravity('Something went wrong');
                    setModalVisible(false);
                  } else if (error.response.status == 500) {
                    // ask the user to try again
                  }
                });
            } else {
              Alert.alert('Order unsuccessful');
              setModalVisible(false);
            }
          }
        })
        .catch(() => {
          // ask the user to try again
        });
    } catch (error) {
      setModalVisible(false);
      log.debug(error);
    }
  };

  // useffect to check if a refrence has been received
  useEffect(() => {
    if ((route.params as any)?.startConfirmation == true) {
      void verifyPayment()
    }
  }, [route.params]);

  const totalPrice = cart.reduce((x, y) => x + y.price, 0);

  const totalItems = cart.reduce((x, y) => x + y?.quantity, 0);

  const shippingPrice = 5000; // you should load shipping price from database instead

  // this is the checkout info that will be sent to the server
  const checkOutInfo = {
    userId: userData?._id,
    products: cart?.map((item) => ({
      _id: item._id,
      name: item.title,
      quantity: item.quantity,
      price: item.price,
      color: item.displayColor,
      size: item.displaySize,
      image: item.image,
      gender: item.gender,
    })),
    totalPrice: totalPrice + shippingPrice,
    shippingAddress: {
      mobileNo: userData?.addresses[selectedAddress]?.mobileNo,
      houseAddress: userData?.addresses[selectedAddress]?.houseAddress,
      street: userData?.addresses[selectedAddress]?.street,
      city: userData?.addresses[selectedAddress]?.city,
      postalCode: userData?.addresses[selectedAddress]?.postalCode,
    },
    paymentMethod:
      selectedPaymentMethod == 1 ? 'Credit Card' : 'Cash On Delivery',
    shippingPrice: shippingPrice,
  };

  // this is a function to get the user data when the component mounts

  const getData = async () => {
    try {
      setDataLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<AuthPayload>(token);
        const userId = decoded.userId;
        await api.public
          .get(`/users/${userId}`)
          .then((response) => {
            if (response.status === 200) {
              setUserData(response.data);
              setDataLoading(false);
            }
          })
          .catch((error) => {
            if (error.response.status === 404) {
              log.debug('something went wrong');
              // Alert.alert('Something went wrong');
              setDataLoading(false);
            } else if (error.response.status === 500) {
              log.debug('server error');
              setDataLoading(false);
            }
          });
      }
    } catch (error) {
      log.debug(error);
      setDataLoading(false);
    }
  };

  useEffect(() => {
    void getData();
  }, []);

  // useffect to update user data when it changes without interrupting
  useEffect(() => {
    const getData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const decoded = jwtDecode<AuthPayload>(token);
          const userId = decoded.userId;
          await api.public.get(`/users/${userId}`).then((response) => {
            if (response.status === 200) {
              setUserData(response.data);
            }
          });
        }
      } catch (error) {
        log.debug(error);
      }
    };
    void getData();
  }, [userData]);

  // if the cart is empty, the screen will be terminated
  useEffect(() => {
    function checkCartLength(): void {
      if (cart?.length == 0) {
        refRBSheetForCart?.current?.close();
        navigation.navigate('mainScreens');
      }
    }
    checkCartLength();
  }, [cart]);

  const stylesInner = StyleSheet.create({
    cardHeaderText: {
      color: currentTextColor,
      fontSize: 16,
      fontWeight: '500',
    },
    cardTextInput: {
      borderColor: currentTextColor,
      borderRadius: 5,
      borderWidth: 1,
      color: currentTextColor,
      fontSize: 20,
      height: 50,
      paddingHorizontal: 10,
      width: '100%',
    },
    cartSummariesContainerHeader: {
      color: currentTextColor,
      fontSize: 22,
      fontWeight: '500',
    },
    cartSummariesContainerHeaderChild: {
      color: currentTextColor,
      fontSize: 24,
      fontWeight: 'bold',
    },
    paymentMethodBox: {
      // flex: 1,
      borderColor: currentTextColor,
      borderRadius: 10,
      height: 120,
      justifyContent: 'space-evenly',
      padding: 10,
      width: '100%',
    },
    radioBtns: {
      alignItems: 'center',
      backgroundColor: currentTextColor,
      borderRadius: 12.5,
      height: 25,
      justifyContent: 'center',
      width: 25,
    },
    radioBtnsOuter: {
      alignItems: 'center',
      borderColor: currentTextColor,
      borderRadius: 17.5,
      borderWidth: 1,
      height: 35,
      justifyContent: 'center',
      width: 35,
    },
    radioBtnsText: {
      color: currentTextColor,
      fontSize: 15,
    },
  });

  // function to initialize transaction when the user selects the credit card payment method
  const cardPay = async () => {
    try {
      setModalVisible(true);
      await api.public
        .post('/initialize-transaction', {
          email: userData.email,
          amount: `${(totalPrice + shippingPrice) * 100}`, // amount is multiplied by 100 because 1 kobo = 100 naira
          channels: ['card'], // only card payment method with paystack
        })
        .then((response) => {
          log.debug(response.data.data);
          if (response.status == 200) {
            const authorizationUrl = response.data.data.authorization_url;
            setModalVisible(false);
            navigation.navigate('paystackCheckout', {
              url: authorizationUrl,
              checkOutInfo: checkOutInfo,
              startConfirmation: false,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          if (error.response.status !== 200) {
            setModalVisible(false);
            log.debug('something went wrong');
          }
        });
    } catch (error) {
      setModalVisible(false);
      log.debug(error);
    }
  };

  // function to receive order if the user is eligible for cash on delivery
  const cashOnDelivery = async () => {
    try {
      setModalVisible(true);
      await api.public
        .post('/cash-on-delivery', {
          userId: userData._id,
        })
        .then(async (response) => {
          if (response.status == 200) {
            await api.public
              .post(`/order`, checkOutInfo)
              .then((response_2) => {
                if (response_2.status == 200) {
                  Alert.alert('Your order has been received.');
                  navigation.navigate('mainScreens');
                  void showOrderNotification();
                }
              })
              .catch((error) => {
                if (error.response.status == 404) {
                  setModalVisible(false);
                  showToastWithGravity('Something went wrong');
                } else if (error.response.status == 500) {
                  setModalVisible(false);
                  showToastWithGravity('Server error');
                }
              });
          }
        })
        .catch((error) => {
          console.error(error);
          if (error.response.status === 404) {
            setModalVisible(false);
            Alert.alert('You are not eligible for this payment method');
          } else if (error.response.status === 500) {
            setModalVisible(false);
            showToastWithGravity('Server error');
          }
        });
    } catch (error) {
      setModalVisible(false);
      log.debug(error);
    }
  };

  function moveToStep2() {
    setStepOneDone(true);
    setProgressNo((number) => number + 1);
  }

  function moveToStep3() {
    setStepTwoDone(true);
    setProgressNo((number) => number + 1);
  }

  function editPressedAddress(index: number) {
    setPressedAddress(index);
    refRBSheetForEditAddress?.current?.open();
  }
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentBgColor }}>
      <Header name={'Checkout'} showCart={false} />
      <LoadingModal modalVisible={modalVisible} />
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

      {!dataLoading && userData !== null && (
        <>
          <View
            style={{
              paddingHorizontal: 30,
              paddingVertical: 20,
            }}
          >
            <View style={styles.radioBtnsContainer}>
              <Pressable
                onPress={() => (stepOneDone ? setProgressNo(1) : null)}
                style={{
                  justifyContent: 'center',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <View style={stylesInner.radioBtnsOuter}>
                  <View style={stylesInner.radioBtns}>
                    {stepOneDone && (
                      <Icon name="check" size={15} color={currentBgColor} />
                    )}
                  </View>
                </View>
                <Text style={{ color: currentTextColor, fontSize: 18 }}>
                  Cart
                </Text>
              </Pressable>

              <Pressable
                onPress={() => (stepOneDone ? setProgressNo(2) : null)}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <View style={stylesInner.radioBtnsOuter}>
                  <View style={stylesInner.radioBtns}>
                    {stepTwoDone && (
                      <Icon name="check" size={15} color={currentBgColor} />
                    )}
                  </View>
                </View>
                <Text style={{ color: currentTextColor, fontSize: 18 }}>
                  Address
                </Text>
              </Pressable>

              <Pressable
                onPress={() => (stepTwoDone ? setProgressNo(3) : null)}
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <View style={stylesInner.radioBtnsOuter}>
                  <View style={stylesInner.radioBtns}>
                    {stepThreeDone && (
                      <Icon name="check" size={15} color={currentBgColor} />
                    )}
                  </View>
                </View>
                <Text style={{ color: currentTextColor, fontSize: 18 }}>
                  Payment
                </Text>
              </Pressable>
            </View>
          </View>

          {/* progress display start */}
          <View style={{ flex: 1 }}>
            {/* progress 1 */}
            {progressNo == 1 && (
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'space-between',
                    paddingVertical: 15,
                  }}
                >
                  <View
                    style={{ gap: 40, marginTop: 20, paddingHorizontal: 15 }}
                  >
                    <View style={styles.cartSummariesContainer}>
                      <Text style={stylesInner.cartSummariesContainerHeader}>
                        Total Items:
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 10,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={stylesInner.cartSummariesContainerHeaderChild}
                        >
                          {totalItems}
                        </Text>
                        <Pressable
                          onPress={() => refRBSheetForCart?.current?.open()}
                        >
                          <Icon
                            name="pen-to-square"
                            color={currentTextColor}
                            size={18}
                          />
                        </Pressable>
                      </View>
                    </View>
                    <View style={styles.cartSummariesContainer}>
                      <Text style={stylesInner.cartSummariesContainerHeader}>
                        Subtotal Price:
                      </Text>
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Icon
                          name="naira-sign"
                          size={15}
                          color={currentTextColor}
                        />
                        <Text
                          style={stylesInner.cartSummariesContainerHeaderChild}
                        >
                          {totalPrice}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cartSummariesContainer}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <Text style={stylesInner.cartSummariesContainerHeader}>
                          Shipping Price:
                        </Text>
                        <Pressable>
                          <Text
                            style={{
                              color: currentTextColor,
                              fontSize: 17,
                              textDecorationLine: 'underline',
                            }}
                          >
                            See details
                          </Text>
                        </Pressable>
                      </View>

                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Icon
                          name="naira-sign"
                          size={15}
                          color={currentTextColor}
                        />
                        <Text
                          style={stylesInner.cartSummariesContainerHeaderChild}
                        >
                          {shippingPrice}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.cartSummariesContainer}>
                      <Text style={stylesInner.cartSummariesContainerHeader}>
                        Total Price:
                      </Text>
                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Icon
                          name="naira-sign"
                          size={15}
                          color={currentTextColor}
                        />
                        <Text
                          style={stylesInner.cartSummariesContainerHeaderChild}
                        >
                          {totalPrice + shippingPrice}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View
                    style={{
                      borderColor: currentTextColor,
                      borderTopWidth: 1,
                      paddingTop: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={moveToStep2}
                      style={{ paddingHorizontal: 15 }}
                    >
                      <View
                        style={{
                          backgroundColor: themeColor,
                          width: '100%',
                          paddingVertical: 15,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 22 }}>
                            Continue
                          </Text>
                          <Icon name="arrow-right" size={20} color="#fff" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            {/* progress 2 */}
            {progressNo == 2 && (
              <View style={{ flex: 1 }}>
                <View
                  style={{
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingHorizontal: 15,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: '500',
                      color: currentTextColor,
                    }}
                  >
                    Address
                  </Text>
                  {userData?.addresses?.length > 0 && (
                    <Pressable
                      onPress={() => refRBSheetForAddress?.current?.open()}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      <Text
                        style={{
                          color: currentTextColor,
                          fontSize: 20,
                          fontWeight: '500',
                        }}
                      >
                        New
                      </Text>
                      <Icon name="plus" color={currentTextColor} size={20} />
                    </Pressable>
                  )}
                </View>
                <View
                  style={{
                    flex: 1,
                    paddingVertical: 15,
                    justifyContent: 'space-between',
                  }}
                >
                  {/* if address length = 0 */}
                  {userData?.addresses?.length == 0 && (
                    <View style={{ flex: 1, justifyContent: 'center' }}>
                      <Pressable
                        onPress={() => refRBSheetForAddress?.current?.open()}
                        style={{
                          paddingVertical: 20,
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <View
                          style={{
                            height: 100,
                            width: 100,
                            borderRadius: 50,
                            borderColor: currentTextColor,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 1,
                          }}
                        >
                          <Icon2
                            name="add"
                            color={currentTextColor}
                            size={60}
                          />
                        </View>

                        <Text
                          style={{
                            color: currentTextColor,
                            fontSize: 20,
                            fontWeight: '400',
                          }}
                        >
                          Add an Address
                        </Text>
                      </Pressable>
                    </View>
                  )}
                  {/* if address length > 0 */}
                  <View style={{ gap: 15, paddingHorizontal: 15 }}>
                    {userData?.addresses?.length > 0 &&
                      userData.addresses.map((item: any, index: number) => (
                        <Pressable
                          key={index}
                          onPress={() => editPressedAddress(index)}
                          style={{
                            borderRadius: 10,
                            minHeight: 100,
                            width: '100%',
                            borderWidth: 1,
                            borderColor: currentTextColor,
                            padding: 15,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View style={{ gap: 10 }}>
                            <Icon
                              name="location-dot"
                              color={currentTextColor}
                              size={25}
                            />
                            <Text
                              style={{
                                color: currentTextColor,
                                fontSize: 18,
                                fontWeight: '500',
                              }}
                            >
                              {item.mobileNo}
                            </Text>
                            <Text
                              style={{
                                color: currentTextColor,
                                fontSize: 18,
                                fontWeight: '500',
                              }}
                              numberOfLines={1}
                            >
                              {item.houseAddress}
                            </Text>
                            <Text
                              style={{
                                color: currentTextColor,
                                fontSize: 18,
                                fontWeight: '500',
                              }}
                              numberOfLines={1}
                            >
                              {item.street}
                            </Text>
                            <Text
                              style={{
                                color: currentTextColor,
                                fontSize: 18,
                                fontWeight: '500',
                              }}
                              numberOfLines={1}
                            >
                              {item.city}
                            </Text>
                          </View>
                          <Pressable onPress={() => setSelectedAddress(index)}>
                            <Icon
                              name={
                                selectedAddress == index
                                  ? 'square-check'
                                  : 'square'
                              }
                              size={30}
                              color={currentTextColor}
                            />
                          </Pressable>
                        </Pressable>
                      ))}
                  </View>
                  <View
                    style={{
                      borderColor: currentTextColor,
                      borderTopWidth: 1,
                      paddingTop: 10,
                    }}
                  >
                    <TouchableOpacity
                      disabled={userData.addresses?.length == 0 ? true : false}
                      onPress={moveToStep3}
                      style={{ paddingHorizontal: 15 }}
                    >
                      <View
                        style={{
                          backgroundColor:
                            userData.addresses?.length == 0
                              ? '#a0a0a0'
                              : themeColor,
                          width: '100%',
                          paddingVertical: 15,
                          borderRadius: 10,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 10,
                          }}
                        >
                          <Text style={{ color: '#fff', fontSize: 22 }}>
                            Continue
                          </Text>
                          <Icon name="arrow-right" size={20} color="#fff" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
            {/* progress 3 */}
            {progressNo == 3 && (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'space-between',
                  paddingBottom: 15,
                }}
              >
                <View>
                  <View
                    style={{
                      paddingHorizontal: 15,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: '500',
                        color: currentTextColor,
                      }}
                    >
                      Payment Method
                    </Text>
                  </View>
                  <View
                    style={{
                      gap: 10,
                      paddingHorizontal: 15,
                      marginTop: 20,
                    }}
                  >
                    <Pressable
                      onPress={() => setSelectedPaymentMethod(1)}
                      style={[
                        stylesInner.paymentMethodBox,
                        { borderWidth: selectedPaymentMethod == 1 ? 2.5 : 1 },
                      ]}
                    >
                      <Icon
                        name="credit-card"
                        size={23}
                        color={currentTextColor}
                      />
                      <Text
                        style={{
                          fontWeight: '500',
                          fontSize: 23,
                          color: currentTextColor,
                        }}
                      >
                        Credit Card
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setSelectedPaymentMethod(2)}
                      style={[
                        stylesInner.paymentMethodBox,
                        { borderWidth: selectedPaymentMethod == 2 ? 2.5 : 1 },
                      ]}
                    >
                      <Icon
                        name="money-bills"
                        size={23}
                        color={currentTextColor}
                      />
                      <Text
                        style={{
                          fontWeight: '500',
                          fontSize: 23,
                          color: currentTextColor,
                        }}
                      >
                        Cash On Delivery
                      </Text>
                    </Pressable>
                  </View>
                </View>
                {/*  */}
                <View
                  style={{
                    borderColor: currentTextColor,
                    borderTopWidth: 1,
                    paddingTop: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={
                      selectedPaymentMethod == 1 ? cardPay : cashOnDelivery
                    }
                    style={{ paddingHorizontal: 15 }}
                  >
                    <View
                      style={{
                        backgroundColor: themeColor,
                        width: '100%',
                        paddingVertical: 15,
                        borderRadius: 10,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 10,
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 22 }}>
                          {selectedPaymentMethod == 1 ? 'Continue' : 'Complete'}
                        </Text>
                        {selectedPaymentMethod == 1 && (
                          <Icon name="arrow-right" size={20} color="#fff" />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
                {/*  */}
              </View>
            )}
          </View>
          {/* progress display end */}
          <BSDisplayForNewAddress />
          <BSDisplayForEditAddress>
            {pressedAddress &&
              <EditAddress
                mobileNoprop={userData.addresses[pressedAddress]?.mobileNo}
                streetprop={userData.addresses[pressedAddress]?.street}
                cityprop={userData.addresses[pressedAddress]?.city}
                objId={userData.addresses[pressedAddress]?._id}
                landmarkprop={userData.addresses[pressedAddress]?.landmark}
                postalCodeprop={userData.addresses[pressedAddress]?.postalCode}
                houseAddressprop={
                  userData.addresses[pressedAddress]?.houseAddress
                }
              />
            }
          </BSDisplayForEditAddress>
        </>
      )}
    </SafeAreaView>
  );
};

export default CheckOutPage;

const styles = StyleSheet.create({
  cartSummariesContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioBtnsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioBtns_plus_text: {
    alignItems: 'center',
    gap: 10,
  },
});
