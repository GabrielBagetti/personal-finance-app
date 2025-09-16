import React, { useMemo } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useTransactions } from '../../context/TransactionContext';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { transactions } = useTransactions();

  const { balance } = useMemo(() => {
    const income = transactions.filter(tx => tx.type === 'receita').reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = transactions.filter(tx => tx.type === 'despesa').reduce((sum, tx) => sum + tx.amount, 0);
    return { balance: income - expenses };
  }, [transactions]);
  
  const recentTransactions = transactions.slice(0, 5);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao Controle de gastos</Text>
      <Text style={styles.balance}>Saldo Atual: R$ {balance.toFixed(2)}</Text>
        <Text style={styles.subtitle}>Transações Recentes:</Text>
        {recentTransactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação recente.</Text>
        ) : (
            recentTransactions.map(tx => (
                <View key={tx.id} style={styles.txItem}>
                    <View>
                        <Text style={styles.txDescription}>{tx.description}</Text>
                        <Text style={styles.txCategory}>{tx.category}</Text>
                    </View>
                    <Text style={tx.type === 'receita' ? styles.txAmountIncome : styles.txAmountExpense}>
                        {tx.type === 'receita' ? '+' : '-'} R$ {tx.amount.toFixed(2)}   
                    </Text>
                </View>
            ))
        )}
        <Button
            title="Adicionar Transação"
            onPress={() => router.push('/add-transaction')}
            color="#4CAF50"
        />
    </View>
  );
}   

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balance: {
    fontSize: 20,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 8,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  txDescription: {
    fontSize: 16,
  },
  txCategory: {
    fontSize: 14,
    color: '#888',
  },
  txAmountIncome: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
  txAmountExpense: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
