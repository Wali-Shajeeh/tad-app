/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import StarRating from 'react-native-star-rating';
import Icon from 'react-native-vector-icons/FontAwesome6';

import { useTheme } from '@/context/themeContext';
import { AppStackParamList } from '@/types/navigation';
import { Item } from './renderListProducts';

const RenderWishlist = ({
  item,
  children,
}: {
  item: Item;
  children?: React.ReactNode;
  index: number;
}): React.JSX.Element => {
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
      style={styles.productContainer}
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
                rating={Number(item['totalRatings'].averageRating)}
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
      <View>{children}</View>
    </TouchableOpacity>
  );
};

export default RenderWishlist;

const styles = StyleSheet.create({
  productChildContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 15,

    height: '100%',
  },
  productContainer: {
    alignItems: 'center',

    flexDirection: 'row',
    gap: 20,
    height: 120,
    justifyContent: 'space-between',
  },
});
