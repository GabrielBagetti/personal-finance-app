import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTransactions } from '../../context/TransactionContext';
import { Picker } from '@react-native-picker/picker';
import { useCategories } from '../../context/CategoryContext'; 
import { useTheme } from '../../context/ThemeContext';
import { lightColors } from '../../constants/Colors';

export default function AddTransactionScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const { addTransaction } = useTransactions();
  const { categories, isLoading: isLoadingCategories } = useCategories(); 

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isExpense, setIsExpense] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const availableCategories = categories.filter(cat => cat.type === (isExpense ? 'despesa' : 'receita'));

  useEffect(() => {
    if (!isLoadingCategories && availableCategories.length > 0) {
      if (!availableCategories.find(cat => cat.name === selectedCategory)) {
        setSelectedCategory(availableCategories[0].name);
      }
    } else if (!isLoadingCategories && availableCategories.length === 0) {
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

const createStyles = (colors: typeof lightColors) => StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 16, 
      backgroundColor: colors.background
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 8,
      padding: 12,
      fontSize: 14,
      color: colors.text,
    },
    pickerContainer: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.cardBorder,
      borderRadius: 8,
      marginBottom: 16,
      overflow: 'hidden',
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 20,
      paddingHorizontal: 16,
    },
    switchLabel: {
      fontSize: 14,
      color: colors.text,
      marginHorizontal: 10,
      fontWeight: '500',
    },
    activeSwitch: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    warningText: {
      marginTop: 12,
      fontSize: 14,
      color: '#F44336',
      textAlign: 'center',
    },
});