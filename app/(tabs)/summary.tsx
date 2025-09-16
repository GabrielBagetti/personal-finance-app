import React from 'react';
import { View, Text, SectionList, StyleSheet, SafeAreaView } from 'react-native';
import { TRANSACTIONS } from '../../data/mockData.js';
import { useTransactions } from '../../context/TransactionContext';

const groupTransactionsByMonth = (transactions: typeof TRANSACTIONS) => {
  const groups = transactions.reduce((acc, transaction) => {
    const monthKey = transaction.timestamp.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expenses: 0, transactions: [] };
    }

    if (transaction.type === 'receita') {
      acc[monthKey].income += transaction.amount;
    } else {
      acc[monthKey].expenses += transaction.amount;
    }
    
    return acc;
  }, {} as Record<string, { income: number; expenses: number; transactions: typeof TRANSACTIONS }>);

  return Object.keys(groups).map(month => ({
    title: month.charAt(0).toUpperCase() + month.slice(1),
    data: [groups[month]],
  }));
};

export default function MonthlySummaryScreen() {
  const { transactions } = useTransactions();
  const sections = groupTransactionsByMonth(transactions);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.mainTitle}>Resumo Mensal</Text>
        
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum resumo para exibir.</Text>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => item.income + index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.label}>Receitas:</Text>
                  <Text style={styles.income}>+ R$ {item.income.toFixed(2)}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Despesas:</Text>
                  <Text style={styles.expense}>- R$ {item.expenses.toFixed(2)}</Text>
                </View>
                <View style={[styles.row, styles.totalRow]}>
                  <Text style={styles.labelTotal}>Saldo do Mês:</Text>
                  <Text style={styles.balance}>R$ {(item.income - item.expenses).toFixed(2)}</Text>
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
  header: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: '#f9f9f9', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  label: { fontSize: 16, color: 'gray' },
  labelTotal: { fontSize: 16, fontWeight: 'bold' },
  income: { fontSize: 16, color: 'green', fontWeight: '500' },
  expense: { fontSize: 16, color: 'red', fontWeight: '500' },
  balance: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 5, paddingTop: 10 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' },
});