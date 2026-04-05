import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

export default function GlassButton({ title, onPress, type = 'primary', style }) {
	const getBackgroundColor = () => {
		switch (type) {
			case 'primary': return COLORS.primaryGlow;
			case 'danger': return 'rgba(255, 77, 77, 0.3)';
			default: return 'rgba(255, 255, 255, 0.1)';
		}
	};

	const getBorderColor = () => {
		switch (type) {
			case 'primary': return COLORS.primary;
			case 'danger': return COLORS.danger;
			default: return 'rgba(255, 255, 255, 0.3)';
		}
	};

	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.7}
			style={[
				styles.button,
				{ backgroundColor: getBackgroundColor(), borderColor: getBorderColor() },
				style
			]}
		>
			<Text style={[styles.text, type === 'primary' && { color: COLORS.primary }]}>
				{title}
			</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	button: {
		borderWidth: 1,
		borderRadius: 12,
		paddingVertical: 14,
		paddingHorizontal: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		color: COLORS.textPrimary,
		fontSize: 16,
		fontWeight: '600',
		fontFamily: 'System',
	}
});
