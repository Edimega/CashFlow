import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import api from '../../api/api';

export default function RegisterScreen({ navigation }) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const { login } = useContext(AuthContext); // To auto-login after register

	const handleRegister = async () => {
		if (!name || !email || !password) {
			Alert.alert('Error', 'Por favor llena todos los campos');
			return;
		}
		try {
			const response = await api.post('/auth/register', {
				name,
				email,
				password,
				role: 'Standard'
			});

			// Auto-login logic
			if (response.data.token) {
				await login(email, password);
			}
		} catch (err) {
			console.error(err);
			Alert.alert('Error de Registro', err.response?.data?.message || 'Error del Servidor');
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
					<View style={styles.glowOrb1} />

					<Text style={styles.title}>Crear Cuenta</Text>
					<Text style={styles.subtitle}>Únete a CashFlow hoy</Text>

					<GlassCard style={styles.card}>
						<Text style={styles.label}>Nombre Completo</Text>
						<GlassInput
							placeholder="Juan Pérez"
							value={name}
							onChangeText={setName}
							style={styles.input}
						/>

						<Text style={styles.label}>Correo Electrónico</Text>
						<GlassInput
							placeholder="admin@cashflow.com"
							keyboardType="email-address"
							autoCapitalize="none"
							value={email}
							onChangeText={setEmail}
							style={styles.input}
						/>

						<Text style={styles.label}>Contraseña</Text>
						<GlassInput
							placeholder="••••••••"
							secureTextEntry
							value={password}
							onChangeText={setPassword}
							style={styles.input}
						/>

						<GlassButton title="Registrarse" onPress={handleRegister} style={styles.button} />

						<GlassButton
							title="Volver al Inicio"
							type="secondary"
							onPress={() => navigation.goBack()}
							style={styles.buttonSecondary}
						/>
					</GlassCard>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.background },
	container: { flex: 1, padding: 24 },
	glowOrb1: {
		position: 'absolute', width: 250, height: 250, borderRadius: 125,
		backgroundColor: COLORS.success, top: -50, right: -50, opacity: 0.3,
	},
	title: { fontSize: 40, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
	subtitle: { fontSize: 16, color: COLORS.success, textAlign: 'center', marginBottom: 40 },
	card: { paddingVertical: 32 },
	label: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8, marginLeft: 4 },
	input: { marginBottom: 20 },
	button: { marginTop: 10 },
	buttonSecondary: { marginTop: 15, borderWidth: 0, backgroundColor: 'transparent' }
});
