# F1 Points Calculator

The F1 Points Calculator is an interactive web application that allows users to predict and simulate Formula 1 season results. With an intuitive drag-and-drop interface, users can place drivers in their predicted finishing positions for each race. The application automatically calculates points based on the official F1 scoring system and provides real-time updates on driver and constructor standings.

## Features

- Drag-and-drop interface for easy prediction of race results
- Automatic points calculation adhering to F1 regulations
- Responsive design optimized for both desktop and mobile devices
- Shareable links for users to showcase and compare their predictions

## Usage

1. Select a driver from the provided list
2. Drag the driver to their predicted finishing position on the grid
3. Repeat steps 1 and 2 for all drivers and races in the season
4. Share your predictions with others using the generated shareable link

## Project Structure

```
F1-Points-Calculator/
├── css/
│   ├── base/
│   ├── components/
│   └── layout/
├── images/
├── modules/
│   ├── dragAndDrop/
│   ├── drivers/
│   ├── grid/
│   ├── points/
│   ├── races/
│   ├── state/
│   └── ui/
├── data.js
├── index.html
├── scripts.js
└── README.md
```

## Implementation Details

- The `css` directory contains stylesheets organized into base, components, and layout subdirectories for maintainable and modular styling.
- The `images` directory stores flag images used to represent different race tracks.
- The `modules` directory houses the core functionality of the application:
  - `dragAndDrop`: Implements the drag-and-drop functionality for placing drivers on the grid.
  - `drivers`: Handles driver selection and display.
  - `grid`: Manages the race grid initialization and updates.
  - `points`: Calculates points based on finishing positions and fastest laps.
  - `races`: Handles race-specific operations and data management.
  - `state`: Manages the overall application state and data flow.
  - `ui`: Controls user interface interactions and updates.
- `data.js` serves as a centralized data source, storing information about drivers, teams, and races.
- `index.html` is the main entry point of the application, defining the structure of the user interface.
- `scripts.js` acts as the main controller, orchestrating the interaction between different modules and handling user actions.
