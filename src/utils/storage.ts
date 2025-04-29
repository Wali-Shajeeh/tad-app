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

export const deleteAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (error) {
    console.error(error);
  }
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (error) {
    console.error(error);
  }
};

export const setUserId = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('userId', userId);
  } catch (error) {
    console.error(error);
  }
}

export const getUserId = async (): Promise<string | null> => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    return userId;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const deleteUserId = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('userId');
  } catch (error) {
    console.error(error);
  }
};