/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import FastImage from 'react-native-fast-image';
import StarRating from 'react-native-star-rating-widget';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { AppStackParamList } from '@/types/navigation';
import { useTheme } from '../context/themeContext';

export type Item = {
  _id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  discountPrice: number;
  isDealActive: boolean;
  details: {
    material: string;
    condition: string;
    brand: string;
    colors: string;
    sizes: string;
  };
  totalRatings: {
    averageRating: number | string;
    totalUsers: number;
  };
};

const RenderListProducts: React.FC<
  React.PropsWithChildren<{ item: Item; index: number }>
> = ({ item, children, index }) => {
  const { currentTextColor } = useTheme();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

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

  function displayProduct(item: Item) {
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
      averageRating: item['totalRatings'].averageRating as string,
    });
  }

  return (
    <TouchableOpacity
      onPress={() => displayProduct(item)}
      style={{ flex: 1, margin: 10, marginTop: index % 2 == 0 ? 10 : 40 }}
    >
      <FastImage
        source={{
          uri: item.image,
          priority: FastImage.priority.normal,
        }}
        style={{
          height: 200,
          width: '100%',
          borderRadius: 20,
          borderTopLeftRadius: index % 2 == 0 ? 0 : 20,
          borderBottomRightRadius: index % 2 == 0 ? 20 : 0,
        }}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View
        style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 5 }}
      >
        <View style={{ gap: 5, flex: 1 }}>
          <Text
            numberOfLines={1}
            style={{
              color: currentTextColor,

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
            <StarRating
              maxStars={5}
              rating={Number(item['totalRatings'].averageRating)}
              color={'#ffe169'}
              starSize={15}
              onChange={() => {}}
              emptyColor={currentTextColor}
              style={{ justifyContent: 'flex-start', gap: 5 }}
            />
            <Text style={{ color: currentTextColor, fontSize: 15 }}>
              {item['totalRatings'].totalUsers}
            </Text>
          </View>
          {/* this is to check if the price is a discount price or not */}
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
        {children}
      </View>
    </TouchableOpacity>
  );
};

export default RenderListProducts;
