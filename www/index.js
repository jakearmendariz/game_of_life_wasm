import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";


// Construct the universe, and get its width and height.
const universe = Universe.new();
const width = universe.width();
const height = universe.height();

const CELL_SIZE = screen.width/(width*2) - 1; // px
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#0d4771";

// Give the canvas room for all of our cells and a 1px border
// around each of them.
const canvas = document.getElementById("game-of-life-canvas");
canvas.height = (CELL_SIZE + 1) * height + 1;
canvas.width = (CELL_SIZE + 1) * width + 1;

const ctx = canvas.getContext('2d');

let animationId = null;

const renderLoop = () => {
//   debugger;

  universe.tick();

  drawGrid();
  drawCells();

  animationId = requestAnimationFrame(renderLoop);
};

const isPaused = () => {
    return animationId === null;
};

const playPauseButton = document.getElementById("play-pause");

const play = () => {
  playPauseButton.textContent = "⏸";
  renderLoop();
};

const pause = () => {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId);
  animationId = null;
};

playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

canvas.addEventListener("click", event => {
    const boundingRect = canvas.getBoundingClientRect();
  
    const scaleX = canvas.width / boundingRect.width;
    const scaleY = canvas.height / boundingRect.height;
  
    const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
    const canvasTop = (event.clientY - boundingRect.top) * scaleY;
  
    const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), height - 1);
    const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), width - 1);
  
    universe.toggle_cell(row, col);
  
    drawGrid();
    drawCells();
  });

const drawGrid = () => {
    ctx.beginPath();
    ctx.strokeStyle = DEAD_COLOR;
  
    // Vertical lines.
    for (let i = 0; i <= width; i++) {
      ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
      ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
    }
  
    // Horizontal lines.
    for (let j = 0; j <= height; j++) {
      ctx.moveTo(0,                           j * (CELL_SIZE + 1) + 1);
      ctx.lineTo((CELL_SIZE + 1) * width + 1, j * (CELL_SIZE + 1) + 1);
    }
  
    ctx.stroke();
  };

  const getIndex = (row, column) => {
    return row * width + column;
  };
  
  const drawCells = () => {
    const cellsPtr = universe.cells();
    const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

    const daysPtr = universe.days();
    const days = new Uint32Array(memory.buffer, daysPtr, width * height);
  
    // ctx.beginPath();
  
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        const idx = getIndex(row, col);
  
        ctx.beginPath();
        if (cells[idx] === Cell.Alive) {
            ctx.fillStyle = ALIVE_COLOR;
        }else if (days[idx] > 90){
            ctx.fillStyle = DEAD_COLOR;
        }else {
            ctx.fillStyle = `rgb(${days[idx]*3+13}, ${days[idx]*3+71}, ${days[idx]*3+113})`;
            // ctx.fillStyle = `rgb(255, 255, 255)`;
        }
        // ctx.fillStyle = days[idx] === Cell.Dead
        //   ? DEAD_COLOR
        //   : ALIVE_COLOR;
  
        // ctx.arc(col * (CELL_SIZE + 1) + 1, row * (CELL_SIZE + 1) + 1, CELL_SIZE/2, 0, 2 * Math.PI);
        // ctx.fill();

        ctx.fillRect(
          col * (CELL_SIZE + 1) + 1,
          row * (CELL_SIZE + 1) + 1,
          CELL_SIZE+2,
          CELL_SIZE+2
        );
      }
    }
  
    // ctx.stroke();
  };

// drawGrid();
drawCells();
// requestAnimationFrame(renderLoop);
play();