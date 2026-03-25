import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
 
export default function DetalhesScreen({ navigation, route }) {
  // 'route.params' contém os parâmetros passados por quem navegou até aqui
  const { postId } = route.params;
 
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Detalhes do Post</Text>
      <Text style={styles.info}>Post ID recebido: {postId}</Text>
      <Text style={styles.subtitulo}>
        Aqui aparecerão os dados completos do post.
      </Text>
 
      <TouchableOpacity
        style={styles.botao}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.textoBotao}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6',
    alignItems: 'center', justifyContent: 'center', padding: 24 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#1e3a5f', marginBottom: 8 },
  info: { fontSize: 18, color: '#1a56db', fontWeight: '600', marginBottom: 12 },
  subtitulo: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 32 },
  botao: { backgroundColor: '#6b7280', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 8 },
  textoBotao: { color: '#fff', fontSize: 15, fontWeight: '600' },
});

