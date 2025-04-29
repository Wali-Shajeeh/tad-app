/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react-native/no-unused-styles */



// this is the order details display for admin. this should be in another app





/* eslint-disable @typescript-eslint/no-explicit-any */
// this is the order details display for admin. this should be in another app
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-return */





/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ColorValue,
} from 'react-native';

import { SelectList } from 'react-native-dropdown-select-list';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useDispatch, useSelector } from 'react-redux';
import { useMyBottomSheet } from '@/context/bottomSheetContext';
import { AppState } from '@/redux/store';
import { AppStackParamList } from '@/types/navigation';
import { useTheme } from '../context/themeContext';
import {
  decreaseItemQuantity,
  increaseItemQuantity,
  selectItemColor,
  selectItemSize,
  deleteCartItem,
  deleteAllCartItem,
} from '../redux/actions';

const Cart = () => {
  const { currentTextColor, currentBgColor, themeColor } = useTheme();
  const { refRBSheetForCart } = useMyBottomSheet();
  const { cart } = useSelector((state: AppState) => state.cartReducer);
  const dispatch = useDispatch();
  const removeCartItem = (product: any) => deleteCartItem(product)(dispatch);
  const deleteAll = () => deleteAllCartItem()(dispatch);
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const totalPrice = cart.reduce((x: any, y: { price: number; }) => x + (Number(y.price) || 0), 0);

  const totalItems = cart.reduce((x: any, y: { quantity: number; }) => x + y?.quantity, 0);

  const stylesInner = StyleSheet.create({
    addMinusBtn: {
      alignItems: 'center',
      borderColor: currentTextColor,
      borderRadius: 5,
      borderWidth: 0.5,
      height: 30,
      justifyContent: 'center',
      width: 30,
    },

    checkOutBtn: {
      backgroundColor: themeColor,
      borderRadius: 10,
      paddingVertical: 15,
      width: '100%',
    },
    checkOutBtnContainer: {
      backgroundColor: currentBgColor,
      borderColor: currentTextColor,
      borderTopWidth: 0.5,
      bottom: 0,
      gap: 15,
      height: 'auto',
      padding: 15,
      width: '100%',
    },
    subtotal_shipping_text: {
      color: currentTextColor,
      fontSize: 18,
      fontWeight: '500',
    },
    totalPrice_cont: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    total_text: { color: currentTextColor, fontSize: 20, fontWeight: 'bold' },
  });

  // function to change selected color

  const changeColor = (item: any, color: any) => {
    selectItemColor(item, color)(dispatch)
  };

  // function to change selected size
  const changeSize = (item: any, size: any) => {
    selectItemSize(item, size)(dispatch)
  };

  const increaseQuantityState = (item: any) => {
    if (item.quantity === item.stock) {
      return null;
    }
    return increaseItemQuantity(item)(dispatch);
  };

  const decreaseQuantityState = (item: any) => item.quantity == 1
    ? removeCartItem(item)
    : decreaseItemQuantity(item)(dispatch)

  const showDeleteAllAlert = () => {
    Alert.alert(
      'Delete all cart items.',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: deleteAll,
        },
      ],
      { cancelable: false },
    );
  };

  // this is the component that's rendered when the cart item is swiped

  const SwipeLeftAction = (item: any) => (
    <View
      style={{
        backgroundColor: 'red',
        justifyContent: 'center',
        padding: 30,
      }}
    >
      <Pressable onPress={() => removeCartItem(item)}>
        <Icon name="trash" size={30} color="#000" />
      </Pressable>
    </View>
  );

  function goToCheckOut() {
    refRBSheetForCart?.current?.close();
    navigation.navigate('checkoutPage');
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={[
          styles.header,
          {
            borderColor: currentTextColor,
            borderBottomWidth: 0.5,
          },
        ]}
      >
        <Pressable onPress={() => refRBSheetForCart?.current?.close()}>
          <Icon name="xmark" size={25} color={currentTextColor} />
        </Pressable>
        <View>
          <Text style={{ fontSize: 25, color: currentTextColor }}>
            Cart ({totalItems})
          </Text>
        </View>
        <Pressable onPress={showDeleteAllAlert}>
          <Icon name="trash" size={25} color={currentTextColor} />
        </Pressable>
      </View>
      <ScrollView>
        {cart.map((item: any) => (
          <Swipeable
            renderLeftActions={() => SwipeLeftAction(item)}
            friction={1}
            containerStyle={{
              borderColor: currentTextColor,
              borderBottomWidth: 0.5,

              backgroundColor: 'red',
            }}
            key={item._id}
          >
            <View
              style={{ backgroundColor: currentBgColor, padding: 15, gap: 10 }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: 150,
                  gap: 20,
                }}
              >
                {/*  */}
                <Image
                  source={{ uri: item.image }}
                  style={{ height: 120, width: 120, borderRadius: 10 }}
                  resizeMode="cover"
                />
                {/*  */}
                <View
                  style={{
                    justifyContent: 'space-evenly',
                    height: '100%',
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      color: currentTextColor,
                      fontSize: 22,
                      fontWeight: '500',
                    }}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>

                  <Text
                    style={{
                      color: currentTextColor,
                      fontSize: 20,
                      fontWeight: '500',
                    }}
                  >
                    Stock: {item.stock}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Icon
                      name="naira-sign"
                      size={15}
                      color={currentTextColor}
                    />
                    <Text
                      style={{
                        color: currentTextColor,
                        fontSize: 22,
                        fontWeight: 'bold',
                      }}
                    >
                      {item.discountPrice ? item.discountPrice : item.price}
                    </Text>
                  </View>
                </View>
                {/*  */}
                <View
                  style={{
                    justifyContent: 'space-evenly',
                    height: '100%',
                    alignItems: 'center',
                  }}
                >
                  <Pressable
                    style={stylesInner.addMinusBtn}
                    onPress={() => increaseQuantityState(item)}
                  >
                    <Icon name="plus" color={currentTextColor} size={15} />
                  </Pressable>

                  <Text
                    style={{
                      color: currentTextColor,
                      fontSize: 20,
                      fontWeight: '500',
                    }}
                  >
                    {item.quantity}
                  </Text>

                  <Pressable
                    style={stylesInner.addMinusBtn}
                    onPress={() => decreaseQuantityState(item)}
                  >
                    <Icon name="minus" color={currentTextColor} size={15} />
                  </Pressable>
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 15,
                }}
              >
                <SelectList
                  setSelected={(val: any) => changeSize(item, val)}
                  data={item.sizeArrayForDropDown}
                  placeholder="Size"
                  search={false}
                  save="value"
                  maxHeight={200}
                  arrowicon={
                    <Icon
                      name="chevron-down"
                      color={currentTextColor}
                      size={20}
                    />
                  }
                  boxStyles={{
                    borderColor: currentTextColor,
                    alignItems: 'center',
                    gap: 10,
                    height: 50,
                  }}
                  dropdownStyles={{ borderColor: currentTextColor }}
                  dropdownTextStyles={{ color: currentTextColor, fontSize: 20 }}
                  inputStyles={{ color: currentTextColor, fontSize: 20 }}
                />

                <View style={{ flexDirection: 'row', gap: 15 }}>
                  {item.colors.map((colorObj: { color: ColorValue | undefined; }, index: React.Key | null | undefined) => (
                    <Pressable
                      onPress={() => changeColor(item, colorObj.color)}
                      key={index}
                      style={{
                        height: 35,
                        width: 35,
                        backgroundColor: colorObj.color
                          ? colorObj.color
                          : 'transparent',
                        borderRadius: 5,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {item.selectedColor == colorObj.color && (
                        <Icon
                          name="check"
                          color={
                            colorObj.color == '#fff' ||
                              colorObj.color == 'white'
                              ? '#000'
                              : '#fff'
                          }
                          size={20}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          </Swipeable>
        ))}
      </ScrollView>
      {cart.length > 0 && (
        <View style={stylesInner.checkOutBtnContainer}>
          <View style={stylesInner.totalPrice_cont}>
            <Text style={stylesInner.total_text}>Total:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="naira-sign" size={13} color={currentTextColor} />
              <Text style={stylesInner.total_text}>{totalPrice}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={goToCheckOut}>
            <View style={stylesInner.checkOutBtn}>
              <View style={styles.checkOut_arrow_cont}>
                <Text style={{ color: '#fff', fontSize: 22 }}>Checkout</Text>
                <Icon name="arrow-right" size={20} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </GestureHandlerRootView>
  );
};

export default Cart;

const styles = StyleSheet.create({
  checkOut_arrow_cont: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
});
