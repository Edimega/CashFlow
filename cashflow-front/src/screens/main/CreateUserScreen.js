import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, Platform, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../theme/colors';
import GlassCard from '../../components/ui/GlassCard';
import GlassInput from '../../components/ui/GlassInput';
import GlassButton from '../../components/ui/GlassButton';
import api from '../../api/api';

export default function CreateUserScreen({ navigation }) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	const handleCreateUser = async () => {
		if (!name || !email || !password) {
			Alert.alert('Error', 'Por favor llena todos los campos');
			return;
		}
		try {
			await api.post('/auth/create-user', { name, email, password });
			Alert.alert('Éxito', '¡Usuario estándar creado con éxito!');
			navigation.goBack();
		} catch (err) {
			console.error(err);
			Alert.alert('Error de Creación', err.response?.data?.message || 'Error del Servidor');
		}
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			>
				<ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>

					<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={28} color={COLORS.textPrimary} />
					</TouchableOpacity>

					<Text style={styles.title}>Crear Nuevo Usuario</Text>
					<Text style={styles.subtitle}>Asigna una cuenta estándar a tu administración</Text>

					<GlassCard style={styles.card}>
						<Text style={styles.label}>Nombre Completo</Text>
						<GlassInput
							placeholder="Ana Smith"
							value={name}
							onChangeText={setName}
							style={styles.input}
						/>

						<Text style={styles.label}>Correo Electrónico</Text>
						<GlassInput
							placeholder="ana@cashflow.com"
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

						<GlassButton title="Crear Usuario" onPress={handleCreateUser} style={styles.button} />

						<GlassButton
							title="Cancelar"
							type="danger"
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
	container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
	backButton: { marginBottom: 20, alignSelf: 'flex-start', padding: 4 },
	title: { fontSize: 32, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 5 },
	subtitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 30 },
	card: { paddingVertical: 32 },
	label: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8, marginLeft: 4 },
	input: { marginBottom: 20 },
	button: { marginTop: 10 },
	buttonSecondary: { marginTop: 15 }
});
