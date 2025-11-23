import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { Pressable } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';

export default function TabsLayout() {
  const { colors } = useTheme(); 

  
  const { signOut } = useAuth();
  const { clearTransactions } = useTransactions();

  const handleLogout = () => {
    clearTransactions();
    signOut();
  };

  return (
    <Tabs
      screenOptions={{
        
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="statement"
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="format-list-bulleted" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Resumo',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-pie" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
          headerRight: () => (
            <Pressable onPress={handleLogout} style={{ marginRight: 15 }}>
              <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen 
        name="add-transaction" 
        options={{ 
          href: null,
          headerShown: false 
        }} 
      />

      <Tabs.Screen 
        name="categories" 
        options={{ 
          href: null,
          headerShown: false 
        }} 
      />

      <Tabs.Screen 
        name="settings" 
        options={{ 
          href: null,
          headerShown: false 
        }} 
      />
    </Tabs>
  );
}