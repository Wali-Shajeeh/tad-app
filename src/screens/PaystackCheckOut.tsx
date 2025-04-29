/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import {
  Alert,
  Text,
  View,
  Pressable,
} from 'react-native';

import Icon from 'react-native-vector-icons/FontAwesome6';
import { WebView } from 'react-native-webview';
import { AppStackParamList } from '@/types/navigation';
import { useTheme } from '../context/themeContext';

const PaystackCheckOut = (): React.JSX.Element => {
  const { currentBgColor, currentTextColor } = useTheme();

  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const route = useRoute<RouteProp<Pick<AppStackParamList, 'paystackCheckout'>>>();
  const { url, checkOutInfo }: any = route.params;

  const callback_url = 'https://callback.com'; // your callback url in your paystack dashboard
  const cancel_url = 'http://cancelurl.com/'; // a paystack redirect url if user cancels payment

  // function to get the refrence from the callback url
  const getUrlParams = (url: string): Record<string, string> => {
    // Parse URL parameters into a key-value object
    const params: Record<string, string> = {};
    const urlParts = url.split('?');
    if (urlParts.length > 1) {
      const queryString = urlParts[1];
      const keyValuePairs = queryString.split('&');
      keyValuePairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[key] = decodeURIComponent(value);
      });
    }
    return params;
  };

  const onNavigationStateChange = (state: any): void => {
    const { url } = state;

    if (!url || typeof url !== 'string') return;

    if (url.includes(cancel_url)) {
      navigation.goBack();
      Alert.alert('Payment cancelled');
    }

    if (url.includes(callback_url)) {
      const params = getUrlParams(url);
      const extractedParam = params['reference'];
      if (extractedParam) {
        navigation.navigate('checkoutPage', {
          reference: extractedParam,
          checkOutInfoFromPaystack: checkOutInfo,
          startConfirmation: true,
        });
      }
    }

    if (url.includes('https://standard.paystack.co/close')) {
      navigation.goBack();
      Alert.alert('Payment cancelled');
    }
  };
  return (
    <View style={{ flex: 1, backgroundColor: currentBgColor }}>
      <View style={{ paddingVertical: 10, paddingHorizontal: 15 }}>
        <Pressable
          onPress={() => (
            navigation.goBack(), Alert.alert('Payment cancelled')
          )}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Icon name="xmark" size={22} color={currentTextColor} />
          <Text style={{ fontSize: 22, color: currentTextColor }}>Cancel</Text>
        </Pressable>
      </View>

      <WebView
        source={{
          uri: url,
        }}
        onNavigationStateChange={onNavigationStateChange}
        style={{ flex: 1 }}
      />
    </View>
  );
};

export default PaystackCheckOut;

