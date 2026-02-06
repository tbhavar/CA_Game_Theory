// --- STATE MANAGEMENT ---
let gameState = {
    role: null,
    subRole: null,
    userScore: 0,
    botScore: 0,
    history: [] // Stores 'C' (Cooperate) or 'D' (Defect) pairs
};

// --- SCENARIO DATA ---
const scenarios = {
    'foundation': {
        title: "CA Foundation: The Study Group",
        desc: "You are preparing for your Foundation exams. You have found a great shortcut for Logical Reasoning. Do you share it with your peer?"
    },
    'inter-awaiting': {
        title: "CA Inter: The IT Training",
        desc: "You are in your OC/IT training waiting for results. You hear about a vacancy at a top firm. Do you share the lead with your batchmate?"
    },
    'final-articleship': {
        title: "Articleship: The Audit Deadline",
        desc: "It's tax audit season. You created a complex Excel macro that saves hours. Do you share it with your co-article who is struggling?"
    },
    'final-completed': {
        title: "Final CA: Open Book Exam",
        desc: "You are preparing for the Elective paper. You have a comprehensive summary of Case Laws. Do you share it with your study circle?"
    },
    'practice': {
        title: "CA in Practice: Client Referral",
        desc: "A client needs a service you don't offer (e.g., Forensic Audit). Do you refer them to a peer (Cooperate) or try to keep the client's other work by not mentioning the peer (Defect)?"
    },
    'job': {
        title: "CA in Job: Budgeting Season",
        desc: "You are the Finance Manager. Sales asks for budget flexibility. Do you provide honest estimates (Cooperate) or pad the numbers to protect your variance (Defect)?"
    }
};

// --- UI LOGIC ---

function showSubOptions(role) {
    gameState.role = role;
    
    // Hide all first
    document.getElementById('step-2').classList.remove('hidden');
    document.getElementById('student-options').classList.add('hidden');
    document.getElementById('qualified-options').classList.add('hidden');
    
    const subHeader = document.getElementById('sub-question-text');

    if (role === 'student') {
        subHeader.innerText = "What level are you studying?";
        document.getElementById('student-options').classList.remove('hidden');
    } else {
        subHeader.innerText = "Current Professional Status?";
        document.getElementById('qualified-options').classList.remove('hidden');
    }
    
    // Reset selection listener
    document.querySelectorAll('input[name="sub-role"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            gameState.subRole = e.target.value;
            document.getElementById('start-btn').disabled = false;
        });
    });
}

function startGame() {
    if (!gameState.subRole) return;

    // Hide setup, show game
    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('game-area').classList.remove('hidden');

    // Load Scenario
    const data = scenarios[gameState.subRole];
    document.getElementById('scenario-title').innerText = data.title;
    document.getElementById('scenario-desc').innerText = 
        data.desc + "\n\n(Cooperate = Collaborative approach / Defect = Selfish approach)";
}

// --- GAME THEORY ENGINE ---

// Payoff Matrix (Standard Prisoner's Dilemma)
// [User, Bot]
const payoffs = {
    'CC': [3, 3], // Reward for mutual cooperation
    'CD': [0, 5], // Sucker's payoff (User cooperates, Bot defects)
    'DC': [5, 0], // Temptation to defect (User defects, Bot cooperates)
    'DD': [1, 1]  // Punishment for mutual defection
};

function getBotMove(strategy, history) {
    const roundNumber = history.length;

    switch (strategy) {
        case 'tit_for_tat':
            // Rule: Cooperate on first move, then copy opponent's last move
            if (roundNumber === 0) return 'C';
            return history[roundNumber - 1].userMove;

        case 'always_defect':
            return 'D';

        case 'always_cooperate':
            return 'C';

        case 'random':
            return Math.random() > 0.5 ? 'C' : 'D';

        case 'grim':
            // Cooperate until opponent defects once, then defect forever
            if (roundNumber === 0) return 'C';
            const opponentHasDefected = history.some(round => round.userMove === 'D');
            return opponentHasDefected ? 'D' : 'C';
            
        default:
            return 'C';
    }
}

function playRound(userMove) {
    const userChoice = userMove === 'cooperate' ? 'C' : 'D';
    const strategy = document.getElementById('opponent-strategy').value;
    
    // Get Bot Move
    const botChoice = getBotMove(strategy, gameState.history);

    // Calculate Scores
    const outcomeKey = userChoice + botChoice;
    const [pointsUser, pointsBot] = payoffs[outcomeKey];

    gameState.userScore += pointsUser;
    gameState.botScore += pointsBot;

    // Save History
    gameState.history.push({ userMove: userChoice, botMove: botChoice });

    // Update UI
    updateScoreboard();
    logRound(userChoice, botChoice, pointsUser, pointsBot);
}

function updateScoreboard() {
    document.getElementById('score-user').innerText = gameState.userScore;
    document.getElementById('score-bot').innerText = gameState.botScore;
}

function logRound(u, b, pU, pB) {
    const list = document.getElementById('game-log');
    const li = document.createElement('li');
    li.className = 'log-entry';
    
    const uText = u === 'C' ? '🤝 Cooperated' : '😈 Defected';
    const bText = b === 'C' ? '🤝 Cooperated' : '😈 Defected';
    
    li.innerHTML = `You <b>${uText}</b> (+${pU}) vs Opponent <b>${bText}</b> (+${pB})`;
    list.prepend(li); // Add new rounds to the top
}

function resetGame() {
    gameState.userScore = 0;
    gameState.botScore = 0;
    gameState.history = [];
    updateScoreboard();
    document.getElementById('game-log').innerHTML = '';
}
