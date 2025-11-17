// app/categories.tsx

import React, { useState, useMemo} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Switch,
} from 'react-native';
import { useCategories, Category } from '../../context/CategoryContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext'; // 1. Importar o Tema
import { lightColors } from '../../constants/Colors'; // Importar o tipo

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { categories, isLoading, addCategory, updateCategory, deleteCategory } = useCategories();

  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'receita' | 'despesa'>('despesa');

  const openAddModal = () => {
    setIsEditing(null);
    setName('');
    setType('despesa');
    setModalVisible(true);
  };

  const openEditModal = (category: Category) => {
    setIsEditing(category);
    setName(category.name);
    setType(category.type);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('O nome não pode ser vazio.');
      return;
    }

    if (isEditing) {
      const success = await updateCategory(isEditing.id, name);
      if (success) setModalVisible(false);
    } else {
      const success = await addCategory(name, type);
      if (success) setModalVisible(false);
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      'Apagar Categoria',
      `Tem certeza que deseja apagar "${category.name}"? Todas as transações associadas também serão removidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteCategory(Number(category.id));
            if (!success) {
              Alert.alert('Erro', 'Não foi possível apagar esta categoria.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#820ad1" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <MaterialCommunityIcons
                name={item.type === 'receita' ? 'arrow-up-circle' : 'arrow-down-circle'}
                size={24}
                color={item.type === 'receita' ? 'green' : 'red'}
              />
              <Text style={styles.itemText}>{item.name}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)} hitSlop={20}>
                  <MaterialCommunityIcons name="pencil" size={24} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={20}>
                  <MaterialCommunityIcons name="trash-can-outline" size={24} color="#a00" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.mainTitle}>Suas Categorias</Text>
              <Button title="Nova Categoria" onPress={openAddModal} />
            </View>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma categoria encontrada.</Text>}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{isEditing ? 'Editar Categoria' : 'Nova Categoria'}</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da Categoria"
                value={name}
                onChangeText={setName}
              />
              <View style={styles.switchContainer}>
                <Text style={type === 'receita' && styles.activeSwitch}>Receita</Text>
                <Switch
                  value={type === 'despesa'}
                  onValueChange={(value) => setType(value ? 'despesa' : 'receita')}
                  disabled={!!isEditing}
                />
                <Text style={type === 'despesa' && styles.activeSwitch}>Despesa</Text>
              </View>
              {isEditing && (
                <Text style={styles.warningText}>O tipo de uma categoria não pode ser alterado.</Text>
              )}
              <View style={styles.modalActions}>
                <Button title="Cancelar" onPress={() => setModalVisible(false)} color="gray" />
                <Button title="Salvar" onPress={handleSave} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: typeof lightColors) => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: { 
      flex: 1, 
      padding: 16, 
      backgroundColor: colors.background
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    header: { 
      marginBottom: 16,
      gap: 12,
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    itemText: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginLeft: 12,
    },
    actions: {
      flexDirection: 'row',
      gap: 16,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
      width: '90%',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    input: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
      marginBottom: 16,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 16,
      gap: 10,
    },
    activeSwitch: {
      fontWeight: 'bold',
      color: colors.text,
      fontSize: 14,
    },
    warningText: {
      fontSize: 12,
      color: '#F44336',
      marginBottom: 16,
      textAlign: 'center',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 16,
    },
    emptyText: { 
      textAlign: 'center', 
      marginTop: 20, 
      fontSize: 16, 
      color: 'gray' 
    },
});