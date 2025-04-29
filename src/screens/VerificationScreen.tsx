/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Image,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import api from '@/services/api';
import { AuthPayload } from '@/types/auth';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
import { getAuthToken } from '@/utils/storage';
import LevonText from '../../assets/levon-text.png';
import { useGeneral } from '../context/generalContext';
import { useTheme } from '../context/themeContext';

const themeColor = '#6236FF';

const InfoBox: React.FC<{
  message: string;
  iconName: string;
  bgColor: string;
}> = ({ message, iconName, bgColor }) => (
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

const VerifyCode: React.FC<object> = () => {
  const { registeredEmail, setRegisteredEmail } = useGeneral();
  const { currentTextColor, currentBgColor } = useTheme();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [code, setCode] = useState('');
  const [isValidCode, setIsValidCode] = useState(true);
  const [regLoading, setRegLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [alertIcon, setAlertIcon] = useState<string | null>(null);
  const [alertColor, setAlertColor] = useState<string | null>(null);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [resendBtnActive, setResendBtnActive] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(60);
  const timerRef = useRef(countdown);
  const [textinputIsFocus, setTextinputIsFocus] = useState(false);

  function showInfo(): void {
    setIsInfoVisible(true);
    setTimeout(() => {
      setIsInfoVisible(false);
    }, 2000);
  }

  function incorrectError(): void {
    setMessage('Incorrect verification code.');
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

  function emailVerified(): void {
    setMessage('Email verified.');
    setAlertIcon('check');
    setAlertColor('#003609');
    showInfo();
  }

  function validateCode(): boolean {
    setIsValidCode(code.length == 6);
    return code.length == 6;
  }

  function startCountdown(): void {
    setResendBtnActive(true);
    timerRef.current = 60;
    const countdownInterval = setInterval(() => {
      timerRef.current -= 1;
      if (timerRef.current == 0) {
        timerRef.current = 60;
        setResendBtnActive(false);
        clearInterval(countdownInterval);
      } else {
        setCountdown(timerRef.current);
      }
    }, 1000);
  }

  useEffect(() => {
    startCountdown();
  }, []);

  const handleVerification = async (): Promise<void> => {
    const user = {
      email: registeredEmail,
      verificationCode: code,
    };

    try {
      if (validateCode()) {
        setRegLoading(true);
        const response = await api.public.post('/register/verify', user);
        if (response) {
          if (response.status == 200) {
            const data = response.data;
            await AsyncStorage.setItem(
              'authToken',
              (data as { token: string }).token,
            );

            const deviceToken = await messaging().getToken();
            const authToken = await getAuthToken();
            if (!authToken) {
              throw new Error('token not found');
            }
            const decoded = jwtDecode<AuthPayload>(authToken);

            //store device token in database
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
            setRegisteredEmail('');
            emailVerified();
            setTimeout(() => {
              navigation.navigate('mainScreens');
            }, 500);
          } else if (response.status === 404) {
            setRegLoading(false);
            unknownError();
          } else if (response.status === 400) {
            setRegLoading(false);
            incorrectError();
          } else if (response.status === 500) {
            setRegLoading(false);
            unknownError();
          }
        }
      }
    } catch (error) {
      log.debug(error);
      setRegLoading(false);
    }
  };

  // function to resend verification code

  const handleResendCode = async (): Promise<void> => {
    const user = {
      email: registeredEmail,
    };

    try {
      setSendingCode(true);
      startCountdown();
      const response = await fetch('/register/verify/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      if (response.status === 200) {
        setSendingCode(false);
      }
    } catch (error) {
      log.debug(error);
      setSendingCode(false);
    }
  };

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
      borderWidth: 1,
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: 'absolute',
            left: 0,
            height: 50,
            width: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            borderColor: currentTextColor,
            borderWidth: 1,
          }}
        >
          <Icon name="chevron-left" size={25} color={currentTextColor} />
        </TouchableOpacity>

        <View>
          <View>
            <Image source={LevonText} style={{ height: 50, width: 150 }} />
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ justifyContent: 'center', flex: 1 }}>
          <View
            style={{
              // alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 30,
            }}
          >
            {sendingCode ? (
              <View style={{ alignSelf: 'center' }}>
                <ActivityIndicator size={30} color="#222" />
              </View>
            ) : (
              <>
                <Text
                  style={{
                    color: currentTextColor,
                    textAlign: 'left',
                    fontSize: 25,
                    fontWeight: '500',
                  }}
                >
                  We sent you a code{' '}
                </Text>
                <Text
                  style={{
                    color: currentTextColor,
                    fontSize: 20,
                    marginTop: 10,
                  }}
                >
                  Enter it below to verify your email
                </Text>
              </>
            )}
          </View>
          <View style={{ gap: 10 }}>
            <View>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    borderColor: textinputIsFocus
                      ? 'blue'
                      : !validateCode
                        ? 'red'
                        : currentTextColor,
                  },
                ]}
                placeholder="Verification code"
                placeholderTextColor={currentTextColor}
                onChangeText={(newText) => setCode(newText)}
                defaultValue={code}
                onFocus={() => setTextinputIsFocus(true)}
                onBlur={() => setTextinputIsFocus(false)}
              />
              {!isValidCode && (
                <Text style={{ color: 'red', fontSize: 16 }}>
                  Invalid verification code
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleVerification}
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
                  VERIFY
                </Text>
              )}
            </TouchableOpacity>
            <Pressable
              disabled={resendBtnActive ? true : false}
              onPress={handleResendCode}
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 5,
                marginTop: 10,
                opacity: resendBtnActive ? 0.5 : 1,
              }}
            >
              <Text style={{ color: currentTextColor, fontSize: 16 }}>
                Resend code
              </Text>
              <Text
                style={{
                  color: themeColor,
                  fontSize: 16,
                  fontWeight: '500',
                  display: resendBtnActive ? 'flex' : 'none',
                }}
              >
                {timerRef.current}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
      {isInfoVisible && alertIcon && alertColor && (
        <InfoBox message={message} iconName={alertIcon} bgColor={alertColor} />
      )}
    </SafeAreaView>
  );
};

export default VerifyCode;
