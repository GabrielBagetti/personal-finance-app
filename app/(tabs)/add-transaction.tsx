import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTransactions } from '../../context/TransactionContext';
import { Picker } from '@react-native-picker/picker';
import { useCategories } from '../../context/CategoryContext'; // 1. Importa do novo contexto de categorias

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();
  // 2. Pega as categorias e o estado de carregamento do CategoryContext
  const { categories, isLoading: isLoadingCategories } = useCategories(); 

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Filtra as categorias disponíveis com base no tipo (receita/despesa)
  const availableCategories = categories.filter(cat => cat.type === (isExpense ? 'despesa' : 'receita'));
  
  // Este useEffect garante que uma categoria padrão seja selecionada
  // assim que a lista de categorias é carregada ou quando o tipo de transação muda.
  useEffect(() => {
    if (!isLoadingCategories && availableCategories.length > 0) {
      // Se a categoria atualmente selecionada não estiver na nova lista,
      // seleciona a primeira da lista como padrão.
      if (!availableCategories.find(cat => cat.name === selectedCategory)) {
        setSelectedCategory(availableCategories[0].name);
      }
    } else if (!isLoadingCategories && availableCategories.length === 0) {
      // Se não houver categorias disponíveis, zera a seleção
      setSelectedCategory('');
    }
  }, [availableCategories, categories, isExpense, isLoadingCategories, router, selectedCategory]);

  const handleSave = async () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!description || !amount || isNaN(numericAmount) || numericAmount <= 0 || !selectedCategory) {
      Alert.alert('Campos Inválidos', 'Por favor, preencha todos os campos corretamente.');
      return;
    }

    await addTransaction({
      description,
      amount: numericAmount,
      category: selectedCategory,
      type: isExpense ? 'despesa' : 'receita',
    });

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };
  
  if (isLoadingCategories) {
    return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color="#820ad1" />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Descrição:</Text>
      <TextInput style={styles.input} placeholder="Ex: Almoço no centro" value={description} onChangeText={setDescription} />
      
      <Text style={styles.label}>Valor:</Text>
      <TextInput style={styles.input} placeholder="Ex: 50,00" keyboardType="numeric" value={amount} onChangeText={setAmount} />

      <Text style={styles.label}>Categoria:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          enabled={availableCategories.length > 0}
        >
          {availableCategories.length > 0 ? (
            availableCategories.map(category => (
              <Picker.Item key={category.id} label={category.name} value={category.name} />
            ))
          ) : (
            <Picker.Item label="Nenhuma categoria disponível" value="" enabled={false} />
          )}
        </Picker>
      </View>

      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, !isExpense && styles.activeSwitch]}>Receita</Text>
        <Switch
          value={!isExpense}
          onValueChange={() => setIsExpense(prev => !prev)}
          trackColor={{ false: '#f5c8c8', true: '#c8f5d0' }}
          thumbColor={isExpense ? '#f44336' : '#4CAF50'}
        />
        <Text style={[styles.switchLabel, isExpense && styles.activeSwitch]}>Despesa</Text>
      </View>

      <Button title="Salvar Transação" onPress={handleSave} disabled={availableCategories.length === 0} />
      {availableCategories.length === 0 && (
          <Text style={styles.warningText}>
              Você precisa criar uma categoria de {isExpense ? 'despesa' : 'receita'} antes de adicionar uma transação.
          </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#555',
    marginLeft: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  switchLabel: {
    fontSize: 16,
    marginHorizontal: 10,
    color: 'gray',
  },
  activeSwitch: {
    color: 'black',
    fontWeight: 'bold',
  },
  warningText: {
      textAlign: 'center',
      marginTop: 10,
      color: 'red',
      fontSize: 12,
  }
});