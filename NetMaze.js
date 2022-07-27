
function getName()
{
    return 'Net Maze';
}

function onConnect()
{
    init_maze();
    prim();
    if(PRIM_COMPLETE_FLAG) {
        init_chest_room();
        init_map();
    }
}

function onUpdate()
{
    clearScreen();

    if(!PRIM_COMPLETE_FLAG) {
        prim();
    }
    else{
        init_chest_room();
        init_map();
    }

    for(let x in map) {
        for(let y in map[x]) {
            if(map[x][y] === -1) {
                drawText("█", 15, x, y);
                // drawText("█", 15, 2 * x + 1, y);
            }
        }
    }

}

function onInput(key)
{
    if(key === 112) {
        init_maze();
        prim();
        init_map();
    }
}

let MAZE_SIZE = 9;
let WEIGHT_RANGE_LEFT = 1;
let WEIGHT_RANGE_RIGHT = 100;
let maze_v = [];
let maze_e = [];
let maze_e_prim = [];
let map = [];
let chest_room = [
    {
        "x": 5,
        "y": 5,
        "exit": "right",
    }
]

let is_chest_wall = function(x, y) {
    // console.log("is_chest_wall", x, y)
    let chest_id = -1;
    for(let c in chest_room) {
        if(Math.abs(x - chest_room[c].x) < 2 && Math.abs(y - chest_room[c].y) < 2) {
            chest_id = c;
        }
    }

    if(chest_id < 0) {
        return false;
    }
    else if(  // chest room center
        x === chest_room[chest_id].x && y === chest_room[chest_id].y
    ) {
        return false;
    }
    else if(  // chest room coner
        (x === chest_room[chest_id].x - 1) && (y === chest_room[chest_id].y - 1) ||
        (x === chest_room[chest_id].x - 1) && (y === chest_room[chest_id].y + 1) ||
        (x === chest_room[chest_id].x + 1) && (y === chest_room[chest_id].y - 1) ||
        (x === chest_room[chest_id].x + 1) && (y === chest_room[chest_id].y + 1)
    ) {
        return true;
    }
    else if(  // chest room edge
        (x === chest_room[chest_id].x - 1) && (y === chest_room[chest_id].y) && chest_room[chest_id].exit === "left" ||
        (x === chest_room[chest_id].x) && (y === chest_room[chest_id].y - 1) && chest_room[chest_id].exit === "top"  ||
        (x === chest_room[chest_id].x + 1) && (y === chest_room[chest_id].y) && chest_room[chest_id].exit === "right" ||
        (x === chest_room[chest_id].x) && (y === chest_room[chest_id].y + 1) && chest_room[chest_id].exit === "bottom"
    ) {
        return false;
    }
    else{
        return true;
    }
}

let init_maze = function(){
    for(let i=0; i<MAZE_SIZE*MAZE_SIZE; i++) {
        maze_e[i] = [];
        for(let j=0; j<MAZE_SIZE*MAZE_SIZE; j++) {
            maze_e[i][j] = null;
        }
    }
    for(let i=0; i<MAZE_SIZE; i++) {
        for(let j=0; j<MAZE_SIZE; j++) {
            maze_v[i * MAZE_SIZE + j] = {
                "x": i,
                "y": j,
            };
            maze_v[i * MAZE_SIZE + j]["w"] = is_chest_wall(i, j) ? -1 : 0;
            if(j > 0) {
                maze_e[i * MAZE_SIZE + j][i * MAZE_SIZE + (j - 1)] = {
                    "x1": i,
                    "y1": j,
                    "x2": i,
                    "y2": j - 1,
                    "w": maze_v[i * MAZE_SIZE + j].w >= 0 && maze_v[i * MAZE_SIZE + (j - 1)].w >= 0 ?
                        Math.floor(WEIGHT_RANGE_LEFT + Math.random() * WEIGHT_RANGE_RIGHT) : -1,
                };
                maze_e[i * MAZE_SIZE + (j - 1)][i * MAZE_SIZE + j] = {
                    "x1": i,
                    "y1": j - 1,
                    "x2": i,
                    "y2": j,
                    "w": maze_v[i * MAZE_SIZE + (j - 1)].w >= 0 && maze_v[i * MAZE_SIZE + j].w >= 0 ?
                        Math.floor(WEIGHT_RANGE_LEFT + Math.random() * WEIGHT_RANGE_RIGHT) : -1,
                };
            }
            if(i > 0) {
                maze_e[i * MAZE_SIZE + j][(i - 1) * MAZE_SIZE + j] = {
                    "x1": i,
                    "y1": j,
                    "x2": i - 1,
                    "y2": j,
                    "w": maze_v[i * MAZE_SIZE + j].w >= 0 && maze_v[(i - 1) * MAZE_SIZE + j].w >= 0 ?
                        Math.floor(WEIGHT_RANGE_LEFT + Math.random() * WEIGHT_RANGE_RIGHT) : -1,
                };
                maze_e[(i - 1) * MAZE_SIZE + j][i * MAZE_SIZE + j] = {
                    "x1": i - 1,
                    "y1": j,
                    "x2": i,
                    "y2": j,
                    "w": maze_v[(i - 1) * MAZE_SIZE + j].w >= 0 && maze_v[i * MAZE_SIZE + j].w >= 0 ?
                        Math.floor(WEIGHT_RANGE_LEFT + Math.random() * WEIGHT_RANGE_RIGHT) : -1,
                };
            }
        }
    }
}

let S = [];
let V = [];
let PRIM_COMPLETE_FLAG = true;
let LOOP_LIMIT = 1000000000000000;
let prim = function() {
    if(S.length === 0) {
        PRIM_COMPLETE_FLAG = false;
        for(let i=0; i<MAZE_SIZE * MAZE_SIZE; i++) {
            maze_e_prim[i] = [];
            for(let j=0; j<MAZE_SIZE * MAZE_SIZE; j++) {
                maze_e_prim[i][j] = null;
            }
        }
        let start_id = 0;
        for(let i = 0; i<MAZE_SIZE * MAZE_SIZE; i++) {
            if(maze_v[i].w >= 0) {
                V.push(i);
            }
        }
        S.push(start_id);
        V = remove(V, start_id);
    }
    let count = 1;
    while(true) {
        let edge_list = [];
        for (let s_i in S) {
            let s = S[s_i];
            if(maze_v[s].w < 0) {
                continue
            }
            for (let e_i in maze_e[s]) {
                let e = maze_e[s][e_i];
                if (e != null && e.w >= 0 && !include(S, e.x2 * MAZE_SIZE + e.y2)) {
                    edge_list.push(e);
                }
            }
        }
        let min_w = -1;
        let min_e = null;
        for (let e_i in edge_list) {
            let e = edge_list[e_i];
            if (min_w === -1 || e.w < min_w) {
                min_w = e.w;
                min_e = e;
            }
        }
        if (min_e != null) {
            S.push(min_e.x2 * MAZE_SIZE + min_e.y2);
            V = remove(V, min_e.x2 * MAZE_SIZE + min_e.y2);
            maze_e_prim[min_e.x1 * MAZE_SIZE + min_e.y1][min_e.x2 * MAZE_SIZE + min_e.y2] = min_e;
            count += 1;
            if(count > LOOP_LIMIT) {
                break;
            }
        } else {
            PRIM_COMPLETE_FLAG = true;
            S = [];
            V = [];
            break;
        }
    }
}

let init_chest_room = function() {
    for(let x in Array.from(Array(MAZE_SIZE).keys())) {
        x = parseInt(x);
        for(let y in Array.from(Array(MAZE_SIZE).keys())) {
            y = parseInt(y);
            for(let i in chest_room) {
                let room = chest_room[i];
                if(Math.abs(x - room["x"]) <= 1 && Math.abs(y - room["y"]) <= 1) {
                    maze_v[x * MAZE_SIZE + y].w = 0
                    if(x < room["x"] + 1 ) {
                        maze_e_prim[x * MAZE_SIZE + y][(x + 1) * MAZE_SIZE + y] =
                            maze_e[x * MAZE_SIZE + y][(x + 1) * MAZE_SIZE + y];
                        maze_e_prim[x * MAZE_SIZE + y][(x + 1) * MAZE_SIZE + y].w = 0;
                        maze_e_prim[(x + 1) * MAZE_SIZE + y][x * MAZE_SIZE + y] =
                            maze_e[(x + 1) * MAZE_SIZE + y][x * MAZE_SIZE + y];
                        maze_e_prim[(x + 1) * MAZE_SIZE + y][x * MAZE_SIZE + y].w = 0;
                    }
                    if(y < room["y"] + 1) {
                        maze_e_prim[x * MAZE_SIZE + y][x * MAZE_SIZE + (y + 1)] =
                            maze_e[x * MAZE_SIZE + y][x * MAZE_SIZE + (y + 1)];
                        maze_e_prim[x * MAZE_SIZE + y][x * MAZE_SIZE + (y + 1)].w = 0;
                        maze_e_prim[x * MAZE_SIZE + (y + 1)][x * MAZE_SIZE + y] =
                            maze_e[x * MAZE_SIZE + (y + 1)][x * MAZE_SIZE + y];
                        maze_e_prim[x * MAZE_SIZE + (y + 1)][x * MAZE_SIZE + y].w = 0;
                    }
                }
            }
        }
    }
}

let init_map = function() {
    // -1 == wall
    // >= 0 == road
    map = [];
    let map_size = MAZE_SIZE * 2 + 1;
    for(let i = 0; i < map_size; i++) {
        map[i] = [];
        for (let j = 0; j < map_size; j++) {
            if (i === 0 || i === map_size - 1 || j === 0 || j === map_size - 1) {
                map[i][j] = -1;
            } else {
                let _i = i - 1;
                let _j = j - 1;
                if (_i % 2 === 0 && _j % 2 === 0) {
                    // map[i][j] = 0;
                    map[i][j] = maze_v[_i / 2 * MAZE_SIZE + _j / 2].w;
                } else {
                    let maze_x1 = 0;
                    let maze_y1 = 0;
                    let maze_x2 = 0;
                    let maze_y2 = 0;
                    if (_i % 2 === 0 && _j % 2 !== 0) {
                        maze_x1 = Math.floor(_i / 2);
                        maze_y1 = Math.floor((_j - 1) / 2);
                        maze_x2 = Math.floor(_i / 2);
                        maze_y2 = Math.floor((_j + 1) / 2);
                    } else if (_i % 2 !== 0 && _j % 2 === 0) {
                        maze_x1 = Math.floor((_i - 1) / 2);
                        maze_y1 = Math.floor(_j / 2);
                        maze_x2 = Math.floor((_i + 1) / 2);
                        maze_y2 = Math.floor(_j / 2);
                    } else {
                        maze_x1 = Math.floor(_i / 2);
                        maze_y1 = Math.floor(_j / 2);
                        maze_x2 = Math.floor((_i + 1) / 2);
                        maze_y2 = Math.floor((_j + 1) / 2);
                    }
                    if (maze_e_prim[maze_x1 * MAZE_SIZE + maze_y1][maze_x2 * MAZE_SIZE + maze_y2] != null) {
                        map[i][j] = maze_e_prim[maze_x1 * MAZE_SIZE + maze_y1][maze_x2 * MAZE_SIZE + maze_y2].w;
                    } else if (maze_e_prim[maze_x2 * MAZE_SIZE + maze_y2][maze_x1 * MAZE_SIZE + maze_y1] != null) {
                        map[i][j] = maze_e_prim[maze_x2 * MAZE_SIZE + maze_y2][maze_x1 * MAZE_SIZE + maze_y1].w;
                    } else {
                        map[i][j] = -1;
                    }
                }
            }
        }
    }
    // let i = map.length;
    // while(i > 0) {
    //     i -= 1;
    //     map.splice(i , 0, map[i])
    // }
}

let remove = function(array, index) {
    if(index > -1) {
        array.splice(index, 1)
    }
    return array;
}

let include = function(array, item) {
    for(let i in array) {
        if(array[i] === item) {
            return true;
        }
    }
    return false;
}
