import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';

import { getUsuarioPorId, deletarPost } from '../services/api';
import LoadingIndicator from '../components/LoadingIndicator';

export default function DetalhesScreen({ navigation, route }) {

  const { post } = route.params;

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState(false);

  // ✅ NOVO (Exercício 4)
  const [erroAutor, setErroAutor] = useState(false);

  // Header
  useLayoutEffect(() => {
    navigation.setOptions({ title: `Post #${post.id}` });
  }, [navigation, post.id]);

  // Buscar autor
  useEffect(() => {
    async function carregarAutor() {
      try {
        const dados = await getUsuarioPorId(post.userId);
        setUsuario(dados);
      } catch (e) {
        console.warn('Não foi possível carregar o autor:', e.message);
        setErroAutor(true); // ✅ erro visual
      } finally {
        setLoading(false);
      }
    }

    carregarAutor();
  }, [post.userId]);

  // Confirmar exclusão
  function confirmarDelecao() {
    Alert.alert(
      'Excluir post',
      `Deseja excluir o post "${post.title.substring(0, 40)}..."?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: executarDelecao },
      ]
    );
  }

  async function executarDelecao() {
    try {
      setDeletando(true);
      await deletarPost(post.id);

      Alert.alert('Sucesso', 'Post excluído com sucesso!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (e) {
      Alert.alert('Erro', 'Não foi possível excluir o post.');
    } finally {
      setDeletando(false);
    }
  }

  if (loading) {
    return <LoadingIndicator mensagem="Carregando autor..." />;
  }

  return (
    <ScrollView style={styles.container}>

      {/* Post */}
      <View style={styles.card}>
        <Text style={styles.titulo}>{post.title}</Text>
        <Text style={styles.corpo}>{post.body}</Text>
      </View>

      {/* ✅ ERRO VISUAL (Exercício 4) */}
      {erroAutor && (
        <View style={styles.erroBox}>
          <Text style={styles.erroTexto}>
            ⚠️ Não foi possível carregar as informações do autor.
          </Text>
        </View>
      )}

      {/* Autor */}
      {usuario && (
        <View style={styles.autorCard}>
          <Text style={styles.autorLabel}>Autor</Text>
          <Text style={styles.autorNome}>{usuario.name}</Text>
          <Text style={styles.autorInfo}>✉️ {usuario.email}</Text>
          <Text style={styles.autorInfo}>🌐 {usuario.website}</Text>
          <Text style={styles.autorInfo}>
            🏢 {usuario.company.name}
          </Text>
        </View>
      )}

      {/* Ações */}
      <View style={styles.acoes}>

        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => navigation.navigate('FormularioTab', { post })}
        >
          <Text style={styles.textoBotao}>✏️ Editar post</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botaoExcluir,
            deletando && styles.botaoDesabilitado
          ]}
          onPress={confirmarDelecao}
          disabled={deletando}
        >
          <Text style={styles.textoBotao}>
            {deletando ? 'Excluindo...' : '🗑️ Excluir post'}
          </Text>
        </TouchableOpacity>

      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a5f',
    textTransform: 'capitalize',
    marginBottom: 16,
    lineHeight: 28,
  },

  corpo: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24
  },

  // ✅ estilo do erro
  erroBox: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },

  erroTexto: {
    color: '#92400e',
    fontSize: 13,
    fontWeight: '500'
  },

  autorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1a56db',
  },

  autorLabel: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6
  },

  autorNome: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: 8
  },

  autorInfo: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4
  },

  acoes: {
    gap: 12
  },

  botaoEditar: {
    backgroundColor: '#1a56db',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },

  botaoExcluir: {
    backgroundColor: '#dc2626',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },

  botaoDesabilitado: {
    opacity: 0.6
  },

  textoBotao: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700'
  },
});