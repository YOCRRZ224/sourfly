const canvas = document.getElementById("world");

const ctx = canvas.getContext("2d");

const modeButtons = document.querySelectorAll(".mode");

const pauseBtn = document.getElementById("pauseBtn");

const resetBtn = document.getElementById("resetBtn");

const anotherBtn = document.getElementById("anotherBtn");

const lesionToggle = document.getElementById("lesionToggle");

const modeLabel = document.getElementById("modeLabel");

const actionLabel = document.getElementById("action");

const positionLabel = document.getElementById("position");

const simTimeLabel = document.getElementById("simTime");

const foodReachedLabel = document.getElementById("foodReached");

const collisionsLabel = document.getElementById("collisions");

const distanceLabel = document.getElementById("distance");

const successLabel = document.getElementById("success");

const statusText = document.getElementById("statusText");

const currentSeedLabel = document.getElementById("currentSeed");

const networkState = document.getElementById("networkState");const neuronInspector =
    document.getElementById("neuronInspector");

const inspectorName =
    document.getElementById("inspectorName");

const inspectorLayer =
    document.getElementById("inspectorLayer");

const inspectorActivity =
    document.getElementById("inspectorActivity");

const inspectorIncoming =
    document.getElementById("inspectorIncoming");

const inspectorOutgoing =
    document.getElementById("inspectorOutgoing");

const closeInspector =
    document.getElementById("closeInspector");

let inspectedNeuron = null;

const VISUAL = [
    "LTe42b",
    "LTe15",
    "LPT54",
    "LT87",
    "LPT48_vCal3",
    "VST2",
    "LPLC4"
];


const CENTRAL = [
    "CB0524",
    "SAD043",
    "LHAD1g1",
    "AVLP340",
    "CB0500",
    "AVLP435a",
    "Nod1",
    "CB0268",
    "CB0316",
    "PVLP020",
    "PS213",
    "LTe42a",
    "PLP213",
    "CB0492",
    "PS174",
    "PS098",
    "PLP248"
];


const DESCENDING = [
    "DNae005",
    "DNbe007",
    "DNge054",
    "DNp103",
    "DNp06",
    "DNp55",
    "DNb06",
    "DNp56",
    "DNp26",
    "DNg41",
    "DNp09",
    "DNa10",
    "DNp57",
    "DNg46"
];


const PATHWAYS = [
    ["LTe42b", "CB0524", "DNae005", 391, 130],
    ["LTe42b", "CB0524", "DNbe007", 391, 101],
    ["LTe15", "SAD043", "DNbe007", 360, 115],
    ["LTe15", "SAD043", "DNge054", 360, 40],
    ["LPT54", "SAD043", "DNge054", 266, 152],
    ["LPT54", "SAD043", "DNbe007", 266, 102],
    ["LT87", "LHAD1g1", "DNp103", 259, 121],
    ["LT87", "LHAD1g1", "DNp06", 259, 120],
    ["LT87", "AVLP340", "DNp55", 174, 175],
    ["LPT48_vCal3", "CB0500", "DNb06", 47, 542],
    ["VST2", "CB0500", "DNb06", 42, 542],
    ["LT1d", "AVLP435a", "DNp103", 330, 68],
    ["LPT22", "Nod1", "DNp26", 395, 55],
    ["LPT04_HST", "CB0268", "DNg41", 228, 87],
    ["LT86", "CB0316", "DNbe007", 153, 124],
    ["LPT51", "SAD043", "DNge054", 120, 152],
    ["LT82a", "PVLP020", "DNp09", 92, 191],
    ["VSm", "PS213", "DNb06", 104, 168],
    ["LTe17", "LTe42a", "DNp56", 132, 128],
    ["LTe07", "PLP213", "DNa10", 76, 207],
    ["LTe42a", "CB0492", "DNbe007", 195, 80],
    ["LPLC4", "PLP213", "DNa10", 75, 207],
    ["VST2", "PS174", "DNg46", 84, 176],
    ["aMe25", "PS098", "DNp57", 118, 125],
    ["vCal1", "PLP248", "DNa10", 189, 78]
];


const visualToCentral = {};

const centralToDescending = {};


for (const [v, c, d, w1, w2] of PATHWAYS) {

    if (!visualToCentral[v]) {
        visualToCentral[v] = [];
    }

    if (!centralToDescending[c]) {
        centralToDescending[c] = [];
    }

    visualToCentral[v].push([c, w1]);

    centralToDescending[c].push([d, w2]);
}


for (const v in visualToCentral) {

    const max = Math.max(
        ...visualToCentral[v].map(x => x[1])
    );

    visualToCentral[v] = visualToCentral[v].map(
        ([n, w]) => [n, w / max]
    );
}


for (const c in centralToDescending) {

    const max = Math.max(
        ...centralToDescending[c].map(x => x[1])
    );

    centralToDescending[c] = centralToDescending[c].map(
        ([n, w]) => [n, w / max]
    );
}


/*
 * Seeded random number generator.
 *
 * Same seed = same sequence of random values.
 * This lets us reproduce exactly the same environment.
 */

class SeededRandom {

    constructor(seed) {
        this.seed = this.hash(String(seed));
    }

    hash(str) {

        let h = 2166136261;

        for (let i = 0; i < str.length; i++) {

            h ^= str.charCodeAt(i);

            h = Math.imul(
                h,
                16777619
            );
        }

        return h >>> 0;
    }

    next() {

        this.seed += 0x6D2B79F5;

        let t = this.seed;

        t = Math.imul(
            t ^ (t >>> 15),
            t | 1
        );

        t ^= t + Math.imul(
            t ^ (t >>> 7),
            t | 61
        );

        return (
            (t ^ (t >>> 14)) >>> 0
        ) / 4294967296;
    }

    range(min, max) {

        return (
            min +
            this.next() *
            (max - min)
        );
    }

    int(min, max) {

        return Math.floor(
            this.range(
                min,
                max + 1
            )
        );
    }

    chance(probability) {

        return this.next() < probability;
    }
}


class NeuralCircuit {

    constructor() {

        this.visual =
            Object.fromEntries(
                VISUAL.map(n => [n, 0])
            );

        this.central =
            Object.fromEntries(
                CENTRAL.map(n => [n, 0])
            );

        this.descending =
            Object.fromEntries(
                DESCENDING.map(n => [n, 0])
            );

        this.tau = 0.72;

        this.gain = 1.4;

        this.lesions = new Set();
    }


    reset() {

        for (const n of VISUAL) {
            this.visual[n] = 0;
        }

        for (const n of CENTRAL) {
            this.central[n] = 0;
        }

        for (const n of DESCENDING) {
            this.descending[n] = 0;
        }
    }


    step(input) {

        for (const n of VISUAL) {

            const target =
                input[n] || 0;

            this.visual[n] +=
                (target - this.visual[n]) *
                (1 - this.tau);
        }


        const centralDrive =
            Object.fromEntries(
                CENTRAL.map(n => [n, 0])
            );


        for (const v of VISUAL) {

            const activity =
                this.visual[v];

            if (!visualToCentral[v]) {
                continue;
            }

            for (
                const [c, weight]
                of visualToCentral[v]
            ) {

                if (this.lesions.has(c)) {
                    continue;
                }

                centralDrive[c] +=
                    activity * weight;
            }
        }


        for (const c of CENTRAL) {

            if (this.lesions.has(c)) {

                this.central[c] = 0;

                continue;
            }

            const target =
                Math.tanh(
                    centralDrive[c] *
                    this.gain
                );

            this.central[c] +=
                (target - this.central[c]) *
                (1 - this.tau);
        }


        const descendingDrive =
            Object.fromEntries(
                DESCENDING.map(n => [n, 0])
            );


        for (const c of CENTRAL) {

            if (this.lesions.has(c)) {
                continue;
            }

            const activity =
                this.central[c];

            if (!centralToDescending[c]) {
                continue;
            }

            for (
                const [d, weight]
                of centralToDescending[c]
            ) {

                descendingDrive[d] +=
                    activity * weight;
            }
        }


        for (const d of DESCENDING) {

            const target =
                Math.tanh(
                    descendingDrive[d] *
                    this.gain
                );

            this.descending[d] +=
                (target - this.descending[d]) *
                (1 - this.tau);
        }


        return this.descending;
    }
}


/*
 * World
 *
 * The fly does NOT know the generated map.
 *
 * The map only determines the physical environment.
 * The fly receives local sensory information through
 * foodSignal() and obstacleSignal().
 */

class World {

    constructor() {

        this.width = 100;

        this.height = 70;

        this.seed = null;

        this.rng = null;

        this.reset(null, "food");
    }


    reset(seed = null, mode = "food") {

        /*
         * If no seed was supplied, generate a new one.
         *
         * This means every normal reset produces
         * a different environment.
         */

        if (
            seed === null ||
            seed === undefined ||
            String(seed).trim() === ""
        ) {

            seed =
                Math.floor(
                    Math.random() *
                    1000000000
                );
        }


        this.seed = String(seed);

        this.rng =
            new SeededRandom(this.seed);
        this.mode = mode;

        this.fly = {

            x: 10,

            y: 35,

            angle: 0
        };


        this.food = [];

        this.obstacles = [];


        this.collisions = 0;

        this.foodReached = 0;

        this.distance = 0;


        this.generateEnvironment();
    }


    generateEnvironment() {

    if (this.mode === "maze") {

        this.generateMaze();

    } else {

        this.generateRandomObstacles();
    }

    this.generateFood();
}


    generateRandomObstacles() {

        const count =
            this.rng.int(5, 10);


        for (let i = 0; i < count; i++) {

            let obstacle;

            let attempts = 0;


            do {

                obstacle = {

                    x:
                        this.rng.range(
                            25,
                            82
                        ),

                    y:
                        this.rng.range(
                            7,
                            57
                        ),

                    w:
                        this.rng.range(
                            5,
                            14
                        ),

                    h:
                        this.rng.range(
                            5,
                            16
                        )
                };


                attempts++;

            } while (

                (
                    this.overlapsStartArea(
                        obstacle
                    ) ||

                    this.obstacleOverlapsExisting(
                        obstacle
                    )
                ) &&

                attempts < 60
            );


            if (
                !this.overlapsStartArea(obstacle) &&
                !this.obstacleOverlapsExisting(obstacle)
            ) {

                this.obstacles.push(obstacle);
            }
        }
    }


    obstacleOverlapsExisting(obstacle) {

        const padding = 3;


        return this.obstacles.some(existing => {

            return (

                obstacle.x <
                    existing.x +
                    existing.w +
                    padding &&

                obstacle.x +
                    obstacle.w +
                    padding >
                    existing.x &&

                obstacle.y <
                    existing.y +
                    existing.h +
                    padding &&

                obstacle.y +
                    obstacle.h +
                    padding >
                    existing.y
            );
        });
    }


    overlapsStartArea(obstacle) {

        const start = {

            x: 2,

            y: 27,

            w: 22,

            h: 16
        };


        return (

            obstacle.x <
                start.x +
                start.w &&

            obstacle.x +
                obstacle.w >
                start.x &&

            obstacle.y <
                start.y +
                start.h &&

            obstacle.y +
                obstacle.h >
                start.y
        );
    }


    /*
     * Randomized maze.
     *
     * The maze is generated from the seed.
     * The fly only sees nearby walls through
     * obstacleSignal().
     */

    generateMaze() {

        const cols = 10;

        const rows = 7;

        const cellW =
            this.width / cols;

        const cellH =
            this.height / rows;


        /*
         * Start with a grid where every cell
         * is considered closed.
         */

        const visited =
            Array.from(
                { length: rows },
                () =>
                    Array(cols).fill(false)
            );


        const walls =
            Array.from(
                { length: rows },
                () =>
                    Array.from(
                        { length: cols },
                        () => ({
                            top: true,
                            right: true,
                            bottom: true,
                            left: true
                        })
                    )
            );


        const stack = [];


        /*
         * Start near the fly.
         */

        const startCol = 0;

        const startRow =
            Math.floor(rows / 2);


        visited[startRow][startCol] =
            true;

        stack.push([
            startCol,
            startRow
        ]);


        /*
         * Randomized depth-first maze generation.
         */

        while (stack.length) {

            const [
                col,
                row
            ] =
                stack[
                    stack.length - 1
                ];


            const neighbors = [];


            if (
                row > 0 &&
                !visited[row - 1][col]
            ) {

                neighbors.push({
                    col,
                    row: row - 1,
                    direction: "top"
                });
            }


            if (
                col < cols - 1 &&
                !visited[row][col + 1]
            ) {

                neighbors.push({
                    col: col + 1,
                    row,
                    direction: "right"
                });
            }


            if (
                row < rows - 1 &&
                !visited[row + 1][col]
            ) {

                neighbors.push({
                    col,
                    row: row + 1,
                    direction: "bottom"
                });
            }


            if (
                col > 0 &&
                !visited[row][col - 1]
            ) {

                neighbors.push({
                    col: col - 1,
                    row,
                    direction: "left"
                });
            }


            if (!neighbors.length) {

                stack.pop();

                continue;
            }


            const next =
                neighbors[
                    this.rng.int(
                        0,
                        neighbors.length - 1
                    )
                ];


            /*
             * Remove the shared wall.
             */

            if (next.direction === "top") {

                walls[row][col].top = false;

                walls[next.row][next.col].bottom =
                    false;

            } else if (
                next.direction === "right"
            ) {

                walls[row][col].right = false;

                walls[next.row][next.col].left =
                    false;

            } else if (
                next.direction === "bottom"
            ) {

                walls[row][col].bottom = false;

                walls[next.row][next.col].top =
                    false;

            } else if (
                next.direction === "left"
            ) {

                walls[row][col].left = false;

                walls[next.row][next.col].right =
                    false;
            }


            visited[next.row][next.col] =
                true;


            stack.push([
                next.col,
                next.row
            ]);
        }


        /*
         * Convert maze walls into physical
         * rectangular obstacles.
         */

        const wallThickness = 1.8;


        for (let row = 0; row < rows; row++) {

            for (let col = 0; col < cols; col++) {

                const cellX =
                    col * cellW;

                const cellY =
                    row * cellH;


                const cell =
                    walls[row][col];


                /*
                 * Top wall
                 */

                if (cell.top) {

                    this.obstacles.push({

                        x:
                            cellX,

                        y:
                            cellY,

                        w:
                            cellW,

                        h:
                            wallThickness
                    });
                }


                /*
                 * Left wall
                 */

                if (cell.left) {

                    this.obstacles.push({

                        x:
                            cellX,

                        y:
                            cellY,

                        w:
                            wallThickness,

                        h:
                            cellH
                    });
                }


                /*
                 * Right wall
                 */

                if (
                    cell.right &&
                    col === cols - 1
                ) {

                    this.obstacles.push({

                        x:
                            cellX +
                            cellW -
                            wallThickness,

                        y:
                            cellY,

                        w:
                            wallThickness,

                        h:
                            cellH
                    });
                }


                /*
                 * Bottom wall
                 */

                if (
                    cell.bottom &&
                    row === rows - 1
                ) {

                    this.obstacles.push({

                        x:
                            cellX,

                        y:
                            cellY +
                            cellH -
                            wallThickness,

                        w:
                            cellW,

                        h:
                            wallThickness
                    });
                }
            }
        }


        /*
         * Open the starting boundary so the fly
         * doesn't spawn trapped.
         */

        this.obstacles =
            this.obstacles.filter(obstacle => {

                const startOpening = {

                    x: 0,

                    y:
                        startRow *
                        cellH +
                        cellH * 0.25,

                    w: 4,

                    h:
                        cellH * 0.5
                };


                return !(
                    obstacle.x <
                        startOpening.x +
                        startOpening.w &&

                    obstacle.x +
                        obstacle.w >
                        startOpening.x &&

                    obstacle.y <
                        startOpening.y +
                        startOpening.h &&

                    obstacle.y +
                        obstacle.h >
                        startOpening.y
                );
            });
    }


    generateFood() {

        /*
         * Maze gets one target.
         * Other modes get 1-3 targets.
         */

        const count =
            this.mode === "maze"
                ? 1
                : this.rng.int(1, 3);


        for (let i = 0; i < count; i++) {

            let food;

            let attempts = 0;


            do {

                food = {

                    x:
                        this.mode === "maze"
                            ? this.rng.range(
                                72,
                                94
                            )
                            : this.rng.range(
                                60,
                                94
                            ),

                    y:
                        this.rng.range(
                            6,
                            64
                        )
                };


                attempts++;

            } while (

                (
                    this.foodTooClose(food) ||

                    this.pointInsideObstacle(
                        food.x,
                        food.y
                    )
                ) &&

                attempts < 100
            );


            if (
                !this.pointInsideObstacle(
                    food.x,
                    food.y
                )
            ) {

                this.food.push(food);
            }
        }


        /*
         * Safety fallback.
         *
         * Ensures every experiment has food.
         */

        if (!this.food.length) {

            this.food.push({
                x: 85,
                y: 35
            });
        }
    }


    foodTooClose(food) {

        if (

            Math.hypot(
                food.x - this.fly.x,
                food.y - this.fly.y
            ) < 15

        ) {

            return true;
        }


        return this.food.some(existing => {

            return (

                Math.hypot(
                    food.x - existing.x,
                    food.y - existing.y
                ) < 10
            );
        });
    }


    pointInsideObstacle(x, y) {

        return this.obstacles.some(obstacle => {

            return (

                x >= obstacle.x - 2 &&

                x <=
                    obstacle.x +
                    obstacle.w +
                    2 &&

                y >= obstacle.y - 2 &&

                y <=
                    obstacle.y +
                    obstacle.h +
                    2
            );
        });
    }


    nearestFood() {

        if (!this.food.length) {
            return null;
        }


        return this.food.reduce(
            (best, food) => {

                const a =
                    this.distanceBetween(
                        this.fly.x,
                        this.fly.y,
                        best.x,
                        best.y
                    );


                const b =
                    this.distanceBetween(
                        this.fly.x,
                        this.fly.y,
                        food.x,
                        food.y
                    );


                return b < a
                    ? food
                    : best;

            }
        );
    }


    distanceBetween(
        x1,
        y1,
        x2,
        y2
    ) {

        return Math.hypot(
            x2 - x1,
            y2 - y1
        );
    }


    foodSignal() {

        const food =
            this.nearestFood();


        if (!food) {

            return {

                strength: 0,

                error: 0
            };
        }


        const dx =
            food.x -
            this.fly.x;


        const dy =
            food.y -
            this.fly.y;


        const distance =
            Math.hypot(
                dx,
                dy
            );


        const direction =
            Math.atan2(
                dy,
                dx
            );


        const error =
            Math.atan2(

                Math.sin(
                    direction -
                    this.fly.angle
                ),

                Math.cos(
                    direction -
                    this.fly.angle
                )
            );


        return {

            strength:
                Math.exp(
                    -distance / 35
                ),

            error
        };
    }


    obstacleSignal() {

        const rays = [

            {
                angle: -0.65,
                weight: 0.55
            },

            {
                angle: -0.35,
                weight: 0.85
            },

            {
                angle: 0,
                weight: 1.0
            },

            {
                angle: 0.35,
                weight: 0.85
            },

            {
                angle: 0.65,
                weight: 0.55
            }
        ];


        const maxDistance = 16;


        let left = 0;

        let right = 0;

        let front = 0;


        for (const ray of rays) {

            let strength = 0;


            for (
                let d = 1;
                d <= maxDistance;
                d += 1
            ) {

                const x =
                    this.fly.x +
                    Math.cos(
                        this.fly.angle +
                        ray.angle
                    ) *
                    d;


                const y =
                    this.fly.y +
                    Math.sin(
                        this.fly.angle +
                        ray.angle
                    ) *
                    d;


                const hitObstacle =
                    this.obstacles.some(
                        obstacle =>

                            x >= obstacle.x &&

                            x <=
                                obstacle.x +
                                obstacle.w &&

                            y >= obstacle.y &&

                            y <=
                                obstacle.y +
                                obstacle.h
                    );


                const hitBorder =
                    x <= 2 ||
                    x >= this.width - 2 ||
                    y <= 2 ||
                    y >= this.height - 2;


                if (
                    hitObstacle ||
                    hitBorder
                ) {

                    strength =
                        (
                            1 -
                            d /
                            maxDistance
                        ) *
                        ray.weight;

                    break;
                }
            }


            if (ray.angle < -0.1) {

                left =
                    Math.max(
                        left,
                        strength
                    );

            } else if (
                ray.angle > 0.1
            ) {

                right =
                    Math.max(
                        right,
                        strength
                    );

            } else {

                front =
                    Math.max(
                        front,
                        strength
                    );
            }
        }


        return {

            left,

            right,

            front
        };
    }


    visualFeatures(mode) {

        const food =
            this.foodSignal();


        const obstacle =
            this.obstacleSignal();


        const foodWeight = {

            food: 1.0,

            obstacle: 0.2,

            competing: 1.0,

            maze: 0.8

        }[mode] ?? 1.0;


        const obstacleWeight = {

            food: 0.7,

            obstacle: 1.2,

            competing: 1.0,

            maze: 1.4

        }[mode] ?? 1.0;


        /*
         * Food direction:
         *
         * negative angle = left
         * positive angle = right
         * near zero       = center
         */

        const foodLeft =
            food.strength *
            Math.max(
                0,
                -Math.sin(food.error)
            );


        const foodRight =
            food.strength *
            Math.max(
                0,
                Math.sin(food.error)
            );


        const foodCenter =
            food.strength *
            Math.max(
                0,
                Math.cos(food.error)
            );


        return {

            leftFood:
                Math.min(
                    1,
                    foodLeft *
                    foodWeight
                ),


            rightFood:
                Math.min(
                    1,
                    foodRight *
                    foodWeight
                ),


            centerFood:
                Math.min(
                    1,
                    foodCenter *
                    foodWeight
                ),


            obstacleLeft:
                Math.min(
                    1,
                    obstacle.left *
                    obstacleWeight
                ),


            obstacleRight:
                Math.min(
                    1,
                    obstacle.right *
                    obstacleWeight
                ),


            obstacleFront:
                Math.min(
                    1,
                    obstacle.front *
                    obstacleWeight
                )
        };
    }


    move(motor) {
    const maxTurn = 0.16;
    const maxSpeed = 0.62;

    const turn = Math.max(
        -1,
        Math.min(1, motor.turn)
    );

    const speed = Math.max(
        0,
        Math.min(1, motor.speed)
    );

    // Steering
    this.fly.angle += turn * maxTurn;

    // Intended movement
    const dx =
        Math.cos(this.fly.angle) *
        maxSpeed *
        speed;

    const dy =
        Math.sin(this.fly.angle) *
        maxSpeed *
        speed;

    const oldX = this.fly.x;
    const oldY = this.fly.y;

    // Try to move
    let nextX = oldX + dx;
    let nextY = oldY + dy;

    // Resolve collisions before committing movement
    const result = this.resolveMovement(
        oldX,
        oldY,
        nextX,
        nextY
    );

    this.fly.x = result.x;
    this.fly.y = result.y;

    // If we hit something, steer along the surface
    if (result.collided) {
        const tangentX = -result.normalY;
        const tangentY = result.normalX;

        // Project desired movement onto wall tangent
        const tangentAmount =
            dx * tangentX +
            dy * tangentY;

        if (Math.abs(tangentAmount) > 0.0001) {
            this.fly.angle = Math.atan2(
                tangentY * Math.sign(tangentAmount),
                tangentX * Math.sign(tangentAmount)
            );
        }
    }

    // Distance is now measured AFTER collision resolution.
    this.distance += Math.hypot(
        this.fly.x - oldX,
        this.fly.y - oldY
    );

    this.checkFood();
}
    resolveMovement(oldX, oldY, nextX, nextY) {
    const r = 1.5;

    let x = nextX;
    let y = nextY;

    let collided = false;
    let normalX = 0;
    let normalY = 0;

    /*
     * ---------------------------------------------------------
     * World boundaries
     * ---------------------------------------------------------
     */

    const minX = 2 + r;
    const maxX = this.width - 2 - r;
    const minY = 2 + r;
    const maxY = this.height - 2 - r;

    if (x < minX) {
        x = minX;
        normalX = 1;
        normalY = 0;
        collided = true;
    } else if (x > maxX) {
        x = maxX;
        normalX = -1;
        normalY = 0;
        collided = true;
    }

    if (y < minY) {
        y = minY;
        normalX = 0;
        normalY = 1;
        collided = true;
    } else if (y > maxY) {
        y = maxY;
        normalX = 0;
        normalY = -1;
        collided = true;
    }

    /*
     * ---------------------------------------------------------
     * Obstacles
     * ---------------------------------------------------------
     */

    for (const obstacle of this.obstacles) {
        const closestX = Math.max(
            obstacle.x,
            Math.min(x, obstacle.x + obstacle.w)
        );

        const closestY = Math.max(
            obstacle.y,
            Math.min(y, obstacle.y + obstacle.h)
        );

        let dx = x - closestX;
        let dy = y - closestY;

        const distanceSq =
            dx * dx +
            dy * dy;

        // No collision
        if (distanceSq > r * r) {
            continue;
        }

        collided = true;
        this.collisions++;

        /*
         * -----------------------------------------------------
         * Normal case: fly is outside rectangle and overlaps it
         * -----------------------------------------------------
         */

        if (distanceSq > 0.000001) {
            const distance = Math.sqrt(distanceSq);

            normalX = dx / distance;
            normalY = dy / distance;

            const penetration = r - distance;

            x += normalX * penetration;
            y += normalY * penetration;
        }

        /*
         * -----------------------------------------------------
         * Special case: center is inside the rectangle.
         *
         * Choose the closest edge and push the fly outside it.
         * -----------------------------------------------------
         */

        else {
            const left =
                x - obstacle.x;

            const right =
                obstacle.x + obstacle.w - x;

            const top =
                y - obstacle.y;

            const bottom =
                obstacle.y + obstacle.h - y;

            const minPenetration = Math.min(
                left,
                right,
                top,
                bottom
            );

            if (minPenetration === left) {
                x = obstacle.x - r;
                normalX = -1;
                normalY = 0;
            } else if (minPenetration === right) {
                x = obstacle.x + obstacle.w + r;
                normalX = 1;
                normalY = 0;
            } else if (minPenetration === top) {
                y = obstacle.y - r;
                normalX = 0;
                normalY = -1;
            } else {
                y = obstacle.y + obstacle.h + r;
                normalX = 0;
                normalY = 1;
            }
        }

        /*
         * Keep the fly inside the world after resolving
         * the obstacle.
         */

        x = Math.max(
            minX,
            Math.min(maxX, x)
        );

        y = Math.max(
            minY,
            Math.min(maxY, y)
        );

        // Only resolve one obstacle this step.
        break;
    }

    return {
        x,
        y,
        collided,
        normalX,
        normalY
    };
}


    checkCollisions() {

        const r = 1.5;


        /*
         * Normal obstacles
         */

        for (
            const obstacle
            of this.obstacles
        ) {

            if (

                this.fly.x + r >
                    obstacle.x &&

                this.fly.x - r <
                    obstacle.x +
                    obstacle.w &&

                this.fly.y + r >
                    obstacle.y &&

                this.fly.y - r <
                    obstacle.y +
                    obstacle.h

            ) {

                this.collisions++;




                const centerY =
                    obstacle.y +
                    obstacle.h / 2;


                if (
                    this.fly.y < centerY
                ) {

                    

                } else {

                
                }


                return;
            }
        }


        /*
         * Canvas borders
         */

        const hitLeft =
            this.fly.x - r <= 2;


        const hitRight =
            this.fly.x + r >=
            this.width - 2;


        const hitTop =
            this.fly.y - r <= 2;


        const hitBottom =
            this.fly.y + r >=
            this.height - 2;


        if (
            hitLeft ||
            hitRight ||
            hitTop ||
            hitBottom
        ) {

            this.collisions++;


            if (hitLeft) {

                this.fly.x = 3;

                this.fly.angle = 0;
            }


            if (hitRight) {

                this.fly.x =
                    this.width - 3;

                this.fly.angle =
                    Math.PI;
            }


            if (hitTop) {

                this.fly.y = 3;

                this.fly.angle =
                    Math.PI / 2;
            }


            if (hitBottom) {

                this.fly.y =
                    this.height - 3;

                this.fly.angle =
                    -Math.PI / 2;
            }
        }
    }


    checkFood() {

        for (
            let i =
                this.food.length - 1;

            i >= 0;

            i--
        ) {

            const food =
                this.food[i];


            if (

                this.distanceBetween(

                    this.fly.x,

                    this.fly.y,

                    food.x,

                    food.y

                ) < 3

            ) {

                this.food.splice(
                    i,
                    1
                );


                this.foodReached++;
            }
        }
    }
}


class BehaviorDecoder {

    decode(descending) {

        const left =
            descending.DNp103 +
            descending.DNp06 +
            descending.DNp55;


        const right =
            descending.DNb06 +
            descending.DNp56 +
            descending.DNp26;


        const forward =
            descending.DNae005 +
            descending.DNbe007;


        const stop =
            descending.DNge054 +
            descending.DNa10;


        const total =
            left +
            right +
            forward +
            stop;


        if (total < 0.01) {

            return {

                turn: 0,

                speed: 0.15,

                action: "forward",

                values: {

                    left,

                    right,

                    forward,

                    stop
                }
            };
        }


        /*
         * Continuous steering.
         *
         * Positive = right
         * Negative = left
         */

        const turn =
            Math.max(
                -1,
                Math.min(
                    1,

                    (right - left) /
                    Math.max(
                        0.5,
                        left + right
                    )
                )
            );


        /*
         * Reduce forward drive
         * when stop dominates.
         */

        const forwardDrive =
            Math.max(
                0,
                forward -
                stop * 0.7
            );


        const speed =
            Math.max(
                0.05,
                Math.min(
                    1,
                    forwardDrive
                )
            );


        let action =
            "forward";


        if (
            Math.abs(turn) > 0.18
        ) {

            action =
                turn < 0
                    ? "turn_left"
                    : "turn_right";
        }


        if (
            speed < 0.12
        ) {

            action =
                "stop";
        }


        return {

            turn,

            speed,

            action,

            values: {

                left,

                right,

                forward,

                stop
            }
        };
    }
}


const circuit =
    new NeuralCircuit();


const world =
    new World();


const decoder =
    new BehaviorDecoder();


let currentMode =
    "food";


let paused =
    false;


let elapsed =
    0;


const seedInput =
    document.getElementById(
        "seedInput"
    );

const neuronLayer = {};

for (const neuron of VISUAL) {
    neuronLayer[neuron] = "VISUAL";
}

for (const neuron of CENTRAL) {
    neuronLayer[neuron] = "CENTRAL";
}

for (const neuron of DESCENDING) {
    neuronLayer[neuron] = "DESCENDING";
}
function getNeuronConnections(neuron) {
    const incoming = [];
    const outgoing = [];

    for (const [
        visual,
        central,
        descending,
        weightVisual,
        weightCentral
    ] of PATHWAYS) {

        if (central === neuron) {
            incoming.push({
                neuron: visual,
                weight: weightVisual,
                type: "visual"
            });

            outgoing.push({
                neuron: descending,
                weight: weightCentral,
                type: "descending"
            });
        }

        if (visual === neuron) {
            outgoing.push({
                neuron: central,
                weight: weightVisual,
                type: "central"
            });
        }

        if (descending === neuron) {
            incoming.push({
                neuron: central,
                weight: weightCentral,
                type: "central"
            });
        }
    }

    return {
        incoming,
        outgoing
    };
}
closeInspector.addEventListener(
    "click",
    () => {
        inspectedNeuron = null;

        neuronInspector.classList.add(
            "hidden"
        );

        document
            .querySelectorAll(
                ".neuron.inspected"
            )
            .forEach(element => {
                element.classList.remove(
                    "inspected"
                );
            });
    }
);
function inspectNeuron(neuron) {
    inspectedNeuron = neuron;

    neuronInspector.classList.remove("hidden");

    inspectorName.textContent =
        neuron;

    inspectorLayer.textContent =
        neuronLayer[neuron] || "UNKNOWN";

    updateNeuronInspector();

    document
        .querySelectorAll(".neuron.inspected")
        .forEach(element => {
            element.classList.remove("inspected");
        });

    const selected =
        document.querySelector(
            `.neuron[data-neuron="${CSS.escape(neuron)}"]`
        );

    if (selected) {
        selected.classList.add("inspected");
    }
}
function updateNeuronInspector() {
    if (!inspectedNeuron) {
        return;
    }

    const layer =
        neuronLayer[inspectedNeuron];

    const activity =
        circuit[layer.toLowerCase()]?.[inspectedNeuron] ?? 0;

    inspectorActivity.textContent =
        activity.toFixed(3);

    const connections =
        getNeuronConnections(inspectedNeuron);

    inspectorIncoming.innerHTML =
        connections.incoming.length
            ? connections.incoming
                .map(connection =>
                    createConnectionHTML(
                        connection,
                        true
                    )
                )
                .join("")
            : `<div class="empty-connection">
                    NONE
               </div>`;

    inspectorOutgoing.innerHTML =
        connections.outgoing.length
            ? connections.outgoing
                .map(connection =>
                    createConnectionHTML(
                        connection,
                        false
                    )
                )
                .join("")
            : `<div class="empty-connection">
                    NONE
               </div>`;
}
function createConnectionHTML(
    connection,
    incoming
) {
    const neuron =
        connection.neuron;

    const layer =
        neuronLayer[neuron];

    const group =
        circuit[layer.toLowerCase()];

    const activity =
        group?.[neuron] ?? 0;

    const normalizedWeight =
        connection.weight > 1
            ? connection.weight / 542
            : connection.weight;

    const signal =
        activity * normalizedWeight;

    return `
        <div class="inspector-connection">
            <div class="connection-main">
                <span class="connection-direction">
                    ${incoming ? "←" : "→"}
                </span>

                <span class="connection-neuron">
                    ${neuron}
                </span>
            </div>

            <div class="connection-data">
                <span>
                    W ${normalizedWeight.toFixed(3)}
                </span>

                <span>
                    S ${signal.toFixed(3)}
                </span>
            </div>
        </div>
    `;
}
function createActivityBars(
    containerId,
    neurons
) {

    const container =
        document.getElementById(
            containerId
        );


    container.innerHTML = "";


    for (
        const neuron
        of neurons
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.className = "neuron";
        element.dataset.neuron = neuron;
        element.addEventListener("click", () => {
                inspectNeuron(neuron);
        });

        element.innerHTML = `

            <div class="neuron-top">

                <span class="neuron-name">
                    ${neuron}
                </span>

                <span
                    class="neuron-value"
                    id="value-${neuron}"
                >
                    0.000
                </span>

            </div>

            <div class="bar">

                <div
                    class="bar-fill"
                    id="bar-${neuron}"
                ></div>

            </div>

        `;


        container.appendChild(
            element
        );
    }
}


createActivityBars(
    "visualActivity",
    VISUAL
);


createActivityBars(
    "centralActivity",
    CENTRAL
);


createActivityBars(
    "descendingActivity",
    DESCENDING
);


function createLesionControls() {

    const container =
        document.getElementById(
            "lesionList"
        );


    container.innerHTML = "";


    const candidates = [

        "CB0524",

        "SAD043",

        "LHAD1g1",

        "CB0500",

        "PLP213",

        "CB0492"

    ];


    for (
        const neuron
        of candidates
    ) {

        const item =
            document.createElement(
                "label"
            );


        item.className =
            "lesion-item";


        item.innerHTML = `

            <span>
                ${neuron}
            </span>

            <input
                type="checkbox"
                data-lesion="${neuron}"
            >

        `;


        container.appendChild(
            item
        );
    }
}


createLesionControls();


document
    .querySelectorAll(
        "[data-lesion]"
    )
    .forEach(input => {

        input.addEventListener(
            "change",
            () => {

                const neuron =
                    input.dataset.lesion;


                if (input.checked) {

                    circuit.lesions.add(
                        neuron
                    );

                } else {

                    circuit.lesions.delete(
                        neuron
                    );
                }


                networkState.textContent =
                    circuit.lesions.size

                        ? `${circuit.lesions.size} LESION${
                            circuit.lesions.size > 1
                                ? "S"
                                : ""
                        }`

                        : "ACTIVE";
            }
        );
    });


lesionToggle.addEventListener(
    "change",
    () => {

        document
            .querySelectorAll(
                "[data-lesion]"
            )
            .forEach(input => {

                input.disabled =
                    !lesionToggle.checked;
            });


        if (
            !lesionToggle.checked
        ) {

            circuit.lesions.clear();


            document
                .querySelectorAll(
                    "[data-lesion]"
                )
                .forEach(input => {

                    input.checked =
                        false;
                });


            networkState.textContent =
                "ACTIVE";
        }
    }
);


document
    .querySelectorAll(
        "[data-lesion]"
    )
    .forEach(input => {

        input.disabled = true;
    });


function updateActivityBars(group) {

    for (
        const neuron
        of Object.keys(group)
    ) {

        const value =
            Math.max(
                0,
                Math.min(
                    1,
                    group[neuron]
                )
            );


        const bar =
            document.getElementById(
                `bar-${neuron}`
            );


        const label =
            document.getElementById(
                `value-${neuron}`
            );


        if (bar) {

            bar.style.width =
                `${value * 100}%`;
        }


        if (label) {

            label.textContent =
                value.toFixed(3);
        }
    }
}


function encodeVisualInput(
    features
) {

    return {

        LTe42b:
            features.leftFood,


        LTe15:
            features.leftFood *
            0.85,


        LPT54:
            features.rightFood,


        LT87:
            features.rightFood *
            0.9,


        /*
         * Centered food signal keeps food
         * directly ahead visible.
         */

        LPT48_vCal3:
            Math.max(

                features.centerFood,

                (
                    features.leftFood +
                    features.rightFood
                ) / 2

            ),


        VST2:
            Math.max(

                features.obstacleLeft,

                features.obstacleFront

            ),


        LPLC4:
            Math.max(

                features.obstacleRight,

                features.obstacleFront

            )
    };
}


function updateMetrics(action) {

    positionLabel.textContent =
        `${world.fly.x.toFixed(1)}, ${world.fly.y.toFixed(1)}`;


    actionLabel.textContent =
        action
            .replace("_", " ")
            .toUpperCase();


    simTimeLabel.textContent =
        `${elapsed.toFixed(1)}s`;


    foodReachedLabel.textContent =
        world.foodReached;


    collisionsLabel.textContent =
        world.collisions;


    distanceLabel.textContent =
        world.distance.toFixed(1);


    const success =
        world.food.length === 0;


    successLabel.textContent =
        success
            ? "YES"
            : "NO";
}


function updateSimulation() {

    if (paused) {
        return;
    }


    elapsed += 0.05;


    const features =
        world.visualFeatures(
            currentMode
        );


    const input =
        encodeVisualInput(
            features
        );


    const descending =
        circuit.step(
            input
        );


    const result =
        decoder.decode(
            descending
        );


    world.move(
        result
    );


    updateActivityBars(
        circuit.visual
    );


    updateActivityBars(
        circuit.central
    );


    updateActivityBars(
        circuit.descending
    );


    updateMetrics(
        result.action
    );
    if (inspectedNeuron) {
    updateNeuronInspector();
    }
}


function resizeCanvas() {

    const rect =
        canvas.getBoundingClientRect();


    const dpr =
        window.devicePixelRatio ||
        1;


    canvas.width =
        rect.width * dpr;


    canvas.height =
        rect.height * dpr;


    ctx.setTransform(

        dpr,

        0,

        0,

        dpr,

        0,

        0
    );
}


function worldToScreen(x, y) {

    return {

        x:
            x /
            world.width *
            canvas.clientWidth,

        y:
            y /
            world.height *
            canvas.clientHeight
    };
}


function drawFly() {

    const p =
        worldToScreen(
            world.fly.x,
            world.fly.y
        );


    ctx.save();


    ctx.translate(
        p.x,
        p.y
    );


    ctx.rotate(
        world.fly.angle
    );


    ctx.beginPath();


    ctx.moveTo(
        11,
        0
    );


    ctx.lineTo(
        -7,
        -6
    );


    ctx.lineTo(
        -5,
        0
    );


    ctx.lineTo(
        -7,
        6
    );


    ctx.closePath();


    ctx.fillStyle =
        "#e7edf2";


    ctx.fill();


    ctx.restore();
}


function drawFood() {

    for (
        const food
        of world.food
    ) {

        const p =
            worldToScreen(
                food.x,
                food.y
            );


        ctx.beginPath();


        ctx.arc(

            p.x,

            p.y,

            5,

            0,

            Math.PI * 2

        );


        ctx.fillStyle =
            "#70d6a0";


        ctx.fill();
    }
}


function drawObstacles() {

    for (
        const obstacle
        of world.obstacles
    ) {

        const p =
            worldToScreen(
                obstacle.x,
                obstacle.y
            );


        const p2 =
            worldToScreen(

                obstacle.x +
                obstacle.w,

                obstacle.y +
                obstacle.h
            );


        ctx.fillStyle =
            "#1c2229";


        ctx.fillRect(

            p.x,

            p.y,

            p2.x - p.x,

            p2.y - p.y
        );


        ctx.strokeStyle =
            "#343d46";


        ctx.strokeRect(

            p.x,

            p.y,

            p2.x - p.x,

            p2.y - p.y
        );
    }
}


function drawSensorCone() {

    const p =
        worldToScreen(
            world.fly.x,
            world.fly.y
        );


    const length =
        13 /
        world.width *
        canvas.clientWidth;


    ctx.save();


    ctx.translate(
        p.x,
        p.y
    );


    ctx.rotate(
        world.fly.angle
    );


    ctx.beginPath();


    ctx.moveTo(
        0,
        0
    );


    ctx.lineTo(
        length,
        -length * 0.35
    );


    ctx.lineTo(
        length,
        length * 0.35
    );


    ctx.closePath();


    ctx.strokeStyle =
        "rgba(91,192,255,.25)";


    ctx.stroke();


    ctx.restore();
}


function render() {

    ctx.clearRect(

        0,

        0,

        canvas.clientWidth,

        canvas.clientHeight
    );


    drawObstacles();

    drawFood();

    drawSensorCone();

    drawFly();


    requestAnimationFrame(
        render
    );
}


function simulationLoop() {

    updateSimulation();


    setTimeout(
        simulationLoop,
        50
    );
}


modeButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                modeButtons.forEach(
                    b =>
                        b.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                currentMode =
                    button.dataset.mode;


                modeLabel.textContent =
                    button.textContent.toUpperCase();


                resetSimulation();
            }
        );
    }
);


pauseBtn.addEventListener(
    "click",
    () => {

        paused =
            !paused;


        pauseBtn.textContent =
            paused
                ? "Resume"
                : "Pause";


        statusText.textContent =
            paused
                ? "PAUSED"
                : "RUNNING";
    }
);


resetBtn.addEventListener(
    "click",
    () => resetSimulation()
);

anotherBtn.addEventListener(
    "click",
    () => resetSimulation(null)
);


seedInput.addEventListener(
    "change",
    () => {

        const seed =
            seedInput.value.trim();


        if (seed) {

            resetSimulation(seed);

        } else {

            seedInput.value =
                world.seed;
        }
    }
);


function resetSimulation(seed = world.seed) {

    world.reset(
        seed,
        currentMode
    );

    seedInput.value =
        world.seed;

    currentSeedLabel.textContent =
        world.seed;


    circuit.reset();


    elapsed = 0;


    paused = false;


    pauseBtn.textContent =
        "Pause";


    statusText.textContent =
        "RUNNING";


    updateMetrics(
        "idle"
    );


    updateActivityBars(
        circuit.visual
    );


    updateActivityBars(
        circuit.central
    );


    updateActivityBars(
        circuit.descending
    );
}


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();


resetSimulation();


render();


simulationLoop();