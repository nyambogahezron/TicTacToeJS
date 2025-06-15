import React, { createContext, useContext, useReducer, ReactNode } from 'react';

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
}

type GameAction =
	| { type: 'MAKE_MOVE'; index: number }
	| { type: 'RESET_GAME' }
	| { type: 'SET_GAME_MODE'; mode: GameMode }
	| { type: 'AI_MOVE'; index: number };

const initialState: GameState = {
	board: Array(9).fill(null),
	currentPlayer: 'X',
	winner: null,
	gameMode: 'vsAI',
	score: { X: 0, O: 0, draws: 0 },
	isGameActive: true,
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

			if (winner === 'X' || winner === 'O') {
				newScore[winner]++;
			} else if (winner === 'draw') {
				newScore.draws++;
			}

			return {
				...state,
				board: newBoard,
				currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
				winner,
				score: newScore,
				isGameActive: winner === null,
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

			if (winner === 'X' || winner === 'O') {
				newScore[winner]++;
			} else if (winner === 'draw') {
				newScore.draws++;
			}

			return {
				...state,
				board: newBoard,
				currentPlayer: 'X',
				winner,
				score: newScore,
				isGameActive: winner === null,
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

		default:
			return state;
	}
}

export default function GameProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(gameReducer, initialState);

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
	}, [state.currentPlayer, state.isGameActive, state.gameMode, state.board]);

	React.useEffect(() => {
		if (state.winner) {
			const timer = setTimeout(() => {
				dispatch({ type: 'RESET_GAME' });
			}, 1000); // Reset after 1 second

			return () => clearTimeout(timer);
		}
	}, [state.winner, dispatch]);

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
