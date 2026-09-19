# Sourfly

Sourfly is a small, interactive simulation of a fruit fly navigating a world using a connectome-informed neural circuit.

The fly receives local visual signals, passes them through visual, central, and descending neurons, and turns that activity into movement. The simulation is designed to make the relationship between neural activity and behavior easy to inspect.

## Explore

- Food seeking.
- Obstacle avoidance
- Competing stimuli
- Seeded random mazes
- Live neural activity across three circuit layers
- Reproducible experiments with custom seeds
- Lesion mode for selected central neurons
- Position, time, distance, collisions, and food-reached metrics

## Run locally

No build step or dependencies are required.

Open `index.html` in a browser, or serve the folder locally:

```sh
python3 -m http.server
```

Then visit `http://localhost:8000`.

## Files

- `index.html` contains the interface.
- `style.css` contains the visual design and responsive layout.
- `app.js` contains the neural circuit, world generation, behavior decoder, and canvas renderer.
- `assets/` contains project media.

## Scope

The model is an educational computational simulation based on FAFB v783 connectome data. It is useful for exploring relationships between circuit activity and movement.

Created by abduhamid and yocrrz.

## tech it uses
- currently i used hardcoded values of neurons as 

```js
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
```
## Known bugs
there are these known bugs in the code

bug 1: The wall thrashing and thing
bug 2: DUMB AS HELL
bug 3: Fly stopping and collision distance increasing

## Roadmap
- Real time fly brain diagram in 3D showing currently processing neural networks.

- i will connect a VPS for the orignal and live dataset its expensive so theres less chance i can do it :(
## bug fixing roadmap

- [1] FIX PHYSICS
        ↓
- [2] EXTRACT CONNECTOME DATA
        ↓
- [3] PYTHON CONNECTOME ENGINE
        ↓
- [4] WEBSOCKET PROTOCOL
        ↓
- [5] REPLACE JS NeuralCircuit
        ↓
- [6] REAL NEURON INSPECTOR
        ↓
- [7] THREE.JS 3D FLY BRAIN
        ↓
- [8] ACTIVE PATH VISUALIZATION
        ↓
- [9] LESION REAL NEURONS
        ↓
- [10] COMPARE BEHAVIOR

## AND YES COPILOT DIDNT DO ANYTHING MAJOR I MISTAKENLY THOUGHT WHAT DOES THIS BUTTON DO AND THIS HAPPEND, EVERYTHING IS WRITTEN BY US