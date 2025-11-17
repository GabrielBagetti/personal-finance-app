import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { API_URL } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // 1. Importar o Tema
import { lightColors } from '../constants/Colors'; // Importar o tipo

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { colors } = useTheme(); // 2. Pegar as cores

  // 3. Criar os estilos dinâmicos
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso!', 'Sua conta foi criada. Faça o login para continuar.', [
          { text: 'OK', onPress: () => router.push('/login') },
        ]);
      } else {
        Alert.alert('Falha no Registro', data.error || 'Não foi possível criar a conta.');
      }
    } catch (error) {
      Alert.alert('Erro de Rede', 'Não foi possível conectar ao servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 4. Aplicar os estilos dinâmicos
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Criar Conta</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.tint} />
        ) : (
          <Button title="Registrar" onPress={handleRegister} />
        )}
        <Link href="/login" style={styles.link}>
          Já tem uma conta? Faça o login
        </Link>
      </View>
    </SafeAreaView>
  );
}

// 5. Estilos dinâmicos (idênticos aos do login)
const createStyles = (colors: typeof lightColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: colors.background,
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20,
    color: colors.text,
  },
  input: { 
    borderWidth: 1, 
    borderColor: colors.inputBorder,
    backgroundColor: colors.card,
    color: colors.text,
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 15,
    fontSize: 16,
  },
  link: { 
    marginTop: 15, 
    textAlign: 'center', 
    color: colors.tint,
  },
});