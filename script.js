// CONFIGURAÇÕES DO JOGO
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 10;

// DADOS DAS UNIDADES
let units = [
    {
        id: 'ge01',
        name: 'Gato Error',
        symbol: 'G',
        faction: 'gato-error',
        position: { x: 1, y: 1 },
        health: 25,
        maxHealth: 25,
        attack: 12,
        moveRange: 4,
        attackRange: 1,
        hasActed: false
    },
    {
        id: 'co01',
        name: 'Cosmonauta',
        symbol: 'C',
        faction: 'cosmonauta',
        position: { x: BOARD_WIDTH - 2, y: BOARD_HEIGHT - 2 },
        health: 40,
        maxHealth: 40,
        attack: 8,
        moveRange: 3,
        attackRange: 2,
        hasActed: false
    }
];

// ELEMENTOS DO DOM
const gameBoardEl = document.getElementById('game-board');
const currentTurnFactionEl = document.getElementById('current-turn-faction');
const endTurnButton = document.getElementById('end-turn-button');
const unitInfoEl = document.getElementById('unit-info');

// ESTADO DO JOGO
let selectedUnitId = null;
let factions = ['gato-error', 'cosmonauta'];
let currentTurnIndex = 0;
let currentTurnFaction = factions[currentTurnIndex];
let voidEventTriggered = false;
let gatoErrorRedeemed = false;

// --- FUNÇÕES DE LÓGICA DO JOGO ---

function createBoard() {
    gameBoardEl.style.gridTemplateColumns = `repeat(${BOARD_WIDTH}, 1fr)`;
    gameBoardEl.style.gridTemplateRows = `repeat(${BOARD_HEIGHT}, 1fr)`;
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.classList.add('grid-cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            gameBoardEl.appendChild(cell);
        }
    }
}

function renderUnits() {
    document.querySelectorAll('.unit').forEach(unitEl => unitEl.remove());
    units.forEach(unit => {
        const cell = gameBoardEl.querySelector(`.grid-cell[data-x='${unit.position.x}'][data-y='${unit.position.y}']`);
        if (cell) {
            const unitEl = document.createElement('div');
            unitEl.classList.add('unit', unit.faction);
            if(unit.id === 'ge01' && gatoErrorRedeemed) {
                unitEl.classList.add('redeemed'); 
            }
            if(unit.hasActed) unitEl.style.filter = 'grayscale(80%)'; 
            unitEl.textContent = unit.symbol;
            unitEl.dataset.unitId = unit.id;
            const healthBar = document.createElement('div');
            healthBar.classList.add('health-bar');
            const healthBarCurrent = document.createElement('div');
            healthBarCurrent.classList.add('health-bar-current');
            healthBarCurrent.style.width = `${(unit.health / unit.maxHealth) * 100}%`;
            healthBar.appendChild(healthBarCurrent);
            unitEl.appendChild(healthBar);
            if (unit.id === selectedUnitId) unitEl.classList.add('selected');
            cell.appendChild(unitEl);
        }
    });
}

function clearHighlights() {
    document.querySelectorAll('.grid-cell').forEach(cell => {
        cell.classList.remove('movable', 'attackable');
    });
}

function showActionRange() {
    clearHighlights();
    const selectedUnit = units.find(u => u.id === selectedUnitId);
    if (!selectedUnit || selectedUnit.hasActed) return;
    const startX = selectedUnit.position.x;
    const startY = selectedUnit.position.y;
    document.querySelectorAll('.grid-cell').forEach(cell => {
        const cellX = parseInt(cell.dataset.x);
        const cellY = parseInt(cell.dataset.y);
        const distance = Math.abs(cellX - startX) + Math.abs(cellY - startY);
        if (distance > 0 && distance <= selectedUnit.moveRange) {
            if (!units.some(u => u.position.x === cellX && u.position.y === cellY)) {
                cell.classList.add('movable');
            }
        }
        const unitInCell = units.find(u => u.position.x === cellX && u.position.y === cellY);
        if (unitInCell && unitInCell.faction !== selectedUnit.faction) {
             if (distance > 0 && distance <= selectedUnit.attackRange) {
                cell.classList.add('attackable');
             }
        }
    });
}

function updateUnitInfo() {
    const selectedUnit = units.find(u => u.id === selectedUnitId);
    if (selectedUnit) {
        unitInfoEl.innerHTML = `
            <h3>${selectedUnit.name}</h3>
            <p>Vida: ${selectedUnit.health} / ${selectedUnit.maxHealth}</p>
            <p>Ataque: ${selectedUnit.attack}</p>
            <p>Alcance Mov.: ${selectedUnit.moveRange} | Alcance Atq.: ${selectedUnit.attackRange}</p>
        `;
    } else {
        unitInfoEl.innerHTML = `<p>Selecione uma unidade para ver seus detalhes.</p>`;
    }
}

function moveUnit(unit, newX, newY) {
    unit.position.x = newX;
    unit.position.y = newY;
    unit.hasActed = true;
    selectedUnitId = null;
    clearHighlights();
    renderUnits();
}

function attackUnit(attacker, defender) {
    defender.health -= attacker.attack;
    if (defender.health < 0) defender.health = 0;
    attacker.hasActed = true;
    selectedUnitId = null;
    clearHighlights();
    if (defender.id === 'co01' && !voidEventTriggered) {
        triggerVoidEvent(defender);
        return; 
    }
    if (defender.health <= 0) {
        const defenderPosition = { ...defender.position };
        units = units.filter(u => u.id !== defender.id);
        if (defender.faction === 'vazio') {
            triggerGoodEnding(defenderPosition);
        }
        checkWinConditions();
    }
    renderUnits();
}

function triggerVoidEvent(cosmonautUnit) {
    voidEventTriggered = true;
    alert("O Sem aproveita a fraqueza do Cosmonauta e assume o controle!");
    cosmonautUnit.name = "Cosmonauta Vazio";
    cosmonautUnit.symbol = "V";
    cosmonautUnit.faction = "vazio";
    cosmonautUnit.health = 80;
    cosmonautUnit.maxHealth = 80;
    cosmonautUnit.attack = 15;
    cosmonautUnit.moveRange = 2;
    cosmonautUnit.attackRange = 1;
    factions.push("vazio");
    selectedUnitId = null;
    clearHighlights();
    renderUnits();
}

function triggerAstroBotRedemption() {
    gatoErrorRedeemed = true;
    const gatoErrorUnit = units.find(u => u.id === 'ge01');
    if (gatoErrorUnit) {
        alert("O Gato Error purifica sua essência! O Astro-Bot Descorrompido renasce!");
        gatoErrorUnit.name = "Astro-Bot Descorrompido";
        gatoErrorUnit.symbol = "A";
        gatoErrorUnit.health = 50;
        gatoErrorUnit.maxHealth = 50;
        gatoErrorUnit.attack = 18;
        gatoErrorUnit.moveRange = 5;
        gatoErrorUnit.attackRange = 2;
        gatoErrorUnit.hasActed = false;
    }
}

function triggerGoodEnding(position) {
    triggerAstroBotRedemption();
    const karenUnit = {
        id: 'karen01', name: 'Karen', symbol: 'K', faction: 'cosmonauta',
        position: { x: position.x, y: position.y }, health: 70, maxHealth: 70,
        attack: 0, moveRange: 4, hasActed: true, passive: "Aura de Sincronia",
        abilities: { ressurreicao: { name: "Ressurreição", uses: 1, used: false }, eloDimensional: { name: "Elo Dimensional" } }
    };
    let tripulantePos = findEmptyAdjacentCell(position);
    const tripulanteUnit = {
        id: 'tripulante01', name: 'Tripulante Humana', symbol: 'T', faction: 'cosmonauta',
        position: tripulantePos, health: 20, maxHealth: 20, attack: 5, moveRange: 4, attackRange: 1, hasActed: true
    };
    let kevinPos = findEmptyAdjacentCell(tripulantePos);
    const kevinUnit = {
        id: 'kevin01', name: 'Kevin Restaurado', symbol: 'K', faction: 'cosmonauta',
        position: kevinPos, health: 40, maxHealth: 40, attack: 0, moveRange: 3, hasActed: true,
        passive: "Aura de Estabilidade",
        abilities: { apagar: { name: "Apagar", range: 3, uses: 1, used: false }, passoNoVazio: { name: "Passo no Vazio", range: 6 } }
    };
    units.push(karenUnit, tripulanteUnit, kevinUnit);
    if(!factions.includes('cosmonauta')) factions.splice(1, 0, 'cosmonauta');
    renderUnits();
}

function findEmptyAdjacentCell(pos) {
    const directions = [{x:0, y:-1}, {x:1, y:0}, {x:0, y:1}, {x:-1, y:0}];
    for(const dir of directions) {
        const newPos = { x: pos.x + dir.x, y: pos.y + dir.y };
        const isOccupied = units.some(u => u.position.x === newPos.x && u.position.y === newPos.y);
        const isInBounds = newPos.x >= 0 && newPos.x < BOARD_WIDTH && newPos.y >= 0 && newPos.y < BOARD_HEIGHT;
        if(isInBounds && !isOccupied) {
            return newPos;
        }
    }
    return pos;
}

function performVoidTurn() {
    const voidUnit = units.find(u => u.faction === 'vazio');
    if (!voidUnit) { endTurn(); return; }
    let closestTarget = null;
    let minDistance = Infinity;
    units.forEach(target => {
        if (target.faction !== 'vazio') {
            const distance = Math.abs(target.position.x - voidUnit.position.x) + Math.abs(target.position.y - voidUnit.position.y);
            if (distance < minDistance) {
                minDistance = distance;
                closestTarget = target;
            }
        }
    });
    if (closestTarget) {
        if (minDistance <= voidUnit.attackRange) {
            attackUnit(voidUnit, closestTarget);
        } else {
            let moveX = voidUnit.position.x; let moveY = voidUnit.position.y;
            const dx = closestTarget.position.x - voidUnit.position.x;
            const dy = closestTarget.position.y - voidUnit.position.y;
            if (Math.abs(dx) > Math.abs(dy)) { moveX += Math.sign(dx); } else { moveY += Math.sign(dy); }
            if (!units.some(u => u.position.x === moveX && u.position.y === moveY)) {
                moveUnit(voidUnit, moveX, moveY);
            } else { voidUnit.hasActed = true; }
        }
    } else { voidUnit.hasActed = true; }
    setTimeout(endTurn, 1000);
}

function checkWinConditions() {
    const remainingFactions = new Set(units.map(u => u.faction));
    if (voidEventTriggered && remainingFactions.size === 1 && remainingFactions.has('vazio')) {
        alert("O Vazio consumiu tudo... FINAL RUIM.");
        endTurnButton.disabled = true;
    } else if (voidEventTriggered && !remainingFactions.has('vazio')) {
        alert("O Vazio foi purificado! Kevin e a Tripulante estão livres! FINAL BOM!");
        endTurnButton.disabled = true;
    } else if (!voidEventTriggered && remainingFactions.size === 1) {
         alert(`A facção ${[...remainingFactions][0].toUpperCase()} venceu!`);
         endTurnButton.disabled = true;
    }
}

function endTurn() {
    selectedUnitId = null;
    clearHighlights();
    units.forEach(u => u.hasActed = false);
    currentTurnIndex = (currentTurnIndex + 1) % factions.length;
    currentTurnFaction = factions[currentTurnIndex];
    updateTurnDisplay();
    renderUnits();
    if (currentTurnFaction === 'vazio') {
        endTurnButton.disabled = true;
        performVoidTurn();
    } else {
        endTurnButton.disabled = false;
    }
}

function handleBoardClick(event) {
    const clickedElement = event.target.closest('.grid-cell');
    if (!clickedElement) return;
    const clickedUnitEl = clickedElement.querySelector('.unit');
    if (clickedUnitEl) {
        const clickedUnitId = clickedUnitEl.dataset.unitId;
        const clickedUnit = units.find(u => u.id === clickedUnitId);
        if (clickedUnit.faction === currentTurnFaction && !clickedUnit.hasActed) {
            selectedUnitId = (selectedUnitId === clickedUnitId) ? null : clickedUnitId;
        } else if (selectedUnitId && clickedUnit.faction !== currentTurnFaction && clickedElement.classList.contains('attackable')) {
            const attacker = units.find(u => u.id === selectedUnitId);
            if (attacker && attacker.faction === currentTurnFaction && !attacker.hasActed) {
                attackUnit(attacker, clickedUnit);
            } else { selectedUnitId = null; }
        } else { selectedUnitId = null; }
    } else if (clickedElement.classList.contains('movable') && selectedUnitId) {
        const unitToMove = units.find(u => u.id === selectedUnitId);
        if (unitToMove && unitToMove.faction === currentTurnFaction && !unitToMove.hasActed) {
            moveUnit(unitToMove, parseInt(clickedElement.dataset.x), parseInt(clickedElement.dataset.y));
        } else { selectedUnitId = null; }
    } else { selectedUnitId = null; }
    renderUnits();
    showActionRange();
    updateUnitInfo();
}

function initializeGame() {
    createBoard();
    renderUnits();
    updateTurnDisplay();
    gameBoardEl.addEventListener('click', handleBoardClick);
    endTurnButton.addEventListener('click', endTurn);
}

function updateTurnDisplay() {
    currentTurnFactionEl.textContent = currentTurnFaction.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

initializeGame();