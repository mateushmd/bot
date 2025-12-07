import { DIRS, MAP1, rightOf, leftOf } from './maps.js';

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const MODES = {
    idle: 0,
    editing: 1,
    playing: 2,
    paused: 3,
};

function inGrid(x) {
	return x*37.5
}

class Mouse {
	constructor(x, y) {
		this.facing = DIRS.u
		this.pos = new Vector2(0, 0)
		this.last_pos = new Vector2(-1, -1)
		if (x != undefined && y != undefined) {
			this.pos.x = x
			this.pos.y = y
		}
	}

	canWalk(direction) {
		let res = false
		if (direction == DIRS.u) {
			res = ((map[this.pos.y][this.pos.x] & DIRS.u) == 0)
		} else if (direction == DIRS.d) {
			console.log(map[1][0])
			res = ((map[this.pos.y][this.pos.x] & DIRS.d) == 0)
		} else if (direction == DIRS.l) {
			res = ((map[this.pos.y][this.pos.x] & DIRS.l) == 0)
		} else if (direction == DIRS.r) {
			res = ((map[this.pos.y][this.pos.x] & DIRS.r) == 0)
		}
		return res
	}

	turnLeft() {
		this.facing = leftOf(this.facing)
	}

	turnRight() {
		this.facing = rightOf(this.facing)
	}

	move() {
		let res = false
		let direction = this.facing

		console.log("move\n\n\n")
		if (this.canWalk(direction)) {
			console.log("can walk\n\n\n")
			this.last_pos.x = this.pos.x
			this.last_pos.y = this.pos.y
			if (direction == DIRS.u) {
				this.pos.y -= 1
			} else if (direction == DIRS.d) {
				this.pos.y += 1
			} else if (direction == DIRS.l) {
				this.pos.x -= 1
			} else if (direction == DIRS.r) {
				this.pos.x += 1
			}
			res = true
		}
		if (res) {
			redraw()
		}
		return res
	}
}

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const playBtn = document.querySelector('#play');
const restartBtn = document.querySelector('#restart');
const editBtn = document.querySelector('#edit');

let screenSize = new Vector2(canvas.width, canvas.height);
let gridSize = new Vector2(16, 16);
let cellSize = new Vector2(screenSize.x / gridSize.x, screenSize.y / gridSize.y);
let mousePos = new Vector2(-1, -1);

let mode = MODES.idle;

let editInterval = null;

let robot = new Mouse(0, 0);

let map = [
    [DIRS.u | DIRS.l, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u, DIRS.u | DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, DIRS.r],
    [DIRS.d | DIRS.l, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d, DIRS.d | DIRS.r],
];

let wallPreview = null;

document.addEventListener('DOMContentLoaded', init);
document.addEventListener('mousemove', (e) => getMousePos(e));
document.addEventListener('mouseenter', (e) => getMousePos(e));
playBtn.addEventListener('click', (e) => {
    const button = e.target;
    if (mode === MODES.idle || mode === MODES.paused) {
        button.innerHTML = 'Pausar';
        mode = MODES.playing;
        restartBtn.disabled = false;
        editBtn.disabled = true;
		startGame();

    } else if (mode === MODES.playing) {
        button.innerHTML = 'Continuar';
        mode = MODES.paused;
        editBtn.disabled = true;
    }
});
restartBtn.addEventListener('click', (e) => {
    const button = e.target;
    if (mode === MODES.playing || mode === MODES.paused) {
        mode = MODES.idle;
        editBtn.disabled = false;
        playBtn.InnerHTML = 'Iniciar';
        button.disabled = true;
    }
})
editBtn.addEventListener('click', (e) => {
    const button = e.target;
    if (mode === MODES.idle) {
        button.innerHTML = 'Salvar';
        mode = MODES.editing;
        playBtn.disabled = true;
        editInterval = setInterval(editTick, 1000 / 15);
    } else if (mode === MODES.editing) {
        button.innerHTML = 'Editar';
        mode = MODES.idle;
        playBtn.disabled = false;
        clearInterval(editInterval);
    }
});
canvas.addEventListener('click', addWall);
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    removeWall();
});

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
}


function init() {
    map = MAP1;
	redraw()
}

function redraw() {
	context.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid();
	drawRobot();
    drawMap();
}

function drawRobot() {
    context.fillStyle = '#FF000020';
    context.fillRect(inGrid(robot.pos.x), inGrid(robot.pos.y), cellSize.x, cellSize.y);
}

function drawGrid() {
    context.strokeStyle = '#FFFFFF20';
    context.setLineDash([5, 5]);

    context.beginPath();

    context.fillStyle = '#00FF0020';
    context.fillRect(cellSize.x * (16 / 2 - 1), cellSize.y * (16 / 2 - 1), cellSize.x * 2, cellSize.y * 2);

    for (let i = 0; i < gridSize.x - 1; i++) {
        const x = cellSize.x * (i + 1);
        context.moveTo(x, 0);
        context.lineTo(x, screenSize.y);
    }

    for (let i = 0; i < gridSize.y - 1; i++) {
        const y = cellSize.y * (i + 1);
        context.moveTo(0, y);
        context.lineTo(screenSize.y, y);
    }

    context.stroke();
}

function drawMap() {
    context.strokeStyle = '#FFFFFF';
    context.setLineDash([]);

    for (let i = 0; i < gridSize.y; i++) {
        for (let j = 0; j < gridSize.x; j++) {
            const dir = map[i][j];
            if (dir & DIRS.u) {
                drawWall(new Vector2(j, i), [new Vector2(0, 0), new Vector2(1, 0)]);
            }
            if (dir & DIRS.d) {
                drawWall(new Vector2(j, i), [new Vector2(0, 1), new Vector2(1, 1)]);
            }
            if (dir & DIRS.l) {
                drawWall(new Vector2(j, i), [new Vector2(0, 0), new Vector2(0, 1)]);
            }
            if (dir & DIRS.r) {
                drawWall(new Vector2(j, i), [new Vector2(1, 0), new Vector2(1, 1)]);
            }
        }
    }
}

function drawWall(position, ends) {
    const truePosition = new Vector2(position.x * cellSize.x,
        position.y * cellSize.y);

    const [start, end] = ends;

    context.beginPath();

    context.moveTo(
        truePosition.x + cellSize.x * start.x,
        truePosition.y + cellSize.y * start.y
    );

    context.lineTo(
        truePosition.x + cellSize.x * end.x,
        truePosition.y + cellSize.y * end.y
    );

    context.stroke();
}

function drawEditView() {
    if (wallPreview == null) {
        return;
    }


    context.strokeStyle = '#FF0000';
    context.setLineDash([]);

    if (wallPreview.dir & DIRS.u) {
        drawWall(wallPreview.position, [new Vector2(0, 0), new Vector2(1, 0)]);
    } else if (wallPreview.dir & DIRS.d) {
        drawWall(wallPreview.position, [new Vector2(0, 1), new Vector2(1, 1)]);
    } else if (wallPreview.dir & DIRS.l) {
        drawWall(wallPreview.position, [new Vector2(0, 0), new Vector2(0, 1)]);
    } else if (wallPreview.dir & DIRS.r) {
        drawWall(wallPreview.position, [new Vector2(1, 0), new Vector2(1, 1)]);
    }
}


function editTick() {
    editUpdate();
    editDraw();
}

function editUpdate() {
    if (mousePos.x < 0 || mousePos.x > screenSize.x || mousePos.y < 0 || mousePos.y > screenSize.y) {
        wallPreview = null;
        return;
    }

    const cellPos = new Vector2(Math.floor(mousePos.x / cellSize.x), Math.floor(mousePos.y / cellSize.y));
    const relativePos = new Vector2(mousePos.x - cellPos.x * cellSize.x, mousePos.y - cellPos.y * cellSize.y);

    const belowMainDiag = relativePos.x < relativePos.y;
    const belowAntiDiag = relativePos.x + relativePos.y > cellSize.x;

    let dir;
    if (!belowMainDiag && !belowAntiDiag) {
        dir = DIRS.u;
    } else if (belowMainDiag && !belowAntiDiag) {
        dir = DIRS.l;
    } else if (!belowMainDiag && belowAntiDiag) {
        dir = DIRS.r;
    } else {
        dir = DIRS.d;
    }

    if ((cellPos.y === 0 && dir === DIRS.u)
        || (cellPos.x === 0 && dir === DIRS.l)
        || (cellPos.y === gridSize.y - 1 && dir === DIRS.d)
        || (cellPos.x === gridSize.x - 1 && dir === DIRS.r)) {
        wallPreview = null;
        return;
    }

    wallPreview = {
        position: cellPos,
        dir: dir
    };
}

function editDraw() {
    context.clearRect(0, 0, screenSize.x, screenSize.y);

    drawGrid();
    drawEditView();
    drawMap();
	robot.move()
}

function addWall() {
    if (mode !== MODES.editing || wallPreview == null) {
        return;
    }

    const pos = wallPreview.position;
    if (wallPreview.dir === DIRS.u) {
        map[pos.y][pos.x] |= DIRS.u;
        if (pos.y > 0) {
            map[pos.y - 1][pos.x] |= DIRS.d;
        }
    } else if (wallPreview.dir === DIRS.d) {
        map[pos.y][pos.x] |= DIRS.d;
        if (pos.y < gridSize.y - 1) {
            map[pos.y + 1][pos.x] |= DIRS.u;
        }
    } else if (wallPreview.dir === DIRS.l) {
        map[pos.y][pos.x] |= DIRS.l;
        if (pos.x > 0) {
            map[pos.y][pos.x - 1] |= DIRS.r;
        }
    } else if (wallPreview.dir === DIRS.r) {
        map[pos.y][pos.x] |= DIRS.r;
        if (pos.x < gridSize.x - 1) {
            map[pos.y][pos.x + 1] |= DIRS.l;
        }
    }
}

function removeWall() {
    if (mode !== MODES.editing || wallPreview == null) {
        return;
    }

    const pos = wallPreview.position;
    if (wallPreview.dir === DIRS.u) {
        map[pos.y][pos.x] &= (~DIRS.u);
        if (pos.y > 0) {
            map[pos.y - 1][pos.x] &= (~DIRS.d);
        }
    } else if (wallPreview.dir === DIRS.d) {
        map[pos.y][pos.x] &= (~DIRS.d);
        if (pos.y < gridSize.y - 1) {
            map[pos.y + 1][pos.x] &= (~DIRS.u);
        }
    } else if (wallPreview.dir === DIRS.l) {
        map[pos.y][pos.x] &= (~DIRS.l);
        if (pos.x > 0) {
            map[pos.y][pos.x - 1] &= (~DIRS.r);
        }
    } else if (wallPreview.dir === DIRS.r) {
        map[pos.y][pos.x] &= (~DIRS.r);
        if (pos.x < gridSize.x - 1) {
            map[pos.y][pos.x + 1] &= (~DIRS.l);
        }
    }
}


export { robot };
globalThis.robot = robot;
