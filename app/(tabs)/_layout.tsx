// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#820ad1',
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="statement"
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="format-list-bulleted" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Resumo',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="chart-pie" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-circle" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}