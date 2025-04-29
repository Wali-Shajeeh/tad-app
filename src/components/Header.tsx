import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon2 from 'react-native-vector-icons/Ionicons';
import Badge from './Badge';
import { useMyBottomSheet } from '../context/bottomSheetContext';
import { useTheme } from '../context/themeContext';

const Header: React.FC<{ name: string; showCart: boolean }> = ({
  name,
  showCart,
}) => {
  const { currentTextColor } = useTheme();
  const { refRBSheetForCart } = useMyBottomSheet();
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <View style={styles.name_BackBtn}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name={'arrow-left'} color={currentTextColor} size={25} />
        </TouchableOpacity>

        <Text
          style={{
            color: currentTextColor,
            fontSize: 22,
          }}
        >
          {name}
        </Text>
      </View>

      {showCart && (
        <TouchableOpacity onPress={() => refRBSheetForCart?.current?.open()}>
          <Badge>
            <Icon2 name="cart-outline" size={30} color={currentTextColor} />
          </Badge>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    paddingBottom: 0,
  },
  name_BackBtn: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 15,
  },
});
