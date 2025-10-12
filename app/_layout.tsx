import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { TransactionProvider } from '../context/TransactionContext';
import { CategoryProvider } from '../context/CategoryContext';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

// Este componente é o "cérebro" que decide a rota
const InitialLayout = () => {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === '(tabs)';

    if (session && !inTabsGroup) {
      // Se está logado, mas está fora do grupo principal (ex: na tela de login),
      // navega para a tela inicial do app.
      router.replace('/(tabs)');
    } else if (!session && inTabsGroup) {
      // Se NÃO está logado, mas tenta acessar uma tela protegida,
      // joga ele para a tela de login.
      router.replace('/login');
    }
  }, [session, isLoading, segments]);

  // Enquanto carrega a sessão, mostramos uma tela de "carregando..."
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#820ad1" />
      </View>
    );
  }

  return (
    <Stack>
      {/* Grupo principal de telas com abas */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Telas que abrem por cima (modais) */}
      <Stack.Screen name="add-transaction" options={{ title: 'Adicionar Transação', presentation: 'modal' }} />
      <Stack.Screen name="categories" options={{ title: 'Gerenciar Categorias', presentation: 'modal' }} />
      
      {/* Telas públicas de autenticação */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
    </Stack>
  );
}

// O componente raiz que envolve tudo com os provedores de contexto.
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