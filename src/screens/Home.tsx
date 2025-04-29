import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { View } from 'react-native';

import Categories from './Categories';
import HomeScreen from './HomeScreen';
import { useTheme } from '../context/themeContext';

const Stack = createNativeStackNavigator();

const Home: React.FC<object> = () => {
  const { currentBgColor } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: currentBgColor }}>
      <Stack.Navigator initialRouteName="homeScreen">
        <Stack.Screen
          name="homeScreen"
          component={HomeScreen}
          options={{ headerShown: false, presentation: 'card' }}
        />
        <Stack.Screen
          name="categories"
          component={Categories}
          options={{ headerShown: false, presentation: 'card' }}
        />
      </Stack.Navigator>
    </View>
  );
};

export default Home;
