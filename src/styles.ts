import { Dimensions, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: { backgroundColor: 'white', flex: 1 },
  splash: {
    flex: 1,
    maxHeight: Dimensions.get('screen').height,
    maxWidth: Dimensions.get('screen').width,
  },
});

export default styles;
