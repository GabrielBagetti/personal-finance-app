import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth, API_URL } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { lightColors } from '../constants/Colors';

export default function LoginScreen() {
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { colors } = useTheme();


  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput }),
      });
      const data = await response.json();
      if (response.ok) {
        signIn(data.token, data.user);
      } else {
        Alert.alert('Falha no Login', data.error || 'Não foi possível fazer login.');
      }
    } catch (error) {
      Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput 
        style={styles.input} 
        placeholder="Email" 
        placeholderTextColor="#999"
        value={emailInput} 
        onChangeText={setEmailInput} 
        keyboardType="email-address" 
        autoCapitalize="none" 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Senha" 
        placeholderTextColor="#999"
        value={passwordInput} 
        onChangeText={setPasswordInput} 
        secureTextEntry 
      />
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.tint} />
      ) : (
        <Button title="Entrar" onPress={handleLogin} />
      )}
      <Link href="/register" style={styles.link}>
        Não tem uma conta? Registre-se
      </Link>
    </View>
  );
}

const createStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: colors.background
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20,
    color: colors.text
  },
  input: { 
    borderWidth: 1, 
    borderColor: colors.inputBorder,
    backgroundColor: colors.card,
    color: colors.text,
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 15 
  },
  link: { 
    marginTop: 15, 
    textAlign: 'center', 
    color: colors.tint
  },
});