const GLOBAL_BUNDLE_ID = 'com.neduet.tad';
const GLOBAL_APP_NAME = 'MeToU Customer';
const GLOBAL_URL_SCHEME = 'com.neduet.tad';

const getAppName = () => {
  return GLOBAL_APP_NAME;
};

const getUniqueIdentifier = () => {
  return GLOBAL_BUNDLE_ID;
};

const getURLScheme = () => {
  return GLOBAL_URL_SCHEME;
};
module.exports = {
  expo: {
    owner: 'syed-wali',
    name: getAppName(),
    slug: 'tad-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    scheme: getURLScheme(),
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    updates: {
      fallbackToCacheTimeout: 0,
    },
    assetBundlePatterns: ['**/*'],
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      permissions: {
        pushNotifications: {
          description: 'Allow notifications for updates',
        },
        camera: 'Allow access to camera for taking photos',
        photoLibrary: 'Allow access to photo library',
      },
      infoPlist: {
        UIBackgroundModes: ['remote-notification'],
      },
      bundleIdentifier: getUniqueIdentifier(),
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      permissions: [
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
      softwareKeyboardLayoutMode: 'pan',
      package: getUniqueIdentifier(),
      googleServicesFile: './google/android.json',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-asset',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#FFCC00',
          image: './assets/splash-icon.png',
          dark: {
            image: './assets/splash-icon.png',
            backgroundColor: '#FFCC00',
          },
          imageWidth: 200,
        },
      ],
      'expo-localization',
      [
        'expo-font',
        {
          fonts: [
            './node_modules/react-native-vector-icons/Fonts/AntDesign.ttf',
            './node_modules/react-native-vector-icons/Fonts/Entypo.ttf',
            './node_modules/react-native-vector-icons/Fonts/EvilIcons.ttf',
            './node_modules/react-native-vector-icons/Fonts/Feather.ttf',
            './node_modules/react-native-vector-icons/Fonts/FontAwesome.ttf',
            './node_modules/react-native-vector-icons/Fonts/FontAwesome5_Brands.ttf',
            './node_modules/react-native-vector-icons/Fonts/FontAwesome5_Regular.ttf',
            './node_modules/react-native-vector-icons/Fonts/FontAwesome5_Solid.ttf',
            './node_modules/react-native-vector-icons/Fonts/FontAwesome6_Brands.ttf',
            './node_modules/react-native-vector-icons/Fonts/FontAwesome6_Regular.ttf',
            './node_modules/react-native-vector-icons/Fonts/FontAwesome6_Solid.ttf',
            './node_modules/react-native-vector-icons/Fonts/Fontisto.ttf',
            './node_modules/react-native-vector-icons/Fonts/Foundation.ttf',
            './node_modules/react-native-vector-icons/Fonts/Ionicons.ttf',
            './node_modules/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf',
            './node_modules/react-native-vector-icons/Fonts/MaterialIcons.ttf',
            './node_modules/react-native-vector-icons/Fonts/Octicons.ttf',
            './node_modules/react-native-vector-icons/Fonts/SimpleLineIcons.ttf',
            './node_modules/react-native-vector-icons/Fonts/Zocial.ttf',
          ],
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            extraMavenRepos: [
              '../../node_modules/@notifee/react-native/android/libs',
            ],
            compileSdkVersion: 35,
            targetSdkVersion: 33,
          },
        },
      ],
      [
        '@react-native-firebase/app',
        {
          androidGoogleServicesFile: './google-services.json',
        },
      ],
    ],
    extra: {
      EXPO_PUBLIC_API_BASE_URL: 'https://05b7-223-123-108-14.ngrok-free.app',
      eas: {
        projectId: '4177dfac-65dd-45e8-9a34-b338c84747ca',
      },
    },
    
  },
};
