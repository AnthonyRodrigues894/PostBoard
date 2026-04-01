import React, { useRef, useLayoutEffect, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, KeyboardAvoidingView,
  Platform, Alert, ActivityIndicator,
} from 'react-native';
import { criarPost, atualizarPost } from '../services/api';
import { remover, CHAVES }          from '../storage/cache';
import useFormulario, { REGRAS }    from '../hooks/useFormulario';
import CampoTexto                   from '../components/CampoTexto';
import SeletorAutor                 from '../components/SeletorAutor';
 
// ── Configuração de validação ────────────────────────────
const CAMPOS_INICIAIS = { titulo: '', corpo: '', autorId: null };
 
const REGRAS_VALIDACAO = {
  titulo: [
    REGRAS.obrigatorio,
    REGRAS.semEspacoInicial,
    REGRAS.minimo(5),
    REGRAS.maximo(100),
  ],
  corpo: [
    REGRAS.obrigatorio,
    REGRAS.minimo(10),
    REGRAS.maximo(500),
  ],
  autorId: [
    (valor) => (!valor ? 'Selecione um autor.' : null),
  ],
};
 
export default function FormularioScreen({ navigation, route }) {
  // Se route.params.post existir, estamos em modo edição
  const postParaEditar = route?.params?.post || null;
  const modoEdicao     = !!postParaEditar;
 
  const form = useFormulario(CAMPOS_INICIAIS, REGRAS_VALIDACAO);
 
  // Ref para navegar entre campos com o teclado
  const refCorpo = useRef(null);
 
  // ── Modo edição: preenche o formulário com dados existentes
  useEffect(() => {
    if (modoEdicao) {
      form.preencher({
        titulo:  postParaEditar.title,
        corpo:   postParaEditar.body,
        autorId: postParaEditar.userId,
      });
    }
  }, []);
 
  // ── Título dinâmico no header ─────────────────────────
  useLayoutEffect(() => {
    navigation.setOptions({
      title: modoEdicao ? `Editar Post #${postParaEditar.id}` : 'Novo Post',
    });
  }, [navigation, modoEdicao]);
 
  // ── Submissão do formulário ───────────────────────────
  async function handleSubmit() {
    // 1. Valida todos os campos antes de enviar
    const valido = form.validarTudo();
    if (!valido) {
      Alert.alert(
        'Formulário inválido',
        'Corrija os campos destacados em vermelho antes de continuar.'
      );
      return;
    }
 
    try {
      // 2. Monta o payload da requisição
      const payload = {
        title:  form.valores.titulo.trim(),
        body:   form.valores.corpo.trim(),
        userId: form.valores.autorId,
      };
 
      // 3. Chama a API conforme o modo
      if (modoEdicao) {
        await atualizarPost(postParaEditar.id, payload);
      } else {
        await criarPost(payload);
      }
 
      // 4. Invalida o cache da lista para forçar atualização
      await remover(CHAVES.POSTS);
      if (modoEdicao) {
        await remover(CHAVES.POST(postParaEditar.id));
      }
 
      // 5. Confirma e navega de volta
      Alert.alert(
        'Sucesso! ✓',
        modoEdicao ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!',
        [{
          text: 'OK',
          onPress: () => {
            form.resetar();
            navigation.goBack();
          }
        }]
      );
 
    } catch (e) {
      Alert.alert('Erro ao salvar', e.message || 'Tente novamente em instantes.');
    }
  }
 
  return (
    // KeyboardAvoidingView empurra o conteúdo para cima
    // quando o teclado abre, evitando que ele cubra os campos
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho informativo */}
        <View style={styles.cabecalho}>
          <Text style={styles.cabTitulo}>
            {modoEdicao ? '✏️  Editar publicação' : '📝  Nova publicação'}
          </Text>
          <Text style={styles.cabSub}>
            Campos marcados com * são obrigatórios
          </Text>
        </View>
 
        {/* Campo título */}
        <CampoTexto
          label="Título"
          obrigatorio
          valor={form.valores.titulo}
          onMudar={(v) => form.definir('titulo', v)}
          onSairFoco={() => form.tocar('titulo')}
          erro={form.erros.titulo}
          placeholder="Ex: Minha primeira publicação"
          autoCapitalize="sentences"
          returnKeyType="next"
          proximoCampo={refCorpo}
          maxLength={100}
        />
 
        {/* Contador de caracteres do título */}
        <Text style={styles.contador}>
          {form.valores.titulo.length}/100
        </Text>
 
        {/* Campo corpo */}
        <CampoTexto
          ref={refCorpo}
          label="Conteúdo"
          obrigatorio
          valor={form.valores.corpo}
          onMudar={(v) => form.definir('corpo', v)}
          onSairFoco={() => form.tocar('corpo')}
          erro={form.erros.corpo}
          placeholder="Escreva o conteúdo do post aqui..."
          multiline
          numberOfLines={6}
          ultimoCampo
          style={{ minHeight: 120, textAlignVertical: 'top' }}
          maxLength={500}
        />
 
        {/* Contador de caracteres do corpo */}
        <Text style={styles.contador}>
          {form.valores.corpo.length}/500
        </Text>
 
        {/* Seletor de autor */}
        <SeletorAutor
          autorId={form.valores.autorId}
          onSelecionar={(usuario) => {
            form.definir('autorId', usuario.id);
            form.tocar('autorId');
          }}
          erro={form.erros.autorId}
        />
 
        {/* Botão de envio */}
        <TouchableOpacity
          style={[
            styles.botaoSalvar,
            form.temErros && styles.botaoComErros,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.botaoTexto}>
            {modoEdicao ? '💾  Salvar alterações' : '🚀  Publicar post'}
          </Text>
        </TouchableOpacity>
 
        {/* Botão cancelar */}
        <TouchableOpacity
          style={styles.botaoCancelar}
          onPress={() => {
            if (form.valores.titulo || form.valores.corpo) {
              Alert.alert(
                'Descartar alterações?',
                'As alterações não salvas serão perdidas.',
                [
                  { text: 'Continuar editando', style: 'cancel' },
                  { text: 'Descartar', style: 'destructive',
                    onPress: () => { form.resetar(); navigation.goBack(); }
                  },
                ]
              );
            } else {
              navigation.goBack();
            }
          }}
        >
          <Text style={styles.cancelarTexto}>Cancelar</Text>
        </TouchableOpacity>
 
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
 
const styles = StyleSheet.create({
  scroll:      { flex: 1, backgroundColor: '#f3f4f6' },
  conteudo:    { padding: 20 },
  cabecalho:   { marginBottom: 28 },
  cabTitulo:   { fontSize: 20, fontWeight: '700', color: '#1e3a5f', marginBottom: 4 },
  cabSub:      { fontSize: 13, color: '#9ca3af' },
  contador:    { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: -16, marginBottom: 16 },
  botaoSalvar: {
    backgroundColor: '#1a56db', borderRadius: 12,
    padding: 17, alignItems: 'center', marginBottom: 12,
  },
  botaoComErros: { backgroundColor: '#6b7280' },
  botaoTexto:    { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  botaoCancelar: {
    borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 12,
    padding: 15, alignItems: 'center',
  },
  cancelarTexto: { color: '#6b7280', fontSize: 15, fontWeight: '600' },
});
