// app/_layout.tsx

import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { TransactionProvider } from '../context/TransactionContext';
import { CategoryProvider } from '../context/CategoryContext';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';


const InitialLayout = () => {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

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

      <Stack.Screen
        name="add-transaction"
        options={{ title: 'Adicionar Transação', presentation: 'modal' }}
      />
      <Stack.Screen
        name="categories"
        options={{ title: 'Gerenciar Categorias', presentation: 'modal' }}
      />

     
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
};

// Contextos globais
export default function RootLayout() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <CategoryProvider>
          <InitialLayout />
        </CategoryProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}
