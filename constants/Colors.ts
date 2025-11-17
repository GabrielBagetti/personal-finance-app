// constants/Colors.ts

const tintColorLight = '#820ad1'; // Nosso roxo
const tintColorDark = '#BB86FC'; // Roxo mais claro para o escuro

export const lightColors = {
  text: '#000',
  background: '#fff',
  tint: tintColorLight,
  tabIconDefault: '#ccc',
  tabIconSelected: tintColorLight,
  card: '#f9f9f9',
  cardBorder: '#eee',
  inputBorder: '#ccc',
  success: '#2e7d32',
  error: '#c62828',
};

export const darkColors = {
  text: '#fff',
  background: '#121212', // Cor de fundo padrão do "material dark"
  tint: tintColorDark,
  tabIconDefault: '#555',
  tabIconSelected: tintColorDark,
  card: '#1E1E1E', // Um cinza um pouco mais claro que o fundo
  cardBorder: '#333',
  inputBorder: '#444',
  success: '#66bb6a', // Cores mais claras para contraste
  error: '#ef5350',
};