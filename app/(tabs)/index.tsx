import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTransactions, Transaction } from '../../context/TransactionContext'; // Pega os dados do contexto
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { transactions, isLoading } = useTransactions();
  const { user } = useAuth();

  // Calcula o saldo total
  const balance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      return tx.type === 'receita' ? acc + Number(tx.amount) : acc - Number(tx.amount);
    }, 0);
  }, [transactions]);
  
  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.email.split('@')[0] || 'Usuário'}!</Text>
      </View>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Atual</Text>
        <Text style={[styles.balanceValue, { color: balance >= 0 ? '#2e7d32' : '#c62828' }]}>
          R$ {balance.toFixed(2)}
        </Text>
      </View>
      
      {/* O Link agora navega para a rota modal que definimos no _layout.tsx */}
      <Link href="/add-transaction" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Adicionar Transação</Text>
        </Pressable>
      </Link>

      <Text style={styles.title}>Últimos Lançamentos</Text>
      {isLoading ? (
        <ActivityIndicator size="large" style={{ marginTop: 20 }}/>
      ) : recentTransactions.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma transação recente. Adicione uma!</Text>
      ) : (
        <FlatList
          data={recentTransactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.txItem}>
              <View>
                <Text style={styles.txDescription}>{item.description}</Text>
                <Text style={styles.txCategory}>{item.category}</Text>
              </View>
              <Text style={{ color: item.type === 'receita' ? '#2e7d32' : '#c62828', fontWeight: 'bold' }}>
                {item.type === 'receita' ? '+' : '-'} R$ {Number(item.amount).toFixed(2)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
    header: { marginBottom: 16 },
    greeting: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    balanceCard: { padding: 20, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center', marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 5 },
    balanceLabel: { fontSize: 16, color: 'gray' },
    balanceValue: { fontSize: 32, fontWeight: 'bold', marginTop: 4 },
    title: { fontSize: 18, fontWeight: 'bold', marginTop: 24, marginBottom: 10, color: '#333' },
    txItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff', borderRadius: 8, marginBottom: 8 },
    txDescription: { fontSize: 16, fontWeight: '500' },
    txCategory: { fontSize: 12, color: 'gray' },
    button: { backgroundColor: '#820ad1', padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    emptyText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: 'gray' },
});