import React, { createContext, useState, useContext, ReactNode } from 'react';
import { TRANSACTIONS as initialTransactions, TRANSACTIONS } from '../data/mockData.js';

interface TransactionContextType {
  transactions: typeof TRANSACTIONS;
  addTransaction: (transaction: Omit<typeof TRANSACTIONS[number], 'id' | 'timestamp'>) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<typeof TRANSACTIONS>(initialTransactions);

  const addTransaction = (newTransactionData: Omit<typeof TRANSACTIONS[number], 'id' | 'timestamp'>) => {
    const newTransaction: typeof TRANSACTIONS[number] = {
      ...newTransactionData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prevTransactions =>
      prevTransactions.filter(transaction => transaction.id !== id)
    );
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, deleteTransaction }}>
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