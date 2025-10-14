import React from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView, Image, TouchableOpacity, Alert, Platform } from 'react-native';
import { Link } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth, API_URL } from '../../context/AuthContext';
import { useTransactions } from '../../context/TransactionContext';
//import { useCategories } from '../../context/CategoryContext';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const { user, signOut, session, updateUserProfilePhoto } = useAuth();
  const { clearTransactions } = useTransactions();
  // const { clearCategories } = useCategories();

  const handleLogout = () => {
    clearTransactions();
    // if (clearCategories) clearCategories();
    signOut();
  };

  const handleChoosePhoto = async () => {
    // 1. A LÓGICA DE PERMISSÃO SÓ RODA NO CELULAR
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão necessária", "Precisamos de acesso à galeria para definir a foto de perfil.");
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    await uploadImage(asset);
  };

  const uploadImage = async (asset: ImagePicker.ImagePickerAsset) => {
    const formData = new FormData();

    // 2. LÓGICA DIFERENTE PARA WEB E MOBILE
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
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Sucesso!', 'Sua foto de perfil foi atualizada.');
        updateUserProfilePhoto(data.profilePhotoUrl);
      } else {
        throw new Error(data.error || 'Falha no upload.');
      }
    } catch (error: any) {
      Alert.alert('Erro no Upload', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleChoosePhoto} style={styles.photoContainer}>
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

        {/* 3. BOTÕES DE VOLTA E FUNCIONANDO */}
        <Link href="/categories" asChild>
          <Pressable style={styles.menuItem}>
            <MaterialCommunityIcons name="shape-outline" size={24} color="#333" />
            <Text style={styles.menuText}>Gerenciar Categorias</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
          </Pressable>
        </Link>
        
        <Pressable style={styles.menuItem}>
          <MaterialCommunityIcons name="cog-outline" size={24} color="#333" />
          <Text style={styles.menuText}>Configurações</Text>
           <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </Pressable>
        
        <Pressable style={styles.menuItem} onPress={handleLogout}>
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
  photoContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center', marginBottom: 20, position: 'relative', },
  profilePhoto: { width: '100%', height: '100%', borderRadius: 60 },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#820ad1', borderRadius: 15, padding: 5, borderWidth: 2, borderColor: '#fff', },
  username: { fontSize: 24, fontWeight: 'bold', marginTop: 10, textTransform: 'capitalize' },
  email: { fontSize: 16, color: 'gray', marginBottom: 40 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, width: '100%', marginBottom: 10, },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#333', },
});