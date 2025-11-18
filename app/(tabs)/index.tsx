import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Modal, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth, API_URL } from '../../context/AuthContext'; // Certifique-se que API_URL é exportado aqui
import { useTheme } from '../../context/ThemeContext';
import { lightColors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons'; // Ícone para o botão

export default function HomeScreen() {
  const router = useRouter();
  const { transactions, isLoading } = useTransactions();
  const { user, session } = useAuth();
  const { colors } = useTheme();

  // Estados para o Painel de Admin
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Criar os estilos dinâmicos
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Calcula o saldo total
  const balance = useMemo(() => {
    return transactions.reduce((acc, tx) => {
      return tx.type === 'receita' ? acc + Number(tx.amount) : acc - Number(tx.amount);
    }, 0);
  }, [transactions]);
  
  const recentTransactions = transactions.slice(0, 5);

  // --- FUNÇÃO DO ADMIN ---
  const fetchAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch(`${API_URL}/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 403) {
        Alert.alert("Acesso Negado", "Você não tem permissão de administrador.");
        return;
      }

      if (!response.ok) throw new Error("Erro ao buscar usuários");

      const data = await response.json();
      setUsersList(data);
      setAdminModalVisible(true);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar a lista de usuários.");
      console.error(error);
    } finally {
      setLoadingUsers(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user?.email.split('@')[0] || 'Usuário'}!</Text>
        {/* Mostra a Role apenas para confirmação visual (opcional) */}
        {user?.role === 'admin' && <Text style={{color: 'red', fontSize: 10, fontWeight: 'bold'}}>ADMINISTRADOR</Text>}
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

      {/* --- BOTÃO FLUTUANTE DE ADMIN (SÓ APARECE SE FOR ADMIN) --- */}
      {user?.role === 'admin' && (
        <TouchableOpacity 
          style={styles.adminFloatingButton} 
          onPress={fetchAllUsers}
          disabled={loadingUsers}
        >
          {loadingUsers ? (
             <ActivityIndicator color="#FFF" size="small" />
          ) : (
             <Ionicons name="settings-sharp" size={24} color="#FFF" />
          )}
        </TouchableOpacity>
      )}

      {/* --- MODAL DA LISTA DE USUÁRIOS --- */}
      <Modal visible={adminModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Gestão de Usuários</Text>
                <TouchableOpacity onPress={() => setAdminModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>
            
            <FlatList
              data={usersList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.userRow}>
                  <View>
                      <Text style={styles.userEmail}>{item.email}</Text>
                      <Text style={styles.userId}>ID: {item.id}</Text>
                  </View>
                  <View style={[styles.roleBadge, { backgroundColor: item.role === 'admin' ? '#ffebee' : '#e8f5e9' }]}>
                      <Text style={{ color: item.role === 'admin' ? 'red' : 'green', fontWeight: 'bold', fontSize: 12 }}>
                        {item.role.toUpperCase()}
                      </Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

// 5. Estilos atualizados
const createStyles = (colors: typeof lightColors) => StyleSheet.create({
    container: { 
      flex: 1, 
      padding: 16, 
      backgroundColor: colors.background 
    },
    header: { 
      marginBottom: 16 
    },
    greeting: { 
      fontSize: 22, 
      fontWeight: 'bold', 
      color: colors.text 
    },
    balanceCard: { 
      padding: 20, 
      backgroundColor: colors.card, 
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
      color: colors.text 
    },
    txItem: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: 15, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.cardBorder, 
      backgroundColor: colors.card, 
      borderRadius: 8, 
      marginBottom: 8 
    },
    txDescription: { 
      fontSize: 16, 
      fontWeight: '500',
      color: colors.text 
    },
    txCategory: { 
      fontSize: 12, 
      color: 'gray' 
    },
    txAmount: {
      fontWeight: 'bold'
    },
    button: { 
      backgroundColor: colors.tint, 
      padding: 15, 
      borderRadius: 8, 
      alignItems: 'center' 
    },
    buttonText: { 
      color: '#fff', 
      fontSize: 16, 
      fontWeight: 'bold' 
    },
    emptyText: { 
      textAlign: 'center', 
      marginTop: 20, 
      fontSize: 16, 
      color: 'gray' 
    },

    // --- ESTILOS NOVOS DO ADMIN ---
    adminFloatingButton: {
        position: 'absolute',
        left: 0,
        top: '50%',
        backgroundColor: '#FF453A', // Vermelho Apple
        padding: 12,
        borderTopRightRadius: 12,
        borderBottomRightRadius: 12,
        elevation: 8,
        zIndex: 999, // Fica em cima de tudo
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: colors.background,
        borderRadius: 16,
        padding: 20,
        maxHeight: '80%',
        elevation: 5
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
        paddingBottom: 10
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text
    },
    userRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder
    },
    userEmail: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500'
    },
    userId: {
        fontSize: 12,
        color: 'gray'
    },
    roleBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    }
});