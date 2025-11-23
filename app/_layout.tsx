import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { TransactionProvider } from '../context/TransactionContext';
import { CategoryProvider } from '../context/CategoryContext';
import { useEffect } from 'react';
import { ActivityIndicator, View, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from '../context/ThemeContext'

//CONFIGURAÇÃO DO HANDLER (Como a notificação se comporta com o app aberto)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, 
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const InitialLayout = () => {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();


  useEffect(() => {
    async function registerForPushNotificationsAsync() {
      if (Platform.OS === 'web') return;

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permissão para notificações não foi concedida!');
        return;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    }

    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inTabsGroup = segments[0] === '(tabs)';
    if (session && !inTabsGroup) {
      router.replace('/(tabs)');
    } else if (!session && inTabsGroup) {
      router.replace('/login');
    }
  }, [session, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#820ad1" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* <Stack.Screen name="add-transaction" options={{ title: 'Adicionar Transação', presentation: 'modal' }} />
      <Stack.Screen name="categories" options={{ title: 'Gerenciar Categorias', presentation: 'modal' }} />
      <Stack.Screen name="settings" options={{ title: 'Configurações', presentation: 'modal'}} /> */}
      {/* <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} /> */}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <CategoryProvider>
          <ThemeProvider>
          <InitialLayout />
          </ThemeProvider>
        </CategoryProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}