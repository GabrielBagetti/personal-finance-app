import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="account-circle" size={100} color="#ccc" />
        <Text style={styles.username}>Usuário Teste</Text>
        <Text style={styles.email}>usuario@email.com</Text>

        <Link href="/categories" asChild>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="shape-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Ver Categorias</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </Pressable>
        </Link>
        
        <Pressable style={styles.menuItem}>
          <MaterialCommunityIcons name="cog-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Configurações</Text>
           <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </Pressable>
        
        <Pressable style={styles.menuItem}>
          <MaterialCommunityIcons name="logout" size={24} color="red" />
          <Text style={[styles.menuText, { color: 'red' }]}>Sair</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, alignItems: 'center', paddingTop: 40, paddingHorizontal: 20 },
  username: { fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  email: { fontSize: 16, color: 'gray', marginBottom: 40 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, width: '100%', marginBottom: 10 },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16 },
});