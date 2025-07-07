import React, {
	createContext,
	useContext,
	useReducer,
	ReactNode,
	useEffect,
	useState,
	useMemo,
} from 'react';
import {
	getCoins,
	updateCoins,
	getStats,
	updateStats,
	getWelcomeBonusStatus,
	setWelcomeBonusGiven,
	completeGame,
} from '@/services/database';

type Player = 'X' | 'O' | null;
type GameMode = 'vsAI' | 'vsPlayer';
type GamePhase = 'placement' | 'movement';

interface GameState {
	board: Player[];
	currentPlayer: Player;
	winner: Player | 'draw' | null;
	winningPattern: number[] | null;
	gameMode: GameMode;
	gameLevel: number;
	score: {
		X: number;
		O: number;
		draws: number;
	};
	isGameActive: boolean;
	coins: number;
	consecutiveWins: number;
	isFirstTime: boolean;
	gamePhase: GamePhase;
	piecesPlaced: {
		X: number;
		O: number;
	};
	selectedPiece: number | null;
	moveHistory: {
		from: number;
		to: number;
		player: Player;
	}[];
}

type GameAction =
	| { type: 'MAKE_MOVE'; index: number }
	| { type: 'SELECT_PIECE'; index: number }
	| { type: 'MOVE_PIECE'; from: number; to: number }
	| { type: 'RESET_GAME' }
	| { type: 'SET_GAME_MODE'; mode: GameMode }
	| { type: 'AI_MOVE'; index: number }
	| { type: 'AI_MOVE_PIECE'; from: number; to: number }
	| { type: 'INITIALIZE_COINS' }
	| { type: 'SET_STATS'; stats: { X: number; O: number; draws: number } }
	| { type: 'SET_COINS'; coins: number }
	| { type: 'SET_FIRST_TIME'; isFirstTime: boolean }
	| { type: 'SET_GAME_LEVEL'; level: number };

const initialState: GameState = {
	board: Array(9).fill(null),
	currentPlayer: 'X',
	winner: null,
	winningPattern: null,
	gameMode: 'vsAI',
	gameLevel: 2, // Default to Level 2 (Morris game)
	score: { X: 0, O: 0, draws: 0 },
	isGameActive: true,
	coins: 0,
	consecutiveWins: 0,
	isFirstTime: true,
	gamePhase: 'placement',
	piecesPlaced: { X: 0, O: 0 },
	selectedPiece: null,
	moveHistory: [],
};

const GameContext = createContext<{
	state: GameState;
	dispatch: React.Dispatch<GameAction>;
} | null>(null);

const checkWinner = (
	board: Player[]
): { winner: Player | 'draw' | null; pattern: number[] | null } => {
	// Validate board input
	if (!board || board.length !== 9) {
		console.error('Invalid board provided to checkWinner');
		return { winner: null, pattern: null };
	}

	const winPatterns = [
		[0, 1, 2], // Top row
		[3, 4, 5], // Middle row
		[6, 7, 8], // Bottom row
		[0, 3, 6], // Left column
		[1, 4, 7], // Middle column
		[2, 5, 8], // Right column
		[0, 4, 8], // Main diagonal
		[2, 4, 6], // Anti-diagonal
	];

	for (const pattern of winPatterns) {
		const [a, b, c] = pattern;

		// Ensure indices are valid
		if (a < 0 || a > 8 || b < 0 || b > 8 || c < 0 || c > 8) {
			console.error('Invalid pattern indices:', pattern);
			continue;
		}

		// Check if all three positions have the same non-null player
		const cellA = board[a];
		const cellB = board[b];
		const cellC = board[c];

		if (cellA && cellA === cellB && cellA === cellC) {
			// Return a sorted copy of the pattern to ensure consistent ordering
			const sortedPattern = [...pattern].sort((x, y) => x - y);
			return { winner: cellA, pattern: sortedPattern };
		}
	}

	return { winner: null, pattern: null };
};

// Get adjacent cells for movement phase
const getAdjacentCells = (index: number): number[] => {
	const adjacencyMap: { [key: number]: number[] } = {
		0: [1, 3, 4],
		1: [0, 2, 3, 4, 5],
		2: [1, 4, 5],
		3: [0, 1, 4, 6, 7],
		4: [0, 1, 2, 3, 5, 6, 7, 8],
		5: [1, 2, 4, 7, 8],
		6: [3, 4, 7],
		7: [3, 4, 5, 6, 8],
		8: [4, 5, 7],
	};
	return adjacencyMap[index] || [];
};

// Get adjacent cells for straight-line movement only (Level 3)
const getStraightLineAdjacentCells = (index: number): number[] => {
	const adjacencyMap: { [key: number]: number[] } = {
		0: [1, 3], // Only right and down
		1: [0, 2, 4], // Left, right, and down
		2: [1, 5], // Only left and down
		3: [0, 4, 6], // Up, right, and down
		4: [1, 3, 5, 7], // Up, left, right, and down (no diagonals)
		5: [2, 4, 8], // Up, left, and down
		6: [3, 7], // Only up and right
		7: [4, 6, 8], // Left, up, and right
		8: [5, 7], // Only left and up
	};
	return adjacencyMap[index] || [];
};

// Check if a move creates a repeated position (for draw detection)
const isRepeatingPosition = (
	moveHistory: { from: number; to: number; player: Player }[],
	currentBoard: Player[]
): boolean => {
	if (moveHistory.length < 6) return false; // Need at least 3 moves per player

	// Check if the last 4 moves create a cycle (2 moves per player back and forth)
	const lastMoves = moveHistory.slice(-4);
	if (lastMoves.length === 4) {
		const [move1, move2, move3, move4] = lastMoves;
		// Check if players are just moving pieces back and forth
		return (
			move1.from === move3.to &&
			move1.to === move3.from &&
			move2.from === move4.to &&
			move2.to === move4.from
		);
	}

	return false;
};

const checkDraw = (
	board: Player[],
	moveHistory: { from: number; to: number; player: Player }[],
	gamePhase: GamePhase
): boolean => {
	// In placement phase, no draws possible
	if (gamePhase === 'placement') return false;

	// Check for repeating moves (loop detection)
	if (isRepeatingPosition(moveHistory, board)) {
		return true;
	}

	return false; // For now, we'll rely mainly on loop detection
};

const getBestMove = (
	board: Player[],
	gamePhase: GamePhase,
	piecesPlaced: { X: number; O: number },
	gameLevel: number
): number => {
	if (gameLevel === 1) {
		// Classic tic-tac-toe AI using minimax
		const minimax = (
			newBoard: Player[],
			depth: number,
			isMaximizing: boolean
		): number => {
			const { winner } = checkWinner(newBoard);
			if (winner === 'O') return 1;
			if (winner === 'X') return -1;
			if (newBoard.every((cell) => cell !== null)) return 0; // Draw

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
	}

	if (gameLevel === 2 && gamePhase === 'placement') {
		// Simple placement strategy: try center, then corners, then edges
		const preferredOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
		for (const index of preferredOrder) {
			if (board[index] === null) {
				return index;
			}
		}
	}

	if (gameLevel === 3 && gamePhase === 'placement') {
		// Same placement strategy as Level 2
		const preferredOrder = [4, 0, 2, 6, 8, 1, 3, 5, 7];
		for (const index of preferredOrder) {
			if (board[index] === null) {
				return index;
			}
		}
	}
	return -1;
};

const getBestMovePiece = (
	board: Player[],
	currentPlayer: Player
): { from: number; to: number } | null => {
	// Find all pieces belonging to current player
	const playerPieces = board
		.map((cell, index) => (cell === currentPlayer ? index : -1))
		.filter((index) => index !== -1);

	// Try to find a winning move
	for (const pieceIndex of playerPieces) {
		const adjacentCells = getAdjacentCells(pieceIndex);
		for (const adjacentIndex of adjacentCells) {
			if (board[adjacentIndex] === null) {
				// Test this move
				const testBoard = [...board];
				testBoard[pieceIndex] = null;
				testBoard[adjacentIndex] = currentPlayer;

				if (checkWinner(testBoard).winner === currentPlayer) {
					return { from: pieceIndex, to: adjacentIndex };
				}
			}
		}
	}

	// Try to block opponent's winning move
	const opponent = currentPlayer === 'X' ? 'O' : 'X';
	const opponentPieces = board
		.map((cell, index) => (cell === opponent ? index : -1))
		.filter((index) => index !== -1);

	for (const opponentPiece of opponentPieces) {
		const adjacentCells = getAdjacentCells(opponentPiece);
		for (const adjacentIndex of adjacentCells) {
			if (board[adjacentIndex] === null) {
				const testBoard = [...board];
				testBoard[opponentPiece] = null;
				testBoard[adjacentIndex] = opponent;

				if (checkWinner(testBoard).winner === opponent) {
					// Block by moving our piece to that position if possible
					for (const ourPiece of playerPieces) {
						const ourAdjacent = getAdjacentCells(ourPiece);
						if (ourAdjacent.includes(adjacentIndex)) {
							return { from: ourPiece, to: adjacentIndex };
						}
					}
				}
			}
		}
	}

	// Make a random valid move
	for (const pieceIndex of playerPieces) {
		const adjacentCells = getAdjacentCells(pieceIndex);
		for (const adjacentIndex of adjacentCells) {
			if (board[adjacentIndex] === null) {
				return { from: pieceIndex, to: adjacentIndex };
			}
		}
	}

	return null;
};

const getBestMovePieceLevel3 = (
	board: Player[],
	currentPlayer: Player
): { from: number; to: number } | null => {
	// Find all pieces belonging to current player
	const playerPieces = board
		.map((cell, index) => (cell === currentPlayer ? index : -1))
		.filter((index) => index !== -1);

	// Try to find a winning move using straight-line movement
	for (const pieceIndex of playerPieces) {
		const adjacentCells = getStraightLineAdjacentCells(pieceIndex);
		for (const adjacentIndex of adjacentCells) {
			if (board[adjacentIndex] === null) {
				// Test this move
				const testBoard = [...board];
				testBoard[pieceIndex] = null;
				testBoard[adjacentIndex] = currentPlayer;

				if (checkWinner(testBoard).winner === currentPlayer) {
					return { from: pieceIndex, to: adjacentIndex };
				}
			}
		}
	}

	// Try to block opponent's winning move using straight-line movement
	const opponent = currentPlayer === 'X' ? 'O' : 'X';
	const opponentPieces = board
		.map((cell, index) => (cell === opponent ? index : -1))
		.filter((index) => index !== -1);

	for (const opponentPiece of opponentPieces) {
		const adjacentCells = getStraightLineAdjacentCells(opponentPiece);
		for (const adjacentIndex of adjacentCells) {
			if (board[adjacentIndex] === null) {
				const testBoard = [...board];
				testBoard[opponentPiece] = null;
				testBoard[adjacentIndex] = opponent;

				if (checkWinner(testBoard).winner === opponent) {
					// Block by moving our piece to that position if possible
					for (const ourPiece of playerPieces) {
						const ourAdjacent = getStraightLineAdjacentCells(ourPiece);
						if (ourAdjacent.includes(adjacentIndex)) {
							return { from: ourPiece, to: adjacentIndex };
						}
					}
				}
			}
		}
	}

	// Make a random valid move using straight-line movement
	for (const pieceIndex of playerPieces) {
		const adjacentCells = getStraightLineAdjacentCells(pieceIndex);
		for (const adjacentIndex of adjacentCells) {
			if (board[adjacentIndex] === null) {
				return { from: pieceIndex, to: adjacentIndex };
			}
		}
	}

	return null;
};

function gameReducer(state: GameState, action: GameAction): GameState {
	switch (action.type) {
		case 'MAKE_MOVE': {
			if (!state.isGameActive) return state;

			// Level 1: Classic Tic-Tac-Toe - unlimited pieces
			if (state.gameLevel === 1) {
				if (state.board[action.index] !== null) return state;

				const newBoard = [...state.board];
				newBoard[action.index] = state.currentPlayer;

				const { winner, pattern } = checkWinner(newBoard);
				if (winner) {
					console.log(
						'Winner detected in classic mode:',
						winner,
						'Pattern:',
						pattern
					);
					return updateGameEndState(
						state,
						newBoard,
						winner,
						state.piecesPlaced,
						pattern
					);
				}

				// Check for draw (board full)
				if (newBoard.every((cell) => cell !== null)) {
					return updateGameEndState(
						state,
						newBoard,
						'draw',
						state.piecesPlaced
					);
				}

				return {
					...state,
					board: newBoard,
					currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
				};
			}

			// Level 2: Morris game (3 pieces, move to win)
			if (state.gameLevel === 2) {
				// Placement phase - place pieces if player has pieces left
				if (state.gamePhase === 'placement') {
					if (state.board[action.index] !== null) return state;
					if (state.piecesPlaced[state.currentPlayer!] >= 3) return state;

					const newBoard = [...state.board];
					newBoard[action.index] = state.currentPlayer;

					const newPiecesPlaced = {
						...state.piecesPlaced,
						[state.currentPlayer!]:
							state.piecesPlaced[state.currentPlayer!] + 1,
					};

					// Check for winner after placement
					const { winner, pattern } = checkWinner(newBoard);
					if (winner) {
						console.log(
							'Winner detected during placement:',
							winner,
							'Pattern:',
							pattern
						);
						return updateGameEndState(
							state,
							newBoard,
							winner,
							newPiecesPlaced,
							pattern
						);
					}

					// Check if we should transition to movement phase
					const shouldTransition =
						newPiecesPlaced.X === 3 && newPiecesPlaced.O === 3;

					return {
						...state,
						board: newBoard,
						currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
						piecesPlaced: newPiecesPlaced,
						gamePhase: shouldTransition ? 'movement' : 'placement',
					};
				}

				// Movement phase - select piece to move
				if (state.gamePhase === 'movement') {
					if (state.selectedPiece === null) {
						// Select a piece to move
						if (state.board[action.index] !== state.currentPlayer) return state;
						return {
							...state,
							selectedPiece: action.index,
						};
					} else {
						// Move the selected piece
						return handlePieceMove(state, state.selectedPiece, action.index);
					}
				}
			}

			// Level 3: Restricted Morris game (3 pieces, straight-line movement only)
			if (state.gameLevel === 3) {
				// Placement phase - place pieces if player has pieces left
				if (state.gamePhase === 'placement') {
					if (state.board[action.index] !== null) return state;
					if (state.piecesPlaced[state.currentPlayer!] >= 3) return state;

					const newBoard = [...state.board];
					newBoard[action.index] = state.currentPlayer;

					const newPiecesPlaced = {
						...state.piecesPlaced,
						[state.currentPlayer!]:
							state.piecesPlaced[state.currentPlayer!] + 1,
					};

					// Check for winner after placement
					const { winner, pattern } = checkWinner(newBoard);
					if (winner) {
						console.log(
							'Winner detected during placement in Level 3:',
							winner,
							'Pattern:',
							pattern
						);
						return updateGameEndState(
							state,
							newBoard,
							winner,
							newPiecesPlaced,
							pattern
						);
					}

					// Check if we should transition to movement phase
					const shouldTransition =
						newPiecesPlaced.X === 3 && newPiecesPlaced.O === 3;

					return {
						...state,
						board: newBoard,
						currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
						piecesPlaced: newPiecesPlaced,
						gamePhase: shouldTransition ? 'movement' : 'placement',
					};
				}

				// Movement phase - select piece to move (restricted to straight lines)
				if (state.gamePhase === 'movement') {
					if (state.selectedPiece === null) {
						// Select a piece to move
						if (state.board[action.index] !== state.currentPlayer) return state;
						return {
							...state,
							selectedPiece: action.index,
						};
					} else {
						// Move the selected piece using straight-line movement
						return handlePieceMoveLevel3(
							state,
							state.selectedPiece,
							action.index
						);
					}
				}
			}

			return state;
		}

		case 'SELECT_PIECE': {
			if (state.gamePhase !== 'movement' || !state.isGameActive) return state;
			if (state.board[action.index] !== state.currentPlayer) return state;

			return {
				...state,
				selectedPiece: action.index,
			};
		}

		case 'MOVE_PIECE': {
			if (state.gamePhase !== 'movement' || !state.isGameActive) return state;
			return handlePieceMove(state, action.from, action.to);
		}

		case 'AI_MOVE': {
			if (state.gameMode !== 'vsAI' || state.currentPlayer !== 'O')
				return state;

			if (state.gamePhase === 'placement') {
				return gameReducer(state, { type: 'MAKE_MOVE', index: action.index });
			}

			return state;
		}

		case 'AI_MOVE_PIECE': {
			if (state.gameMode !== 'vsAI' || state.currentPlayer !== 'O')
				return state;
			return handlePieceMove(state, action.from, action.to);
		}

		case 'RESET_GAME':
			return {
				...state,
				board: Array(9).fill(null),
				currentPlayer: 'X',
				winner: null,
				winningPattern: null,
				isGameActive: true,
				gamePhase: 'placement',
				piecesPlaced: { X: 0, O: 0 },
				selectedPiece: null,
				moveHistory: [],
			};

		case 'SET_GAME_MODE':
			return {
				...initialState,
				gameMode: action.mode,
				score: state.score,
				coins: state.coins,
				consecutiveWins: state.consecutiveWins,
				isFirstTime: state.isFirstTime,
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

		case 'SET_GAME_LEVEL':
			return {
				...initialState,
				gameLevel: action.level,
				gameMode: state.gameMode,
				score: state.score,
				coins: state.coins,
				consecutiveWins: state.consecutiveWins,
				isFirstTime: state.isFirstTime,
				gamePhase: action.level === 1 ? 'placement' : 'placement', // Level 1 doesn't use phases
			};

		default:
			return state;
	}
}

// Helper function to handle piece movement
function handlePieceMove(
	state: GameState,
	from: number,
	to: number
): GameState {
	// Validate inputs
	if (from < 0 || from > 8 || to < 0 || to > 8) {
		console.error('Invalid move indices:', { from, to });
		return state;
	}

	// Check if the piece being moved belongs to current player
	if (state.board[from] !== state.currentPlayer) {
		console.error('Piece does not belong to current player:', {
			from,
			player: state.currentPlayer,
			piece: state.board[from],
		});
		return state;
	}

	// Check if destination is empty
	if (state.board[to] !== null) {
		console.error('Destination cell is not empty:', {
			to,
			cell: state.board[to],
		});
		return state;
	}

	// Check if move is to adjacent cell
	const adjacentCells = getAdjacentCells(from);
	if (!adjacentCells.includes(to)) {
		console.error('Move is not to adjacent cell:', {
			from,
			to,
			adjacent: adjacentCells,
		});
		return state;
	}

	// Create new board state
	const newBoard = [...state.board];
	newBoard[from] = null;
	newBoard[to] = state.currentPlayer;

	const newMoveHistory = [
		...state.moveHistory,
		{ from, to, player: state.currentPlayer! },
	];

	// Check for winner with the new board state
	const { winner, pattern } = checkWinner(newBoard);
	if (winner) {
		console.log('Winner detected:', winner, 'Pattern:', pattern);
		return updateGameEndState(
			state,
			newBoard,
			winner,
			state.piecesPlaced,
			pattern,
			newMoveHistory
		);
	}

	// Check for draw (loop detection)
	const isDraw = checkDraw(newBoard, newMoveHistory, state.gamePhase);
	if (isDraw) {
		console.log('Draw detected due to repeated moves');
		return updateGameEndState(
			state,
			newBoard,
			'draw',
			state.piecesPlaced,
			null, // No winning pattern for draw
			newMoveHistory
		);
	}

	return {
		...state,
		board: newBoard,
		currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
		selectedPiece: null,
		moveHistory: newMoveHistory,
	};
}

// Helper function to handle piece movement for Level 3 (straight-line movement only)
function handlePieceMoveLevel3(
	state: GameState,
	from: number,
	to: number
): GameState {
	// Validate inputs
	if (from < 0 || from > 8 || to < 0 || to > 8) {
		console.error('Invalid move indices:', { from, to });
		return state;
	}

	// Check if the piece being moved belongs to current player
	if (state.board[from] !== state.currentPlayer) {
		console.error('Piece does not belong to current player:', {
			from,
			player: state.currentPlayer,
			piece: state.board[from],
		});
		return state;
	}

	// Check if destination is empty
	if (state.board[to] !== null) {
		console.error('Destination cell is not empty:', {
			to,
			cell: state.board[to],
		});
		return state;
	}

	// Check if move is to adjacent cell using straight-line movement only
	const adjacentCells = getStraightLineAdjacentCells(from);
	if (!adjacentCells.includes(to)) {
		console.error('Move is not to straight-line adjacent cell:', {
			from,
			to,
			adjacent: adjacentCells,
		});
		return state;
	}

	// Create new board state
	const newBoard = [...state.board];
	newBoard[from] = null;
	newBoard[to] = state.currentPlayer;

	const newMoveHistory = [
		...state.moveHistory,
		{ from, to, player: state.currentPlayer! },
	];

	// Check for winner with the new board state
	const { winner, pattern } = checkWinner(newBoard);
	if (winner) {
		console.log('Winner detected in Level 3:', winner, 'Pattern:', pattern);
		return updateGameEndState(
			state,
			newBoard,
			winner,
			state.piecesPlaced,
			pattern,
			newMoveHistory
		);
	}

	// Check for draw (loop detection)
	const isDraw = checkDraw(newBoard, newMoveHistory, state.gamePhase);
	if (isDraw) {
		console.log('Draw detected due to repeated moves in Level 3');
		return updateGameEndState(
			state,
			newBoard,
			'draw',
			state.piecesPlaced,
			null, // No winning pattern for draw
			newMoveHistory
		);
	}

	return {
		...state,
		board: newBoard,
		currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
		selectedPiece: null,
		moveHistory: newMoveHistory,
	};
}

// Helper function to update game state when game ends
function updateGameEndState(
	state: GameState,
	board: Player[],
	winner: Player | 'draw',
	piecesPlaced: { X: number; O: number },
	winningPattern: number[] | null = null,
	moveHistory: {
		from: number;
		to: number;
		player: Player;
	}[] = state.moveHistory
): GameState {
	let newScore = { ...state.score };
	let newCoins = state.coins;
	let newConsecutiveWins = state.consecutiveWins;
	let isFirstTime = state.isFirstTime;

	if (winner === 'X') {
		newScore.X++;
		newCoins += 3;
		newConsecutiveWins++;
		if (newConsecutiveWins === 3) {
			newCoins += 3;
			newConsecutiveWins = 0;
		}
	} else if (winner === 'O') {
		newScore.O++;
		newConsecutiveWins = 0;
	} else if (winner === 'draw') {
		newScore.draws++;
		newCoins += 1;
		newConsecutiveWins = 0;
	}

	if (isFirstTime) {
		newCoins += 10;
		isFirstTime = false;
		setTimeout(async () => {
			try {
				await setWelcomeBonusGiven();
			} catch (error) {
				console.error('Error marking welcome bonus as given:', error);
			}
		}, 0);
	}

	// Handle achievements asynchronously
	setTimeout(async () => {
		try {
			const totalGames = newScore.X + newScore.O + newScore.draws;
			const gameResult =
				winner === 'X' ? 'win' : winner === 'O' ? 'loss' : 'draw';

			await completeGame(
				gameResult,
				newConsecutiveWins,
				newScore.X,
				totalGames
			);
		} catch (error) {
			console.error('Error handling achievements:', error);
		}
	}, 0);

	return {
		...state,
		board,
		winner,
		winningPattern,
		score: newScore,
		isGameActive: false,
		coins: newCoins,
		consecutiveWins: newConsecutiveWins,
		isFirstTime,
		piecesPlaced,
		moveHistory,
	};
}

export default function GameProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(gameReducer, initialState);
	const [isLoading, setIsLoading] = useState(true);

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

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
				if (state.gameLevel === 1 || state.gamePhase === 'placement') {
					const bestMove = getBestMove(
						[...state.board],
						state.gamePhase,
						state.piecesPlaced,
						state.gameLevel
					);
					if (bestMove !== -1) {
						dispatch({ type: 'AI_MOVE', index: bestMove });
					}
				} else if (state.gameLevel === 2 && state.gamePhase === 'movement') {
					const bestMovePiece = getBestMovePiece([...state.board], 'O');
					if (bestMovePiece) {
						dispatch({
							type: 'AI_MOVE_PIECE',
							from: bestMovePiece.from,
							to: bestMovePiece.to,
						});
					}
				} else if (state.gameLevel === 3 && state.gamePhase === 'movement') {
					const bestMovePiece = getBestMovePieceLevel3([...state.board], 'O');
					if (bestMovePiece) {
						dispatch({
							type: 'AI_MOVE_PIECE',
							from: bestMovePiece.from,
							to: bestMovePiece.to,
						});
					}
				}
			}, 800);

			return () => clearTimeout(timer);
		}
	}, [
		state.currentPlayer,
		state.isGameActive,
		state.gameMode,
		state.board,
		state.winner,
		state.gamePhase,
		state.piecesPlaced,
		state.gameLevel,
	]);

	if (isLoading) {
		return null;
	}

	return (
		<GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
	);
}

export const useGame = () => {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error('useGame must be used within GameProvider');
	}
	return context;
};
