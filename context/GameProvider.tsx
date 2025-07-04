import React, {
	createContext,
	useContext,
	useReducer,
	ReactNode,
	useEffect,
	useState,
} from 'react';
import {
	getCoins,
	updateCoins,
	getStats,
	updateStats,
	getWelcomeBonusStatus,
	setWelcomeBonusGiven,
} from '@/services/database';

type Player = 'X' | 'O' | null;
type GameMode = 'vsAI' | 'vsPlayer';

interface GameState {
	board: Player[];
	currentPlayer: Player;
	winner: Player | 'draw' | null;
	gameMode: GameMode;
	score: {
		X: number;
		O: number;
		draws: number;
	};
	isGameActive: boolean;
	coins: number;
	consecutiveWins: number;
	isFirstTime: boolean;
}

type GameAction =
	| { type: 'MAKE_MOVE'; index: number }
	| { type: 'RESET_GAME' }
	| { type: 'SET_GAME_MODE'; mode: GameMode }
	| { type: 'AI_MOVE'; index: number }
	| { type: 'INITIALIZE_COINS' }
	| { type: 'SET_STATS'; stats: { X: number; O: number; draws: number } }
	| { type: 'SET_COINS'; coins: number }
	| { type: 'SET_FIRST_TIME'; isFirstTime: boolean };

const initialState: GameState = {
	board: Array(9).fill(null),
	currentPlayer: 'X',
	winner: null,
	gameMode: 'vsAI',
	score: { X: 0, O: 0, draws: 0 },
	isGameActive: true,
	coins: 0,
	consecutiveWins: 0,
	isFirstTime: true,
};

const GameContext = createContext<{
	state: GameState;
	dispatch: React.Dispatch<GameAction>;
} | null>(null);

const checkWinner = (board: Player[]): Player | 'draw' | null => {
	const winPatterns = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8], // rows
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8], // columns
		[0, 4, 8],
		[2, 4, 6], // diagonals
	];

	for (const pattern of winPatterns) {
		const [a, b, c] = pattern;
		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			return board[a];
		}
	}

	if (board.every((cell) => cell !== null)) {
		return 'draw';
	}

	return null;
};

const getBestMove = (board: Player[]): number => {
	// Simple AI using minimax algorithm
	const minimax = (
		newBoard: Player[],
		depth: number,
		isMaximizing: boolean
	): number => {
		const winner = checkWinner(newBoard);

		if (winner === 'O') return 1;
		if (winner === 'X') return -1;
		if (winner === 'draw') return 0;

		if (isMaximizing) {
			let bestScore = -Infinity;
			for (let i = 0; i < 9; i++) {
				if (newBoard[i] === null) {
					newBoard[i] = 'O';
					const score = minimax(newBoard, depth + 1, false);
					newBoard[i] = null;
					bestScore = Math.max(score, bestScore);
				}
			}
			return bestScore;
		} else {
			let bestScore = Infinity;
			for (let i = 0; i < 9; i++) {
				if (newBoard[i] === null) {
					newBoard[i] = 'X';
					const score = minimax(newBoard, depth + 1, true);
					newBoard[i] = null;
					bestScore = Math.min(score, bestScore);
				}
			}
			return bestScore;
		}
	};

	let bestScore = -Infinity;
	let bestMove = -1;

	for (let i = 0; i < 9; i++) {
		if (board[i] === null) {
			board[i] = 'O';
			const score = minimax(board, 0, false);
			board[i] = null;
			if (score > bestScore) {
				bestScore = score;
				bestMove = i;
			}
		}
	}

	return bestMove;
};

function gameReducer(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		case 'MAKE_MOVE': {
			if (!state.isGameActive || state.board[action.index] !== null) {
				return state;
			}

			const newBoard = [...state.board];
			newBoard[action.index] = state.currentPlayer;

			const winner = checkWinner(newBoard);
			let newScore = { ...state.score };
			let newCoins = state.coins;
			let newConsecutiveWins = state.consecutiveWins;
			let isFirstTime = state.isFirstTime;

			if (winner === 'X') {
				newScore.X++;
				newCoins += 3; // Award 3 coins for winning
				newConsecutiveWins++;

				// Award 3 bonus coins for 3 consecutive wins
				if (newConsecutiveWins === 3) {
					newCoins += 3;
					newConsecutiveWins = 0;
				}
			} else if (winner === 'O') {
				newScore.O++;
				newConsecutiveWins = 0;
			} else if (winner === 'draw') {
				newScore.draws++;
				newCoins += 1; // Award 1 coin for draw
				newConsecutiveWins = 0;
			}

			// Award welcome coins for first time (only once ever)
			if (isFirstTime) {
				newCoins += 10;
				isFirstTime = false;
				// Mark welcome bonus as given in database immediately
				setTimeout(async () => {
					try {
						await setWelcomeBonusGiven();
					} catch (error) {
						console.error('Error marking welcome bonus as given:', error);
					}
				}, 0);
			}

			return {
				...state,
				board: newBoard,
				currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
				winner,
				score: newScore,
				isGameActive: winner === null,
				coins: newCoins,
				consecutiveWins: newConsecutiveWins,
				isFirstTime,
			};
		}

		case 'AI_MOVE': {
			if (!state.isGameActive || state.board[action.index] !== null) {
				return state;
			}

			const newBoard = [...state.board];
			newBoard[action.index] = 'O';

			const winner = checkWinner(newBoard);
			let newScore = { ...state.score };
			let newCoins = state.coins;
			let newConsecutiveWins = state.consecutiveWins;
			let isFirstTime = state.isFirstTime;

			if (winner === 'X') {
				newScore.X++;
				newCoins += 3; // Award 3 coins for winning
				newConsecutiveWins++;

				// Award 3 bonus coins for 3 consecutive wins
				if (newConsecutiveWins === 3) {
					newCoins += 3;
					newConsecutiveWins = 0;
				}
			} else if (winner === 'O') {
				newScore.O++;
				newConsecutiveWins = 0;
			} else if (winner === 'draw') {
				newScore.draws++;
				newCoins += 1; // Award 1 coin for draw
				newConsecutiveWins = 0;
			}

			// Award welcome coins for first time (only once ever)
			if (isFirstTime) {
				newCoins += 10;
				isFirstTime = false;
				// Mark welcome bonus as given in database immediately
				setTimeout(async () => {
					try {
						await setWelcomeBonusGiven();
					} catch (error) {
						console.error('Error marking welcome bonus as given:', error);
					}
				}, 0);
			}

			return {
				...state,
				board: newBoard,
				currentPlayer: 'X',
				winner,
				score: newScore,
				isGameActive: winner === null,
				coins: newCoins,
				consecutiveWins: newConsecutiveWins,
				isFirstTime,
			};
		}

		case 'RESET_GAME':
			return {
				...state,
				board: Array(9).fill(null),
				currentPlayer: 'X',
				winner: null,
				isGameActive: true,
			};

		case 'SET_GAME_MODE':
			return {
				...initialState,
				gameMode: action.mode,
				score: state.score,
			};

		case 'INITIALIZE_COINS': {
			return {
				...state,
				coins: 10,
				isFirstTime: false,
			};
		}

		case 'SET_STATS':
			return {
				...state,
				score: action.stats,
			};

		case 'SET_COINS':
			return {
				...state,
				coins: action.coins,
			};

		case 'SET_FIRST_TIME':
			return {
				...state,
				isFirstTime: action.isFirstTime,
			};

		default:
			return state;
	}
}

export default function GameProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(gameReducer, initialState);
	const [isLoading, setIsLoading] = useState(true);

	// Load saved game state from database
	useEffect(() => {
		const loadGameState = async () => {
			try {
				setIsLoading(true);
				// Load coins
				const coins = await getCoins();
				dispatch({ type: 'SET_COINS', coins });

				// Check if welcome bonus was already given
				const welcomeBonusGiven = await getWelcomeBonusStatus();
				if (welcomeBonusGiven) {
					dispatch({ type: 'SET_FIRST_TIME', isFirstTime: false });
				}

				// Load stats
				const stats = await getStats();
				if (stats) {
					const totalGames = stats.gamesPlayed;
					const wins = stats.gamesWon;
					const draws = totalGames - wins - (stats.totalScore - wins); // Calculate draws from total games and wins

					dispatch({
						type: 'SET_STATS',
						stats: {
							X: wins,
							O: totalGames - wins - draws,
							draws: draws,
						},
					});
				}
			} catch (error) {
				console.error('Error loading game state:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadGameState();
	}, []);

	// Save game state to database when it changes
	useEffect(() => {
		const saveGameState = async () => {
			if (isLoading) return; // Don't save while initial loading is in progress

			try {
				// Save coins
				await updateCoins(state.coins);

				// Calculate total games
				const totalGames = state.score.X + state.score.O + state.score.draws;

				// Save stats
				await updateStats({
					gamesPlayed: totalGames,
					gamesWon: state.score.X,
					highestScore: Math.max(state.score.X, state.score.O),
					totalScore: totalGames,
				});
			} catch (error) {
				console.error('Error saving game state:', error);
			}
		};

		saveGameState();
	}, [state.coins, state.score, isLoading]);

	// AI move logic
	React.useEffect(() => {
		if (
			state.gameMode === 'vsAI' &&
			state.currentPlayer === 'O' &&
			state.isGameActive &&
			!state.winner
		) {
			const timer = setTimeout(() => {
				const bestMove = getBestMove([...state.board]);
				if (bestMove !== -1) {
					dispatch({ type: 'AI_MOVE', index: bestMove });
				}
			}, 800); // Delay for better UX

			return () => clearTimeout(timer);
		}
	}, [
		state.currentPlayer,
		state.isGameActive,
		state.gameMode,
		state.board,
		state.winner,
	]);

	React.useEffect(() => {
		if (state.winner) {
			const timer = setTimeout(() => {
				dispatch({ type: 'RESET_GAME' });
			}, 1000); // Reset after 1 second

			return () => clearTimeout(timer);
		}
	}, [state.winner, dispatch]);

	if (isLoading) {
		return null; // Or a loading spinner if you prefer
	}

	return (
		<GameContext.Provider value={{ state, dispatch }}>
			{children}
		</GameContext.Provider>
	);
}

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error('useGame must be used within GameProvider');
	}
	return context;
};
