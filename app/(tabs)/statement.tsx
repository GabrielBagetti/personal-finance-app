import React, {useMemo} from 'react';
import { View, Text, SectionList, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useTransactions, Transaction } from '../../context/TransactionContext'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext'; // 1. Importar o Tema
import { lightColors } from '../../constants/Colors';


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


  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);


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
        <Text style={styles.title}>Extrato Completo</Text>
        
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

const createStyles = (colors: typeof lightColors) => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background // Cor dinâmica
    },
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
    txAmountIncome: {
      fontWeight: 'bold',
      color: '#2ecc71', // Green for income
    },
    txAmountExpense: {
      fontWeight: 'bold',
      color: '#e74c3c', // Red for expense
    },
    txDetails: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    txRightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
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