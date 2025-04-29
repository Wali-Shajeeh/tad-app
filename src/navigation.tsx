import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect } from 'react';

import AddProductScreen from './Admin/AddProduct';
import OrderDisplay from './Admin/OrderDisplay';
import OrderScreenForAdmin from './Admin/OrderScreenForAdmin';
import CartDisplay from './components/CartDisplay';
import MainScreens from './components/main/MainScreens';
import CheckOutPage from './screens/CheckOutPage';
import LoginScreen from './screens/LoginScreen';
import MyOrderDetailScreen from './screens/MyOrderDetailScreen';
import MyOrderScreen from './screens/MyOrderScreen';
import Onboarding from './screens/Onboarding';
import PaystackCheckOut from './screens/PaystackCheckOut';
import ProductDisplay from './screens/ProductDisplay';
import RegistrationScreen from './screens/RegistrationScreen';
import UserPage from './screens/UserPage';
import VerificationScreen from './screens/VerificationScreen';

import api from './services/api';
import { AuthPayload } from './types/auth';
import log from './utils/log';

const Stack = createNativeStackNavigator();

const Navigation: React.FC<{ initialRouteName: string | null }> = ({
  initialRouteName,
}) => {
  // useffect to update device token if it changed
  useEffect(() => {
    messaging().onTokenRefresh(async (newToken) => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const decoded = jwtDecode<AuthPayload>(token);
          const userId = decoded.userId;

          await api.public
            .post('/refreshToken', {
              userId: userId,
              newToken: newToken,
            })
            .then((response) => {
              if (response.status == 200) {
                log.debug('token changed');
              } else {
                log.debug('token failed to change');
              }
            });
        }
      } catch (error) {
        log.debug(error);
      }
    });
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName || 'login'}>
        <Stack.Screen
          name="login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="register"
          component={RegistrationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="verify"
          component={VerificationScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="mainScreens"
          component={MainScreens}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="productDisplay"
          component={ProductDisplay}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="userPage"
          component={UserPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="checkoutPage"
          component={CheckOutPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="paystackCheckout"
          component={PaystackCheckOut}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="orderScreenForAdmin"
          component={OrderScreenForAdmin} // this should be in another app
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="MyOrders"
          component={MyOrderScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="myOrderDetail"
          component={MyOrderDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="orderDisplay"
          component={OrderDisplay} // this should be in another app
          options={{ headerShown: false }}
        />
      <Stack.Screen
          name="addProduct"
          component={AddProductScreen} // this should be in another app
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="onboarding"
          component={Onboarding}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      <CartDisplay />
    </NavigationContainer>
  );
};

export default Navigation;
