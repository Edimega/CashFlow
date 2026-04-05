import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS } from '../../theme/colors';

export default function GlassCard({ children, style, intensity = 20 }) {
	return (
		<View style={[styles.container, style]}>
			<BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
			{children}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: COLORS.surface,
		borderColor: COLORS.surfaceBorder,
		borderWidth: 1,
		borderRadius: 16,
		overflow: 'hidden',
		padding: 16,
	}
});
