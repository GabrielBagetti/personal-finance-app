import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTransactions } from '../context/TransactionContext';
import { Picker } from '@react-native-picker/picker';
import { CATEGORIES } from '../data/mockData.js'; 

export default function AddTransactionScreen() {
  const router = useRouter();
  const { addTransaction } = useTransactions();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]?.name || '');

  const handleSave = () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (!description || !amount || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos com valores válidos.');
      return;
    }

    addTransaction({
      description,
      amount: numericAmount,
      category: selectedCategory,
      type: isExpense ? 'despesa' : 'receita',
    });

    router.back();
  };

  const availableCategories = isExpense
    ? CATEGORIES.filter(cat => cat.name !== 'Salário') 
    : CATEGORIES.filter(cat => cat.name === 'Salário'); 

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Descrição (Ex: Supermercado)" value={description} onChangeText={setDescription} />
      <TextInput style={styles.input} placeholder="Valor (Ex: 150.50)" keyboardType="numeric" value={amount} onChangeText={setAmount} />

      <Text style={styles.label}>Categoria:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        >
          {availableCategories.map(category => (
            <Picker.Item key={category.id} label={category.name} value={category.name} />
          ))}
        </Picker>
      </View>

      <View style={styles.switchContainer}>
        <Text style={[styles.switchLabel, !isExpense && styles.activeSwitch]}>Receita</Text>
        <Switch
          value={!isExpense}
          onValueChange={() => {
            const newIsExpense = !isExpense;
            setIsExpense(newIsExpense);
            const newCategories = newIsExpense ? CATEGORIES.filter(c => c.name !== 'Salário') : CATEGORIES.filter(c => c.name === 'Salário');
            setSelectedCategory(newCategories[0]?.name || '');
          }}
          trackColor={{ false: '#f5c8c8', true: '#c8f5d0' }}
          thumbColor={isExpense ? '#f44336' : '#4CAF50'}
        />
        <Text style={[styles.switchLabel, isExpense && styles.activeSwitch]}>Despesa</Text>
      </View>

      <Button title="Salvar Transação" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  label: { fontSize: 16, marginBottom: 5, color: '#555', marginLeft: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 20 },
  switchContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 20 },
  switchLabel: { fontSize: 16, marginHorizontal: 10, color: 'gray' },
  activeSwitch: { color: 'black', fontWeight: 'bold' }
});