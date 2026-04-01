import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
 
export default function BannerOffline() {
  const [conectado, setConectado] = useState(true);
  const [visivel, setVisivel]     = useState(false);
  const opacidade = useState(new Animated.Value(0))[0];
 
  useEffect(() => {
    // Assina eventos de mudança de conectividade
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable !== false;
      setConectado(online);
    });
 
    // Cancela a assinatura ao desmontar o componente
    return unsubscribe;
  }, []);
 
  useEffect(() => {
    if (!conectado) {
      // Ficou offline: mostra o banner com animação
      setVisivel(true);
      Animated.timing(opacidade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Voltou online: esconde o banner com fade-out
      Animated.timing(opacidade, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisivel(false));
    }
  }, [conectado]);
 
  if (!visivel) return null;
 
  return (
    <Animated.View style={[styles.banner, { opacity: opacidade }]}>
      <Text style={styles.texto}>
        📡  Sem conexão com a internet
      </Text>
    </Animated.View>
  );
}
 
const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1e3a5f',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  texto: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
});
