import React from 'react';

import { View, Text, SectionList, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import { TRANSACTIONS } from '../../data/mockData.js';
import { useTransactions } from '../../context/TransactionContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const groupTransactionsByDate = (transactions: typeof TRANSACTIONS) => {
    const groups = transactions.reduce((acc, transaction) => {
      const dateKey = transaction.timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(transaction);
      return acc;
    }, {} as Record<string, typeof TRANSACTIONS[0][]>);

    return Object.keys(groups).map(date => ({ title: date, data: groups[date] }));
};

export default function StatementScreen() {
  const { transactions, deleteTransaction } = useTransactions();
  
  const sortedTransactions = [...transactions].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const sections = groupTransactionsByDate(sortedTransactions);


  const handleDelete = (id: string) => {
    const message = "Você tem certeza que deseja apagar esta transação?";

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        deleteTransaction(id);
      }
    } else {
      Alert.alert(
        "Confirmar Exclusão",
        message,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Apagar", style: "destructive", onPress: () => deleteTransaction(id) }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.mainTitle}>Extrato Completo</Text>
        
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.txItem}>
                <View style={styles.txDetails}>
                  <Text style={styles.txDescription}>{item.description}</Text>
                  <Text style={styles.txCategory}>{item.category}</Text>
                </View>
                <View style={styles.txRightContainer}>
                    <Text style={item.type === 'receita' ? styles.txAmountIncome : styles.txAmountExpense}>
                    {item.type === 'receita' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={24} color="#a0a0a0" />
                    </TouchableOpacity>
                </View>
              </View>
            )}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.header}>{title}</Text>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 16 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', paddingVertical: 16 },
  header: { fontSize: 16, fontWeight: 'bold', paddingVertical: 8, backgroundColor: '#f0f0f0', paddingHorizontal: 16, marginTop: 10 },
  txItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  txDetails: { flex: 1 },
  txRightContainer: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  txDescription: { fontSize: 16 },
  txCategory: { fontSize: 12, color: 'gray' },
  txAmountIncome: { color: 'green', fontSize: 16, fontWeight: 'bold' },
  txAmountExpense: { color: 'red', fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' },
});