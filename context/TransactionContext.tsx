import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth, API_URL } from './AuthContext';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  timestamp: Date;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isLoading: boolean;
  clearTransactions: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth(); 

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!session) {
        setTransactions([]);
        return;
      }
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/transactions`, {
          headers: {
            'Authorization': `Bearer ${session}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          const formattedData = data.map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp)
          }));
          setTransactions(formattedData);
        } else {
          console.error('Falha ao buscar transações:', data.error);
        }
      } catch (e) {
        console.error('Erro de rede ao buscar transações:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [session]);

  
  const addTransaction = async (newTransactionData: Omit<Transaction, 'id' | 'timestamp'>) => {
    if (!session) return; 
    try {
        console.log('[CONTEXT] Enviando nova transação para a API:', newTransactionData);
        const response = await fetch(`${API_URL}/transactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session}`,
            },
            body: JSON.stringify(newTransactionData),
        });
        const addedTxFromDB = await response.json(); 
        if (response.ok) {
          console.log('[CONTEXT] Transação salva com sucesso no DB:', addedTxFromDB);
          const formattedTx = { ...addedTxFromDB, timestamp: new Date(addedTxFromDB.timestamp) };
          setTransactions(prev => [formattedTx, ...prev]);
        } else {
          console.error('[CONTEXT] Erro da API ao salvar:', addedTxFromDB.error);
        }
    } catch (e) {
        console.error('[CONTEXT] Erro de rede ao adicionar transação:', e);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!session) return;
    try {
        await fetch(`${API_URL}/transactions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${session}` },
        });
        setTransactions(prev => prev.filter(tx => tx.id.toString() !== id));
    } catch(e) {
        console.error('Erro ao deletar transação:', e);
    }
  };

  const clearTransactions = () => {
    setTransactions([]);
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction, isLoading, clearTransactions }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};