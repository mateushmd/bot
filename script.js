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
		this.moved = false;
		this.facing = DIRS.d
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

	print() {
		console.log("pos: ", x, y);
		console.log("facing: ", facing);
	}

	move() {
		this.moved = true;
		let res = false
		let direction = this.facing

		if (this.canWalk(direction)) {

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
			this.print();
		}
		return res
	}
}

let robot = new Mouse(0, 0);

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
        playBtn.innerHTML = 'Iniciar';
        button.disabled = true;
		reset()
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

function reset() {
	robot = new Mouse(0, 0)
	redraw();
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

const MWidth = 16
let visited = new Array(MWidth);
let G = new Array(MWidth);
let H = new Array(MWidth);
let parent = new Array(MWidth);

function searchSetup() {

	visited = new Array(MWidth);
	G = new Array(MWidth);
	H = new Array(MWidth);
	parent = new Array(MWidth);

	for (let i = 0; i < MWidth; i++) {
		visited[i] = Array(MWidth)
		parent[i] = Array(MWidth)
		G[i] = Array(MWidth)
		H[i] = Array(MWidth)
		for (let j = 0; j < MWidth; j++) {
			visited[i][j] = false
			parent[i][j] = -1
			G[i][j] = Infinity
			H[i][j] = Infinity
		}
	}

	G[robot.pos.y][robot.pos.x] = 0
}

function F(v) {
	let g = G[v.y][v.x]
	let h = H[v.y][v.x]
	return (g+h)
}

function manhattan (v1, v2) {
	return (Math.abs(v1.x-v2.x) + Math.abs(v1.y-v2.y))
}

function heuristic (type, pos, v1, v2) {
	let value = -1

	if (type === 0) {
		value = Math.min(manhattan(pos, v1), manhattan(pos, v2));
	}
	return (value)
}

function minHeap (v1, v2) {
	let fv1 = F(v1)
	let fv2 = F(v2)

	let res = false
	if (fv1 === fv2) {
		res = (H[v1.y][v1.x] > H[v2.y][v2.x])
	} else {
		res = (fv1 > fv2)
	}
	return (res)
}

function qsort (arr, L, R) {
	let pivot = arr[Math.floor((L+R)/2.0)];
	let l = L
	let r = R

	let res = arr

	while (l <= r) {
		while (minHeap(arr[l], pivot)) {
			l++
		}
		while (minHeap(pivot, arr[r])) {
			r--
		}
		if (l <= r) {
			let tmp = arr[l]
			arr[l] = arr[r]
			arr[r] = tmp
			l++
			r--
		}
	}
	if (l < R) {
		res = qsort(arr, l, R)
	}
	if (L < r) {
		res = qsort(arr, L, r)
	}
	return (res)
}

function inRange(pos, d1, d2) {
	return ((pos.x >= d1.x && pos.x <= d2.x) && (pos.y >= d1.y && pos.y <= d2.y))
}

function neighbors(u) {
	let res = []
	if ((map[u.y][u.x] & DIRS.u) === 0) {
		res.push(new Vector2(u.x, (u.y-1)))
	}
	if ((map[u.y][u.x] & DIRS.d) === 0) {
		res.push(new Vector2(u.x, (u.y+1)))
	}
	if ((map[u.y][u.x] & DIRS.l) === 0) {
		res.push(new Vector2((u.x-1), u.y))
	}
	if ((map[u.y][u.x] & DIRS.r) === 0) {
		res.push(new Vector2((u.x+1), u.y))
	}
	return (res)
}

function astar(d1, d2) {
	searchSetup()
	let pq = [robot.pos];

	let stop = -1
	while (pq.length != 0 && stop == -1) {
		let u = pq.pop()
		if (inRange(u, d1, d2)) {
			stop = u
		} else if (!visited[u.y][u.x]) {
			visited[u.y][u.x] = true;
			let N = neighbors(u);
			for (let i = 0; i < N.length; i++) {
				let v = N[i]
				if (!visited[v.y][v.x]) {

										
					if (G[v.y][v.x] > (G[u.y][u.x] + 1)) {
						G[v.y][v.x] = G[u.y][u.x] + 1
					}

					if (H[v.y][v.x] === Infinity) {
						H[v.y][v.x] = heuristic(0, v, d1, d2);
					}

					parent[v.y][v.x] = u

					pq.push(v)
					pq = qsort(pq, 0, (pq.length-1));
				}
			}
		}
	}

	let path = []
	let i = stop
	while (i !== -1 && (i.x !== robot.pos.x || i.y !== robot.pos.y)) {
		path.push(i)
		i = parent[i.y][i.x]
	}
	path.push(i)

	return (path)
}

function dijkstra(d1, d2) {
	searchSetup()
	let pq = [robot.pos];

	let stop = -1
	while (pq.length != 0 && stop == -1) {
		let u = pq.pop()
		if (inRange(u, d1, d2)) {
			stop = u
		} else if (!visited[u.y][u.x]) {
			visited[u.y][u.x] = true;
			let N = neighbors(u);
			for (let i = 0; i < N.length; i++) {
				let v = N[i]
				if (!visited[v.y][v.x]) {

										
					if (G[v.y][v.x] > (G[u.y][u.x] + 1)) {
						G[v.y][v.x] = G[u.y][u.x] + 1
					}

					if (H[v.y][v.x] === Infinity) {
						H[v.y][v.x] = 0
					}

					parent[v.y][v.x] = u

					pq.push(v)
					pq = qsort(pq, 0, (pq.length-1));
				}
			}
		}
	}

	let path = []
	let i = stop
	while (i !== -1 && (i.x !== robot.pos.x || i.y !== robot.pos.y)) {
		path.push(i)
		i = parent[i.y][i.x]
	}
	path.push(i)

	return (path)
}

function BFS(d1, d2) {
	searchSetup()
	let pq = [robot.pos];

	let stop = -1
	while (pq.length != 0 && stop == -1) {
		let u = pq.shift()
		if (inRange(u, d1, d2)) {
			stop = u
		} else if (!visited[u.y][u.x]) {
			visited[u.y][u.x] = true;
			let N = neighbors(u);
			for (let i = 0; i < N.length; i++) {
				let v = N[i]
				if (!visited[v.y][v.x]) {

					if (G[v.y][v.x] > (G[u.y][u.x] + 1)) {
						G[v.y][v.x] = G[u.y][u.x] + 1
					}

					if (H[v.y][v.x] === Infinity) {
						H[v.y][v.x] = 0
					}

					parent[v.y][v.x] = u

					pq.push(v)
				}
			}
		}
	}

	let path = []
	let i = stop
	while (i !== -1 && (i.x !== robot.pos.x || i.y !== robot.pos.y)) {
		path.push(i)
		i = parent[i.y][i.x]
	}
	path.push(i)

	return (path)
}

function startGame() {
	let path = BFS(new Vector2(7,7), new Vector2(8,8))
	context.fillStyle = '#0000FF20';
	for (let i = 0; i < path.length; i++) {
		let u = path[i]
		context.fillRect(inGrid(u.x), inGrid(u.y), cellSize.x, cellSize.y);
	}
}
