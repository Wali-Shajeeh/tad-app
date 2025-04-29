import Icon from '@expo/vector-icons/FontAwesome6';
import React from 'react';
import { View, Text } from 'react-native';


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

export default InfoBox;