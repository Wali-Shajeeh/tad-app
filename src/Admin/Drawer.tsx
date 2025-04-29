import Icon from '@expo/vector-icons/FontAwesome6';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { AppStackParamList } from '@/types/navigation';
import type { User } from '@/types/schema';

type DrawerProps = {
  userData: User | null,
  showAlert: () => void,
};

const Drawer: React.FC<DrawerProps> = ({ userData, showAlert }) => {
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 15, gap: 15 }}>
        <View
          style={{
            width: '100%',
            height: 'auto',
            backgroundColor: '#f1f3f2',
            borderRadius: 10,
            padding: 15,
            gap: 10,
          }}
        >
          <Text style={{ fontSize: 22, color: '#222', fontWeight: '500' }}>
            {userData?.firstName + ' ' + userData?.lastName}
          </Text>
          <Text style={{ fontSize: 20, color: '#222', fontWeight: '400' }}>
            {userData?.email}
          </Text>
        </View>
        <Pressable
          onPress={() => navigation.navigate('addProduct')}
          style={{
            width: '100%',
            height: 'auto',
            backgroundColor: '#f1f3f2',
            borderRadius: 10,
            padding: 15,
            gap: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 22, color: '#222', fontWeight: '500' }}>
              Add Product
            </Text>
            <Icon name="chevron-right" size={20} color="#222" />
          </View>
        </Pressable>
        <Pressable
          onPress={showAlert}
          style={{
            width: '100%',
            height: 'auto',
            backgroundColor: '#f1f3f2',
            borderRadius: 10,
            padding: 15,
            gap: 10,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 22, color: '#222', fontWeight: '500' }}>
              Logout
            </Text>
            <Icon name="chevron-right" size={20} color="#222" />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default Drawer;