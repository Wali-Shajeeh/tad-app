import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AxiosError } from 'axios';
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
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome6';
import api from '@/services/api';
import { AppStackParamList } from '@/types/navigation';
import log from '@/utils/log';
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

const RegistrationScreen: React.FC<object> = () => {
  const { setRegisteredEmail } = useGeneral();
  const { currentTextColor, currentBgColor } = useTheme();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const [firstName, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
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
  const [firstNameIsFocus, setFirstNameIsFocus] = useState(false);
  const [lastNameIsFocus, setLastNameIsFocus] = useState(false);

  // input fields validation hooks

  const [firstNameIsEmpty, setFirstNameError] = useState(false);
  const [lastNameIsEmpty, setLastNameError] = useState(false);
  const [emailIsEmpty, setEmailError] = useState(false);
  const [passwordIsEmpty, setPasswordError] = useState(false);
  const [isValidFirstName, setIsValidFirstName] = useState(true);
  const [isValidLastName, setIsValidLastName] = useState(true);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isValidPassword, setIsValidPassword] = useState(true);

  // regex expressions

  const nameRegex = /^[a-zA-Z_\s]+$/;
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/;
  const passwordRegex = /[^a-zA-Z0-9]/;

  function showInfo(): void {
    setIsInfoVisible(true);
    setTimeout(() => {
      setIsInfoVisible(false);
    }, 1500);
  }

  function emailError(): void {
    setMessage('Email already exists.');
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

  // check for empty fields function

  function validateFields(): boolean {
    if (firstName == '') {
      setFirstNameError(true);
    } else {
      setFirstNameError(false);
    }
    if (lastname == '') {
      setLastNameError(true);
    } else {
      setLastNameError(false);
    }
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
    return (
      firstName !== '' && lastname !== '' && email !== '' && password !== ''
    );
  }

  // check for regex test

  function regexValid(): boolean {
    setIsValidFirstName(nameRegex.test(firstName));
    setIsValidLastName(nameRegex.test(lastname));
    setIsValidEmail(emailRegex.test(email));
    setIsValidPassword(!passwordRegex.test(password) && password.length >= 6);
    return (
      nameRegex.test(firstName) &&
      nameRegex.test(lastname) &&
      emailRegex.test(email) &&
      !passwordRegex.test(password) &&
      password.length >= 6
    );
  }

  function setFieldToDefault(): void {
    setFirstNameError(false);
    setLastNameError(false);
    setEmailError(false);
    setPasswordError(false);
    setIsValidFirstName(true);
    setIsValidEmail(true);
    setIsValidLastName(true);
    setIsValidPassword(true);
  }

  const handleRegisterUser = async (): Promise<void> => {
    const user = {
      firstName: firstName,
      lastName: lastname,
      email: email,
      password: password,
    };

    try {
      setFieldToDefault();
      if (validateFields()) {
        if (regexValid()) {
          setRegLoading(true);
          await api.public
            .post('/register', user)
            .then((response) => {
              if (response.status == 200) {
                setRegLoading(false);
                setRegisteredEmail(email);
                navigation.navigate('verify');
              }
            })
            .catch((error) => {
              if (error instanceof AxiosError) {
                if (error?.response?.status == 400) {
                  setRegLoading(false);
                  emailError();
                } else if (error?.response?.status === 500) {
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
        <TouchableOpacity
          onPress={() => navigation.navigate('login')}
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
        <ScrollView contentContainerStyle={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <View style={{ gap: 10 }}>
              <View style={{ gap: 5 }}>
                <View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        borderColor: firstNameIsEmpty
                          ? 'red'
                          : firstNameIsFocus
                            ? 'blue'
                            : currentTextColor,
                      },
                    ]}
                    placeholder="First name"
                    placeholderTextColor={currentTextColor}
                    onChangeText={(newText) => setFirstName(newText)}
                    defaultValue={firstName}
                    onFocus={() => setFirstNameIsFocus(true)}
                    onBlur={() => setFirstNameIsFocus(false)}
                  />
                  {!isValidFirstName && (
                    <Text style={{ color: 'red', fontSize: 16 }}>
                      Invalid Name
                    </Text>
                  )}
                </View>
                <View>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        borderColor: lastNameIsEmpty
                          ? 'red'
                          : lastNameIsFocus
                            ? 'blue'
                            : currentTextColor,
                      },
                    ]}
                    placeholder="Last name"
                    placeholderTextColor={currentTextColor}
                    onChangeText={(newText) => setLastName(newText)}
                    defaultValue={lastname}
                    onFocus={() => setLastNameIsFocus(true)}
                    onBlur={() => setLastNameIsFocus(false)}
                  />
                  {!isValidLastName && (
                    <Text style={{ color: 'red', fontSize: 16 }}>
                      Invalid name
                    </Text>
                  )}
                </View>

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
              <TouchableOpacity
                style={styles.loginBtn}
                onPress={handleRegisterUser}
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
                    SIGN UP
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {isInfoVisible && alertColor && alertIcon && (
        <InfoBox message={message} iconName={alertIcon} bgColor={alertColor} />
      )}
    </SafeAreaView>
  );
};

export default RegistrationScreen;
