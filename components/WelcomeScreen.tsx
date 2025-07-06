import React, { useState, useEffect, useRef } from 'react';
import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	Animated,
	Easing,
	ScrollView,
	Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WelcomeScreenProps {
	onContinue: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onContinue }) => {
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const [showAgreement, setShowAgreement] = useState(false);
	const [agreedToTerms, setAgreedToTerms] = useState(false);

	// Animation values
	const titleOpacity = useRef(new Animated.Value(0)).current;
	const titleScale = useRef(new Animated.Value(0.8)).current;
	const subtitleOpacity = useRef(new Animated.Value(0)).current;
	const gameIconRotation = useRef(new Animated.Value(0)).current;
	const gameIconScale = useRef(new Animated.Value(0)).current;
	const buttonsOpacity = useRef(new Animated.Value(0)).current;
	const buttonsTranslateY = useRef(new Animated.Value(50)).current;

	useEffect(() => {
		// Start animations sequence
		const animationSequence = Animated.sequence([
			// Game icon animation
			Animated.parallel([
				Animated.timing(gameIconScale, {
					toValue: 1,
					duration: 800,
					easing: Easing.out(Easing.back(1.7)),
					useNativeDriver: true,
				}),
				Animated.timing(gameIconRotation, {
					toValue: 1,
					duration: 1000,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
			]),

			// Title animation
			Animated.parallel([
				Animated.timing(titleOpacity, {
					toValue: 1,
					duration: 600,
					easing: Easing.out(Easing.quad),
					useNativeDriver: true,
				}),
				Animated.timing(titleScale, {
					toValue: 1,
					duration: 600,
					easing: Easing.out(Easing.back(1.5)),
					useNativeDriver: true,
				}),
			]),

			// Subtitle animation
			Animated.timing(subtitleOpacity, {
				toValue: 1,
				duration: 500,
				easing: Easing.out(Easing.quad),
				useNativeDriver: true,
			}),

			// Buttons animation
			Animated.parallel([
				Animated.timing(buttonsOpacity, {
					toValue: 1,
					duration: 600,
					easing: Easing.out(Easing.quad),
					useNativeDriver: true,
				}),
				Animated.timing(buttonsTranslateY, {
					toValue: 0,
					duration: 600,
					easing: Easing.out(Easing.back(1.5)),
					useNativeDriver: true,
				}),
			]),
		]);

		animationSequence.start();

		// Continuous rotation for the game icon
		const continuousRotation = Animated.loop(
			Animated.timing(gameIconRotation, {
				toValue: 2,
				duration: 10000,
				easing: Easing.linear,
				useNativeDriver: true,
			})
		);

		const timer = setTimeout(() => {
			continuousRotation.start();
		}, 1000);

		return () => clearTimeout(timer);
	}, [
		buttonsOpacity,
		buttonsTranslateY,
		gameIconRotation,
		gameIconScale,
		subtitleOpacity,
		titleOpacity,
		titleScale,
	]);

	const handleContinue = async () => {
		if (agreedToTerms) {
			await AsyncStorage.setItem('hasSeenWelcome', 'true');
			onContinue();
		}
	};

	const handlePrivacyPress = () => {
		setShowAgreement(true);
	};

	const rotateValue = gameIconRotation.interpolate({
		inputRange: [0, 1, 2],
		outputRange: ['0deg', '360deg', '720deg'],
	});

	return (
		<View
			style={[
				styles.container,
				{ backgroundColor: colors.background[0], paddingTop: insets.top },
			]}
		>
			<LinearGradient
				colors={colors.background}
				style={styles.gradient}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				<View style={styles.content}>
					{/* Animated Game Icon */}
					<Animated.View
						style={[
							styles.iconContainer,
							{
								opacity: gameIconScale,
								transform: [{ scale: gameIconScale }, { rotate: rotateValue }],
							},
						]}
					>
						<View style={[styles.gameIcon, { borderColor: colors.primary }]}>
							<View style={styles.grid}>
								{/* Tic Tac Toe Grid */}
								<View style={[styles.gridRow]}>
									<View
										style={[styles.gridCell, { borderColor: colors.primary }]}
									>
										<Text style={[styles.cellText, { color: colors.primary }]}>
											X
										</Text>
									</View>
									<View
										style={[styles.gridCell, { borderColor: colors.primary }]}
									>
										<Text style={[styles.cellText, { color: colors.text }]}>
											O
										</Text>
									</View>
									<View
										style={[styles.gridCell, { borderColor: colors.primary }]}
									/>
								</View>
								<View style={styles.gridRow}>
									<View
										style={[styles.gridCell, { borderColor: colors.primary }]}
									/>
									<View
										style={[styles.gridCell, { borderColor: colors.primary }]}
									>
										<Text style={[styles.cellText, { color: colors.primary }]}>
											X
										</Text>
									</View>
									<View
										style={[styles.gridCell, { borderColor: colors.primary }]}
									>
										<Text style={[styles.cellText, { color: colors.text }]}>
											O
										</Text>
									</View>
								</View>
								<View style={styles.gridRow}>
									<View
										style={[styles.gridCell, { borderColor: colors.primary }]}
									/>
									<View
										style={[styles.gridCell, { borderColor: colors.primary }]}
									/>
									<View
										style={[styles.gridCell, { borderColor: colors.primary }]}
									>
										<Text style={[styles.cellText, { color: colors.primary }]}>
											X
										</Text>
									</View>
								</View>
							</View>
						</View>
					</Animated.View>

					{/* Animated Title */}
					<Animated.View
						style={[
							styles.titleContainer,
							{
								opacity: titleOpacity,
								transform: [{ scale: titleScale }],
							},
						]}
					>
						<Text style={[styles.title, { color: colors.text }]}>
							Welcome to
						</Text>
						<Text style={[styles.gameTitle, { color: colors.primary }]}>
							Tic Tac Toe
						</Text>
					</Animated.View>

					{/* Animated Subtitle */}
					<Animated.View
						style={[styles.subtitleContainer, { opacity: subtitleOpacity }]}
					>
						<Text style={[styles.subtitle, { color: colors.cardSubtext }]}>
							Challenge yourself with the classic game!
						</Text>
						<Text style={[styles.subtitle, { color: colors.cardSubtext }]}>
							Play against AI or enjoy endless fun.
						</Text>
					</Animated.View>

					{/* Animated Buttons */}
					<Animated.View
						style={[
							styles.buttonsContainer,
							{
								opacity: buttonsOpacity,
								transform: [{ translateY: buttonsTranslateY }],
							},
						]}
					>
						{/* Terms Agreement */}
						<TouchableOpacity
							style={[styles.agreementContainer]}
							onPress={() => setAgreedToTerms(!agreedToTerms)}
							activeOpacity={0.7}
						>
							<View
								style={[
									styles.checkbox,
									{ borderColor: colors.primary },
									agreedToTerms && { backgroundColor: colors.primary },
								]}
							>
								{agreedToTerms && (
									<Ionicons name='checkmark' size={16} color='white' />
								)}
							</View>
							<View style={styles.agreementText}>
								<Text style={[styles.agreementLabel, { color: colors.text }]}>
									I agree to the{' '}
								</Text>
								<TouchableOpacity onPress={handlePrivacyPress}>
									<Text style={[styles.linkText, { color: colors.primary }]}>
										Terms of Service & Privacy Policy
									</Text>
								</TouchableOpacity>
							</View>
						</TouchableOpacity>

						{/* Continue Button */}
						<TouchableOpacity
							style={[
								styles.continueButton,
								{
									backgroundColor: agreedToTerms ? colors.primary : colors.card,
								},
								{ opacity: agreedToTerms ? 1 : 0.5 },
							]}
							onPress={handleContinue}
							disabled={!agreedToTerms}
							activeOpacity={0.8}
						>
							<Text
								style={[
									styles.continueButtonText,
									{ color: agreedToTerms ? 'white' : colors.cardSubtext },
								]}
							>
								Start Playing
							</Text>
							<Ionicons
								name='arrow-forward'
								size={20}
								color={agreedToTerms ? 'white' : colors.cardSubtext}
								style={styles.buttonIcon}
							/>
						</TouchableOpacity>
					</Animated.View>
				</View>
			</LinearGradient>

			{/* Terms & Privacy Modal */}
			<Modal
				visible={showAgreement}
				animationType='slide'
				presentationStyle='pageSheet'
			>
				<View
					style={[
						styles.modalContainer,
						{ backgroundColor: colors.background[0], paddingTop: insets.top },
					]}
				>
					<LinearGradient
						colors={colors.background}
						style={styles.modalGradient}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
					>
						<View style={styles.modalHeader}>
							<Text style={[styles.modalTitle, { color: colors.text }]}>
								Terms & Privacy
							</Text>
							<TouchableOpacity
								onPress={() => setShowAgreement(false)}
								style={[styles.closeButton, { backgroundColor: colors.card }]}
							>
								<Ionicons name='close' size={24} color={colors.text} />
							</TouchableOpacity>
						</View>

						<ScrollView
							style={styles.modalContent}
							showsVerticalScrollIndicator={false}
						>
							<View style={[styles.section, { backgroundColor: colors.card }]}>
								<Text style={[styles.sectionTitle, { color: colors.text }]}>
									Terms of Service
								</Text>
								<Text
									style={[styles.sectionText, { color: colors.cardSubtext }]}
								>
									Welcome to Tic Tac Toe! By using this app, you agree to the
									following terms:
								</Text>
								<Text
									style={[styles.bulletPoint, { color: colors.cardSubtext }]}
								>
									• This is a free game designed for entertainment purposes
								</Text>
								<Text
									style={[styles.bulletPoint, { color: colors.cardSubtext }]}
								>
									• Game statistics and achievements are stored locally on your
									device
								</Text>
								<Text
									style={[styles.bulletPoint, { color: colors.cardSubtext }]}
								>
									• We reserve the right to update the app and these terms
								</Text>
								<Text
									style={[styles.bulletPoint, { color: colors.cardSubtext }]}
								>
									• Use of the app should be in accordance with applicable laws
								</Text>
							</View>

							<View style={[styles.section, { backgroundColor: colors.card }]}>
								<Text style={[styles.sectionTitle, { color: colors.text }]}>
									Privacy Policy
								</Text>
								<Text
									style={[styles.sectionText, { color: colors.cardSubtext }]}
								>
									Your privacy is important to us. Here&apos;s how we handle
									your data:
								</Text>
								<Text
									style={[styles.bulletPoint, { color: colors.cardSubtext }]}
								>
									• No personal information is collected or transmitted
								</Text>
								<Text
									style={[styles.bulletPoint, { color: colors.cardSubtext }]}
								>
									• Game data is stored only on your local device
								</Text>
								<Text
									style={[styles.bulletPoint, { color: colors.cardSubtext }]}
								>
									• No analytics or tracking services are used
								</Text>
								<Text
									style={[styles.bulletPoint, { color: colors.cardSubtext }]}
								>
									• Audio and haptic preferences are saved locally
								</Text>
								<Text
									style={[styles.bulletPoint, { color: colors.cardSubtext }]}
								>
									• No data is shared with third parties
								</Text>
							</View>

							<View style={[styles.section, { backgroundColor: colors.card }]}>
								<Text style={[styles.sectionTitle, { color: colors.text }]}>
									Contact
								</Text>
								<Text
									style={[styles.sectionText, { color: colors.cardSubtext }]}
								>
									If you have any questions about these terms or privacy policy,
									feel free to reach out.
								</Text>
							</View>

							<View style={styles.modalBottomSpacing} />
						</ScrollView>
					</LinearGradient>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	gradient: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 30,
	},
	iconContainer: {
		marginBottom: 40,
	},
	gameIcon: {
		width: 120,
		height: 120,
		borderRadius: 30,
		borderWidth: 3,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
	},
	grid: {
		width: 80,
		height: 80,
	},
	gridRow: {
		flexDirection: 'row',
		flex: 1,
	},
	gridCell: {
		flex: 1,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cellText: {
		fontSize: 16,
		fontFamily: 'Inter_700Bold',
	},
	titleContainer: {
		alignItems: 'center',
		marginBottom: 20,
	},
	title: {
		fontSize: 28,
		fontFamily: 'Inter_400Regular',
		textAlign: 'center',
		marginBottom: 5,
	},
	gameTitle: {
		fontSize: 36,
		fontFamily: 'Inter_700Bold',
		textAlign: 'center',
	},
	subtitleContainer: {
		alignItems: 'center',
		marginBottom: 60,
	},
	subtitle: {
		fontSize: 16,
		fontFamily: 'Inter_400Regular',
		textAlign: 'center',
		lineHeight: 24,
	},
	buttonsContainer: {
		width: '100%',
		alignItems: 'center',
	},
	agreementContainer: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 30,
		width: '100%',
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
		marginTop: 2,
	},
	agreementText: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
	},
	agreementLabel: {
		fontSize: 14,
		fontFamily: 'Inter_400Regular',
		lineHeight: 20,
	},
	linkText: {
		fontSize: 14,
		fontFamily: 'Inter_600SemiBold',
		textDecorationLine: 'underline',
		lineHeight: 20,
	},
	continueButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		width: '100%',
		paddingVertical: 16,
		borderRadius: 12,
		marginTop: 10,
	},
	continueButtonText: {
		fontSize: 18,
		fontFamily: 'Inter_600SemiBold',
		marginRight: 8,
	},
	buttonIcon: {
		marginLeft: 4,
	},

	// Modal Styles
	modalContainer: {
		flex: 1,
	},
	modalGradient: {
		flex: 1,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 20,
	},
	modalTitle: {
		fontSize: 24,
		fontFamily: 'Inter_700Bold',
	},
	closeButton: {
		padding: 8,
		borderRadius: 20,
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
	},
	section: {
		borderRadius: 12,
		padding: 20,
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontFamily: 'Inter_700Bold',
		marginBottom: 12,
	},
	sectionText: {
		fontSize: 14,
		fontFamily: 'Inter_400Regular',
		lineHeight: 20,
		marginBottom: 12,
	},
	bulletPoint: {
		fontSize: 14,
		fontFamily: 'Inter_400Regular',
		lineHeight: 22,
		marginBottom: 6,
	},
	modalBottomSpacing: {
		height: 40,
	},
});

export default WelcomeScreen;
