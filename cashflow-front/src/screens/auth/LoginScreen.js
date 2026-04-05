import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';

export default function LoginScreen({ navigation }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const { login } = useContext(AuthContext);

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert('Error', 'Por favor llena todos los campos');
			return;
		}
		const result = await login(email, password);
		if (!result.success) {
			Alert.alert('Error de Inicio', result.message);
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<View style={styles.glowOrb1} />
				<View style={styles.glowOrb2} />

				<Text style={styles.title}>CashFlow</Text>
				<Text style={styles.subtitle}>Gestión Premium</Text>

				<GlassCard style={styles.card}>
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

					<GlassButton title="Iniciar Sesión" onPress={handleLogin} style={styles.button} />

					<GlassButton
						title="Crear Cuenta"
						type="secondary"
						onPress={() => navigation.navigate('Register')}
						style={{ marginTop: 15, borderWidth: 0, backgroundColor: 'transparent' }}
					/>
				</GlassCard>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: { flex: 1, backgroundColor: COLORS.background },
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 24,
	},
	glowOrb1: {
		position: 'absolute',
		width: 200,
		height: 200,
		borderRadius: 100,
		backgroundColor: COLORS.primaryGlow,
		top: -50,
		left: -50,
		opacity: 0.6,
	},
	glowOrb2: {
		position: 'absolute',
		width: 250,
		height: 250,
		borderRadius: 125,
		backgroundColor: 'rgba(255, 0, 127, 0.2)', // Pink glow
		bottom: -50,
		right: -50,
		opacity: 0.5,
	},
	title: {
		fontSize: 48,
		fontWeight: '800',
		color: COLORS.textPrimary,
		textAlign: 'center',
		letterSpacing: 1,
	},
	subtitle: {
		fontSize: 18,
		color: Object.assign({}, COLORS).primary,
		textAlign: 'center',
		marginBottom: 40,
		fontWeight: '600',
		letterSpacing: 2,
	},
	card: {
		paddingVertical: 32,
	},
	label: {
		color: COLORS.textSecondary,
		fontSize: 14,
		marginBottom: 8,
		marginLeft: 4,
		fontWeight: '500',
	},
	input: {
		marginBottom: 20,
	},
	button: {
		marginTop: 10,
	}
});
