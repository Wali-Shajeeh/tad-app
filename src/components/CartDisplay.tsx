// this is the bottom sheet to dispay cart

import React from 'react';
import { Dimensions } from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import { useMyBottomSheet } from '@/context/bottomSheetContext';
import { useTheme } from '../context/themeContext';
import Cart from '../screens/Cart';

const CartDisplay: React.FC = () => {
  const { theme } = useTheme();
  const { refRBSheetForCart } = useMyBottomSheet();
  return (
    <RBSheet
      ref={refRBSheetForCart}
      draggable={true}
      closeOnPressMask={true}
      customModalProps={{
        animationType: 'slide',
        statusBarTranslucent: true,
      }}
      dragOnContent={true}
      customStyles={{
        wrapper: {
          backgroundColor: 'rgba(0,0,0,0.2)',
        },
        draggableIcon: {
          backgroundColor: theme == 'light' ? '#222' : '#fff',
        },
        container: {
          backgroundColor: theme == 'light' ? '#fff' : '#111',
          height: Dimensions.get('window').height - 10,
        },
      }}
    >
      <Cart />
    </RBSheet>
  );
};

export default CartDisplay;
