import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Reactotron.setAsyncStorageHandler(AsyncStorage) // AsyncStorage would either come from react-native or @react-native-community/async-storage depending on where you get it from
  .useReactNative() // add all built-in react native plugins
  .connect(); // let's connect!
const log = console.log;
console.log = function () {
  Reactotron.log(...arguments);
  log(...arguments);
};
