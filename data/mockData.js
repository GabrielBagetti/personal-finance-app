export const CATEGORIES = [
  { id: '1', name: 'Alimentação' },
  { id: '2', name: 'Transporte' },
  { id: '3', name: 'Lazer' },
  { id: '4', name: 'Salário' },
  { id: '5', name: 'Moradia' },
];

export const TRANSACTIONS = [
  { id: '1', description: 'Salário Mensal', amount: 5000, type: 'receita', category: 'Salário', timestamp: new Date('2025-09-01T09:00:00') },
  { id: '2', description: 'Aluguel', amount: 1500, type: 'despesa', category: 'Moradia', timestamp: new Date('2025-09-05T10:00:00') },
  { id: '3', description: 'Supermercado', amount: 450, type: 'despesa', category: 'Alimentação', timestamp: new Date('2025-09-10T18:30:00') },
];