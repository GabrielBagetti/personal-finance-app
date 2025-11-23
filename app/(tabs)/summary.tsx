import React, {useMemo} from 'react';
import { View, Text, SectionList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTransactions, Transaction } from '../../context/TransactionContext';
import { useTheme } from '../../context/ThemeContext';
import { lightColors } from '../../constants/Colors';



const groupTransactionsByMonth = (transactions: Transaction[]) => {
  const groups = transactions.reduce((acc, transaction) => {
    const monthKey = new Date(transaction.timestamp).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    });

    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expenses: 0 };
    }

    if (transaction.type === 'receita') {
      acc[monthKey].income += Number(transaction.amount);
    } else {
      acc[monthKey].expenses += Number(transaction.amount);
    }
    
    return acc;
  }, {} as Record<string, { income: number; expenses: number }>);

  return Object.keys(groups).map(month => ({
    title: month.charAt(0).toUpperCase() + month.slice(1),
    data: [groups[month]],
  }));
};

export default function MonthlySummaryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { transactions, isLoading } = useTransactions();
  const sections = groupTransactionsByMonth(transactions);

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

const createStyles = (colors: typeof lightColors) => StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: { 
      flex: 1, 
      padding: 16, 
      backgroundColor: colors.background
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
    },
    header: { 
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: 16,
      marginBottom: 12,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.cardBorder,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    totalRow: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.cardBorder,
    },
    label: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },
    labelTotal: {
      fontSize: 14,
      color: colors.text,
      fontWeight: 'bold',
    },
    income: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    expense: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#F44336',
    },
    balance: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    emptyText: { 
      textAlign: 'center', 
      marginTop: 20, 
      fontSize: 16, 
      color: 'gray' 
    },
});