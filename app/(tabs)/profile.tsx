import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Image, TouchableOpacity, Alert, Platform, AlertButton } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth, API_URL } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';
import { useCategories } from '../../context/CategoryContext';
import { useTheme } from '../../context/ThemeContext'; // Importa o TEMA
import { lightColors } from '../../constants/Colors'; // Importa o TIPO de cores
import * as ImagePicker from 'expo-image-picker'; // Importa o UPLOAD de imagem

export default function ProfileScreen() {
  const { user, signOut, session, updateUserProfilePhoto } = useAuth();
  const { clearTransactions } = useTransactions();
  // const { clearCategories } = useCategories(); // Supondo que você tenha
  const { colors } = useTheme(); // Pega as cores do TEMA

  // 1. CRIA OS ESTILOS DINÂMICOS
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleLogout = () => {
    clearTransactions();
    // if (clearCategories) clearCategories();
    signOut();
  };

  // --- LÓGICA DE UPLOAD (MUDAR FOTO) ---
  const launchImagePicker = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão necessária", "Precisamos de acesso à galeria.");
        return;
      }
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (result.canceled || !result.assets || result.assets.length === 0) return;
    
    await uploadImage(result.assets[0]);
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();
    if (Platform.OS === 'web') {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      formData.append('profilePhoto', blob, `profile-${user?.id}.jpg`);
    } else {
      formData.append('profilePhoto', {
        uri: asset.uri,
        name: `profile-${user?.id}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      } as any);
    }
    try {
      const response = await fetch(`${API_URL}/upload-profile-photo`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${session}` }, body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso!', 'Sua foto de perfil foi atualizada.');
        updateUserProfilePhoto(data.profilePhotoUrl);
      } else { throw new Error(data.error); }
    } catch (error: any) { Alert.alert('Erro no Upload', error.message); }
  };

  // --- LÓGICA PARA REMOVER FOTO ---
  const handleRemovePhoto = async () => {
    try {
      const response = await fetch(`${API_URL}/remove-profile-photo`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session}` }
      });
      if (response.ok) {
        Alert.alert('Sucesso!', 'Sua foto de perfil foi removida.');
        updateUserProfilePhoto(null);
      } else {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      Alert.alert('Erro ao Remover Foto', error.message);
    }
  };

  // --- FUNÇÃO "MENU DE OPÇÕES" ---
  const handleProfilePhotoPress = () => {
    const options: AlertButton[] = [
      { text: "Mudar Foto", onPress: launchImagePicker },
    ];
    if (user?.profilePhotoUrl) {
      options.push({ text: "Remover Foto", onPress: handleRemovePhoto });
    }
    options.push({ text: "Cancelar" });
    Alert.alert("Foto de Perfil", "O que você gostaria de fazer?", options);
  };

  return (
    // 2. APLICA AS CORES DINÂMICAS
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 3. LÓGICA DA FOTO (NÃO MAIS O ÍCONE GENÉRICO) */}
        <TouchableOpacity onPress={handleProfilePhotoPress} style={styles.photoContainer}>
            {user?.profilePhotoUrl ? (
                <Image source={{ uri: `${API_URL}${user.profilePhotoUrl}?key=${new Date().getTime()}` }} style={styles.profilePhoto} />
            ) : (
                <MaterialCommunityIcons name="account-circle" size={100} color="#ccc" />
            )}
            <View style={styles.cameraIcon}>
                <MaterialCommunityIcons name="camera-plus" size={24} color="#fff" />
            </View>
        </TouchableOpacity>
        
        <Text style={styles.username}>{user ? user.email.split('@')[0] : 'Usuário'}</Text>
        <Text style={styles.email}>{user ? user.email : 'Carregando...'}</Text>

        <Link href="/categories" asChild>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="shape-outline" size={24} color={colors.text} />
            <Text style={styles.menuText}>Gerenciar Categorias</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </Pressable>
        </Link>
        
        <Link href="/settings" asChild>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="cog-outline" size={24} color={colors.text} />
            <Text style={styles.menuText}>Configurações</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </Pressable>
        </Link>
        
        <Pressable style={styles.menuItem} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
          <Text style={[styles.menuText, { color: colors.error }]}>Sair</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// 4. ESTILOS COMO FUNÇÃO (para o tema)
const createStyles = (colors: typeof lightColors) => StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  container: { 
    flex: 1, 
    alignItems: 'center', 
    paddingTop: 40, 
    paddingHorizontal: 20, 
    backgroundColor: colors.background 
  },
  photoContainer: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: colors.card, // Cor dinâmica
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20, 
    position: 'relative', 
  },
  profilePhoto: { 
    width: '100%', 
    height: '100%', 
    borderRadius: 60 
  },
  cameraIcon: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: colors.tint, // Cor dinâmica
    borderRadius: 15, 
    padding: 5, 
    borderWidth: 2, 
    borderColor: '#fff', 
  },
  username: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginTop: 10, 
    textTransform: 'capitalize', 
    color: colors.text // Cor dinâmica
  },
  email: { 
    fontSize: 16, 
    color: 'gray', 
    marginBottom: 40 
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.card, // Cor dinâmica
    padding: 15, 
    borderRadius: 8, 
    width: '100%', 
    marginBottom: 10, 
  },
  menuText: { 
    flex: 1, 
    marginLeft: 15, 
    fontSize: 16, 
    color: colors.text, // Cor dinâmica
  },
});