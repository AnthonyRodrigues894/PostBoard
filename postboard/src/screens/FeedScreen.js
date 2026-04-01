import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';

import { getPosts } from '../services/api';
import { salvar, lerMesmoExpirado, CHAVES, lerComInfo } from '../storage/cache';

import PostCard from '../components/PostCard';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';

export default function FeedScreen({ navigation }) {

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fonteOffline, setFonteOffline] = useState(false);

  const [tempoAtualizacao, setTempoAtualizacao] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('FormularioTab')}
          style={{ marginRight: 4, padding: 4 }}
        >
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '300' }}>+</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    carregarPosts();
  }, []);

  // ── Calcula tempo ─────────────────────────────
  function calcularTempo(ms) {
    const minutos = Math.floor(ms / 60000);

    if (minutos < 1) return 'Agora mesmo';
    if (minutos === 1) return '1 minuto atrás';

    return `${minutos} minutos atrás`;
  }

  // ── CACHE-FIRST ─────────────────────────────
  async function carregarPosts() {
    try {
      setLoading(true);
      setErro(null);

      // 1️⃣ CACHE (com timestamp)
      const cache = await lerComInfo(CHAVES.POSTS);

      if (cache) {
        setPosts(cache.dados);

        const diff = Date.now() - cache.timestamp;
        setTempoAtualizacao(calcularTempo(diff));

        setFonteOffline(false);
        setLoading(false);
        return;
      }

      // 2️⃣ API
      const dados = await getPosts();
      setPosts(dados);

      await salvar(CHAVES.POSTS, dados);

      setTempoAtualizacao('Agora mesmo');
      setFonteOffline(false);

    } catch (e) {

      // 3️⃣ CACHE EXPIRADO
      const cacheAntigo = await lerMesmoExpirado(CHAVES.POSTS);

      if (cacheAntigo) {
        setPosts(cacheAntigo);

        // como não temos timestamp aqui, mostramos genérico
        setTempoAtualizacao('Dados antigos');

        setFonteOffline(true);
      } else {
        setErro('Sem conexão e sem dados em cache.\nVerifique sua internet.');
      }

    } finally {
      setLoading(false);
    }
  }

  // ── REFRESH ─────────────────────────────
  async function onRefresh() {
    try {
      setRefreshing(true);
      setErro(null);

      const dados = await getPosts();
      setPosts(dados);

      await salvar(CHAVES.POSTS, dados);

      setTempoAtualizacao('Agora mesmo');
      setFonteOffline(false);

    } catch (e) {
      setErro('Não foi possível atualizar. Verifique sua conexão.');
    } finally {
      setRefreshing(false);
    }
  }

  // ── LOADING ─────────────────────────────
  if (loading) {
    return <LoadingIndicator mensagem="Carregando posts..." />;
  }

  // ── ERRO ─────────────────────────────
  if (erro && posts.length === 0) {
    return (
      <EmptyState
        icone="⚠️"
        titulo="Ops! Algo deu errado"
        mensagem={erro}
        textoBotao="Tentar novamente"
        onBotao={carregarPosts}
      />
    );
  }

  // ── UI ─────────────────────────────
  return (
    <View style={styles.container}>

      {/* Banner offline */}
      {fonteOffline && (
        <View style={styles.bannerOffline}>
          <Text style={styles.bannerTexto}>
            📡 Sem internet — exibindo dados salvos anteriormente
          </Text>
        </View>
      )}

      {/* Tempo do cache */}
      {tempoAtualizacao && (
        <Text style={styles.cacheInfo}>
          🕒 Atualizado: {tempoAtualizacao}
        </Text>
      )}

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onPress={() => navigation.navigate('Detalhes', { post: item })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icone="📭"
            titulo="Nenhum post encontrado"
            mensagem="A lista está vazia."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1a56db']}
            tintColor="#1a56db"
          />
        }
        contentContainerStyle={
          posts.length === 0 ? styles.listaVazia : styles.lista
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },

  lista: { padding: 16, paddingBottom: 32 },

  listaVazia: { flex: 1, justifyContent: 'center' },

  bannerOffline: {
    backgroundColor: '#fef3c7',
    borderBottomWidth: 1,
    borderBottomColor: '#fcd34d',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  bannerTexto: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },

  cacheInfo: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 6,
  },
});