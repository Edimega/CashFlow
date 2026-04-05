import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';

export default function GlassInput({ style, ...props }) {
	return (
		<TextInput
			style={[styles.input, style, { color: COLORS.textPrimary }]}
			placeholderTextColor={COLORS.textSecondary}
			keyboardAppearance="dark"
			autoCorrect={false}
			{...props}
		/>
	);
}

const styles = StyleSheet.create({
	input: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		borderColor: 'rgba(255,255,255,0.2)',
		borderWidth: 1,
		borderRadius: 12,
		color: COLORS.textPrimary,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		fontFamily: 'System', // Later switch to Inter/Roboto
	}
});
