/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable react-native/split-platform-components */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import React, {
  useState,
  useEffect,
} from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon2 from 'react-native-vector-icons/Ionicons';
import { AuthPayload } from '@/types/auth';
import log from '@/utils/log';
import ListProduct from '../components/renderWishlist';
import { useTheme } from '../context/themeContext';
import api from '../services/api';

const Likes = (): React.JSX.Element => {
  const { currentTextColor, currentBgColor } = useTheme();
  const navigation = useNavigation();
  const [arrayToUse, setArrayToUse] = useState<any[]>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [text, setText] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  // const [unlikeProduct, setUnlikeProduct] = useState(null);

  const showToastWithGravity = (text: string): void => {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };
  const getData = async (): Promise<void> => {
    try {
      setDataLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<AuthPayload>(token);
        const userId = decoded.userId;
        const response = await api.public.get(`/users/${userId}/likedProducts`);

        if (response.status == 200) {
          setDataLoading(false);
          setArrayToUse(response.data);
        } else if (response.status == 404) {
          setDataLoading(false);
          showToastWithGravity('Something went wrong');
        } else if (response.status == 500) {
          setDataLoading(false);
          showToastWithGravity('Server error');
        }
      }
    } catch (error) {
      log.debug(error);
      setDataLoading(false);
    }
  };

  // useffect to get all user's liked products
  useEffect(() => {
    void getData();
  }, []);

  // useffect to get all user's liked products everytime the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const getData = async (): Promise<void> => {
        try {
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            const decoded = jwtDecode<AuthPayload>(token);
            const userId = decoded.userId;
            const response = await api.public.get(
              `/users/${userId}/likedProducts`,
            );

            if (response.status == 200) {
              setArrayToUse(response.data);
            }
          }
        } catch (error) {
          log.debug('error', error);
        }
      };
      void getData();
    }, []),
  );

  // function to like/unlike product
  const like_Unlike_Product = async ({ item }: { item: any }): Promise<void> => {
    try {
      setArrayToUse(arrayToUse.filter((product: { _id: any; }) => product._id !== item._id));
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<AuthPayload>(token);
        const response = await fetch('/likeProduct', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: decoded.userId,
            productId: item._id,
          }),
        });

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
  };

  return (
    <View style={{ backgroundColor: currentBgColor, flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 15,
          gap: 10,
          borderColor: currentTextColor,
          borderBottomWidth: 0.2,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            flex: 1,
          }}
        >
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" color={currentTextColor} size={25} />
          </Pressable>

          {searchActive && (
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
                style={{ position: 'absolute', zIndex: 10, marginLeft: 10 }}
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
                  placeholder="Search likes..."
                  onChangeText={(newText) => setText(newText)}
                  defaultValue={text}
                  placeholderTextColor={currentTextColor}
                  autoFocus={true}
                />
              </View>
            </View>
          )}

          {!searchActive && (
            <Text
              style={{
                color: currentTextColor,
                fontSize: 22,
              }}
            >
              My Wishlist
            </Text>
          )}
        </View>
        <Pressable onPress={() => setSearchActive(!searchActive)}>
          <Icon2
            name={searchActive ? 'close' : 'search'}
            color={currentTextColor}
            size={25}
          />
        </Pressable>
      </View>

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

      {arrayToUse?.length == 0 && !dataLoading && (
        <Text
          style={{
            textAlign: 'center',
            textAlignVertical: 'center',
            color: currentTextColor,
            fontSize: 17,
            flex: 1,
          }}
        >
          Whislist is empty
        </Text>
      )}

      {!dataLoading && arrayToUse?.length > 0 && (
        <FlatList
          contentContainerStyle={{ padding: 15, gap: 15 }}
          data={arrayToUse}
          keyExtractor={(item: any) => item._id}
          renderItem={({ item, index }) => (
            <ListProduct {...{ item, index }}>
              <TouchableOpacity onPress={() => like_Unlike_Product({ item })}>
                <Icon2
                  name="trash-bin-outline"
                  size={22}
                  color={currentTextColor}
                />
              </TouchableOpacity>
            </ListProduct>
          )}
        />
      )}
    </View>
  );
};

export default Likes;

const styles = StyleSheet.create({
  searchBar: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 0.5,
    fontSize: 20,
    height: 50,
    paddingLeft: 40,
  },
});
