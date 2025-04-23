/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable react-native/split-platform-components */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  NavigationProp,
  useFocusEffect,
  useRoute,
  useNavigation,
  RouteProp,
} from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  SafeAreaView,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon2 from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '@/redux/store';
import { AuthPayload } from '@/types/auth';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import { getAuthToken } from '@/utils/storage';
import RenderRecommended from '../components/RenderRecommended';
import { useTheme } from '../context/themeContext';
import {
  addToCart,
  deleteCartItem,
  increaseItemQuantity,
  decreaseItemQuantity,
} from '../redux/actions';
import api from '../services/api';
const themeColor = '#6236FF';

const ShowMoreText: React.FC<{ text: string; maxLength: number }> = ({
  text,
  maxLength,
}) => {
  const [showFullText, setShowFullText] = useState(false);
  const numberOfLines = showFullText ? undefined : 2;
  const { currentTextColor } = useTheme();
  return (
    <View>
      <Text
        style={{
          color: currentTextColor,
          fontSize: 20,
          lineHeight: 30,
        }}
        numberOfLines={numberOfLines}
      >
        {text}
      </Text>
      {text.length > maxLength && (
        <Pressable
          onPress={() => setShowFullText(!showFullText)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
        >
          <Text
            style={{
              color: currentTextColor,
              fontWeight: 'bold',
              fontSize: 20,
            }}
          >
            {showFullText ? 'show less' : 'show more'}
          </Text>
          <Icon
            name={showFullText ? 'chevron-up' : 'chevron-down'}
            color={currentTextColor}
            size={20}
          />
        </Pressable>
      )}
    </View>
  );
};

const Separator = (): React.JSX.Element => (
  <View
    style={{
      backgroundColor: '#cccccc',
      height: 0.7,
      marginHorizontal: 15,
    }}
  ></View>
);

const DetailsText: React.FC<{ text: string; value: string }> = ({
  text,
  value,
}) => {
  const { currentTextColor } = useTheme();
  return (
    value && (
      <Text
        style={{ color: currentTextColor, fontSize: 18, fontWeight: '400' }}
      >
        {text}:{' '}
        {<Text style={{ fontWeight: 'bold', fontSize: 20 }}>{value}</Text>}
      </Text>
    )
  );
};

const ProductDisplay = (): React.JSX.Element => {
  const { theme, currentTextColor, currentBgColor } = useTheme();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList>>();
  const [isProductLiked, setProductLiked] = useState(
    route?.params?.userLiked || false,
  );
  const [_userId, setUserId] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [userData, setUserData] = useState<
    Partial<{ firstName: string; lastName: string; email: string }>
  >({});
  const dispatch = useDispatch();
  const { cart } = useSelector((state: AppState) => state.cartReducer);
  const addNewCartItem = (newCartItem: any) => addToCart(newCartItem)(dispatch);
  const removeCartItem = (cartItem: any) => deleteCartItem(cartItem)(dispatch);
  const increaseQuantity = (product: any) =>
    increaseItemQuantity(product)(dispatch);
  const decreaseQuantity = (product: any) =>
    decreaseItemQuantity(product)(dispatch);
  const [recommended, setRecommended] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
  const [_userRating, setUserRating] = useState<number | null>(null);

  const cartItem = cart.find(
    (obj) => route?.params?.productId && obj._id == route?.params?.productId,
  );

  const styleInner = StyleSheet.create({
    _title: {
      color: currentTextColor,
      fontSize: 20,
      fontWeight: '500',
    },
    addMinusBtn: {
      alignItems: 'center',
      borderColor: currentTextColor,
      borderRadius: 5,
      borderWidth: 0.5,
      height: 30,
      justifyContent: 'center',
      width: 30,
    },
    container: {
      backgroundColor: currentBgColor,
      paddingVertical: 15,
    },
    lineThrough: {
      backgroundColor: currentTextColor,
      height: 2,
      position: 'absolute',
      width: '100%',
    },
    productImage: {
      flex: 1,
      height: '100%',
      width: 'auto',
    },
    productPrice: {
      color: currentTextColor,
      fontSize: 25,
      fontWeight: '500',
    },
    productTitle: {
      color: currentTextColor,
      fontSize: 30,
      fontWeight: '500',
    },
    strikedPrice: {
      color: currentTextColor,
      fontSize: 22,
      fontWeight: '400',
    },
  });

  const showToastWithGravity = (text: string) => {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };

  // useffect to check if user has liked product or not before displaying product
  useEffect(() => {
    const getUser = async () => {
      try {
        setDataLoading(true);
        const token = await getAuthToken();
        const productId = route?.params?.productId;
        if (token) {
          const decoded = jwtDecode<AuthPayload>(token);
          setUserId(decoded.userId);
          const response = await api.public.get(`/users/${decoded.userId}`);
          if (response.status == 200) {
            setUserData(response.data as typeof userData);
            if (
              'likedProducts' in response.data &&
              response.data.likedProducts &&
              response.data.likedProducts.includes(productId)
            ) {
              setProductLiked(true);
            } else {
              setProductLiked(false);
            }

            setDataLoading(false);
          } else {
            showToastWithGravity('Something went wrong');

            setDataLoading(false);
          }
        }
      } catch (error) {
        log.debug(error);
        setDataLoading(false);
      }
    };
    void getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useffect to get recommended products before product displays
  useEffect(() => {
    const getRecommended = async () => {
      setRecommendedLoading(true);
      if (!route.params?.productId) return;
      try {
        await api.public
          .get(`/recomended/${route.params.productId}`)
          .then((response) => {
            if (response.status == 200) {
              setRecommended(
                response.data.filter(
                  (item: { _id: string | undefined }) =>
                    item._id !== route?.params?.productId,
                ),
              );
              setRecommendedLoading(false);
            }
          })
          .catch((error) => {
            log.debug(error.response);
            setRecommended([]);
            setRecommendedLoading(false);
          });
      } catch (error) {
        log.debug(error);
        setRecommendedLoading(false);
      }
    };
    void getRecommended();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // function to update data on every change

  useFocusEffect(
    React.useCallback(() => {
      const getUser = async () => {
        try {
          const token = await getAuthToken();
          if (token) {
            const decoded = jwtDecode<AuthPayload>(token);
            setUserId(decoded.userId);
            const response = await api.public.get(`/users/${decoded.userId}`);
            if (response.status == 200) {
              setUserData(response.data);
            }
          }
        } catch {
          log.debug('Something went wrong');
        }
      };
      void getUser();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData]),
  );

  // function to like / unlike product
  async function like_UnlikeProduct() {
    setProductLiked(!isProductLiked);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<AuthPayload>(token);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_BASE_URL as string}/likeProduct`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: decoded.userId,
              productId: route.params?.productId,
            }),
          },
        );

        if (response.status == 200) {
          showToastWithGravity('Added to wishlist');
        } else if (response.status == 201) {
          showToastWithGravity('Removed from wishlist');
        } else {
          showToastWithGravity('Something went wrong');
        }
      }
    } catch (error) {
      log.debug(error);
    }
  }

  // this is a function to rate product

  // eslint-disable-next-line no-unused-vars
  async function rateProduct({ rating }: { rating: number }): Promise<void> {
    setUserRating(rating);
    try {
      const token = await getAuthToken();
      if (token) {
        const decoded = jwtDecode<AuthPayload>(token);
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/rateProduct`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: decoded.userId,
              productId: route.params?.productId,
              newRating: rating,
            }),
          },
        );
        if (response.status == 200 || 201) {
          showToastWithGravity(
            'Your rating for this product has been updated successfully.',
          );
        } else if (response.status == 404) {
          showToastWithGravity('Something went wrong');
        } else if (response.status == 500) {
          showToastWithGravity('Server error');
        }
      }
    } catch (error) {
      log.debug(error);
    }
  }

  const handleAddToCart = (item: any) => {
    addNewCartItem(item);
  };

  const increaseQuantityState = (item: any) => {
    if (item.quantity === item.stock) {
      increaseQuantity(item);
    }
  };

  const decreaseQuantityState = (item: any) => {
    if (item.quantity === 1) {
      removeCartItem(item);
    } else {
      decreaseQuantity(item);
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: currentBgColor, flex: 1 }}>
      <StatusBar
        backgroundColor={currentBgColor}
        barStyle={theme == 'light' ? 'dark-content' : 'light-content'}
      />

      <View style={styleInner.container}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 15,
          }}
        >
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" color={currentTextColor} size={25} />
          </Pressable>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 15,
            }}
          >
            <Pressable>
              <Icon2
                name="share-social-outline"
                color={currentTextColor}
                size={25}
              />
            </Pressable>
            <Pressable>
              <Icon
                name="ellipsis-vertical"
                color={currentTextColor}
                size={25}
              />
            </Pressable>
          </View>
        </View>
      </View>
      {dataLoading && recommendedLoading && (
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
      {!dataLoading && !recommendedLoading && (
        <>
          <ScrollView>
            <View style={{ height: 350 }}>
              <Image
                source={{
                  uri: route.params?.image,
                }}
                resizeMode="contain"
                style={styleInner.productImage}
              />
            </View>
            <View style={{ gap: 30, paddingVertical: 20 }}>
              <View
                style={{
                  paddingHorizontal: 15,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ gap: 5 }}>
                  <Text style={styleInner.productTitle}>
                    {route.params?.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 5,
                    }}
                  >
                    <Icon
                      name="star"
                      size={18}
                      color={'#ffe169'}
                      solid={true}
                    />
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '400',
                        color: currentTextColor,
                      }}
                    >
                      {Number(route.params?.averageRating).toFixed(1)}
                    </Text>
                  </View>
                  {!route.params?.isDealActive && (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Icon
                        name="naira-sign"
                        size={20}
                        color={currentTextColor}
                      />
                      <Text style={styleInner.productPrice}>
                        {cartItem ? cartItem.price : route.params?.price}
                      </Text>
                    </View>
                  )}
                  {route.params?.isDealActive && (
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 10,
                        alignItems: 'flex-end',
                      }}
                    >
                      <View
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <View
                          style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                          <Icon
                            name="naira-sign"
                            size={12}
                            color={currentTextColor}
                          />
                          <Text style={styleInner.strikedPrice}>
                            {route.params.price}
                          </Text>
                        </View>

                        <View style={styleInner.lineThrough}></View>
                      </View>

                      <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                      >
                        <Icon
                          name="naira-sign"
                          size={20}
                          color={currentTextColor}
                        />
                        <Text style={styleInner.productPrice}>
                          {cartItem
                            ? cartItem.price
                            : route.params.discountPrice}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
                <Pressable onPress={like_UnlikeProduct}>
                  <Icon2
                    name={isProductLiked ? 'heart' : 'heart-outline'}
                    size={35}
                    color={isProductLiked ? '#FF4747' : currentTextColor}
                  />
                </Pressable>
              </View>

              <View style={{ paddingHorizontal: 15, gap: 10 }}>
                <ShowMoreText
                  text={route.params?.description || ''}
                  maxLength={80}
                />
              </View>

              <View style={{ paddingHorizontal: 15, gap: 10 }}>
                <Text style={styleInner._title}>Details</Text>
                <View
                  style={{ gap: 10, flexDirection: 'row', flexWrap: 'wrap' }}
                >
                  <DetailsText
                    text={'Brand'}
                    value={route.params?.brand || ''}
                  />
                  <DetailsText
                    text={'Material'}
                    value={route.params?.material || ''}
                  />
                  <DetailsText
                    text={'Condition'}
                    value={route.params?.condition || ''}
                  />
                  <DetailsText
                    text={'Colors'}
                    value={route.params?.colors || ''}
                  />
                  <DetailsText
                    text={'Sizes'}
                    value={route.params?.sizes || ''}
                  />
                </View>
              </View>
              {/* this is to be used somewhere else */}
              {/* <View style={{paddingHorizontal: 15, gap: 15}}>
                {userData?.ratedProducts?.find(
                  obj => obj.productId === route.params.productId,
                ) ? null : (
                  <Text style={styleInner._title}>Rate this product</Text>
                )}

                <StarRating
                  disabled={false}
                  maxStars={5}
                  rating={UserRating}
                  selectedStar={rating => rateProduct({rating})}
                  fullStarColor={'#ffe169'}
                  starSize={35}
                  emptyStarColor={currentTextColor}
                  containerStyle={{justifyContent: 'flex-start', gap: 5}}
                />
              </View> */}
            </View>
            {/* recommended section */}
            <Separator />
            <View style={{ paddingVertical: 15 }}>
              <Text
                style={{
                  fontSize: 25,
                  fontWeight: '500',
                  color: currentTextColor,
                  paddingHorizontal: 15,
                  paddingVertical: 20,
                }}
              >
                More like this
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View
                  style={{
                    gap: 15,
                    flexDirection: 'row',
                    paddingHorizontal: 15,
                  }}
                >
                  {recommended.map((item, index) => (
                    <RenderRecommended item={item} key={index} />
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>
          <View
            style={[
              styles.addToCartContainer,
              {
                backgroundColor: currentBgColor,
              },
            ]}
          >
            {cart.find((obj) => obj._id == route.params?.productId) == null && (
              <TouchableOpacity
                onPress={() => handleAddToCart(route.params?.item)}
              >
                <View
                  style={{
                    backgroundColor: themeColor,
                    width: '100%',
                    paddingVertical: 15,
                    borderRadius: 10,
                  }}
                >
                  <View style={styles.addToCartBtnFlexRow}>
                    <Icon name={'bag-shopping'} size={25} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 20 }}>
                      Add to cart
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {cart.find((obj) => obj._id == route.params?.productId) && (
              <View
                style={{
                  flexDirection: 'row',
                  gap: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', gap: 15 }}>
                  <Pressable
                    style={[
                      styleInner.addMinusBtn,
                      { borderColor: currentTextColor },
                    ]}
                    onPress={() => decreaseQuantityState(cartItem)}
                  >
                    <Icon name="minus" size={15} color={currentTextColor} />
                  </Pressable>
                  <Text
                    style={{
                      color: currentTextColor,
                      fontSize: 20,
                      fontWeight: '500',
                    }}
                  >
                    {cartItem?.quantity}
                  </Text>
                  <Pressable
                    style={[
                      styleInner.addMinusBtn,
                      { borderColor: currentTextColor },
                    ]}
                    onPress={() => increaseQuantityState(cartItem)}
                  >
                    <Icon name="plus" size={15} color={currentTextColor} />
                  </Pressable>
                </View>
                <View style={{ flex: 1 }}>
                  <TouchableOpacity onPress={() => removeCartItem(cartItem)}>
                    <View
                      style={{
                        backgroundColor: themeColor,
                        width: '100%',
                        paddingVertical: 15,
                        borderRadius: 10,
                      }}
                    >
                      <View style={styles.addToCartBtnFlexRow}>
                        <Icon name={'check'} size={25} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 20 }}>
                          Added to cart
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default ProductDisplay;

const styles = StyleSheet.create({
  addToCartBtnFlexRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  addToCartContainer: {
    borderTopColor: '#111',
    borderTopWidth: 0.5,
    height: 90,
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
});
