/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-native/split-platform-components */

import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, {
  useEffect,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  SafeAreaView,
  FlatList,
  Image,
  ToastAndroid,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon2 from 'react-native-vector-icons/Ionicons';
import api from '@/services/api';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import { useTheme } from '../context/themeContext';

const ListProduct = ({ item }: { item: any }): React.JSX.Element => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { currentTextColor } = useTheme();
  const styleInner = StyleSheet.create({
    lineThrough: {
      backgroundColor: currentTextColor,
      height: 2,
      position: 'absolute',
      width: '100%',
    },
    productPrice: {
      color: currentTextColor,
      fontSize: 20,
      fontWeight: '500',
    },
    strikedPrice: {
      color: currentTextColor,
      fontSize: 22,
      fontWeight: '400',
    },
  });

  function displayProduct(item: any): void {
    navigation.navigate('productDisplay', {
      item: item,
      productId: item._id,
      title: item.title,
      price: item.price,
      discountPrice: item.discountPrice,
      isDealActive: item.isDealActive,
      image: item.image,
      material: item.details.material,
      condition: item.details.condition,
      brand: item.details.brand,
      colors: item.details.colors,
      sizes: item.details.sizes,
      description: item.description,
      averageRating: item['totalRatings'].averageRating,
    });
  }

  return (
    <TouchableOpacity
      style={{ height: 120 }}
      onPress={() => displayProduct(item)}
    >
      <View style={styles.productChildContainer}>
        <Image
          source={{
            uri: item.image,
          }}
          style={{ height: '100%', width: 120, borderRadius: 10 }}
          resizeMode="cover"
        />
        <View style={{ gap: 10, flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              color: currentTextColor,
              fontWeight: 500,
              fontSize: 20,
            }}
          >
            {item.title}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 0 }}>
              <StarRating
                disabled={true}
                maxStars={5}
                rating={item['totalRatings'].averageRating}
                // selectedStar={rating => ratingChange(productIndex.id, rating)}
                fullStarColor={'#ffe169'}
                starSize={20}
                emptyStarColor={currentTextColor}
                containerStyle={{ justifyContent: 'flex-start', gap: 5 }}
              />
            </View>

            <Text
              style={{ color: currentTextColor, fontSize: 18, flex: 1 }}
              numberOfLines={1}
            >
              {item['totalRatings'].totalUsers}
            </Text>
          </View>
          {!item.isDealActive && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="naira-sign" size={15} color={currentTextColor} />
              <Text style={styleInner.productPrice}>{item.price}</Text>
            </View>
          )}
          {item.isDealActive && (
            <View
              style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}
            >
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="naira-sign" size={12} color={currentTextColor} />
                  <Text style={styleInner.strikedPrice}>{item.price}</Text>
                </View>

                <View style={styleInner.lineThrough}></View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="naira-sign" size={15} color={currentTextColor} />
                <Text style={styleInner.productPrice}>
                  {item.discountPrice}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeSearchScreen = (): React.JSX.Element => {
  const { currentBgColor, currentTextColor, theme } = useTheme();
  const navigation = useNavigation();
  const [text, setText] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const SearchPlaceholder = (): React.JSX.Element => (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 15,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          height: 120,
          width: 120,
          backgroundColor: theme == 'light' ? '#f8f8f8' : '#222',
          borderRadius: 10,
        }}
      ></View>
      <View style={{ justifyContent: 'space-evenly', height: 120 }}>
        <View
          style={{
            backgroundColor: theme == 'light' ? '#f8f8f8' : '#222',
            height: 20,
            width: 220,
            borderRadius: 10,
          }}
        ></View>
        <View
          style={{
            backgroundColor: theme == 'light' ? '#f8f8f8' : '#222',
            height: 20,
            width: 100,
            borderRadius: 10,
          }}
        ></View>
        <View
          style={{
            backgroundColor: theme == 'light' ? '#f8f8f8' : '#222',
            height: 20,
            width: 110,
            borderRadius: 10,
          }}
        ></View>
      </View>
    </View>
  );

  const showToastWithGravity = (text: string): void => {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };

  const getData = async (): Promise<void> => {
    try {
      setDataLoading(true);
      await api.public
        .get(`/search/${text}`)
        .then((response) => {
          if (response.status == 200) {
            setData(response.data);
            setDataLoading(false);
          }
        })
        .catch((error) => {
          if (error.response.status == 404) {
            log.debug('nothing');
            setData([]);
            setDataLoading(false);
          } else if (error.response.status == 500) {
            showToastWithGravity('Something went wrong');
            setData([]);
            setDataLoading(false);
          }
        });
    } catch (error) {
      log.debug('error', error);
      setData([]);
      setDataLoading(false);
    }
  };

  // useffect to get search items on every input
  useEffect(() => {
    void getData();
  }, [text]);

  return (
    <SafeAreaView style={{ backgroundColor: currentBgColor, flex: 1 }}>
      <View style={styles.arrowSearchBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.6}
        >
          <Icon name="arrow-left" size={25} color={currentTextColor} />
        </TouchableOpacity>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <Icon2
            name="search"
            size={25}
            color={currentTextColor}
            style={{ position: 'absolute', zIndex: 10, left: 10 }}
          />
          <View style={{ flex: 1 }}>
            <TextInput
              style={[
                styles.searchBar,
                {
                  borderColor: currentTextColor,
                  color: currentTextColor,
                },
              ]}
              autoFocus={true}
              placeholder="Search..."
              onChangeText={(newText) => setText(newText)}
              defaultValue={text}
              placeholderTextColor={currentTextColor}
            />
          </View>
          {text.length > 0 && (
            <Pressable
              onPress={() => setText('')}
              style={{ position: 'absolute', zIndex: 10, right: 10 }}
            >
              <Icon2 name="close" size={25} color={currentTextColor} />
            </Pressable>
          )}
        </View>
      </View>

      {dataLoading && (
        <View style={{ gap: 15 }}>
          <SearchPlaceholder />
          <SearchPlaceholder />
        </View>
      )}

      {data.length > 0 && !dataLoading && (
        <FlatList
          contentContainerStyle={{ padding: 15, gap: 15 }}
          data={data}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item }) => <ListProduct {...{ item }} />}
        />
      )}
    </SafeAreaView>
  );
};

export default HomeSearchScreen;

const styles = StyleSheet.create({
  arrowSearchBar: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20,
    padding: 15,
    width: '100%',
  },
  productChildContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 15,
    height: '100%',
  },

  searchBar: {
    backgroundColor: 'transparent',
    borderColor: '#fff',
    borderRadius: 10,
    borderWidth: 0.5,
    color: '#fff',
    fontSize: 20,
    height: 50,
    paddingLeft: 40,
    padding: 10,
  },
});
