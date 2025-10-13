import React from 'react';
import { View, Text, SectionList, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useTransactions, Transaction } from '../../context/TransactionContext'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';

const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups = transactions.reduce((acc, transaction) => {
      const dateKey = new Date(transaction.timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);

    return Object.keys(groups).map(date => ({ title: date, data: groups[date] }));
};

export default function StatementScreen() {

  const { transactions, isLoading, deleteTransaction } = useTransactions();
  
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const sections = groupTransactionsByDate(sortedTransactions);

  const handleDelete = (id: string) => {
    const message = "Você tem certeza que deseja apagar esta transação?";
    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        deleteTransaction(id);
      }
    } else {
      Alert.alert("Confirmar Exclusão", message, [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => deleteTransaction(id) }
      ]);
    }
  };


  if (isLoading) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#820ad1" />
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.mainTitle}>Extrato Completo</Text>
        
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma transação encontrada.</Text>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.txItem}>
                <View style={styles.txDetails}>
                  <Text style={styles.txDescription}>{item.description}</Text>
                  <Text style={styles.txCategory}>{item.category}</Text>
                </View>
                <View style={styles.txRightContainer}>
                    <Text style={item.type === 'receita' ? styles.txAmountIncome : styles.txAmountExpense}>
                      {item.type === 'receita' ? '+' : '-'} R$ {Number(item.amount).toFixed(2)}
                    </Text>
                    <TouchableOpacity onPress={() => handleDelete(item.id.toString())}>
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