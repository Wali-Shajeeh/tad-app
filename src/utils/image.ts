// import * as ImagePicker from 'expo-image-picker';

export async function pickImage(): Promise<string | null> {
  // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  // if (status !== 'granted') {
  //   alert('Permission to access media library denied');
  //   return;
  // }
  // const result = await ImagePicker.launchImageLibraryAsync();
  // if (!result.cancelled) {
  //   console.log(result.uri);
  //   return null;
  // }

  // return result.uri;
  return Promise.resolve('');
}
