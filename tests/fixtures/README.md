# Golden fixtures

`golden.json` holds positions and velocities computed by the original JavaScript implementation of jsOrrery
(commit `1e930aa`, three.js r82, before the TypeScript port). `tests/simulation.test.ts` checks that the current
code reproduces them (relative tolerance 1e-9):

- `elements`: every orbital-elements scenario at 4 dates (1600, 1969, 2017, 2024), initially and after 25 ticks.
- `precise`: VSOP87 (Earth, Mercury) and ELP2000 (Moon) positions.
- `physics`: gravity-integrated scenarios (Apollo 11 for 1500 ticks, including its event labels; BigJupiter; MoonSOI
  with 10 calculations per tick instead of 1000 to keep it fast).

They were produced by `legacy-harness.js`, a headless copy of the legacy `Universe` (no graphics), bundled with
esbuild against the legacy sources and their node_modules, and run with `legacy-run.cjs`, which loads the
VSOP/ELP data scripts first:

```
NODE_PATH=<legacy>/node_modules npx esbuild legacy-harness.js --bundle --platform=node --format=cjs --outfile=old-bundle.cjs
OUT=golden.json DATA=<legacy>/assets/data node legacy-run.cjs
```

Only regenerate them if a change to the computations is intended.
