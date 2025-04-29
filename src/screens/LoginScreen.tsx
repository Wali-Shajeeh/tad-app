/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-native/split-platform-components */
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AxiosError } from 'axios';
import { jwtDecode } from 'jwt-decode';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Image,
  ScrollView,
  Platform,
  StatusBar,
  ToastAndroid,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome6';
import api from '@/services/api';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import { getAuthToken } from '@/utils/storage';
import LevonText from '../../assets/levon-text.png';
import { useGeneral } from '../context/generalContext';
import { useTheme } from '../context/themeContext';

type InfoBoxProps = {
  message: string;
  iconName: string;
  bgColor: string;
};

const InfoBox: React.FC<InfoBoxProps> = ({ message, iconName, bgColor }) => (
  <View
    style={{
      position: 'absolute',
      top: 20,
      width: '100%',
      height: 100,

      backgroundColor: bgColor,
      alignSelf: 'center',
      alignItems: 'center',
      borderRadius: 10,
      justifyContent: 'center',
      padding: 15,
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon name={iconName} size={25} color={'#fff'} />
      <Text style={{ color: '#fff', fontSize: 22, textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  </View>
);

const LoginScreen: React.FC<object> = () => {
  const { setRegisteredEmail } = useGeneral();
  const { currentTextColor, currentBgColor, themeColor } = useTheme();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState<string | null>(null);
  const [alertColor, setAlertColor] = useState<string | null>(null);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [emailIsFocus, setEmailIsFocus] = useState(false);
  const [passwordIsFocus, setPasswordIsFocus] = useState(false);

  // input fields validation hooks

  const [emailIsEmpty, setEmailError] = useState(false);
  const [passwordIsEmpty, setPasswordError] = useState(false);

  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);

  // regex expressions

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/;
  const passwordRegex = /[^a-zA-Z0-9]/;

  function showInfo(): void {
    setIsInfoVisible(true);
    setTimeout(() => {
      setIsInfoVisible(false);
    }, 1500);
  }

  function emailPasswordError(): void {
    setMessage('Invalid email or password!');
    setAlertIcon('xmark');
    setAlertColor('#660202');
    showInfo();
  }

  function unknownError(): void {
    setMessage('Something went wrong.');
    setAlertIcon('circle-exclamation');
    setAlertColor('#362600');
    showInfo();
  }

  function loginSuccess(): void {
    setMessage('Login successful.');
    setAlertIcon('check');
    setAlertColor('#003609');
    showInfo();
  }

  // check for empty fields function

  function validateFields(): boolean {
    if (email == '') {
      setEmailError(true);
    } else {
      setEmailError(false);
    }
    if (password == '') {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }
    return email !== '' && password !== '';
  }

  // check for regex test

  function regexValid(): boolean {
    setIsValidEmail(emailRegex.test(email));
    setIsValidPassword(!passwordRegex.test(password) && password.length >= 6);
    return (
      emailRegex.test(email) &&
      !passwordRegex.test(password) &&
      password.length >= 6
    );
  }

  function setFieldToDefault(): void {
    setEmailError(false);
    setPasswordError(false);

    setIsValidEmail(true);

    setIsValidPassword(true);
  }

  const showToastWithGravity = (text: string): void => {
    ToastAndroid.showWithGravity(text, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };
  const handleLoginUser = async (): Promise<void> => {
    const user = {
      email: email,
      password: password,
    };

    try {
      setFieldToDefault();
      if (validateFields()) {
        if (regexValid()) {
          setRegLoading(true);
          await api.public
            .post('/login', user)
            .then(async (response) => {
              if (response.status == 200) {
                const data = response.data;
                await AsyncStorage.setItem(
                  'authToken',
                  (data as { token: string }).token,
                );
                const deviceToken = await messaging().getToken();
                const authToken = await getAuthToken();
                if (!authToken) {
                  throw new Error('Auth token not found!');
                }
                const decoded = jwtDecode<{ userId: string; role: string }>(
                  authToken,
                );

                // store device token in database
                await api.public
                  .post('/refreshToken', {
                    userId: decoded.userId,
                    newToken: deviceToken,
                  })
                  .then((response) => {
                    if (response.status == 200) {
                      log.debug('token changed');
                    } else {
                      log.debug('token failed to change');
                    }
                  });
                setRegLoading(false);
                loginSuccess();
                setTimeout(() => {
                  if (decoded.role === 'admin') {
                    setRegLoading(false);
                    navigation.navigate('orderScreenForAdmin')
                  } else {
                    navigation.navigate('mainScreens');

                  }
                }, 500);
              } else if (response.status == 202) {
                // this shouldn't be here. this should be in another app. this is to login admin
                const data = response.data;
                await AsyncStorage.setItem(
                  'authToken',
                  (data as { token: string }).token,
                );
                setRegLoading(false);
                navigation.navigate('orderScreenForAdmin');
              }
            })
            .catch((error) => {
              console.log('Login Error: ', error)
              if (error instanceof AxiosError) {
                if (error?.response?.status == 304) {
                  setRegisteredEmail(email);
                  setRegLoading(false);
                  navigation.navigate('verify');
                } else if (error?.response?.status === 404) {
                  setRegLoading(false);
                  emailPasswordError();
                } else if (error?.response?.status === 500) {
                  showToastWithGravity('Server error');
                  setRegLoading(false);
                  unknownError();
                }
              }
            });
        }
      }
    } catch (error) {
      setRegLoading(false);
      log.debug(error);
    }
  };

  ///////

  const styles = StyleSheet.create({
    container: {
      backgroundColor: currentBgColor,
      flex: 1,
      paddingHorizontal: 15,
    },
    loginBtn: {
      alignItems: 'center',
      backgroundColor: themeColor,
      borderRadius: 10,
      height: 50,
      justifyContent: 'center',
      marginTop: 5,
    },
    textInput: {
      borderColor: currentTextColor,
      borderRadius: 10,
      borderRightColor: currentTextColor,
      borderWidth: 1.5,
      color: currentTextColor,
      fontSize: 17,
      height: 50,
      marginVertical: 5,
      padding: 15,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
      <View
        style={{
          alignItems: 'center',
          paddingVertical: 20,
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <View>
          <Image source={LevonText} style={{ height: 50, width: 150 }} />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ gap: 10 }}>
              <View style={{ gap: 5 }}>
                <View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        borderColor: emailIsEmpty
                          ? 'red'
                          : emailIsFocus
                            ? 'blue'
                            : currentTextColor,
                      },
                    ]}
                    placeholder="Email"
                    placeholderTextColor={currentTextColor}
                    onChangeText={(newText) => setEmail(newText)}
                    defaultValue={email}
                    keyboardType="email-address"
                    onFocus={() => setEmailIsFocus(true)}
                    onBlur={() => setEmailIsFocus(false)}
                  />
                  {!isValidEmail && (
                    <Text style={{ color: 'red', fontSize: 16 }}>
                      Invalid Email Address
                    </Text>
                  )}
                </View>

                <View style={{ justifyContent: 'center' }}>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        borderColor: passwordIsEmpty
                          ? 'red'
                          : passwordIsFocus
                            ? 'blue'
                            : currentTextColor,
                      },
                    ]}
                    secureTextEntry={isPasswordVisible ? false : true}
                    placeholder="Password"
                    placeholderTextColor={currentTextColor}
                    onChangeText={(newText) => setPassword(newText)}
                    defaultValue={password}
                    onFocus={() => setPasswordIsFocus(true)}
                    onBlur={() => setPasswordIsFocus(false)}
                  />
                  {!isValidPassword && (
                    <Text style={{ color: 'red', fontSize: 16 }}>
                      Invalid Password
                    </Text>
                  )}

                  <Pressable
                    onPress={() => setPasswordVisible(!isPasswordVisible)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      paddingRight: 10,
                      paddingBottom: !isValidPassword ? 20 : 0,
                    }}
                  >
                    <Icon
                      name={isPasswordVisible ? 'eye-slash' : 'eye'}
                      color={currentTextColor}
                      size={20}
                    />
                  </Pressable>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: currentTextColor, fontSize: 16 }}>
                  Forgot Password?
                </Text>
              </View>
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleLoginUser}
                disabled={regLoading ? true : false}
              >
                {regLoading ? (
                  <ActivityIndicator size={30} color="#fff" />
                ) : (
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 20,
                      fontWeight: '500',
                    }}
                  >
                    LOGIN
                  </Text>
                )}
              </TouchableOpacity>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  gap: 5,
                  marginTop: 10,
                }}
              >
                <Text style={{ color: currentTextColor, fontSize: 17 }}>
                  Don&apos;t have an account?
                </Text>
                <Pressable onPress={() => navigation.navigate('register')}>
                  <Text
                    style={{
                      color: themeColor,
                      fontSize: 17,
                      fontWeight: '500',
                    }}
                  >
                    Sign Up
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {isInfoVisible && alertIcon && alertColor && (
        <InfoBox message={message} iconName={alertIcon} bgColor={alertColor} />
      )}
    </SafeAreaView>
  );
};

export default LoginScreen;
