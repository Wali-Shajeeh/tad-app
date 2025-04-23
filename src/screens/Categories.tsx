/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-native/split-platform-components */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */




// this is the order details display for admin. this should be in another app






// this is the order details display for admin. this should be in another app
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unsafe-return */






import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  ToastAndroid,
} from 'react-native';



import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon2 from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useMyBottomSheet } from '@/context/bottomSheetContext';
import { AppState } from '@/redux/store';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import Badge from '../components/Badge';
import ProductList from '../components/renderListProducts';
import { useTheme } from '../context/themeContext';
import { addToCart, deleteCartItem } from '../redux/actions';
import api from '../services/api';

const Categories = () => {
  const { currentBgColor, currentTextColor } = useTheme();
  const { refRBSheetForCart } = useMyBottomSheet();
  //////
  const { cart } = useSelector((state: AppState) => state.cartReducer);
  const dispatch = useDispatch();
  const addNewCartItem = (newCartItem: any) => addToCart(newCartItem)(dispatch);
  const removeCartItem = (cartItem: any) => deleteCartItem(cartItem)(dispatch);
  ///////
  const [arrayToUse, setArrayToUse] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const navigation = useNavigation();
  const [page, setPage] = useState(1);
  const [dataLoadingForRefresh, setDataLoadingForRefresh] = useState(false);
  const [dataLoadingForEndReached, setDataLoadingForEndReached] =
    useState(false);

  const route = useRoute<RouteProp<Pick<AppStackParamList, 'categories'>>>();

  const handleAddToCart = (item: any) => cart.find((obj) => obj?._id == item._id)
    ? removeCartItem(item)
    : addNewCartItem(item);

  // useffect to load product
  useEffect(() => {
    const getData = async () => {
      try {
        setDataLoading(true);
        const response = await api.public.get(
          `/products/${route?.params?.endpoint}/?page=${page}`,
        );

        if (response.status == 200) {
          setDataLoading(false);
          setArrayToUse(response.data);
        } else if (response.status == 404) {
          setDataLoading(false);
          setArrayToUse([]);
        } else if (response.status == 500) {
          setDataLoading(false);
          setArrayToUse([]);
          ToastAndroid.showWithGravity(
            'Something went wrong',
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
          );
        }
      } catch (error) {
        log.debug(error);
        setDataLoading(false);
        setArrayToUse([]);
      }
    };
    void getData();
  }, []);

  // function to load product without interrupting
  const getDatawithoutInterupting = async () => {
    setDataLoadingForRefresh(true);
    try {
      const response = await api.public.get(
        `/products/${route.params.endpoint}/?page=${page}`,
      );

      if (response.status == 200) {
        setArrayToUse(response.data);
        setDataLoadingForRefresh(false);
      } else {
        setDataLoadingForRefresh(false);
      }
    } catch (error) {
      log.debug(error);
      setDataLoadingForRefresh(false);
    }
  };

  // function to load product without showing refresh loader
  const getDatawithoutShowingLoader = async () => {
    setDataLoadingForEndReached(true);
    try {
      const response = await api.public.get(
        `/products/${route.params.endpoint}/?page=${page}`,
      );

      if (response.status == 200) {
        setArrayToUse(response.data);
        setDataLoadingForEndReached(false);
      } else {
        setDataLoadingForEndReached(false);
      }
    } catch (error) {
      log.debug(error);
      setDataLoadingForEndReached(false);
    }
  };

  // function to load more products

  function incrementPage() {
    setPage((count) => count + 1);
    void getDatawithoutShowingLoader();
  }

  // component to show if the flatlist reaches the end
  const renderFooterLoader = () => dataLoadingForEndReached ? (
    <ActivityIndicator size={30} color={'#ccc'} />
  ) : null;

  return (
    <SafeAreaView style={{ backgroundColor: currentBgColor, flex: 1 }}>
      <View
        style={{
          paddingBottom: 15,
          borderBottomWidth: 0.5,
          borderColor: currentTextColor,
        }}
      >
        <View style={styles.header}>
          <View style={styles.name_BackBtn}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name={'arrow-left'} color={currentTextColor} size={25} />
            </TouchableOpacity>

            <Text
              style={{
                color: currentTextColor,
                fontSize: 22,
              }}
            >
              {route.params.name}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <TouchableOpacity onPress={() => refRBSheetForCart?.current?.open()}>
              <Badge>
                <Icon2 name="cart-outline" size={30} color={currentTextColor} />
              </Badge>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { }}>
              <Icon2 name="filter-outline" size={27} color={currentTextColor} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {arrayToUse?.length == 0 && !dataLoading && (
        <Text
          style={{
            textAlign: 'center',
            color: currentTextColor,
            fontSize: 17,
            flex: 1,
            textAlignVertical: 'center',
          }}
        >
          No Products To Show
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

      {!dataLoading && arrayToUse.length > 0 && (
        <FlatList
          contentContainerStyle={{
            paddingHorizontal: 5,
            paddingVertical: 15,
          }}
          data={arrayToUse}
          numColumns={2}
          keyExtractor={(item: any) => item._id.toString()}
          renderItem={({ item, index }) => (
            <ProductList {...{ item, index }}>
              <TouchableOpacity onPress={() => handleAddToCart(item)}>
                <Icon2
                  name={
                    cart.find((obj) => obj?._id == item._id)
                      ? 'checkmark-outline'
                      : 'add'
                  }
                  size={30}
                  color={currentTextColor}
                />
              </TouchableOpacity>
            </ProductList>
          )}
          onRefresh={getDatawithoutInterupting}
          refreshing={dataLoadingForRefresh}
          onEndReached={incrementPage}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooterLoader}
        />
      )}
    </SafeAreaView>
  );
};

export default Categories;

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingBottom: 0,
  },
  name_BackBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 15,
  },
});
