import { ExpoPushToken, getExpoPushTokenAsync } from 'expo-notifications';

async function getPushToken(): Promise<ExpoPushToken> {
  const token = await getExpoPushTokenAsync();
  return token;
}
export { getPushToken };
