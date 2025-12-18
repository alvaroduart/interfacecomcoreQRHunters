import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';

interface UpdateScreenProps {
    onFinish: () => void;
}

export default function UpdateScreen({ onFinish }: UpdateScreenProps) {
    const [status, setStatus] = useState('Verificando atualizações...');
    const [isUpdating, setIsUpdating] = useState(true);

    useEffect(() => {
        checkForUpdates();
    }, []);

    async function checkForUpdates() {
        try {
            // Verificar se estamos em modo de desenvolvimento
            if (__DEV__) {
                console.log('[UpdateScreen] Modo de desenvolvimento - pulando verificação de updates');
                setStatus('Modo de desenvolvimento');
                setTimeout(onFinish, 1000);
                return;
            }

            // Verificar se há atualizações disponíveis
            setStatus('Verificando atualizações...');
            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                setStatus('Baixando atualização...');
                await Updates.fetchUpdateAsync();

                setStatus('Aplicando atualização...');
                await Updates.reloadAsync();
            } else {
                setStatus('App atualizado!');
                setTimeout(onFinish, 500);
            }
        } catch (error) {
            console.error('[UpdateScreen] Erro ao verificar atualizações:', error);
            setStatus('Erro ao verificar atualizações');
            // Continuar mesmo com erro
            setTimeout(onFinish, 1000);
        }
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>{status}</Text>
            {__DEV__ && (
                <Text style={styles.devText}>
                    Expo Updates não funciona em modo dev
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    statusText: {
        marginTop: 16,
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    devText: {
        marginTop: 8,
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
    },
});
