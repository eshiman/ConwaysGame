const canvas = document.querySelector('canvas');
const range_input = document.querySelector("#size_toggle");
const ctx = canvas.getContext('2d');
// square width
canvas.width = 400;
canvas.height = 400;
var COLS = Number(range_input.value);
var ROWS = Number(range_input.value);
var resolution = canvas.width / COLS;
var past_grids = []
const past_grids_max = 500;

function buildGrid() {
    // fill with null so that it is iterable
    return new Array(COLS).fill(null)
        .map(() => new Array(ROWS).fill(0));
}

let grid = buildGrid();
let autoUpdate = null;

render(grid)

function update() {
    if (past_grids.length > past_grids_max) {
        past_grids = past_grids.slice(1);
    }
    past_grids.push(grid);
    grid = getNextGen(grid);
    render(grid);
}


function getNextGen(grid) {
    const nextGen = grid.map(arr => [...arr]);
    for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
            let alive_neighbor_count = 0;
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    // current cell is not its own neighbor
                    if (i === 0 && j === 0) {
                        continue;
                    }
                    const neighbor_col = col + i;
                    const neighbor_row = row + j;
                    //  skip neighbors that are outside the grid
                    if (neighbor_col >= grid.length || neighbor_col < 0 || neighbor_row >= grid[col].length || neighbor_row < 0) {
                        continue;
                    }
                    const neighbor_cell = grid[neighbor_col][neighbor_row]
                    if (neighbor_cell === 1) {
                        alive_neighbor_count++
                    }
                }
            }
            const cell = grid[col][row];
            if (cell === 1) {
                if (alive_neighbor_count < 2 || alive_neighbor_count > 3) {
                    nextGen[col][row] = 0;
                }
            } else if (cell === 0) {
                if (alive_neighbor_count === 3) {
                    nextGen[col][row] = 1;
                }
            }
        }
    }
    return nextGen;
}

function render(grid) {
    for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
            const cell = grid[col][row];
            ctx.beginPath();
            ctx.rect(col * resolution, row * resolution, resolution, resolution);
            ctx.fillStyle = cell ? '#101C42' : '#f9fcfc';
            ctx.fill();
            ctx.stroke()
        }
    }
}

function play() {
    if (autoUpdate !== null) { return; }
    autoUpdate = setInterval(update, 1000);
}

function step() {
    pause();
    update();

}

function step_back() {
    pause();
    const new_grid = past_grids.pop()
    if (new_grid) {
        grid = new_grid
        render(grid);
    }
}

function pause() {
    clearInterval(autoUpdate);
    autoUpdate = null;
}

canvas.addEventListener("mousedown", function (e) {
    flipClickedSquare(canvas, e);
});

function flipClickedSquare(canvas, event) {
    // get coordinates of click
    let rect = canvas.getBoundingClientRect();
    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;
    let [col, row] = getCellFromCoordinates(x, y);
    if (grid[col][row] === 1) {
        grid[col][row] = 0;
    } else if (grid[col][row] === 0) {
        grid[col][row] = 1;

    }
    render(grid)
}

function getCellFromCoordinates(x, y) {
    let col = Math.min(Math.floor(x / resolution), COLS - 1);
    let row = Math.min(Math.floor(y / resolution), ROWS - 1);
    return [col, row];
}
range_input.addEventListener("input", (event) => {
    COLS = Number(event.target.value)
    ROWS = Number(event.target.value)
    resolution = canvas.width / COLS;
    grid = buildGrid()
    render(grid)
});