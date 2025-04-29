/* eslint-disable react-native/no-unused-styles */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';

import { AppStackParamList } from '@/types/navigation';
import Header from '../components/Header';
import { useTheme } from '../context/themeContext';
// import {Header} from '../components/resuableComponents';

const MyOrderDetailScreen = (): React.JSX.Element => {
  const { currentBgColor, currentTextColor, theme, themeColor } =
    useTheme();
  const route = useRoute<RouteProp<Pick<AppStackParamList, 'myOrderDetail'>>>();
  // const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const window = useWindowDimensions();
  const { item }: any = route.params;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const totalItems = item.products.reduce((x: any, y: { quantity: any; }) => x + y?.quantity, 0);

  const totalPrice = item.products.reduce((x: any, y: { price: any; }) => x + y?.price, 0);

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
      backgroundColor: theme == 'light' ? '#fff' : '#222',
      borderColor: currentTextColor,
      borderRadius: 10,
      height: 'auto',
      padding: 10,
      paddingVertical: 20,
      width: '100%',
    },
    scrollPageSelector: {
      alignItems: 'center',
      flex: 1,
      height: 50,
      justifyContent: 'center',
    },
    text_between: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    text_between_header: {
      color: currentTextColor,
      fontSize: 20,
      fontWeight: '400',
    },
    text_between_price: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
    },
    text_between_price_number: {
      color: currentTextColor,
      fontSize: 20,
      fontWeight: '500',
    },
  });

  const scrollToPage = (pageNumber: number): void => {
    if (scrollRef.current) {
      const offsetX = pageNumber * Dimensions.get('window').width;
      scrollRef.current?.scrollTo({ x: offsetX, animated: true });
    }
  };

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: any; }; }; }): void => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(
      contentOffset / Dimensions.get('window').width,
    );
    setActiveIndex(currentIndex);
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentBgColor }}>
      <Header name={'Order'} showCart={false} />
      <View style={{ flexDirection: 'row' }}>
        <Pressable
          style={styles.scrollPageSelector}
          onPress={() => scrollToPage(0)}>
          <Text
            style={{ fontSize: 20, fontWeight: '500', color: currentTextColor }}>
            Details
          </Text>
          <View
            style={{
              backgroundColor: activeIndex == 0 ? themeColor : 'transparent',
              height: 5,
              width: 10,
              borderRadius: 5,
              marginTop: 3,
            }}></View>
        </Pressable>
        <Pressable
          style={styles.scrollPageSelector}
          onPress={() => scrollToPage(1)}>
          <Text
            style={{ fontSize: 20, fontWeight: '500', color: currentTextColor }}>
            Products
          </Text>
          <View
            style={{
              backgroundColor: activeIndex == 1 ? themeColor : 'transparent',
              height: 5,
              width: 10,
              borderRadius: 5,
              marginTop: 3,
            }}></View>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{
          backgroundColor: theme == 'light' ? '#f8f8f8' : undefined,
        }}
        horizontal
        pagingEnabled
        nestedScrollEnabled
        onScroll={handleScroll}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        ref={scrollRef}>
        {/* page 1 */}
        <View style={{ width: window.width, padding: 15 }}>
          <ScrollView
            contentContainerStyle={{ gap: 15 }}
            showsVerticalScrollIndicator={false}>
            <View style={styles.detailsBox}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="naira-sign" size={20} color={currentTextColor} />
                <Text
                  style={{
                    fontWeight: 'bold',
                    fontSize: 30,
                    color: currentTextColor,
                  }}>
                  {totalPrice + item.shippingPrice}
                </Text>
              </View>
              <View style={{ gap: 15 }}>
                <View style={styles.text_between}>
                  <Text style={styles.text_between_header}>Total Items</Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '400',
                      color: currentTextColor,
                    }}>
                    {totalItems}
                  </Text>
                </View>
                <View style={styles.text_between}>
                  <Text style={styles.text_between_header}>Subtotal</Text>
                  <View style={styles.text_between_price}>
                    <Icon
                      name="naira-sign"
                      size={12}
                      color={currentTextColor}
                    />
                    <Text style={styles.text_between_price_number}>
                      {totalPrice}
                    </Text>
                  </View>
                </View>
                <View style={styles.text_between}>
                  <Text style={styles.text_between_header}>Shipping price</Text>
                  <View style={styles.text_between_price}>
                    <Icon
                      name="naira-sign"
                      size={12}
                      color={currentTextColor}
                    />
                    <Text style={styles.text_between_price_number}>
                      {item.shippingPrice}
                    </Text>
                  </View>
                </View>
                <View style={styles.text_between}>
                  <Text style={styles.text_between_header}>Total price</Text>
                  <View style={styles.text_between_price}>
                    <Icon
                      name="naira-sign"
                      size={12}
                      color={currentTextColor}
                    />
                    <Text style={styles.text_between_price_number}>
                      {totalPrice + item.shippingPrice}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.detailsBox, { gap: 15 }]}>
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
              {item.products.map((product: { image: any; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; price: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; color: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; size: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; quantity: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }, index: React.Key | null | undefined) => (
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
                        <Icon
                          name="naira-sign"
                          size={12}
                          color={currentTextColor}
                        />
                        <Text style={styles.text_between_price_number}>
                          {product.price}
                        </Text>
                      </View>
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
    </SafeAreaView>
  );
};

export default MyOrderDetailScreen;
