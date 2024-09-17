/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {Alert, Button, SafeAreaView, Text} from 'react-native';

import {Amplify} from 'aws-amplify';

import {
  getBadgeCount,
  getPermissionStatus,
  initializePushNotifications,
  onNotificationOpened,
  onNotificationReceivedInBackground,
  onNotificationReceivedInForeground,
  setBadgeCount,
} from 'aws-amplify/push-notifications';
import {requestPermissions} from 'aws-amplify/push-notifications';
import {onTokenReceived} from 'aws-amplify/push-notifications';
import {signOut} from 'aws-amplify/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import awsMobile from './aws-exports';

Amplify.configure(awsMobile);
initializePushNotifications();

async function handlePermissions() {
  const status = await getPermissionStatus();
  if (status === 'granted') {
    // no further action is required, user has already granted permissions
    Alert.alert('Permission granted');
    return;
  }
  if (status === 'denied') {
    // further attempts to request permissions will no longer do anything
    // myFunctionToGracefullyDegradeMyApp();
    return;
  }
  if (status === 'shouldRequest') {
    // go ahead and request permissions from the user
    await requestPermissions();
  }
  if (status === 'shouldExplainThenRequest') {
    // you should display some explanation to your user before requesting permissions
    // await myFunctionExplainingPermissionsRequest();
    // then request permissions
    await requestPermissions();
  }
}

function App(): React.JSX.Element {
  useEffect(() => {
    onTokenReceived(token => {
      console.log('token: ', token);
      settoken(token);
    });
  }, []);

  const [deviceToken, settoken] = useState('');
  const [notificationOpened, setNotificationOpened] = useState('');
  const [notificationForeground, setNotificationForeground] = useState('');
  const [notificationBackground, setNotificationBackground] = useState('');

  return (
    <SafeAreaView
      style={{
        paddingTop: 100,
        alignContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: 'white',
      }}>
      <Button
        title="Check endpoint ID"
        onPress={async () => {
          const {appId} =
            Amplify.getConfig().Notifications?.PushNotification?.Pinpoint!;
          console.log('appId', appId);
          const endpointId = await AsyncStorage.getItem(
            `aws-amplify-cachePushNotification:pinpoint:${appId}`,
          );
          console.log('endpointId', endpointId);
        }}
      />
      <Button title="Request permission" onPress={handlePermissions} />
      <Button
        title="Listen to notification opened events"
        onPress={() => {
          onNotificationOpened(notification => {
            setNotificationOpened(
              `Notification opened with title: ${notification.title ?? ''}`,
            );
          });
        }}
      />
      <Text>{notificationOpened}</Text>
      <Button
        title="Listen to notification events in foreground"
        onPress={() => {
          onNotificationReceivedInForeground(notification => {
            setNotificationForeground(
              `Notification was received in foreground with title: ${
                notification.title ?? ''
              }`,
            );
          });
        }}
      />
      <Text>{notificationForeground}</Text>
      <Button
        title="Listen to notification events in background"
        onPress={() => {
          onNotificationReceivedInBackground(notification => {
            console.log(
              `🌀 Notification was received in background with title: ${
                notification.title ?? ''
              }`,
            );
            setNotificationBackground(
              `Notification was received in background with title: ${
                notification.title ?? ''
              }`,
            );
          });
        }}
      />
      <Text>{notificationBackground}</Text>

      <Text selectable={true}>{deviceToken}</Text>
      <Button
        title="Get badge count"
        onPress={async () => {
          const count = await getBadgeCount();
          Alert.alert(`count: ${count}`);
        }}
      />
      <Button
        title="Set badge count"
        onPress={async () => {
          try {
            setBadgeCount(10);
          } catch (e) {
            console.log('error setting badge count: ', e);
          }
        }}
      />
      <Button
        title="Sign Out"
        onPress={async () => {
          const res = await signOut();
          console.log('signOut res:', res);
        }}
      />
    </SafeAreaView>
  );
}

export default App;
