const data = [
    [1, 1, 7, 2, 7, 2, 8, 8, 7, 4],
    [6, 7, 5, 1, 4, 5, 4, 2, 8, 1],
    [2, 6, 1, 2, 3, 4, 3, 5, 3, 3],
    [1, 8, 8, 4, 8, 7, 7, 5, 1, 1],
    [7, 5, 7, 4, 3, 4, 6, 2, 4, 7],
    [2, 1, 1, 7, 4, 1, 3, 7, 4, 5],
    [7, 7, 6, 6, 7, 3, 6, 5, 1, 7],
    [4, 3, 3, 1, 7, 8, 3, 4, 4, 4],
    [4, 8, 4, 1, 2, 1, 5, 8, 2, 8],
    [6, 8, 5, 7, 7, 6, 6, 2, 7, 3]
]

const classColorMap = {
    0: 'ten',
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    10: 'ten'
}

const stepBtn = document.querySelector('#step')
const dspFlashes = document.querySelector('#flashes')
const dspTurns = document.querySelector('#turns')

let flashesCount = 0;
let steps = 0;
let octoList = [];

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

function increaseEngergyLevel(data) {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j] < 10) {
                data[i][j]++
            }
        }
    }
}

async function increaseEnergyLevelByFlashes(data) {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j] === 10) {
                flashesCount++
                dspFlashes.textContent = flashesCount
                await increseAdjacentsEnergyLevel(data, i, j)
            };
        }
    }
}

async function increseAdjacentsEnergyLevel(data, x, y) {
    data[x][y] = 0;
    toogleBorder(data,x,y);
    directions = [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1], [-1, -1]]
    for (let i = 0; i < directions.length; i++) {
        const dx = directions[i][0];
        const dy = directions[i][1];
        try {
            if (data[x + dx][y + dy] !== 0 && data[x + dx][y + dy] < 10) {
                data[x + dx][y + dy]++
                appendData(data, x + dx, y + dy)
                await sleep(250);
                if (data[x + dx][y + dy] === 10) {
                    flashesCount++
                    dspFlashes.textContent = flashesCount
                    await increseAdjacentsEnergyLevel(data, x + dx, y + dy)
                }
            }
        } catch {
            //shame on you
        }

    }
    toogleBorder(data,x,y);
}

function countFlashes(data) {
    let flashes = 0;
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j] === 0) flashes++;
        }
    }
    return flashes;
}

function isEveryFlashing(data) {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j] !== 0) return false;;
        }
    }
    return true;
}

function createOctopusBoard(x, y) {
    const parent = document.querySelector('.octoGrid')

    for (let i = 0; i < x; i++) {
        for (let j = 0; j < y; j++) {
            const item = document.createElement('div');
            item.classList.add('octoItem')
            const octoImage = document.createElement('img');
            octoImage.src = 'octopus.svg'
            octoImage.classList.add('octopus')
            item.appendChild(octoImage);
            parent.appendChild(item);
        }
    }
}

function appendDataAll(data) {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            octoList[i * 10 + j].childNodes[0].classList.remove(...octoList[i * 10 + j].childNodes[0].classList)
                octoList[i * 10 + j].childNodes[0].classList.add(classColorMap[data[i][j]])
        }
    }
    // for (let i = 0; i < data.length; i++) {
    //     for (let j = 0; j < data[i].length; j++) {
    //         octoList[i*10+j].textContent = data[i][j]
    //     }
    // }
}

function toogleBorder(data,x,y) {
    octoList[x * 10 + y].classList.toggle('current')
}

function appendData(data, x, y) {
    octoList[x * 10 + y].childNodes[0].classList.remove(...octoList[x * 10 + y].childNodes[0].classList)
    octoList[x * 10 + y].childNodes[0].classList.add(classColorMap[data[x][y]])
    if (data[x][y] === 10) {
        octoList[x * 10 + y].childNodes[0].classList.add('flash')
    }
    // octoList[x * 10 + y].textContent = data[x][y]
}

function initialize() {
    createOctopusBoard(10, 10);
    octoList = [...document.querySelectorAll('.octoItem')]
    appendDataAll(data);
    stepBtn.addEventListener('click', stepper )
    dspFlashes.textContent = `Flashes: ${flashesCount}`
    dspTurns.textContent = `Turn: ${steps}`
}

async function stepper() {
    stepBtn.disabled = true;
    increaseEngergyLevel(data);
    appendDataAll(data);
    await increaseEnergyLevelByFlashes(data);
    steps++;
    dspTurns.textContent = `Turn: ${steps}`
    stepBtn.disabled = false;
}

initialize();

