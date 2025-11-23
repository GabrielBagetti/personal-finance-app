import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Switch, Platform } from 'react-native';
import { useAuth, API_URL } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../context/ThemeContext';
import { lightColors } from '../../constants/Colors';

export default function SettingsScreen() {
  const { session, updateUserEmail, signOut } = useAuth();
  const { theme, toggleTheme, colors } = useTheme();
  const router = useRouter();


  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [currentPasswordForPwd, setCurrentPasswordForPwd] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');


 const styles = useMemo(() => createStyles(colors), [colors]);

  // Função para disparar a notificação
  const showSuccessToast = (title: string, body: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n${body}`);
      return;
    }
    Notifications.scheduleNotificationAsync({
      content: { title: title, body: body, sound: true },
      trigger: null,
    });
  };

  // Função para alterar o email
  const handleUpdateEmail = async () => {
    if (!newEmail || !currentPasswordForEmail) {
      Alert.alert("Erro", "Preencha todos os campos para alterar o email.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/update-email`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session}` },
        body: JSON.stringify({ newEmail, currentPassword: currentPasswordForEmail })
      });
      const data = await response.json();
      if (response.ok) {
        await updateUserEmail(data.email);
        showSuccessToast("Sucesso!", "Seu email foi alterado.");
        router.back();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      Alert.alert("Erro ao alterar email", error.message);
    }
  };

  // Função para alterar a senha
  const handleUpdatePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Erro", "As novas senhas não coincidem.");
      return;
    }
    if (!currentPasswordForPwd || !newPassword) {
      Alert.alert("Erro", "Preencha todos os campos para alterar a senha.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session}` },
        body: JSON.stringify({ currentPassword: currentPasswordForPwd, newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Sucesso!", "Sua senha foi alterada. Por favor, faça login novamente.", [
          { text: "OK", onPress: () => {
            signOut();
            router.replace('/login');
          }}
        ]);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      Alert.alert("Erro ao alterar senha", error.message);
    }
  };

  return (

    <ScrollView style={styles.container}>
      
      {}
      <View style={styles.card}>
        <Text style={styles.title}>Aparência</Text>
        <View style={styles.themeRow}>
          <Text style={styles.themeLabel}>Modo Escuro (Dark Mode)</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={theme === 'dark' ? colors.tint : "#f4f3f4"}
            onValueChange={toggleTheme}
            value={theme === 'dark'}
          />
        </View>
      </View>

      {}
      <View style={styles.card}>
        <Text style={styles.title}>Alterar Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Novo Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={newEmail}
          onChangeText={setNewEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha Atual"
          placeholderTextColor="#999"
          secureTextEntry
          value={currentPasswordForEmail}
          onChangeText={setCurrentPasswordForEmail}
        />
        <Button title="Salvar Novo Email" onPress={handleUpdateEmail} />
      </View>

      {}
      <View style={styles.card}>
        <Text style={styles.title}>Alterar Senha</Text>
        <TextInput
          style={styles.input}
          placeholder="Senha Atual"
          placeholderTextColor="#999"
          secureTextEntry
          value={currentPasswordForPwd}
          onChangeText={setCurrentPasswordForPwd}
        />
        <TextInput
          style={styles.input}
          placeholder="Nova Senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar Nova Senha"
          placeholderTextColor="#999"
          secureTextEntry
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
        />
        <Button title="Salvar Nova Senha" onPress={handleUpdatePassword} />
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background,
  },
  card: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: colors.text,
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeLabel: {
    fontSize: 16,
    color: colors.text,
  },
});