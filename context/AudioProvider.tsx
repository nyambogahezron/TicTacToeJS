import React, { createContext, useContext, useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioContextType {
	soundEnabled: boolean;
	hapticEnabled: boolean;
	toggleSound: () => void;
	toggleHaptic: () => void;
	playSound: (type: 'move' | 'win' | 'draw' | 'reset') => Promise<void>;
	triggerHaptic: (
		type: 'light' | 'medium' | 'heavy' | 'success' | 'error'
	) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
	const [soundEnabled, setSoundEnabled] = useState(true);
	const [hapticEnabled, setHapticEnabled] = useState(true);
	const [sounds, setSounds] = useState<Record<string, Audio.Sound>>({});

	// Load settings from storage
	useEffect(() => {
		const loadSettings = async () => {
			try {
				const soundSetting = await AsyncStorage.getItem('soundEnabled');
				const hapticSetting = await AsyncStorage.getItem('hapticEnabled');

				if (soundSetting !== null) setSoundEnabled(JSON.parse(soundSetting));
				if (hapticSetting !== null) setHapticEnabled(JSON.parse(hapticSetting));
			} catch (error) {
				console.error('Error loading audio settings:', error);
			}
		};

		loadSettings();
	}, []);

	// Load sound effects
	useEffect(() => {
		const loadSounds = async () => {
			try {
				const moveSound = await Audio.Sound.createAsync(
					require('../assets/sounds/move.mp3')
				);
				const winSound = await Audio.Sound.createAsync(
					require('../assets/sounds/win.mp3')
				);
				const drawSound = await Audio.Sound.createAsync(
					require('../assets/sounds/draw.mp3')
				);
				const resetSound = await Audio.Sound.createAsync(
					require('../assets/sounds/reset.mp3')
				);

				setSounds({
					move: moveSound.sound,
					win: winSound.sound,
					draw: drawSound.sound,
					reset: resetSound.sound,
				});
			} catch (error) {
				console.error('Error loading sounds:', error);
			}
		};

		loadSounds();

		// Cleanup
		return () => {
			Object.values(sounds).forEach((sound) => {
				sound.unloadAsync();
			});
		};
	}, []);

	const toggleSound = async () => {
		const newValue = !soundEnabled;
		setSoundEnabled(newValue);
		try {
			await AsyncStorage.setItem('soundEnabled', JSON.stringify(newValue));
		} catch (error) {
			console.error('Error saving sound setting:', error);
		}
	};

	const toggleHaptic = async () => {
		const newValue = !hapticEnabled;
		setHapticEnabled(newValue);
		try {
			await AsyncStorage.setItem('hapticEnabled', JSON.stringify(newValue));
		} catch (error) {
			console.error('Error saving haptic setting:', error);
		}
	};

	const playSound = async (type: 'move' | 'win' | 'draw' | 'reset') => {
		if (!soundEnabled || !sounds[type]) return;

		try {
			await sounds[type].setPositionAsync(0);
			await sounds[type].playAsync();
		} catch (error) {
			console.error('Error playing sound:', error);
		}
	};

	const triggerHaptic = async (
		type: 'light' | 'medium' | 'heavy' | 'success' | 'error'
	) => {
		if (!hapticEnabled) return;

		try {
			switch (type) {
				case 'light':
					await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
					break;
				case 'medium':
					await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
					break;
				case 'heavy':
					await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
					break;
				case 'success':
					await Haptics.notificationAsync(
						Haptics.NotificationFeedbackType.Success
					);
					break;
				case 'error':
					await Haptics.notificationAsync(
						Haptics.NotificationFeedbackType.Error
					);
					break;
			}
		} catch (error) {
			console.error('Error triggering haptic:', error);
		}
	};

	return (
		<AudioContext.Provider
			value={{
				soundEnabled,
				hapticEnabled,
				toggleSound,
				toggleHaptic,
				playSound,
				triggerHaptic,
			}}
		>
			{children}
		</AudioContext.Provider>
	);
}

export const useAudio = () => {
	const context = useContext(AudioContext);
	if (!context) {
		throw new Error('useAudio must be used within AudioProvider');
	}
	return context;
};
