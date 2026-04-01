import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';

import { getUsuarioPorId, deletarPost } from '../services/api';
import LoadingIndicator from '../components/LoadingIndicator';

// ✅ CACHE
import { salvar, ler, lerMesmoExpirado, CHAVES } from '../storage/cache';

export default function DetalhesScreen({ navigation, route }) {

  const { post: postParam } = route.params;

  const [post, setPost] = useState(postParam); // ✅ novo estado
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletando, setDeletando] = useState(false);
  const [erroAutor, setErroAutor] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ title: `Post #${post.id}` });
  }, [navigation, post.id]);

  // ✅ CACHE DO POST (NOVO)
  useEffect(() => {
    async function carregarPost() {
      const chavePost = CHAVES.POST(postParam.id);

      try {
        // 1️⃣ tenta cache válido
        const cachePost = await ler(chavePost);

        if (cachePost) {
          setPost(cachePost);
          return;
        }

        // 2️⃣ usa fallback da navegação
        setPost(postParam);

        // salva no cache
        await salvar(chavePost, postParam);

      } catch (e) {
        // 3️⃣ tenta cache expirado
        const cacheAntigo = await lerMesmoExpirado(chavePost);

        if (cacheAntigo) {
          setPost(cacheAntigo);
        }
      }
    }

    carregarPost();
  }, [postParam]);

  // ✅ CACHE DO AUTOR (já estava certo)
  useEffect(() => {
    async function carregarAutor() {
      const chaveUsuario = CHAVES.USUARIO(post.userId);

      try {
        const cacheUsuario = await ler(chaveUsuario);

        if (cacheUsuario) {
          setUsuario(cacheUsuario);
          setLoading(false);
          return;
        }

        const dados = await getUsuarioPorId(post.userId);
        setUsuario(dados);
        await salvar(chaveUsuario, dados);

      } catch (e) {
        const cacheAntigo = await lerMesmoExpirado(chaveUsuario);

        if (cacheAntigo) {
          setUsuario(cacheAntigo);
        } else {
          console.warn('Autor indisponível:', e.message);
          setErroAutor(true);
        }

      } finally {
        setLoading(false);
      }
    }

    carregarAutor();
  }, [post.userId]);

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
    return <LoadingIndicator mensagem="Carregando..." />;
  }

  return (
    <ScrollView style={styles.container}>

      {/* Post */}
      <View style={styles.card}>
        <Text style={styles.titulo}>{post.title}</Text>
        <Text style={styles.corpo}>{post.body}</Text>
      </View>

      {/* Erro */}
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