import { NavigationProp, useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import Icon2 from 'react-native-vector-icons/Ionicons';
import { AppStackParamList } from '@/types/navigation';
import { useTheme } from '../context/themeContext';

const RenderTexts: React.FC<{ text: string; icon: string }> = ({
  text,
  icon,
}) => {
  const { currentTextColor } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon2 name={icon} size={25} color={currentTextColor} />
      <Text
        style={{
          color: currentTextColor,
          fontSize: 20,
          fontWeight: '500',
        }}
      >
        {text}
      </Text>
    </View>
  );
};

const RenderDrawer: React.FC<{ userName: string; dataLoading: boolean }> = ({
  userName,
  dataLoading,
}) => {
  const { toggleTheme, currentTextColor, theme } = useTheme();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={{ gap: 20 }}>
        <Pressable
          style={{
            alignItems: 'center',
            backgroundColor: theme == 'light' ? '#F2F1F3' : '#222',
            borderRadius: 15,
            flexDirection: 'row',
            height: 'auto',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            paddingVertical: 10,
            width: '100%',
          }}
          onPress={() => navigation.navigate('userPage')}
        >
          <View style={{ gap: 10 }}>
            <View
              style={{
                height: 50,
                width: 50,
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: currentTextColor,
              }}
            >
              <Icon name="user" color={currentTextColor} size={20} />
            </View>
            <View>
              {!dataLoading ? (
                <Text
                  style={{
                    color: currentTextColor,
                    fontSize: 20,
                    fontWeight: '500',
                  }}
                >
                  {userName}
                </Text>
              ) : (
                <Text
                  style={{
                    color: currentTextColor,
                    fontSize: 25,
                  }}
                >
                  ...
                </Text>
              )}
            </View>
          </View>
          <Icon name="chevron-right" color={currentTextColor} size={25} />
        </Pressable>
        <View
          style={[
            {
              alignItems: 'center',
              backgroundColor: theme == 'light' ? '#F2F1F3' : '#222',
              borderRadius: 15,
              flexDirection: 'row',
              height: 'auto',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
              paddingVertical: 10,
              width: '100%',
            },
            { flexDirection: 'column', gap: 30, alignItems: 'flex-start' },
          ]}
        >
          <Pressable onPress={() => navigation.navigate('MyOrders')}>
            <RenderTexts text={'My Orders'} icon={'receipt-outline'} />
          </Pressable>

          <RenderTexts text={'Shopping Guide'} icon={'compass-outline'} />

          <RenderTexts
            text={'Become a seller'}
            icon={'arrow-up-circle-outline'}
          />

          <RenderTexts text={'Help Center'} icon={'help-circle-outline'} />
        </View>
      </View>
      <View
        style={[
          {
            alignItems: 'center',
            backgroundColor: theme == 'light' ? '#F2F1F3' : '#222',
            borderRadius: 15,
            flexDirection: 'row',
            height: 'auto',
            justifyContent: 'space-between',
            paddingHorizontal: 15,
            paddingVertical: 10,
            width: '100%',
          },
          { paddingVertical: 20 },
        ]}
      >
        <Pressable onPress={toggleTheme}>
          <Icon
            name={theme == 'light' ? 'moon' : 'sun'}
            size={30}
            color={currentTextColor}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default RenderDrawer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
});
