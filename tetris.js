/* Copyright (c) 2011 Zero <zhaoyunhaosss@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var CANVAS,
    CONTEXT,
    NEXT_CONTEXT,
    MARK_CONTEXT,
    LEVEL_CONTEXT,
    WIDTH, 
    HEIGHT,
    MIDDLE,

    LENGTH_X,
    LENGTH_Y,
    GRID_SIZE, 
    CURRENT_HEIGHT,

    TETRIMINO,
    NEXT_TETRIMINO,
    LINES,
    BACKGROUND,

    X = 0, 
    Y = 1,

    // Colors
    RED     = "#9900CC",
    GREEN   = "#CC3366",
    BLUE    = "#CC66FF",
    YELLOW  = "#666FFF",
    MAGENTA = "#993366",
    CYAN    = "#003399",
    WHITE   = "#666666",

    // Points
    POINTS,
    POINTS_PER_LINE = 20,
    POINTS_PER_LEVEL = 500,

    // Level
    LEVEL,
    VELOCITY = 300,
    VELOCITY_STEP = 30,

    END,
    STATE,
    RUNNING = 0,
    PAUSE   = 1;

/* Determines whether an element is in the array or not
 */
Array.prototype.contains = function(element) {
    return this.indexOf(element) != -1;
}

/* A block is one of the four parts in a single tetrimino.
 * It has two properties, one is the position of the block
 * while the other one is the color of the block.
 */
function Block(position, color) {
    this.position = position;
    this.color    = color;
}

/* A tetrimino is the basic element in the game tetris. It
 * consists of four blocks. Different combinations of the 
 * blocks make different kind of tetriminos. A tetrimino has
 * several methods.
 * drop() the basic method that makes the tetrimino drops down
 *        one unit each frame.
 * turn() the basic method turns the tetrimino 90 degrees each
 *        time the method is called.
 */
function Tetrimino(blocks, center) {
    this.blocks = blocks;
    this.center = center;
}

/* Basic movements of a tetrimino.
 * back()    : The tetrimino moves back one unit grid.
 * drop()    : The tetrimino moves downward one unit grid.
 * left()    : The tetrimino moves one unit grid to the left.
 * right()   : The tetrimino moves one unit grid to the right.
 * turnleft  : The tetrimino turns 90 degrees conterclockwise.
 * turnright : The tetrimino turns 90 degrees clockwise.
 */
Tetrimino.prototype.back = function() {
    for (var i = 0; i < 4; ++i) 
        this.blocks[i].position[Y] -= 1;
    this.center.position[Y] -= 1;
}

Tetrimino.prototype.drop = function() {
    for (var i = 0; i < 4; ++i) 
        this.blocks[i].position[Y] += 1;
    this.center.position[Y] += 1;
}

Tetrimino.prototype.left = function() {
    for (var i = 0; i < 4; ++i)
        this.blocks[i].position[X] -= 1;
    this.center.position[X] -= 1;
}

Tetrimino.prototype.right = function() {
    for (var i = 0; i < 4; ++i)
        this.blocks[i].position[X] += 1;
    this.center.position[X] += 1;
}

Tetrimino.prototype.turnleft = function() {
    for (var i = 0; i < 4; ++i) {
        var dx = this.blocks[i].position[X] -
                 this.center.position[X];
        var dy = this.blocks[i].position[Y] - 
                 this.center.position[Y];
        this.blocks[i].position[X] = 
            this.center.position[X] - dy;
        this.blocks[i].position[Y] =
            this.center.position[Y] + dx;
    }
}

Tetrimino.prototype.turnright = function() {
    for (var i = 0; i < 4; ++i) {
        var dx = this.blocks[i].position[X] -
                 this.center.position[X];
        var dy = this.blocks[i].position[Y] - 
                 this.center.position[Y];
        this.blocks[i].position[X] = 
            this.center.position[X] + dy;
        this.blocks[i].position[Y] =
            this.center.position[Y] - dx;
    }
}

/* Checks whether the tetrimino is in a valid place.
 */
Tetrimino.prototype.isValid = function() {
    var x, y;
    for (var i = 0; i < 4; ++i) {
        x = this.blocks[i].position[X];
        y = this.blocks[i].position[Y];
        if (x < 0 || x > LENGTH_X - 1 || y > LENGTH_Y - 1) 
            return false;
        if (y < 0)
            return true;
        if (BACKGROUND[y][x] != "#000000")
            return false;
    }
    return true;
}

/* The show draws the tetrimino to the background while the
 * remove method fills the tetrimino with the background 
 * color.
 */
Tetrimino.prototype.show = function() {
    for (var i = 0; i < 4; ++i) {
        CONTEXT.fillStyle = this.blocks[i].color;
        CONTEXT.fillRect(this.blocks[i].position[X] * GRID_SIZE + 1,
                         this.blocks[i].position[Y] * GRID_SIZE + 1,
                         GRID_SIZE - 1, GRID_SIZE - 1);
    }
}

Tetrimino.prototype.remove = function() {
    for (var i = 0; i < 4; ++i) {
        CONTEXT.fillStyle = "#000000";
        CONTEXT.fillRect(this.blocks[i].position[X] * GRID_SIZE + 1,
                         this.blocks[i].position[Y] * GRID_SIZE + 1,
                         GRID_SIZE - 1, GRID_SIZE - 1);
    }
}

/* Randomly generate the next tetrimino.
 */
function generateTetrimino() {
    var type = Math.floor(Math.random() * 7 + 1);
    var newTetrimino;

    switch (type) {
        // Style "L"
        case 1:
            newTetrimino = new Tetrimino(
                [new Block([MIDDLE,  0],    BLUE),
                 new Block([MIDDLE, -1],    BLUE),
                 new Block([MIDDLE, -2],    BLUE),
                 new Block([MIDDLE + 1, 0], BLUE)],
                 new Block([MIDDLE, 0], BLUE));
            break;
        // Style "J"
        case 2:
            newTetrimino = new Tetrimino(
                [new Block([MIDDLE,  0],    GREEN),
                 new Block([MIDDLE, -1],    GREEN),
                 new Block([MIDDLE, -2],    GREEN),
                 new Block([MIDDLE - 1, 0], GREEN)],
                 new Block([MIDDLE, 0], GREEN));
            break;
        // Style "I"
        case 3:
            newTetrimino = new Tetrimino(
                [new Block([MIDDLE,  0], RED),
                 new Block([MIDDLE, -1], RED),
                 new Block([MIDDLE, -2], RED),
                 new Block([MIDDLE, -3], RED)],
                 new Block([MIDDLE, -3], RED));
            break;
        // Style "T"
        case 4:
            newTetrimino = new Tetrimino(
                [new Block([MIDDLE,  0], MAGENTA),
                 new Block([MIDDLE + 1, 0], MAGENTA),
                 new Block([MIDDLE - 1, 0], MAGENTA),
                 new Block([MIDDLE, -1], MAGENTA)],
                 new Block([MIDDLE,  0], MAGENTA));
            break;
        // Style "O"
        case 5:
            newTetrimino = new Tetrimino(
                [new Block([MIDDLE,  0],     CYAN),
                 new Block([MIDDLE, -1],     CYAN),
                 new Block([MIDDLE + 1,  0], CYAN),
                 new Block([MIDDLE + 1, -1], CYAN)],
                 new Block([MIDDLE, 0], CYAN));
            break;
        // Style "S"
        case 6:
            newTetrimino = new Tetrimino(
                [new Block([MIDDLE,  0],    YELLOW),
                 new Block([MIDDLE, -1],    YELLOW),
                 new Block([MIDDLE + 1, 0], YELLOW),
                 new Block([MIDDLE + 1, 1], YELLOW)],
                 new Block([MIDDLE, 0], YELLOW));
            break;
        // Style "Z"
        case 7:
            newTetrimino = new Tetrimino(
                [new Block([MIDDLE,  0],    WHITE),
                 new Block([MIDDLE, -1],    WHITE),
                 new Block([MIDDLE - 1, 0], WHITE),
                 new Block([MIDDLE - 1, 1], WHITE)],
                 new Block([MIDDLE, 0], WHITE));
            break;

    }

    return newTetrimino;
}


/* Initialize the variables which are related to canvas.
 */
function initCanvas(canvas) {
    GRID_SIZE = 15;
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    LENGTH_X = WIDTH / GRID_SIZE;
    LENGTH_Y = HEIGHT / GRID_SIZE;
    MIDDLE = LENGTH_X / 2;
}

/* Initialize the variables which are related to the
 * background of the game.
 */
function initBackground() {
    LINES = new Array(LENGTH_Y);
    BACKGROUND = new Array(HEIGHT);
    CURRENT_HEIGHT = LENGTH_Y - 1;

    // Initialize the BACKGROUND
    for (var i = 0; i < HEIGHT; ++i)
        BACKGROUND[i] = new Array(WIDTH);
    for (var i = 0; i < HEIGHT; ++i)
        for (var j = 0; j < WIDTH; ++j)
            BACKGROUND[i][j] = "#000000";

    // Initialize the LINES
    for (var i = 0; i < LENGTH_Y; ++i)
        LINES[i] = 0;

    POINTS = 0;
    LEVEL  = 1;
    END = false;
    VELOCITY = 300;
    STATE = RUNNING;

    resetBackground();
}

/* Draws a dark grid into the background.
 */
function drawGrid(ctx) {
    ctx.beginPath();
    ctx.strokeStyle = "#111111";
    for (var i = 0.5; i < WIDTH; i += GRID_SIZE) {
        ctx.moveTo(i, 0);
        ctx.lineTo(i, HEIGHT);
    }

    for (var i = 0.5; i < HEIGHT; i += GRID_SIZE) {
        ctx.moveTo(0, i);
        ctx.lineTo(WIDTH, i);
    }
    ctx.stroke();

    // Draw dead line
    ctx.beginPath();
    ctx.strokeStyle = "#FF0000";
    ctx.moveTo(0, 3 * GRID_SIZE + 0.5);
    ctx.lineTo(300, 3 * GRID_SIZE + 0.5);
    ctx.stroke();
}

/* If a tetrimino falls to the bottom, then some part of
 * the background is occupied by the blocks of that tetrimino.
 * These occupied parts will be set to false.
 * At the same time, the tetrimino will be splited into four
 * blocks and pushed into the heap, which keeps record of the
 * fallen tetriminos(more exactly, the blocks).
 */
function updateInformation(tetrimino) {
    var x, y;
    for (var i = 0; i < 4; ++i) {
        // Update background
        x = tetrimino.blocks[i].position[X];
        y = tetrimino.blocks[i].position[Y];
        BACKGROUND[y][x] = tetrimino.blocks[i].color;

        // Update lines
        LINES[y]++;

        // Update current height
        if (y < CURRENT_HEIGHT)
            CURRENT_HEIGHT = y;
    }
}

function updateMark(lineNum) {
    for (var i = 1; i <= lineNum; ++i) {
        POINTS += i * POINTS_PER_LINE;
    }
    showPoints();

    // If level is already 9, which is the most, then the velocity
    // remains the same.
    if (LEVEL * POINTS_PER_LEVEL <= POINTS && LEVEL != 9) {
        LEVEL++;
        VELOCITY -= VELOCITY_STEP;
        showLevel();

        showLevelup();
        hideLevelup();
    }
}

function cancelLineCheck(tetrimino) {
    var cancelLines = new Array();
    var y;
    // Search the closest four lines to see if some of them can be
    // canceled.
    for (var i = 0; i < 4; ++i) {
        y = tetrimino.blocks[i].position[Y];
        if (LINES[y] == LENGTH_X && !cancelLines.contains(y)) 
            cancelLines.push(y);
    }

    // Cancel the lines which is already full of blocks.
    for (var i = 0; i < cancelLines.length; ++i) {
        cancelLine(cancelLines[i]);

        // Keep moving down
        for (var j = i + 1; j < cancelLines.length; ++j)
            if (cancelLines[j] < cancelLines[i])
                cancelLines[j]++;
    }

    updateMark(cancelLines.length);
    //console.log("current_height: %d", CURRENT_HEIGHT);
}

function cancelLine(lineNum) {
    // Line cancel animation
    cancelLineAnimation(lineNum);

    // Update background 
    for (var i = lineNum; i >= CURRENT_HEIGHT; --i)
        for (var j = 0; j < LENGTH_X; ++j) 
            BACKGROUND[i][j] = BACKGROUND[i - 1][j];
    showBackground();

    // Update lines
    for (var i = lineNum; i >= CURRENT_HEIGHT; --i)
        LINES[i] = LINES[i - 1];

    // Update current height
    CURRENT_HEIGHT++;
}

function cancelLineAnimation(lineNum) {
}

function showBackground() {
    for (var i = LENGTH_Y - 1; i >= CURRENT_HEIGHT; --i) 
        for ( var j = 0; j < LENGTH_X; ++j) {
            CONTEXT.fillStyle = BACKGROUND[i][j];
            CONTEXT.fillRect(
                j * GRID_SIZE + 1, i * GRID_SIZE + 1,
                GRID_SIZE - 1, GRID_SIZE - 1);
    }
}

function resetBackground() {
    for (var i = LENGTH_Y; i >= 0; --i) 
        for ( var j = 0; j < LENGTH_X; ++j) {
            CONTEXT.fillStyle = BACKGROUND[i][j];
            CONTEXT.fillRect(
                j * GRID_SIZE + 1, i * GRID_SIZE + 1,
                GRID_SIZE - 1, GRID_SIZE - 1);
    }
}

function showNextTetrimino() {
    var x, y;
    NEXT_CONTEXT.fillStyle = "#000000";
    NEXT_CONTEXT.fillRect(0, 0, 100, 80);
    for (var i = 0; i < 4; ++i) {
        x = NEXT_TETRIMINO.blocks[i].position[X];
        y = NEXT_TETRIMINO.blocks[i].position[Y];
        NEXT_CONTEXT.fillStyle = NEXT_TETRIMINO.blocks[i].color;   
        NEXT_CONTEXT.fillRect(
            (x - 8) * GRID_SIZE + 10, (y + 3) * GRID_SIZE + 1,
            GRID_SIZE - 1, GRID_SIZE - 1);
    }
}

function showPoints() {
    MARK_CONTEXT.fillStyle = "#000000";
    MARK_CONTEXT.fillRect(0, 0, 100, 40);

    MARK_CONTEXT.font = "bold 25pt sans-serif";
    MARK_CONTEXT.fillStyle = "#666666";
    MARK_CONTEXT.fillText(POINTS.toString(), 5, 33);
}

function showLevel() {
    LEVEL_CONTEXT.fillStyle = "#000000";
    LEVEL_CONTEXT.fillRect(0, 0, 100, 40);

    LEVEL_CONTEXT.font = "bold 25pt sans-serif";
    LEVEL_CONTEXT.fillStyle = "#666666";
    LEVEL_CONTEXT.fillText(LEVEL.toString(), 40, 33);
}

function restAnimation() {
    for (var i = 0; i < LENGTH_Y; ++i)
        for (var j = 0; j < LENGTH_X; ++j) {
            
        }
}

/* This update methods is called every frame, refreshing the 
 * game playground.
 */
function update() {

    if (CURRENT_HEIGHT <= 3) 
        showGameover();
    if (POINTS > 9999) 
        showCongratulations();

    // Default drop of the tetrimino every frame.
    if (STATE != PAUSE) {
        TETRIMINO.remove();
        TETRIMINO.drop();
        if (!TETRIMINO.isValid()) {
            // If the drop is invalid, that means the tetrimino has
            // already fallen to the bottom. So it has to move back
            // one unit grid and show one last time before it "dies".
            TETRIMINO.back();
            TETRIMINO.show();

            updateInformation(TETRIMINO);
            cancelLineCheck(TETRIMINO);

            delete TETRIMINO;
            TETRIMINO = NEXT_TETRIMINO;
            delete NEXT_TETRIMINO;
            NEXT_TETRIMINO = generateTetrimino();
            showNextTetrimino();
        }
    }
 
    // Keyboard control
    document.onkeydown = function(event) {
        TETRIMINO.remove();
        switch (event.keyCode) {
            case 38:
                TETRIMINO.turnleft();
                if (!TETRIMINO.isValid()) {
                    TETRIMINO.turnright();
                    TETRIMINO.turnright();
                    if (!TETRIMINO.isValid())
                        TETRIMINO.turnleft();
                }
                break;
            case 39:
                TETRIMINO.right();
                if (!TETRIMINO.isValid())
                    TETRIMINO.left();
                break;
            case 40:
                TETRIMINO.drop();
                if (!TETRIMINO.isValid())
                    TETRIMINO.back();
                break;
            case 37:
                TETRIMINO.left();
                if (!TETRIMINO.isValid())
                    TETRIMINO.right();
                break;
            case 32:
                if (STATE == RUNNING) {
                    showPause();
                    STATE = PAUSE;
                }
                else if (STATE == PAUSE) {
                    hidePause();
                    STATE = RUNNING;
                }
                break;
        }
        TETRIMINO.show();
    }
    
    // All the setting above only set the parameters or variables.
    // The tetrimino can only be shown to the screen by method show.
    TETRIMINO.show();

    setTimeout(update, VELOCITY);
}

/* Initialization function of the whole game.
 */
function init() {
    CANVAS = document.getElementById("playground");
    CONTEXT = CANVAS.getContext("2d");
    
    NEXT_CONTEXT = document.getElementById(
        "nextTetrimino").getContext("2d");
    MARK_CONTEXT = document.getElementById(
        "tetrisMark").getContext("2d");
    LEVEL_CONTEXT = document.getElementById(
        "tetrisLevel").getContext("2d");

    initCanvas(CANVAS);
    initBackground();
    drawGrid(CONTEXT);

    TETRIMINO = generateTetrimino();
    NEXT_TETRIMINO = generateTetrimino();
    showNextTetrimino();
    showPoints();
    showLevel();

    update();
}

function restart() {
    TETRIMINO.remove();
    initBackground();
    drawGrid(CONTEXT);

    TETRIMINO = generateTetrimino();
    NEXT_TETRIMINO = generateTetrimino();
    showNextTetrimino();
    showPoints();
    showLevel();
}

window.onload = init;


