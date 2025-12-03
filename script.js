const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

init();

function init() {
    let screen = new Vector2(canvas.width, canvas.height);
    let grid = new Vector2(16, 16);
    let cell = new Vector2(screen.x / grid.x, screen.y / grid.y);

    drawGrid(screen, grid, cell);
}

function drawGrid(screen, grid, cell) {
    context.strokeStyle = '#FFFFFF20';
    context.setLineDash([5, 5]);

    for (let i = 0; i < grid.x - 1; i++) {
        const x = cell.x * (i + 1);
        context.moveTo(x, 0);
        context.lineTo(x, screen.y);
    }

    for (let i = 0; i < grid.y - 1; i++) {
        const y = cell.y * (i + 1);
        context.moveTo(0, y);
        context.lineTo(screen.y, y);
    }

    context.stroke();
}
