import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
 
export default function FeedScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Feed de Posts</Text>
      <Text style={styles.subtitulo}>
        Aqui aparecerá a lista de posts da API.
      </Text>
 
      {/* Botão temporário para testar a navegação */}
      <TouchableOpacity
        style={styles.botao}
        onPress={() => navigation.navigate('Detalhes', { postId: 1 })}
      >
        <Text style={styles.textoBotao}>Ver detalhe do post 1</Text>
      </TouchableOpacity>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8 },
  subtitulo: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
  botao: { backgroundColor: '#1a56db', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 8 },
  textoBotao: { color: '#fff', fontSize: 15, fontWeight: '600' },
});