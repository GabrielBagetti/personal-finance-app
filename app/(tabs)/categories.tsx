// app/categories.tsx

import React, { useState } from 'react';
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

export default function CategoriesScreen() {
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainTitle: { fontSize: 24, fontWeight: 'bold' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemText: { fontSize: 16, marginLeft: 15, marginRight: 'auto' },
  actions: { flexDirection: 'row', gap: 15 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    elevation: 5,
    width: '85%',
  },
  modalTitle: { fontSize: 20, marginBottom: 15 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  activeSwitch: { fontWeight: 'bold' },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  warningText: { fontSize: 10, color: 'gray', marginBottom: 20 },
});
