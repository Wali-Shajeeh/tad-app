import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    return authToken;
  } catch (error) {
    console.error(error);
    return null;
  }
};
