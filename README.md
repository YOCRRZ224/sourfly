# Sourfly

Sourfly is a small, interactive simulation of a fruit fly navigating a world using a connectome-informed neural circuit.

The fly receives local visual signals, passes them through visual, central, and descending neurons, and turns that activity into movement. The simulation is designed to make the relationship between neural activity and behavior easy to inspect.

## Explore

- Food seeking
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
