// Tab functionality
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all tabs
                document.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Add active class to clicked tab
                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
        
        // Game elements
        const gameBoard = document.getElementById('game-board');
        const currentPlayerElement = document.getElementById('current-player');
        const blackScoreElement = document.getElementById('black-score');
        const whiteScoreElement = document.getElementById('white-score');
        const gameMessageElement = document.getElementById('game-message');
        const showMovesButton = document.getElementById('show-moves-btn');
        const newGameButton = document.getElementById('new-game-btn');
        const undoMoveButton = document.getElementById('undo-move-btn');
        const moveCounterElement = document.getElementById('move-counter');
        const capturedPiecesElement = document.getElementById('captured-pieces');
        const gameStatusElement = document.getElementById('game-status');
        const blackIndicator = document.getElementById('black-indicator');
        const whiteIndicator = document.getElementById('white-indicator');
        const gameModeSelect = document.getElementById('game-mode');
        const botDifficultySelect = document.getElementById('bot-difficulty');
        const botDifficultyContainer = document.getElementById('bot-difficulty-container');
        const botThinkingIndicator = document.getElementById('bot-thinking');
        
        // Modal elements
        const confirmationModal = document.getElementById('confirmation-modal');
        const modalMessage = document.getElementById('modal-message');
        const modalConfirm = document.getElementById('modal-confirm');
        const modalCancel = document.getElementById('modal-cancel');
        
        // Winner modal elements
        const winnerModal = document.getElementById('winner-modal');
        const winnerMessage = document.getElementById('winner-message');
        const winnerOk = document.getElementById('winner-ok');
        
        // Game state
        let board = Array(8).fill().map(() => Array(8).fill(0));
        let currentPlayer = 1; // 1 for black, 2 for white
        let showingMoves = false;
        let moveCounter = 1;
        let capturedPieces = 0;
        let gameInProgress = true;
        let gameMode = 'player'; // 'player' or 'bot'
        let botDifficulty = 'normal';
        let botThinking = false;
        let gameHistory = []; // For undo functionality
        let playerColor = 1; // Player is black by default
        let pendingAction = null; // For storing pending actions that need confirmation
        
        // Show confirmation modal
        function showConfirmationModal(message, confirmCallback) {
            modalMessage.textContent = message;
            confirmationModal.classList.remove('hidden');
            
            // Set up confirm button
            modalConfirm.onclick = () => {
                confirmCallback();
                confirmationModal.classList.add('hidden');
            };
            
            // Set up cancel button
            modalCancel.onclick = () => {
                confirmationModal.classList.add('hidden');
            };
        }
        
        // Показати модальне вікно переможця
function showWinnerModal(message) {
    winnerMessage.textContent = message;
    winnerModal.classList.remove('hidden');
}

// Сховати модальне вікно переможця
winnerOk.onclick = function() {
    winnerModal.classList.add('hidden');
};

        // Game mode selection with confirmation
        gameModeSelect.addEventListener('change', function() {
            const newGameMode = this.value;
            
            // If game is in progress and has moves, show confirmation
            if (gameInProgress && moveCounter > 1) {
                // Reset the select to current value until confirmed
                this.value = gameMode;
                
                showConfirmationModal(
                    "Зміна режиму гри почне нову гру. Поточний прогрес буде втрачено. Продовжити?",
                    () => {
                        gameMode = newGameMode;
                        if (gameMode === 'bot') {
                            botDifficultyContainer.classList.remove('hidden');
                            playerColor = 1; // Player is always black when playing against bot
                        } else {
                            botDifficultyContainer.classList.add('hidden');
                        }
                        initGame(); // Start a new game with the new mode
                    }
                );
            } else {
                // If game just started or not in progress, change mode without confirmation
                gameMode = newGameMode;
                if (gameMode === 'bot') {
                    botDifficultyContainer.classList.remove('hidden');
                    playerColor = 1; // Player is always black when playing against bot
                } else {
                    botDifficultyContainer.classList.add('hidden');
                }
                initGame(); // Start a new game with the new mode
            }
        });
        
        // Bot difficulty selection with confirmation
        botDifficultySelect.addEventListener('change', function() {
            const newDifficulty = this.value;
            
            // If game is in progress and has moves, show confirmation
            if (gameInProgress && moveCounter > 1) {
                // Reset the select to current value until confirmed
                this.value = botDifficulty;
                
                showConfirmationModal(
                    "Зміна складності бота почне нову гру. Поточний прогрес буде втрачено. Продовжити?",
                    () => {
                        botDifficulty = newDifficulty;
                        initGame(); // Start a new game with the new difficulty
                    }
                );
            } else {
                // If game just started or not in progress, change difficulty without confirmation
                botDifficulty = newDifficulty;
                initGame(); // Start a new game with the new difficulty
            }
        });
        
        // Функція для оновлення стану кнопки "Скасувати хід"
function updateUndoButtonState() {
    if (gameMode === 'bot') {
        undoMoveButton.disabled = true;
        undoMoveButton.classList.add('btn-disabled-bot');
        // Знімаємо стандартні класи Tailwind для жовтої кнопки
        undoMoveButton.classList.remove('bg-amber-600', 'hover:bg-amber-700', 'text-white');
        undoMoveButton.title = 'Недоступно в режимі з ботом';
    } else {
        undoMoveButton.disabled = false;
        undoMoveButton.classList.remove('btn-disabled-bot');
        // Повертаємо стандартні класи Tailwind для жовтої кнопки
        undoMoveButton.classList.add('bg-amber-600', 'hover:bg-amber-700', 'text-white');
        undoMoveButton.title = '';
    }
}

// Initialize the game
function initGame() {
    // Clear the board
    gameBoard.innerHTML = '';
    board = Array(8).fill().map(() => Array(8).fill(0));
    
    // Create cells
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.className = 'game-cell flex items-center justify-center';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => makeMove(row, col));
            gameBoard.appendChild(cell);
        }
    }
    
    // Set initial pieces
    board[3][3] = 2; // White
    board[3][4] = 1; // Black
    board[4][3] = 1; // Black
    board[4][4] = 2; // White
    
    // Reset game state
    currentPlayer = 1;
    showingMoves = false;
    moveCounter = 1;
    capturedPieces = 0;
    gameInProgress = true;
    gameHistory = [];
    botThinking = false;
    
    // Update the UI
    updateBoard();
    updateGameInfo();
    
    // Reset game message
    gameMessageElement.textContent = '';
    gameMessageElement.classList.add('hidden');
    
    // Reset game status
    gameStatusElement.textContent = 'В процесі';
    gameStatusElement.classList.remove('text-red-600');
    gameStatusElement.classList.add('text-green-600');
    
    // Update move counter and captured pieces
    moveCounterElement.textContent = moveCounter;
    capturedPiecesElement.textContent = capturedPieces;
    
    // Hide bot thinking indicator
    botThinkingIndicator.classList.add('hidden');
    
    // Save initial state
    saveGameState();
    
    // If starting in bot mode and it's bot's turn, make a move
    if (gameMode === 'bot' && currentPlayer !== playerColor) {
        console.log('[initGame] Викликаємо makeBotMove');
        makeBotMove();
    }
}

        // Update the visual board based on the game state
        function updateBoard() {
            console.log('[updateBoard] updating DOM');
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const cell = gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    cell.innerHTML = '';
                    
                    if (board[row][col] === 1) {
                        const piece = document.createElement('div');
                        piece.className = 'game-piece black';
                        cell.appendChild(piece);
                    } else if (board[row][col] === 2) {
                        const piece = document.createElement('div');
                        piece.className = 'game-piece white';
                        cell.appendChild(piece);
                    }
                }
            }
            
            // Clear any move indicators
            if (!showingMoves) {
                document.querySelectorAll('.valid-move-indicator').forEach(indicator => {
                    indicator.remove();
                });
            }
        }
        
        // Update game information (scores, current player)
        function updateGameInfo() {
            // Count pieces
            let blackCount = 0;
            let whiteCount = 0;
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if (board[row][col] === 1) blackCount++;
                    else if (board[row][col] === 2) whiteCount++;
                }
            }
            
            // Update score display
            blackScoreElement.textContent = blackCount;
            whiteScoreElement.textContent = whiteCount;
            
            // Update current player
            currentPlayerElement.textContent = currentPlayer === 1 ? 'Чорні' : 'Білі';
            
            // Update turn indicator
            if (currentPlayer === 1) {
                blackIndicator.classList.add('active');
                whiteIndicator.classList.remove('active');
            } else {
                blackIndicator.classList.remove('active');
                whiteIndicator.classList.add('active');
            }
            
            // Check game state
            const blackMoves = getValidMoves(1).length;
            const whiteMoves = getValidMoves(2).length;
            
            if (blackCount + whiteCount === 64 || (blackMoves === 0 && whiteMoves === 0)) {
                // Game over
                gameInProgress = false;
                gameStatusElement.textContent = 'Завершено';
                gameStatusElement.classList.remove('text-green-600');
                gameStatusElement.classList.add('text-red-600');
                
                let message;
                if (blackCount > whiteCount) {
                    message = 'Гра закінчена! Перемогли чорні!';
                } else if (whiteCount > blackCount) {
                    message = 'Гра закінчена! Перемогли білі!';
                } else {
                    message = 'Гра закінчена! Нічия!';
                }
                gameMessageElement.textContent = message;
                gameMessageElement.classList.remove('hidden');
                // --- Додаємо показ модального вікна переможця ---
                let winnerText;
                if (blackCount > whiteCount) {
                    winnerText = 'Перемогли чорні!';
                } else if (whiteCount > blackCount) {
                    winnerText = 'Перемогли білі!';
                } else {
                    winnerText = 'Нічия!';
                }
                showWinnerModal(winnerText);

                // Save final state
                saveGameState();
            } else if (getValidMoves(currentPlayer).length === 0) {
                // Поточний гравець не має ходів
                gameMessageElement.textContent = `${currentPlayer === 1 ? 'Чорні' : 'Білі'} не мають ходів. Хід переходить до ${currentPlayer === 1 ? 'білих' : 'чорних'}.`;
                gameMessageElement.classList.remove('hidden');
                currentPlayer = currentPlayer === 1 ? 2 : 1;

                // --- ДОДАНО: перевірка, чи є ходи у нового гравця ---
                if (getValidMoves(currentPlayer).length === 0) {
                    // Ніхто не може ходити — гра завершена
                    gameInProgress = false;
                    gameStatusElement.textContent = 'Завершено';
                    gameStatusElement.classList.remove('text-green-600');
                    gameStatusElement.classList.add('text-red-600');
                    let message;
                    if (blackCount > whiteCount) {
                        message = 'Гра закінчена! Перемогли чорні!';
                    } else if (whiteCount > blackCount) {
                        message = 'Гра закінчена! Перемогли білі!';
                    } else {
                        message = 'Гра закінчена! Нічия!';
                    }
                    gameMessageElement.textContent = message;
                    gameMessageElement.classList.remove('hidden');
                    // --- Додаємо показ модального вікна переможця ---
                    let winnerText;
                    if (blackCount > whiteCount) {
                        winnerText = 'Перемогли чорні!';
                    } else if (whiteCount > blackCount) {
                        winnerText = 'Перемогли білі!';
                    } else {
                        winnerText = 'Нічия!';
                    }
                    showWinnerModal(winnerText);

                    saveGameState();
                    return;
                }

                setTimeout(() => {
                    gameMessageElement.classList.add('hidden');
                    updateGameInfo();

                    // --- ВИКЛИК БОТА ТІЛЬКИ ЯКЩО Є ХОДИ ---
                    if (gameMode === 'bot' && currentPlayer !== playerColor && gameInProgress && getValidMoves(currentPlayer).length > 0) {
                        makeBotMove();
                    }
                }, 2000);

                // Save state after skipping
                saveGameState();
            } else {
                gameMessageElement.classList.add('hidden');

                // --- ВИКЛИК БОТА ТІЛЬКИ ЯКЩО Є ХОДИ ---
                if (gameMode === 'bot' && currentPlayer !== playerColor && gameInProgress && !botThinking && getValidMoves(currentPlayer).length > 0) {
                    makeBotMove();
                }
            }
        }
        
        // Get valid moves for the current player
        function getValidMoves(player) {
            const validMoves = [];
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if (isValidMove(row, col, player)) {
                        validMoves.push({row, col});
                    }
                }
            }
            
            console.log('[getValidMoves] for player', player, 'found', validMoves.length, 'moves:', validMoves);
            return validMoves;
        }
        
        // Check if a move is valid
        function isValidMove(row, col, player) {
            // Cell must be empty
            if (board[row][col] !== 0) return false;
            
            const opponent = player === 1 ? 2 : 1;
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            
            let isValid = false;
            
            // Check all directions
            for (const [dx, dy] of directions) {
                let r = row + dx;
                let c = col + dy;
                let foundOpponent = false;
                
                // Look for opponent's pieces
                while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
                    r += dx;
                    c += dy;
                    foundOpponent = true;
                }
                
                // If we found opponent's pieces and then our own piece
                if (foundOpponent && r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
                    isValid = true;
                    break;
                }
            }
            
            return isValid;
        }
        
        // Get captured pieces count for a move
        function getCapturedCount(row, col, player) {
            if (!isValidMove(row, col, player)) return 0;
            
            const opponent = player === 1 ? 2 : 1;
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            
            let totalCaptured = 0;
            
            for (const [dx, dy] of directions) {
                let r = row + dx;
                let c = col + dy;
                let toFlip = [];
                
                // Collect opponent's pieces to flip
                while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
                    toFlip.push({row: r, col: c});
                    r += dx;
                    c += dy;
                }
                
                // If we found our own piece at the end, count all collected pieces
                if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === player) {
                    totalCaptured += toFlip.length;
                }
            }
            
            return totalCaptured;
        }
        
        // Make a move
        function makeMove(row, col, isBot = false) {
            console.log('[makeMove] called with', {row, col, currentPlayer, playerColor, gameInProgress, botThinking, isBot});
            if (!gameInProgress) {
                console.log('[makeMove] gameInProgress is false');
                return;
            }
            // Якщо це режим бота, і зараз не хід гравця, і це не бот — блокуємо
            if (gameMode === 'bot' && currentPlayer !== playerColor && !isBot) {
                console.log('[makeMove] Not player\'s turn in bot mode');
                return;
            }
            if (!isValidMove(row, col, currentPlayer)) {
                console.log('[makeMove] Not a valid move', {row, col, currentPlayer});
                return;
            }

            // Діагностика
            console.log('[makeMove] currentPlayer:', currentPlayer, 'playerColor:', playerColor, 'botThinking:', botThinking, 'gameInProgress:', gameInProgress);

            // Save current state for undo
            saveGameHistory();
            
            // Place the piece
            board[row][col] = currentPlayer;
            
            // Flip opponent's pieces
            const opponent = currentPlayer === 1 ? 2 : 1;
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [0, -1],           [0, 1],
                [1, -1],  [1, 0],  [1, 1]
            ];
            
            let totalCaptured = 0;
            
            for (const [dx, dy] of directions) {
                let r = row + dx;
                let c = col + dy;
                let toFlip = [];
                
                // Collect opponent's pieces to flip
                while (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === opponent) {
                    toFlip.push({row: r, col: c});
                    r += dx;
                    c += dy;
                }
                
                // If we found our own piece at the end, flip all collected pieces
                if (r >= 0 && r < 8 && c >= 0 && c < 8 && board[r][c] === currentPlayer) {
                    for (const {row: flipRow, col: flipCol} of toFlip) {
                        board[flipRow][flipCol] = currentPlayer;
                        totalCaptured++;
                    }
                }
            }
            
            // Update captured pieces count
            capturedPieces += totalCaptured;
            capturedPiecesElement.textContent = capturedPieces;
            
            // Increment move counter
            moveCounter++;
            moveCounterElement.textContent = moveCounter;
            
            // Switch player
            currentPlayer = currentPlayer === 1 ? 2 : 1;

            // Діагностика після перемикання гравця
            console.log('[makeMove-after] currentPlayer:', currentPlayer, 'playerColor:', playerColor);
            console.log('[makeMove] Викликається updateBoard');
            console.log('[updateBoard] Оновлення DOM');
            // Update the board and game info
            showingMoves = false;
            console.log('[makeMove] calling updateBoard');
            updateBoard();
            console.log('[makeMove] calling updateGameInfo');
            updateGameInfo();
            
            // Save game state
            saveGameState();

            // Додано: якщо режим "бот" і зараз хід бота — викликати makeBotMove()
            if (gameMode === 'bot' && currentPlayer !== playerColor && gameInProgress && !botThinking) {
                console.log('[makeMove] викликаємо makeBotMove');
                makeBotMove();
            }
        }
        
        // Bot move logic
        function makeBotMove() {
            console.log('[makeBotMove] called', {currentPlayer, playerColor, botThinking, gameInProgress});

            if (!gameInProgress || botThinking) return;
            
            botThinking = true;
            botThinkingIndicator.classList.remove('hidden');
            
            // Simulate thinking time based on difficulty
            let thinkingTime = 500;
            switch (botDifficulty) {
                case 'kindergarten':
                    thinkingTime = 300;
                    break;
                case 'beginner':
                    thinkingTime = 500;
                    break;
                case 'normal':
                    thinkingTime = 800;
                    break;
                case 'hard':
                    thinkingTime = 1200;
                    break;
                case 'hardcore':
                    thinkingTime = 1500;
                    break;
            }
            
            setTimeout(() => {
                const validMoves = getValidMoves(currentPlayer);
                console.log('[makeBotMove] validMoves:', validMoves);
                if (validMoves.length === 0) {
                    botThinking = false;
                    botThinkingIndicator.classList.add('hidden');
                    // Діагностика
                    console.log('[makeBotMove] Немає ходів для бота, пропуск ходу');
                    updateGameInfo();
                    return;
                }
                
                let selectedMove;
                
                switch (botDifficulty) {
                    case 'kindergarten':
                        let worstMoves = validMoves.filter(move => {
            // Не дозволяємо ботy брати кути
            return !(
                (move.row === 0 && move.col === 0) ||
                (move.row === 0 && move.col === 7) ||
                (move.row === 7 && move.col === 0) ||
                (move.row === 7 && move.col === 7)
            );
        });
        if (worstMoves.length === 0) worstMoves = validMoves; // якщо тільки кути залишились
        // Знаходимо мінімальну кількість захоплених фішок
        let minCaptured = Math.min(...worstMoves.map(m => getCapturedCount(m.row, m.col, currentPlayer)));
        // Всі ходи з мінімальним захопленням
        let minMoves = worstMoves.filter(m => getCapturedCount(m.row, m.col, currentPlayer) === minCaptured);
        // Випадковий серед найгірших
        selectedMove = minMoves[Math.floor(Math.random() * minMoves.length)];
        break;
                        
                    case 'beginner':
    // Сортуємо ходи за кількістю захоплених фішок (від кращого до гіршого)
    validMoves.sort((a, b) => {
        return getCapturedCount(b.row, b.col, currentPlayer) -
               getCapturedCount(a.row, a.col, currentPlayer);
    });
    // Замість топ-3 беремо топ-5, але з імовірністю 50% бот зробить випадковий хід
    const topN = Math.min(5, validMoves.length);
    if (Math.random() < 0.5) {
        // Випадковий хід серед усіх можливих
        selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    } else {
        // Випадковий хід серед топ-5
        selectedMove = validMoves[Math.floor(Math.random() * topN)];
    }
    break;
                        
                    case 'normal':
                        // Strategic move evaluation
                        selectedMove = evaluateMovesNormal(validMoves);
                        break;
                        
                    case 'hard':
                        // Advanced strategic evaluation
                        selectedMove = evaluateMovesHard(validMoves);
                        break;
                        
                    case 'hardcore':
                        // Expert level evaluation
                        selectedMove = evaluateMovesHardcore(validMoves);
                        break;
                        
                    default:
                        selectedMove = validMoves[Math.floor(Math.random() * validMoves.length)];
                }
                
                botThinking = false;
                botThinkingIndicator.classList.add('hidden');
                
                if (selectedMove) {
                    console.log('[makeBotMove] Бот робить хід:', selectedMove);
                    makeMove(selectedMove.row, selectedMove.col, true); // <-- Додаємо true
                }
            }, thinkingTime);
        }
        
        // Bot strategy: Normal difficulty
        function evaluateMovesNormal(validMoves) {
            // Score each move
            const scoredMoves = validMoves.map(move => {
                let score = getCapturedCount(move.row, move.col, currentPlayer);
                
                // Bonus for corner moves
                if ((move.row === 0 || move.row === 7) && (move.col === 0 || move.col === 7)) {
                    score += 10;
                }
                
                // Penalty for moves adjacent to corners (if corner is empty)
                if ((move.row === 0 || move.row === 1 || move.row === 6 || move.row === 7) && 
                    (move.col === 0 || move.col === 1 || move.col === 6 || move.col === 7)) {
                    // Check if this is adjacent to an empty corner
                    const nearCorners = [
                        {row: 0, col: 0},
                        {row: 0, col: 7},
                        {row: 7, col: 0},
                        {row: 7, col: 7}
                    ];
                    
                    for (const corner of nearCorners) {
                        if (board[corner.row][corner.col] === 0 && 
                            Math.abs(move.row - corner.row) <= 1 && 
                            Math.abs(move.col - corner.col) <= 1) {
                            score -= 5;
                        }
                    }
                }
                
                return { ...move, score };
            });
            
            // Sort by score (highest first)
            scoredMoves.sort((a, b) => b.score - a.score);
            
            // Return the best move or one of the top moves
            return scoredMoves[0];
        }
        
        // Bot strategy: Hard difficulty
        function evaluateMovesHard(validMoves) {
            // Score each move with more sophisticated evaluation
            const scoredMoves = validMoves.map(move => {
                let score = getCapturedCount(move.row, move.col, currentPlayer);
                
                // Corners are extremely valuable
                if ((move.row === 0 || move.row === 7) && (move.col === 0 || move.col === 7)) {
                    score += 15;
                }
                
                // Edges are good but not as good as corners
                else if (move.row === 0 || move.row === 7 || move.col === 0 || move.col === 7) {
                    score += 5;
                }
                
                // Penalty for moves adjacent to corners (if corner is empty)
                if ((move.row === 0 || move.row === 1 || move.row === 6 || move.row === 7) && 
                    (move.col === 0 || move.col === 1 || move.col === 6 || move.col === 7)) {
                    // Check if this is adjacent to an empty corner
                    const nearCorners = [
                        {row: 0, col: 0},
                        {row: 0, col: 7},
                        {row: 7, col: 0},
                        {row: 7, col: 7}
                    ];
                    
                    for (const corner of nearCorners) {
                        if (board[corner.row][corner.col] === 0 && 
                            Math.abs(move.row - corner.row) <= 1 && 
                            Math.abs(move.col - corner.col) <= 1) {
                            score -= 8;
                        }
                    }
                }
                
                // Look ahead one move to see if opponent can capture a corner after this move
                const tempBoard = JSON.parse(JSON.stringify(board));
                tempBoard[move.row][move.col] = currentPlayer;
                
                // Simulate flipping pieces
                const opponent = currentPlayer === 1 ? 2 : 1;
                const directions = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1],           [0, 1],
                    [1, -1],  [1, 0],  [1, 1]
                ];
                
                for (const [dx, dy] of directions) {
                    let r = move.row + dx;
                    let c = move.col + dy;
                    let toFlip = [];
                    
                    while (r >= 0 && r < 8 && c >= 0 && c < 8 && tempBoard[r][c] === opponent) {
                        toFlip.push({row: r, col: c});
                        r += dx;
                        c += dy;
                    }
                    
                    if (r >= 0 && r < 8 && c >= 0 && c < 8 && tempBoard[r][c] === currentPlayer) {
                        for (const {row: flipRow, col: flipCol} of toFlip) {
                            tempBoard[flipRow][flipCol] = currentPlayer;
                        }
                    }
                }
                
                // Check if opponent can capture a corner after this move
                const corners = [
                    {row: 0, col: 0},
                    {row: 0, col: 7},
                    {row: 7, col: 0},
                    {row: 7, col: 7}
                ];
                
                for (const corner of corners) {
                    if (tempBoard[corner.row][corner.col] === 0) {
                        // Check if opponent can place here
                        let canOpponentCapture = false;
                        
                        for (const [dx, dy] of directions) {
                            let r = corner.row + dx;
                            let c = corner.col + dy;
                            let foundCurrent = false;
                            
                            while (r >= 0 && r < 8 && c >= 0 && c < 8 && tempBoard[r][c] === currentPlayer) {
                                r += dx;
                                c += dy;
                                foundCurrent = true;
                            }
                            
                            if (foundCurrent && r >= 0 && r < 8 && c >= 0 && c < 8 && tempBoard[r][c] === opponent) {
                                canOpponentCapture = true;
                                break;
                            }
                        }
                        
                        if (canOpponentCapture) {
                            score -= 12; // Heavy penalty
                        }
                    }
                }
                
                return { ...move, score };
            });
            
            // Sort by score (highest first)
            scoredMoves.sort((a, b) => b.score - a.score);
            
            // Return the best move
            return scoredMoves[0];
        }
        
        // Bot strategy: Hardcore difficulty
        function evaluateMovesHardcore(validMoves) {
            // Advanced position evaluation
            const positionValues = [
                [100, -20, 10, 5, 5, 10, -20, 100],
                [-20, -50, -2, -2, -2, -2, -50, -20],
                [10, -2, -1, -1, -1, -1, -2, 10],
                [5, -2, -1, -1, -1, -1, -2, 5],
                [5, -2, -1, -1, -1, -1, -2, 5],
                [10, -2, -1, -1, -1, -1, -2, 10],
                [-20, -50, -2, -2, -2, -2, -50, -20],
                [100, -20, 10, 5, 5, 10, -20, 100]
            ];
            
            // Score each move with expert evaluation
            const scoredMoves = validMoves.map(move => {
                // Base score from position value
                let score = positionValues[move.row][move.col];
                
                // Add capture count
                score += getCapturedCount(move.row, move.col, currentPlayer) * 2;
                
                // Simulate the move
                const tempBoard = JSON.parse(JSON.stringify(board));
                tempBoard[move.row][move.col] = currentPlayer;
                
                // Simulate flipping pieces
                const opponent = currentPlayer === 1 ? 2 : 1;
                const directions = [
                    [-1, -1], [-1, 0], [-1, 1],
                    [0, -1],           [0, 1],
                    [1, -1],  [1, 0],  [1, 1]
                ];
                
                for (const [dx, dy] of directions) {
                    let r = move.row + dx;
                    let c = move.col + dy;
                    let toFlip = [];
                    
                    while (r >= 0 && r < 8 && c >= 0 && c < 8 && tempBoard[r][c] === opponent) {
                        toFlip.push({row: r, col: c});
                        r += dx;
                        c += dy;
                    }
                    
                    if (r >= 0 && r < 8 && c >= 0 && c < 8 && tempBoard[r][c] === currentPlayer) {
                        for (const {row: flipRow, col: flipCol} of toFlip) {
                            tempBoard[flipRow][flipCol] = currentPlayer;
                        }
                    }
                }
                
                // Count opponent's valid moves after this move
                let opponentMoveCount = 0;
                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 8; c++) {
                        if (tempBoard[r][c] === 0) {
                            // Check if opponent can place here
                            let isValid = false;
                            
                            for (const [dx, dy] of directions) {
                                let nr = r + dx;
                                let nc = c + dy;
                                let foundCurrent = false;
                                
                                while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && tempBoard[nr][nc] === currentPlayer) {
                                    nr += dx;
                                    nc += dy;
                                    foundCurrent = true;
                                }
                                
                                if (foundCurrent && nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && tempBoard[nr][nc] === opponent) {
                                    isValid = true;
                                    opponentMoveCount++;
                                    break;
                                }
                            }
                        }
                    }
                }
                
                // Limiting opponent's moves is good
                score -= opponentMoveCount * 3;
                
                // Special case for corners
                if ((move.row === 0 || move.row === 7) && (move.col === 0 || move.col === 7)) {
                    score += 30; // Extra bonus for corners
                }
                
                // Special case for moves that secure edges
                if ((move.row === 0 || move.row === 7 || move.col === 0 || move.col === 7)) {
                    // Count how many pieces of our color are on this edge after the move
                    let edgePieces = 0;
                    if (move.row === 0 || move.row === 7) {
                        for (let c = 0; c < 8; c++) {
                            if (tempBoard[move.row][c] === currentPlayer) {
                                edgePieces++;
                            }
                        }
                    } else {
                        for (let r = 0; r < 8; r++) {
                            if (tempBoard[r][move.col] === currentPlayer) {
                                edgePieces++;
                            }
                        }
                    }
                    score += edgePieces * 2;
                }
                
                return { ...move, score };
            });
            
            // Sort by score (highest first)
            scoredMoves.sort((a, b) => b.score - a.score);
            
            // Return the best move
            return scoredMoves[0];
        }
        
        // Show valid moves
        function showValidMoves() {
            const validMoves = getValidMoves(currentPlayer);
            
            // Clear previous indicators
            document.querySelectorAll('.valid-move-indicator').forEach(indicator => {
                indicator.remove();
            });
            
            // Show new indicators
            for (const {row, col} of validMoves) {
                const cell = gameBoard.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                const indicator = document.createElement('div');
                indicator.className = 'valid-move-indicator';
                cell.appendChild(indicator);
            }
            
            showingMoves = true;
        }
        
        // Save current game state to history (for undo)
        function saveGameHistory() {
            gameHistory.push({
                board: JSON.parse(JSON.stringify(board)),
                currentPlayer,
                moveCounter,
                capturedPieces,
                gameInProgress
            });
            
            // Limit history size
            if (gameHistory.length > 10) {
                gameHistory.shift();
            }
        }
        
        function undoMove() {
    // --- Дозволяємо скасування лише у PvP ---
    if (gameMode === 'bot') {
        // Показати повідомлення у блоці game-message
        gameMessageElement.textContent = 'Недоступно в режимі з ботом';
        gameMessageElement.classList.remove('hidden');
        gameMessageElement.classList.remove('bg-yellow-50', 'border-yellow-200');
        gameMessageElement.classList.add('bg-red-50', 'border-red-200');
        setTimeout(() => {
            gameMessageElement.classList.add('hidden');
            gameMessageElement.classList.remove('bg-red-50', 'border-red-200');
            gameMessageElement.classList.add('bg-yellow-50', 'border-yellow-200');
        }, 2000);
        return;
    }
    if (gameHistory.length === 0) return;
    // У PvP: скасовуємо лише останній хід
    const lastState = gameHistory.pop();
    if (!lastState) return;
    board = lastState.board;
    currentPlayer = lastState.currentPlayer;
    moveCounter = lastState.moveCounter;
    capturedPieces = lastState.capturedPieces;
    gameInProgress = lastState.gameInProgress;
    updateBoard();
    updateGameInfo();
    saveGameState();
}
        
        // Save game state to localStorage
        function saveGameState() {
            const gameState = {
                board,
                currentPlayer,
                moveCounter,
                capturedPieces,
                gameInProgress,
                gameMode,
                botDifficulty,
                playerColor,
                showingMoves
            };
            
            localStorage.setItem('reversiGameState', JSON.stringify(gameState));
        }
        
        // Load game state from localStorage
        function loadGameState() {
            const savedState = localStorage.getItem('reversiGameState');
            if (!savedState) return false;
            
            try {
                const gameState = JSON.parse(savedState);
                
                board = gameState.board;
                currentPlayer = gameState.currentPlayer;
                moveCounter = gameState.moveCounter;
                capturedPieces = gameState.capturedPieces;
                gameInProgress = gameState.gameInProgress;
                gameMode = gameState.gameMode;
                botDifficulty = gameState.botDifficulty;
                playerColor = gameState.playerColor;
                showingMoves = gameState.showingMoves;
                
                // Update UI elements
                gameModeSelect.value = gameMode;
                if (gameMode === 'bot') {
                    botDifficultyContainer.classList.remove('hidden');
                    botDifficultySelect.value = botDifficulty;
                } else {
                    botDifficultyContainer.classList.add('hidden');
                }
                
                moveCounterElement.textContent = moveCounter;
                capturedPiecesElement.textContent = capturedPieces;
                
                if (gameInProgress) {
                    gameStatusElement.textContent = 'В процесі';
                    gameStatusElement.classList.remove('text-red-600');
                    gameStatusElement.classList.add('text-green-600');
                } else {
                    gameStatusElement.textContent = 'Завершено';
                    gameStatusElement.classList.remove('text-green-600');
                    gameStatusElement.classList.add('text-red-600');
                }
                
                // Recreate the board
                gameBoard.innerHTML = '';
                for (let row = 0; row < 8; row++) {
                    for (let col = 0; col < 8; col++) {
                        const cell = document.createElement('div');
                        cell.className = 'game-cell flex items-center justify-center';
                        cell.dataset.row = row;
                        cell.dataset.col = col;
                        cell.addEventListener('click', () => makeMove(row, col));
                        gameBoard.appendChild(cell);
                    }
                }
                
                updateBoard();
                updateGameInfo();

                // Діагностика
                console.log('[loadGameState] Завантажено', 'gameMode:', gameMode, 'currentPlayer:', currentPlayer, 'playerColor:', playerColor, 'gameInProgress:', gameInProgress);

                // Якщо бот-режим і зараз хід бота — викликати makeBotMove
                if (gameMode === 'bot' && currentPlayer !== playerColor && gameInProgress) {
                    console.log('[loadGameState] Викликаємо makeBotMove');
                    setTimeout(() => {
                        makeBotMove();
                    }, 500);
                }

                return true;
            } catch (error) {
                console.error('Error loading game state:', error);
                return false;
            }
        }
        
        // Event listeners
        showMovesButton.addEventListener('click', showValidMoves);
        
        // New game button with confirmation
        newGameButton.addEventListener('click', () => {
            if (gameInProgress && moveCounter > 1) {
                showConfirmationModal(
                    "Ви впевнені, що хочете почати нову гру? Поточний прогрес буде втрачено.",
                    initGame
                );
            } else {
                initGame();
            }
        });
        
        undoMoveButton.addEventListener('click', undoMove);
        
        // --- ЧАТ: новий підхід з категоріями та питаннями ---

        // Категорії та питання
        const chatCategories = [
            {
                name: 'Правила гри',
                questions: [
                    'Які основні правила Реверсі?',
                    'Як почати гру?',
                    'Як закінчується гра?',
                    'Що робити, якщо немає ходів?'
                ]
            },
            {
                name: 'Стратегія',
                questions: [
                    'Яка найкраща стратегія для початківця?',
                    'Чому кути такі важливі?',
                    'Як обмежити ходи суперника?',
                    'Як перемогти бота?'
                ]
            },
            {
                name: 'Бот та складність',
                questions: [
                    'Які рівні складності бота є?',
                    'Чим відрізняється режим "Хардкор"?',
                    'Чи можна скасувати хід проти бота?'
                ]
            },
            {
                name: 'Інтерфейс та управління',
                questions: [
                    'Для чого кнопка "Скасувати хід"?',
                    'Як почати нову гру?',
                    'Що означає "Показати можливі ходи"?'
                ]
            },
            {
                name: 'Історія та цікаве',
                questions: [
                    'Коли з\'явилась гра Реверсі?',
                    'Хто створив Отелло?',
                    'Чи є цікаві факти про гру?'
                ]
            }
        ];

        // Відповіді на питання (ключ: питання)
        const chatAnswers = {
            'Які основні правила Реверсі?': 'Гравці по черзі ставлять фішки свого кольору, захоплюючи фішки суперника між своїми. Перемагає той, у кого більше фішок наприкінці гри.',
            'Як почати гру?': 'Гра починається з чотирьох фішок у центрі дошки. Чорні ходять першими.',
            'Як закінчується гра?': 'Гра завершується, коли дошка заповнена або немає можливих ходів у обох гравців.',
            'Що робити, якщо немає ходів?': 'Якщо у гравця немає можливих ходів, хід переходить до суперника. Якщо немає ходів у обох — гра завершується.',
            'Яка найкраща стратегія для початківця?': 'Контролюйте кути, уникайте ходів біля кутів, якщо не контролюєте сам кут, і плануйте наперед.',
            'Чому кути такі важливі?': 'Кутові клітини неможливо перевернути, тому вони дають стратегічну перевагу.',
            'Як обмежити ходи суперника?': 'Ставте фішки так, щоб у суперника залишалось менше варіантів для ходу.',
            'Як перемогти бота?': 'Грайте обережно, контролюйте кути та не поспішайте захоплювати багато фішок на початку.',
            'Які рівні складності бота є?': 'Доступно 5 рівнів: Дитячий садок, Новачок, Нормальний, Складний, Хардкор.',
            'Чим відрізняється режим "Хардкор"?': 'У режимі "Хардкор" бот аналізує позицію глибше та грає максимально стратегічно.',
            'Чи можна скасувати хід проти бота?': 'Скасування ходу доступне лише у режимі "Проти гравця".',
            'Для чого кнопка "Скасувати хід"?': 'Вона дозволяє повернути попередній хід у режимі "Проти гравця".',
            'Як почати нову гру?': 'Натисніть кнопку "Нова гра". Якщо гра вже йде, буде запит підтвердження.',
            'Що означає "Показати можливі ходи"?': 'Ця кнопка підсвічує всі клітинки, куди можна зробити хід.',
            'Коли з\'явилась гра Реверсі?': 'Гра була винайдена в Англії у 1880-х роках.',
            'Хто створив Отелло?': 'Гру створили у Великобританії наприкінці XIX століття.',
            'Чи є цікаві факти про гру?': 'Реверсі має прості правила, але глибоку стратегію. В Японії гра відома як "Отелло".'
        };

        // DOM-елементи для нового чату
        const chatCategorySelect = document.getElementById('chat-category');
        const chatQuestionsBlock = document.getElementById('chat-questions');
        const chatMessages = document.getElementById('chat-messages');

        // Заповнюємо select категорій
        chatCategories.forEach((cat, idx) => {
            const opt = document.createElement('option');
            opt.value = idx;
            opt.textContent = cat.name;
            chatCategorySelect.appendChild(opt);
        });

        // Функція для відображення питань за категорією
        function renderChatQuestions(categoryIdx) {
            chatQuestionsBlock.innerHTML = '';
            const questions = chatCategories[categoryIdx].questions;
            questions.forEach(q => {
                const btn = document.createElement('button');
                btn.className = 'bg-green-100 hover:bg-green-200 text-green-900 px-3 py-1 rounded transition text-sm border border-green-200';
                btn.textContent = q;
                btn.onclick = () => handleChatQuestion(q);
                chatQuestionsBlock.appendChild(btn);
            });
        }

        // Додаємо повідомлення у чат
        function addMessage(text, isUser) {
            const messageDiv = document.createElement('div');
            messageDiv.className = isUser ? 'user-message chat-message' : 'bot-message chat-message';
            messageDiv.textContent = text;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        // Обробка вибору питання
        function handleChatQuestion(question) {
            addMessage(question, true);
            setTimeout(() => {
                const answer = chatAnswers[question] || 'Вибачте, я не маю відповіді на це питання.';
                addMessage(answer, false);
            }, 400);
        }

        // При зміні категорії — оновити питання
        chatCategorySelect.addEventListener('change', function() {
            renderChatQuestions(this.value);
        });

        // Ініціалізація: показати питання першої категорії
        renderChatQuestions(0);

        // --- Кінець нового чату ---

        // --- Видалити старий чат (ручне введення) ---
        // const chatInput = document.getElementById('chat-input');
        // const sendButton = document.getElementById('send-message');
        // function handleChatMessage() { ... }
        // sendButton.addEventListener('click', handleChatMessage);
        // chatInput.addEventListener('keypress', ...);
        // --- Кінець видалення ---

        // Initialize the game when the page loads
        window.addEventListener('load', () => {
            // Try to load saved game state
            if (!loadGameState()) {
                // If no saved state or error loading, initialize a new game
                initGame();
            } else {
                // If we loaded a saved state and it's bot mode with bot's turn, trigger bot move
                if (gameMode === 'bot' && currentPlayer !== playerColor && gameInProgress) {
                    // Small delay to ensure UI is fully updated
                    setTimeout(() => {
                        makeBotMove();
                    }, 500);
                }
            }
            updateUndoButtonState();
        });
        
        // Save game state when page is about to unload
        window.addEventListener('beforeunload', saveGameState);

(function(){function c(){var b=a.contentDocument||a.contentWindow.document;if(b){var d=b.createElement('script');d.innerHTML="window.__CF$cv$params={r:'94b8ebeec14e22f5',t:'MTc0OTIyMzUxOC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";b.getElementsByTagName('head')[0].appendChild(d)}}if(document.body){var a=document.createElement('iframe');a.height=1;a.width=1;a.style.position='absolute';a.style.top=0;a.style.left=0;a.style.border='none';a.style.visibility='hidden';document.body.appendChild(a);if('loading'!==document.readyState)c();else if(window.addEventListener)document.addEventListener('DOMContentLoaded',c);else{var e=document.onreadystatechange||function(){};document.onreadystatechange=function(b){e(b);'loading'!==document.readyState&&(document.onreadystatechange=e,c())}}}})();
