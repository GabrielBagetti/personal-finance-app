import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { CATEGORIES } from '../data/mockData.js';

export default function CategoriesScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemText}>{item.name}</Text>
            </View>
          )}
          ListHeaderComponent={<Text style={styles.mainTitle}>Categorias</Text>}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, paddingHorizontal: 16 },
  mainTitle: { fontSize: 24, fontWeight: 'bold', paddingVertical: 16 },
  item: { backgroundColor: '#f9f9f9', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 16 },
});