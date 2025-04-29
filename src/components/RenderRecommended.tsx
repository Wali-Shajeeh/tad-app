/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import StarRating from 'react-native-star-rating-widget';
import Icon from 'react-native-vector-icons/FontAwesome6';

import { AppStackParamList } from '@/types/navigation';
import { Item } from './renderListProducts';
import { useTheme } from '../context/themeContext';

const RenderRecommended: React.FC<{ item: Item }> = ({ item }) => {
  const { currentTextColor } = useTheme();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const window = useWindowDimensions();

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
      style={{ width: (window.width - 48) / 2 }}
    >
      <FastImage
        source={{
          uri: item.image,
          priority: FastImage.priority.normal,
        }}
        fallback
        style={{
          height: 200,
          width: '100%',
          borderRadius: 10,
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
  rating={Number(item['totalRatings'].averageRating)}
  maxStars={5}
  onChange={() => {}} // Required, even if disabled
  starSize={15}
  enableHalfStar={true}
  starStyle={{ tintColor: '#ffe169' }}
  color={currentTextColor}
  enableSwiping={false}
  animationConfig={{ scale: 1 }} // Optional: disables bounce animation
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
      </View>
    </TouchableOpacity>
  );
};

export default RenderRecommended;
