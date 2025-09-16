// navigation/types.ts
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { StackScreenProps } from '@react-navigation/stack';

// Tipos para as rotas da navegação de pilha principal
export type RootStackParamList = {
  Main: undefined; // A rota 'Main' não recebe parâmetros
  AddTransaction: undefined;
  Categories: undefined;
};

// Tipos para as rotas da navegação por abas
export type MainTabParamList = {
  Início: undefined;
  Extrato: undefined;
  Resumo: undefined;
  Perfil: undefined;
};

// Tipos das props para as telas da pilha
export type RootStackScreenProps<T extends keyof RootStackParamList> = StackScreenProps<RootStackParamList, T>;

// Tipos das props para as telas das abas
export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<MainTabParamList, T>;