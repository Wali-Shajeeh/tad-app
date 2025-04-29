/* eslint-disable @typescript-eslint/no-unsafe-return */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

/* eslint-disable react-native/split-platform-components */


/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Image,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';

import Icon2 from 'react-native-vector-icons/Ionicons';

// import NoFilterScreen from './NoFilterScreen';

import { useMyBottomSheet } from '@/context/bottomSheetContext';
import api from '@/services/api';
import { AuthPayload } from '@/types/auth';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import Badge from '../components/Badge';
import { useGeneral } from '../context/generalContext';
import { useTheme } from '../context/themeContext';
import CartDisplay from '@/components/CartDisplay';
// import SkeletonLoader from './SkeletonLoader';

const HomeScreen = () => {
  const { drawer } = useGeneral();
  const { currentTextColor, currentBgColor, theme } = useTheme();
  const { refRBSheetForCart } = useMyBottomSheet();
  // const [activeGroup, setActiveGroup] = useState(null);
  const [userData, setUserData] = useState<any>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const window = useWindowDimensions();

  const groups = [
    { id: 1, name: 'Best Sellers' },
    { id: 2, name: 'New Arrivals' },
    { id: 3, name: 'Top Rated' },
  ];

  const categoryData = [
    {
      id: 1,
      imageSource: 'https://i.ibb.co/ss4kj0d/sweater-For-Women-2.jpg',
      name: 'Clothing',
      endpoint: 'clothing',
    },
    {
      id: 2,
      imageSource: 'https://i.ibb.co/X8m0hqs/shoe-For-Men.jpg',
      name: 'Shoes',
      endpoint: 'shoes',
    },

    {
      id: 4,
      imageSource: 'https://i.ibb.co/7zDJfWY/wristwatch-For-Men-3.jpg',
      name: 'Watches',
      endpoint: 'watches',
    },
    {
      id: 5,
      imageSource: 'https://i.ibb.co/fkrdDpt/fedora-For-Women-4.jpg',
      name: 'Accessories',
      endpoint: 'accessories',
    },
    {
      id: 6,
      imageSource: 'https://i.ibb.co/MSZG7hT/handbag-For-Women.jpg',
      name: 'Bags',
      endpoint: 'bags',
    },
  ];

  const ListView = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{ width: (window.width - 48) / 2 }}
      onPress={() =>
        navigation.navigate('categories', {
          name: item.name,
          endpoint: item.endpoint,
        })
      }
    >
      <Image
        source={{ uri: item.imageSource }}
        style={{ width: '100%', height: 200, borderRadius: 10 }}
        resizeMode="cover"
      />
      <Text
        style={{ color: currentTextColor, fontSize: 20, paddingVertical: 10 }}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const showToastWithGravity = (text: string) => {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };

  // useffect to get user data for name
  useEffect(() => {
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
                showToastWithGravity('Something went wrong');

                setDataLoading(false);
              } else if (error.response.status === 500) {
                showToastWithGravity('Server error');
                setDataLoading(false);
              }
            });
        }
      } catch {
        log.debug('Something went wrong!');
        setDataLoading(false);
      }
    };
    void getData();
  }, []);

  return (
    <View style={{ backgroundColor: currentBgColor, flex: 1 }}>
      <View>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', gap: 15 }}>
            <TouchableOpacity
              onPress={() => drawer?.current?.openDrawer()}
              style={[
                styles.profileIndicator,
                { borderColor: currentTextColor },
              ]}
            >
              <Icon name="user" color={currentTextColor} size={15} />
            </TouchableOpacity>

            <Text
              style={{
                color: currentTextColor,
                fontSize: 25,
              }}
            >
              {dataLoading || userData.firstName == undefined
                ? 'Hi ...'
                : 'Hi,' + ' ' + userData.firstName}
            </Text>
          </View>

          <TouchableOpacity
            style={{ flexDirection: 'row', gap: 20 }}
            onPress={() => refRBSheetForCart?.current?.open()}
          >
            <Badge>
              <Icon2 name="cart-outline" size={30} color={currentTextColor} />
            </Badge>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 5 }}
        >
          <View style={[{ padding: 15 }, styles.groups]}>
            {groups.map((item) => (
              <Pressable
                onPress={null}
                key={item.id}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 7,
                  borderRadius: 10,
                  backgroundColor: theme == 'light' ? '#F2F1F3' : '#222',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: currentTextColor,
                    fontSize: 20,
                  }}
                >
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
      <ScrollView>
        {/* <NoFilterScreen /> */}
        <View style={styles.dealsImg}>
          <Image
            source={{
              uri: 'https://i.ibb.co/26DrQp6/freestocks-3-Q3ts-J01nc-unsplash.jpg',
            }}
            style={{ height: '100%', width: '100%', borderRadius: 10 }}
            resizeMode="cover"
          />
          <View style={styles.dealsImgTextBtnContainer}>
            <Text style={{ color: '#fff', fontSize: 30, fontWeight: 'bold' }}>
              Get your special sales up to 50%
            </Text>

            <TouchableOpacity
              style={styles.dealsImgBtn}
              onPress={() => navigation.navigate('specials')}
            >
              <Text
                style={{
                  alignSelf: 'center',
                  color: '#222',
                  fontSize: 25,
                  fontWeight: 'bold',
                }}
              >
                Shop now
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.layer}></View>
        </View>

        <View style={{ paddingHorizontal: 15, paddingTop: 25 }}>
          <Text
            style={{ color: currentTextColor, fontSize: 22, fontWeight: '500' }}
          >
            Categories for you
          </Text>
          <View style={styles.categoryContainer}>
            {categoryData.map((item) => (
              <ListView item={item} key={item.id} />
            ))}
          </View>
        </View>
      </ScrollView>
      <CartDisplay/>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'flex-start',
    marginBottom: 15,
    paddingTop: 15,
    width: '100%',
  },

  dealsImg: {
    alignItems: 'center',
    height: 230,
    justifyContent: 'center',

    marginHorizontal: 15,
  },

  dealsImgBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,

    paddingHorizontal: 20,
    paddingVertical: 7,
  },

  dealsImgTextBtnContainer: {
    alignSelf: 'flex-start',
    height: '100%',
    justifyContent: 'space-evenly',
    padding: 15,
    position: 'absolute',
    zIndex: 20,
  },

  groups: {
    flexDirection: 'row',
    gap: 15,
  },

  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingBottom: 0,
  },
  layer: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 10,
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
  profileIndicator: {
    alignItems: 'center',
    borderRadius: 17.5,
    borderWidth: 1.5,
    height: 35,
    justifyContent: 'center',
    width: 35,
  },
});
