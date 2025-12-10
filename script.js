import { DIRS, MAP0, MAP1 } from './maps.js';

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

const MODES = {
    idle: 0,
    editing: 1,
};

function inGrid(x) {
	return x*37.5
}

class Mouse {
	constructor(x, y) {
		this.pos = new Vector2(0, 0)
		if (x != undefined && y != undefined) {
			this.pos.x = x
			this.pos.y = y
		}
	}
}

let robot = new Mouse(0, 0);

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const playBtn = document.querySelector('#play');
const restartBtn = document.querySelector('#restart');
const editBtn = document.querySelector('#edit');
const initx = document.querySelector('#inix');
const inity = document.querySelector('#iniy');
const count = document.querySelector('span#node-count');
const emptyMap = document.querySelector('#map0');
const testMap = document.querySelector('#map1');

let screenSize = new Vector2(canvas.width, canvas.height);
let gridSize = new Vector2(16, 16);
let cellSize = new Vector2(screenSize.x / gridSize.x, screenSize.y / gridSize.y);
let mousePos = new Vector2(-1, -1);

let mode = MODES.idle;

let editInterval = null;

let searchMethod = 0; // 0 -> A* (manhattan)
					  // 1 -> A* (euclidean)
					  // 2 -> A* (chebyshev)
	    			  // 3 -> A* (octile)
	    			  // 4 -> A* (random)
	  				  // 5 -> Dijkstra
					  // 6 -> Bfs

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
playBtn.addEventListener('click', () => {
    if (mode === MODES.idle) {
		playBtn.disabled = true;
        restartBtn.disabled = false;
        editBtn.disabled = true;
		redraw()
		searchDraw();
    }
});
restartBtn.addEventListener('click', (e) => {
    const button = e.target;
    if (mode !== MODES.editing) {
        mode = MODES.idle;
		count.innerHTML = 0
        editBtn.disabled = false;
        playBtn.disabled = false;
        playBtn.innerHTML = 'Iniciar';
        button.disabled = true;
		redraw()
    }
})
editBtn.addEventListener('click', (e) => {
    const button = e.target;
    if (mode === MODES.idle) {
        button.innerHTML = 'Salvar';
        mode = MODES.editing;
        playBtn.disabled = true;
        editInterval = setInterval(editTick, 1000 / 15);
		emptyMap.disabled = true
		testMap.disabled = true
    } else if (mode === MODES.editing) {
        button.innerHTML = 'Editar';
        mode = MODES.idle;
        playBtn.disabled = false;
		emptyMap.disabled = false
		testMap.disabled = false
        clearInterval(editInterval);
    }
});
canvas.addEventListener('click', addWall);
canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    removeWall();
});

document.querySelector("select").addEventListener("change", (e) => {
	const selected = e.target.value

	if (selected === "astar1") {
		searchMethod = 0
	} else if (selected === "astar2") {
		searchMethod = 1
	} else if (selected === "astar3") {
		searchMethod = 2
	} else if (selected === "astar4") {
		searchMethod = 3
	} else if (selected === "astar5") {
		searchMethod = 4
	} else if (selected === "dijkstra") {
		searchMethod = 5
	} else if (selected === "bfs") {
		searchMethod = 6
	}

});

initx.addEventListener("change", (e) => {
	restartBtn.click()
	const selected = e.target.value
	robot.pos.x = parseInt(selected)
	redraw()
});

inity.addEventListener("change", (e) => {
	restartBtn.click()
	const selected = e.target.value
	robot.pos.y = parseInt(selected)
	redraw()
});

emptyMap.addEventListener("click", () => {
	map = MAP0
	redraw()
});

testMap.addEventListener("click", () => {
	map = MAP1
	redraw()
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
    context.fillStyle = '#FF000060';
    context.fillRect(inGrid(robot.pos.x), inGrid(robot.pos.y), cellSize.x, cellSize.y);
}

function drawGrid() {
    context.strokeStyle = '#FFFFFF40';
    context.setLineDash([5, 5]);

    context.beginPath();

    context.fillStyle = '#00FF0060';
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
	drawRobot();
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

function euclidean (v1, v2) {
	let dx = v1.x - v2.x
	let dy = v1.y - v2.y
	return (Math.sqrt((dx*dx) + (dy*dy)))
}

function chebyshev (v1, v2) {
	return Math.max(Math.abs(v1.x-v2.x), Math.abs(v1.y-v2.y));
}

function octile (v1, v2) {
	let ccost = 1
	let dcost = 1.41421	// sqrt(2)

	let dx = Math.abs(v1.x - v2.x)
	let dy = Math.abs(v1.y - v2.y)

	let diag = Math.abs(dx-dy)
	let card = Math.min(dx, dy)

	return ( (diag * dcost) + (card * ccost) )
}

function randomH () {
	return (Math.floor(Math.random() * 100))
}

function heuristic (type, pos, v1, v2) {

	let f = undefined

	if (type === 0) {
		f = manhattan
	} else if (type === 1) {
		f = euclidean
	} else if (type === 2) {
		f = chebyshev
	} else if (type === 3) {
		f = octile
	} else if (type === 4) {
		f = randomH 
	}

	let value = Infinity

	let dx = Math.abs(v1.x - v2.x) + 1
	let dy = Math.abs(v1.y - v2.y) + 1

	let x = Math.min(v1.x, v2.x)
	let y = Math.min(v1.y, v2.y)

	for (let ix = x; ix < x+dx; ix++) {
		for (let iy = y; iy < y+dy; iy++) {
			value = Math.min(value, f(pos, new Vector2(ix, iy)));
		}
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

function insesort (arr) {
	for (let i = 1; i < arr.length; i++) {
		let tmp = arr[i];
		let j = i-1;
		while ( (j >= 0) && minHeap(tmp, arr[j])) {
			arr[j+1] = arr[j];
			j--;
		}
		arr[j+1] = tmp
	}
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

function astar(d1, d2, htype) {
	searchSetup()
	let pq = [robot.pos];

	let stop = -1
	while (pq.length != 0 && stop == -1) {
		let u = pq.pop()
		if (inRange(u, d1, d2)) {
			stop = u
		} else if (!visited[u.y][u.x]) {

			visited[u.y][u.x] = true;

			let nG = (G[u.y][u.x] + 1)

			let N = neighbors(u);
			let pushed = false
			for (let i = 0; i < N.length; i++) {
				let v = N[i]
				if (!visited[v.y][v.x] && G[v.y][v.x] > (G[u.y][u.x] + 1)) {

					if (G[v.y][v.x] > nG) {
						G[v.y][v.x] = nG 

						if (H[v.y][v.x] === Infinity) {
							H[v.y][v.x] = heuristic(htype, v, d1, d2);
						}

						parent[v.y][v.x] = u

						pq.push(v)

						pushed = true
					}
				}
			}
			if (pushed) {
				insesort(pq);
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

			let nG = (G[u.y][u.x] + 1)

			let N = neighbors(u);
			let pushed = false
			for (let i = 0; i < N.length; i++) {
				let v = N[i]
				if (!visited[v.y][v.x] && G[v.y][v.x] > (nG)) {

					G[v.y][v.x] = nG

					if (H[v.y][v.x] === Infinity) {
						H[v.y][v.x] = 0
					}

					parent[v.y][v.x] = u

					pq.push(v)

					pushed = true
				}
			}
			if (pushed) {
				insesort(pq);
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

			let nG = G[u.y][u.x] + 1;

			let N = neighbors(u);
			for (let i = 0; i < N.length; i++) {
				let v = N[i]
				if (!visited[v.y][v.x] && G[v.y][v.x] > (nG)) {
					G[v.y][v.x] = nG
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

function searchDraw() {
	let path = []
	if (searchMethod == 0) {
		path = astar(new Vector2(7,7), new Vector2(8,8), 0) // manhattan
	} else if (searchMethod == 1) {
		path = astar(new Vector2(7,7), new Vector2(8,8), 1) // euclidean
	} else if (searchMethod == 2) {
		path = astar(new Vector2(7,7), new Vector2(8,8), 2) // chebyshev
	} else if (searchMethod == 3) {
		path = astar(new Vector2(7,7), new Vector2(8,8), 3) // octile
	} else if (searchMethod == 4) {
		path = astar(new Vector2(7,7), new Vector2(8,8), 4) // random
	} else if (searchMethod == 5) {
		path = dijkstra(new Vector2(7,7), new Vector2(8,8))
	} else if (searchMethod == 6) {
		path = BFS(new Vector2(7,7), new Vector2(8,8))
	}
	count.innerHTML = path.length

	context.fillStyle = '#0000FF60';
	for (let i = 0; i < path.length; i++) {
		let u = path[i]
		context.fillRect(inGrid(u.x), inGrid(u.y), cellSize.x, cellSize.y);
	}
}
