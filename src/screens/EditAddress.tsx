/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-unused-vars */
/* eslint-disable import/order */

/* eslint-disable @typescript-eslint/explicit-function-return-type */

/* eslint-disable react-native/split-platform-components */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { BottomSheet, useMyBottomSheet } from '../context/bottomSheetContext';
import Icon from 'react-native-vector-icons/FontAwesome6';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import LoadingModal from '../components/LoadingModal';
import { Theme, useTheme } from '../context/themeContext';
import { AuthPayload } from '@/types/auth';
import api from '@/services/api';
import log from '@/utils/log';

const themeColor = '#6236FF';
const EditAddress = ({
  mobileNoprop,
  houseAddressprop,
  streetprop,
  cityprop,
  landmarkprop,
  postalCodeprop,
  objId,
}: any) => {
  const { currentBgColor, currentTextColor } = useTheme();
  const { refRBSheetForEditAddress } = useMyBottomSheet();
  const [mobileNo, setMobileNo] = useState(mobileNoprop);
  const [houseAddress, setHouseAddress] = useState(houseAddressprop);
  const [street, setStreet] = useState(streetprop);
  const [city, setCity] = useState(cityprop);
  const [landmark, setLandMark] = useState(landmarkprop);
  const [postalCode, setPostalCode] = useState(postalCodeprop);
  const [isKeyboardShown, setKeyboardShown] = useState(false);
  // const [regLoading, setRegLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // field validation states

  const [moNumIsEmpty, setMoNumError] = useState(false);
  const [cityIsEmpty, setCityError] = useState(false);
  const [streetIsEmpty, setStreetError] = useState(false);
  const [addressIsEmpty, setAddressError] = useState(false);
  const [postalCodeIsEmpty, setPostalCodeError] = useState(false);
  const [moNumIsValid, setMoNumIsValid] = useState(true);
  const [cityIsValid, setCityIsValid] = useState(true);
  const [streetIsValid, setStreetIsValid] = useState(true);
  const [addressIsValid, setAddressIsValid] = useState(true);
  const [landmarkIsValid, setLandmarkIsValid] = useState(true);
  const [postalCodeIsValid, setPostalCodeIsValid] = useState(true);

  const nameRegex = /^[a-zA-Z\s]+$/; // name regex
  const numbersLettersSpaces = /^[a-zA-Z0-9\s]*$/; // regex to check if input contains only letters and numbers

  useEffect(() => {
    const showTab = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardShown(true);
    });
    const hideTab = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardShown(false);
    });

    return () => {
      showTab.remove();
      hideTab.remove();
    };
  }, []);

  const innerStyles = StyleSheet.create({
    inputHeaderText: {
      color: currentTextColor,
      fontSize: 18,
      fontWeight: '500',
    },
    textInput: {
      borderColor: currentTextColor,
      borderRadius: 10,
      borderRightColor: currentTextColor,
      borderWidth: 1,
      color: currentTextColor,
      fontSize: 17,
      height: 50,
      marginVertical: 5,
      padding: 15,
    },
  });

  const showToastWithGravity = (text: string) => {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };

  // this function is to check if the textinputs are empty

  function validateFields() {
    if (mobileNo == '') {
      setMoNumError(true);
    } else {
      setMoNumError(false);
    }
    if (city == '') {
      setCityError(true);
    } else {
      setCityError(false);
    }
    if (street == '') {
      setStreetError(true);
    } else {
      setStreetError(false);
    }
    if (houseAddress == '') {
      setAddressError(true);
    } else {
      setAddressError(false);
    }
    if (postalCode == '') {
      setPostalCodeError(true);
    } else {
      setPostalCodeError(false);
    }
    return (
      mobileNo !== '' &&
      city !== '' &&
      street !== '' &&
      houseAddress !== '' &&
      postalCode !== ''
    );
  }

  // this function is to check if the inputs are regex valid

  function regexValid() {
    setCityIsValid(nameRegex.test(city));
    setStreetIsValid(numbersLettersSpaces.test(street));
    setAddressIsValid(numbersLettersSpaces.test(houseAddress));
    setLandmarkIsValid(nameRegex.test(landmark) || landmark == '');
    setMoNumIsValid(mobileNo.length == 11);
    setPostalCodeIsValid(postalCode !== '' && postalCode.length >= 5);

    return (
      nameRegex.test(city) &&
      numbersLettersSpaces.test(street) &&
      numbersLettersSpaces.test(houseAddress) &&
      numbersLettersSpaces.test(landmark) &&
      mobileNo.length == 11 &&
      postalCode !== '' &&
      postalCode.length >= 5
    );
  }

  function setFieldToDefault() {
    setMoNumError(false);
    setCityError(false);
    setStreetError(false);
    setAddressError(false);
    setPostalCodeError(false);
    setMoNumIsValid(true);
    setCityIsValid(true);
    setStreetIsValid(true);
    setAddressIsValid(true);
    setLandmarkIsValid(true);
    setPostalCodeIsValid(true);
  }

  async function editaddress() {
    setFieldToDefault();
    try {
      if (validateFields()) {
        if (regexValid()) {
          setModalVisible(true);
          const token = await AsyncStorage.getItem('authToken');
          if (token) {
            const decoded = jwtDecode<AuthPayload>(token);
            const userId = decoded.userId;
            await api.public
              .post('/editAddress', {
                userId,
                objId,
                mobileNo,
                city,
                street,
                houseAddress,
                landmark,
                postalCode,
              })
              .then((response) => {
                if (response.status == 200) {
                  setModalVisible(false);
                  refRBSheetForEditAddress?.current?.close();
                  Alert.alert('Delivery address edited successfully');
                }
              })
              .catch((error) => {
                if (error.response.status == 400) {
                  setModalVisible(false);
                  Alert.alert("Delivery address wasn't changed.");
                } else {
                  setModalVisible(false);
                  showToastWithGravity('Something went wrong');
                }
              });
          }
        }
      }
    } catch (error) {
      log.debug(error);
      setModalVisible(false);
    }
  }

  async function deleteAddress() {
    try {
      setModalVisible(true);
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const decoded = jwtDecode<AuthPayload>(token);
        const userId = decoded.userId;
        await api.public
          .post('/deleteAddress', {
            userId,
            objId,
          })
          .then((response) => {
            if (response.status == 200) {
              setModalVisible(false);
              refRBSheetForEditAddress?.current?.close();
              Alert.alert('Delivery address deleted.');
            }
          })
          .catch((error) => {
            setModalVisible(false);
            showToastWithGravity('Something went wrong');
          });
      }
    } catch (error) {
      log.debug(error);
      // setRegLoading(false);
    }
  }

  function showDeleteAlert() {
    Alert.alert(
      'Delete delivery address',
      'Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: deleteAddress,
        },
      ],
      { cancelable: false },
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: currentBgColor,
        paddingHorizontal: 15,
      }}
    >
      <LoadingModal modalVisible={modalVisible} />
      <View
        style={[
          styles.header,
          {
            borderColor: currentTextColor,
            borderBottomWidth: 0.5,
          },
        ]}
      >
        <Pressable onPress={() => refRBSheetForEditAddress?.current?.close()}>
          <Icon name="xmark" size={25} color={currentTextColor} />
        </Pressable>
        <View>
          <Text style={{ fontSize: 25, color: currentTextColor }}>
            Edit Delivery Address
          </Text>
        </View>
        <Pressable onPress={showDeleteAlert}>
          <Icon name="trash" size={25} color={currentTextColor} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={'padding'} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={{
              gap: 15,
              paddingVertical: 20,
              paddingBottom: isKeyboardShown ? 80 : 20,
            }}
          >
            <View>
              <Text style={innerStyles.inputHeaderText}>Mobile number</Text>
              <TextInput
                style={[
                  innerStyles.textInput,
                  {
                    borderColor: moNumIsEmpty ? 'red' : currentTextColor,
                    borderWidth: moNumIsEmpty ? 2 : 1,
                  },
                ]}
                placeholderTextColor={currentTextColor}
                onChangeText={(newText) => setMobileNo(newText)}
                defaultValue={mobileNo}
                keyboardType="phone-pad"
              />
              {!moNumIsValid && (
                <Text style={{ color: 'red', fontSize: 16 }}>
                  Mobile No. must be the Nigerian standard
                </Text>
              )}
            </View>
            <View>
              <Text style={innerStyles.inputHeaderText}>City</Text>
              <TextInput
                style={[
                  innerStyles.textInput,
                  {
                    borderColor: cityIsEmpty ? 'red' : currentTextColor,
                    borderWidth: cityIsEmpty ? 2 : 1,
                  },
                ]}
                placeholderTextColor={currentTextColor}
                onChangeText={(newText) => setCity(newText)}
                defaultValue={city}
              />
              {!cityIsValid && (
                <Text style={{ color: 'red', fontSize: 16 }}>
                  City field must only contain letters
                </Text>
              )}
            </View>
            <View>
              <Text style={innerStyles.inputHeaderText}>Street</Text>
              <TextInput
                style={[
                  innerStyles.textInput,
                  {
                    borderColor: streetIsEmpty ? 'red' : currentTextColor,
                    borderWidth: streetIsEmpty ? 2 : 1,
                  },
                ]}
                placeholderTextColor={currentTextColor}
                onChangeText={(newText) => setStreet(newText)}
                defaultValue={street}
              />
              {!streetIsValid && (
                <Text style={{ color: 'red', fontSize: 16 }}>
                  Street field must only contain lettere and numbers
                </Text>
              )}
            </View>
            <View>
              <Text style={innerStyles.inputHeaderText}>House Address</Text>
              <TextInput
                style={[
                  innerStyles.textInput,
                  {
                    borderColor: addressIsEmpty ? 'red' : currentTextColor,
                    borderWidth: addressIsEmpty ? 2 : 1,
                  },
                ]}
                placeholderTextColor={currentTextColor}
                onChangeText={(newText) => setHouseAddress(newText)}
                defaultValue={houseAddress}
              />
              {!addressIsValid && (
                <Text style={{ color: 'red', fontSize: 16 }}>
                  House adress field must only contain lettere and numbers
                </Text>
              )}
            </View>
            <View>
              <Text style={innerStyles.inputHeaderText}>
                Land Mark (Optional)
              </Text>
              <TextInput
                style={innerStyles.textInput}
                placeholderTextColor={currentTextColor}
                onChangeText={(newText) => setLandMark(newText)}
                defaultValue={landmark}
              />
              {!landmarkIsValid && (
                <Text style={{ color: 'red', fontSize: 16 }}>
                  Landmark field must only contain lettere and numbers
                </Text>
              )}
            </View>
            <View>
              <Text style={innerStyles.inputHeaderText}>Postal code</Text>
              <TextInput
                style={[
                  innerStyles.textInput,
                  {
                    borderColor: postalCodeIsEmpty ? 'red' : currentTextColor,
                    borderWidth: postalCodeIsEmpty ? 2 : 1,
                  },
                ]}
                placeholderTextColor={currentTextColor}
                onChangeText={(newText) => setPostalCode(newText)}
                defaultValue={postalCode}
                keyboardType="numeric"
              />
              {!postalCodeIsValid && (
                <Text style={{ color: 'red', fontSize: 16 }}>
                  Postal code cannot be empty
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={editaddress}
              style={{
                backgroundColor: themeColor,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                height: 50,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: '500',
                }}
              >
                Edit Address
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditAddress;

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 10,
  },
});
