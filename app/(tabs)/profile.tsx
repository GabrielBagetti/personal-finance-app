import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';
import { useCategories } from '../../context/CategoryContext';
import { useTheme } from '../../context/ThemeContext'; // Importa o tema

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { clearTransactions } = useTransactions();
  // const { clearCategories } = useCategories(); // Descomente se tiver
  const { colors } = useTheme(); // Pega as cores

  const handleLogout = () => {
    clearTransactions();
    // if (clearCategories) clearCategories();
    signOut();
  };

  return (
    
    <SafeAreaView style={{ ...styles.safeArea, backgroundColor: colors.background }}>
      <View style={{ ...styles.container, backgroundColor: colors.background }}>
        <MaterialCommunityIcons name="account-circle" size={100} color="#ccc" />
        
        <Text style={{ ...styles.username, color: colors.text }}>
          {user ? user.email.split('@')[0] : 'Usuário'}
        </Text>
        <Text style={{ ...styles.email, color: colors.text, opacity: 0.6 }}>
          {user ? user.email : 'Carregando...'}
        </Text>

        <Link href="/categories" asChild>
          <Pressable style={{ ...styles.menuItem, backgroundColor: colors.card }}>
            <MaterialCommunityIcons name="shape-outline" size={24} color={colors.text} />
            <Text style={{ ...styles.menuText, color: colors.text }}>Gerenciar Categorias</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </Pressable>
        </Link>
        
        <Link href="/settings" asChild>
          <Pressable style={{ ...styles.menuItem, backgroundColor: colors.card }}>
            <MaterialCommunityIcons name="cog-outline" size={24} color={colors.text} />
            <Text style={{ ...styles.menuText, color: colors.text }}>Configurações</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </Pressable>
        </Link>
        
        <Pressable style={{ ...styles.menuItem, backgroundColor: colors.card }} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
          <Text style={{ ...styles.menuText, color: colors.error }}>Sair</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  username: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  email: { fontSize: 16, marginBottom: 40 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 8, width: '100%', marginBottom: 10, },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, },
});