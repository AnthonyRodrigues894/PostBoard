import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, Button
} from 'react-native';

import { getPostsPaginados } from '../services/api';
import PostCard from '../components/PostCard';
import LoadingIndicator from '../components/LoadingIndicator';
import EmptyState from '../components/EmptyState';

export default function FeedScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 paginação
  const [page, setPage] = useState(1);
  const [carregandoMais, setCarregandoMais] = useState(false);

  // Botão '+' no header
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
    carregarPostsInicial();
  }, []);

  // ✅ Carregamento inicial
  async function carregarPostsInicial() {
    try {
      setLoading(true);
      setErro(null);

      const dados = await getPostsPaginados(1, 10);

      setPosts(dados);
      setPage(2);

      // ✅ Exercício 2 — contador no header
      navigation.setOptions({
        title: `PostBoard (${dados.length})`
      });

    } catch (e) {
      setErro('Não foi possível carregar os posts.\nVerifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }

  // ✅ Exercício 5 — carregar mais
  async function carregarMais() {
    try {
      setCarregandoMais(true);

      const novosDados = await getPostsPaginados(page, 10);

      const atualizados = [...posts, ...novosDados];

      setPosts(atualizados);
      setPage(page + 1);

      // Atualiza contador
      navigation.setOptions({
        title: `PostBoard (${atualizados.length})`
      });

    } catch (e) {
      console.warn(e);
    } finally {
      setCarregandoMais(false);
    }
  }

  // Pull-to-refresh
  async function onRefresh() {
    try {
      setRefreshing(true);
      setErro(null);

      const dados = await getPostsPaginados(1, 10);

      setPosts(dados);
      setPage(2);

      navigation.setOptions({
        title: `PostBoard (${dados.length})`
      });

    } catch (e) {
      setErro('Erro ao atualizar.');
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return <LoadingIndicator mensagem="Carregando posts..." />;
  }

  if (erro && posts.length === 0) {
    return (
      <EmptyState
        icone="⚠️"
        titulo="Ops! Algo deu errado"
        mensagem={erro}
        textoBotao="Tentar novamente"
        onBotao={carregarPostsInicial}
      />
    );
  }

  return (
    <View style={styles.container}>
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
            mensagem="A lista está vazia no momento."
          />
        }

        // 🔥 BOTÃO PAGINAÇÃO
        ListFooterComponent={
          <View style={{ padding: 16 }}>
            <Button
              title={carregandoMais ? 'Carregando...' : 'Carregar mais'}
              onPress={carregarMais}
              disabled={carregandoMais}
            />
          </View>
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
        ItemSeparatorComponent={() => <View style={styles.separador} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  lista: {
    padding: 16,
    paddingBottom: 32,
  },
  listaVazia: {
    flex: 1,
    justifyContent: 'center',
  },
  separador: {
    height: 12,
  },
});