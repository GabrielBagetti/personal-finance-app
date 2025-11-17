import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTransactions, Transaction } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // 1. Importar o Tema
import { lightColors } from '../../constants/Colors'; // Importar o tipo

export default function HomeScreen() {
  const router = useRouter();
  const { transactions, isLoading } = useTransactions();
  const { user } = useAuth();
  const { colors } = useTheme(); // 2. Pegar as cores do tema

  // 3. Criar os estilos dinâmicos
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Calcula o saldo total
  const balance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      return tx.type === 'receita' ? acc + Number(tx.amount) : acc - Number(tx.amount);
    }, 0);
  }, [transactions]);
  
  const recentTransactions = transactions.slice(0, 5);

  return (
    // 4. Aplicar os estilos dinâmicos
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.email.split('@')[0] || 'Usuário'}!</Text>
      </View>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Atual</Text>
        <Text style={[styles.balanceValue, { color: balance >= 0 ? colors.success : colors.error }]}>
          R$ {balance.toFixed(2)}
        </Text>
      </View>
      
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
              <Text style={[styles.txAmount, { color: item.type === 'receita' ? colors.success : colors.error }]}>
                {item.type === 'receita' ? '+' : '-'} R$ {Number(item.amount).toFixed(2)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

// 5. Transformar os estilos em uma função que recebe as cores
const createStyles = (colors: typeof lightColors) => StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 16, 
      backgroundColor: colors.background // Cor dinâmica
    },
    header: { 
      marginBottom: 16 
    },
    greeting: { 
      fontSize: 22, 
      fontWeight: 'bold', 
      color: colors.text // Cor dinâmica
    },
    balanceCard: { 
      padding: 20, 
      backgroundColor: colors.card, // Cor dinâmica
      borderRadius: 12, 
      alignItems: 'center', 
      marginBottom: 20, 
      shadowColor: "#000", 
      shadowOffset: { width: 0, height: 2 }, 
      shadowOpacity: 0.1, 
      shadowRadius: 3.84, 
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    balanceLabel: { 
      fontSize: 16, 
      color: 'gray' 
    },
    balanceValue: { 
      fontSize: 32, 
      fontWeight: 'bold', 
      marginTop: 4 
    },
    title: { 
      fontSize: 18, 
      fontWeight: 'bold', 
      marginTop: 24, 
      marginBottom: 10, 
      color: colors.text // Cor dinâmica
    },
    txItem: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: 15, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.cardBorder, // Cor dinâmica
      backgroundColor: colors.card, // Cor dinâmica
      borderRadius: 8, 
      marginBottom: 8 
    },
    txDescription: { 
      fontSize: 16, 
      fontWeight: '500',
      color: colors.text // Cor dinâmica
    },
    txCategory: { 
      fontSize: 12, 
      color: 'gray' 
    },
    txAmount: {
      fontWeight: 'bold'
    },
    button: { 
      backgroundColor: colors.tint, // Cor dinâmica
      padding: 15, 
      borderRadius: 8, 
      alignItems: 'center' 
    },
    buttonText: { 
      color: '#fff', // Texto do botão principal geralmente fica branco
      fontSize: 16, 
      fontWeight: 'bold' 
    },
    emptyText: { 
      textAlign: 'center', 
      marginTop: 20, 
      fontSize: 16, 
      color: 'gray' 
    },
});