import { StyleSheet } from 'react-native';
import { Colors, Dimensions } from '@/theme';

export const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary,
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  buttons: { flexDirection: 'row', gap: 10 },
  contentContainer: {
    paddingHorizontal: 15,
    zIndex: 1000,
  },
  customToast: {
    backgroundColor: Colors.white,
    borderLeftColor: Colors.primary,
    borderLeftWidth: 5,
    borderRadius: 10,
    elevation: 2,
    height: Dimensions.height.size16,
    marginHorizontal: 10,
    marginTop: 10,
    padding: 15,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: Dimensions.width.size90,
  },
  errorToast: {
    borderLeftColor: Colors.errorText,
  },
  secondaryBtn: {
    backgroundColor: Colors.secondary,
  },

  successToast: {
    borderLeftColor: Colors.successText,
  },
  text1: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  text2: {
    fontSize: 13,
  },
});
