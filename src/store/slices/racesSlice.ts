import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RacesState, PastRaceResult } from '../../types';
import { races } from '../../data/races';
import { pastRaceResults } from '../../data/pastResults';

const initialState: RacesState = {
  list: races,
  pastResults: pastRaceResults
};

// Async thunk for fetching past race results
// This maintains compatibility with the existing API
export const fetchPastRaceResults = createAsyncThunk(
  'races/fetchPastRaceResults',
  async (_, { rejectWithValue }) => {
    try {
      // Using the same API endpoint as in the original project
      const response = await fetch('https://api.jolpi.ca/ergast/f1/2025');
      if (!response.ok) {
        throw new Error('Failed to fetch race schedule');
      }
      
      const data = await response.json();
      const races = data.MRData.RaceTable.Races;
      
      const pastResults: PastRaceResult = {};
      
      // Process each race
      for (const race of races) {
        try {
          const round = race.round;
          const resultResponse = await fetch(`https://api.jolpi.ca/ergast/f1/2025/${round}/results`);
          
          if (!resultResponse.ok) {
            console.warn(`Failed to fetch results for round ${round}`);
            continue;
          }
          
          const resultData = await resultResponse.json();
          const results = resultData.MRData.RaceTable.Races[0]?.Results;
          
          if (!results) {
            console.warn(`No results available for round ${round}`);
            continue;
          }
          
          // Format the results similar to the original project
          const formattedResults = results.map((result: any) => result.Driver.familyName);
          
          // Map the race name to our format
          const raceName = mapRaceNameToOurFormat(race.raceName);
          if (raceName) {
            pastResults[raceName] = formattedResults;
          }
        } catch (error) {
          console.error(`Error fetching results for race`, error);
        }
        
        // Respect API rate limits
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      
      return pastResults;
    } catch (error) {
      return rejectWithValue('Failed to fetch race results');
    }
  }
);

// Helper function to map API race names to our format
function mapRaceNameToOurFormat(raceName: string): string | null {
  // Map API race names to our race names (same as in the original project)
  const raceMap: Record<string, string> = {
    Australian: "Australia",
    Chinese: "China",
    Japanese: "Japan",
    Bahrain: "Bahrain",
    "Saudi Arabian": "Saudi Arabia",
    Miami: "Miami",
    "Emilia Romagna": "Imola",
    Monaco: "Monaco",
    Canadian: "Canada",
    Spanish: "Spain",
    Austrian: "Austria",
    British: "United Kingdom",
    Hungarian: "Hungary",
    Belgian: "Belgium",
    Dutch: "Netherlands",
    Italian: "Italy",
    Azerbaijan: "Azerbaijan",
    Singapore: "Singapore",
    "United States": "Austin",
    "Mexico City": "Mexico",
    "São Paulo": "Sao Paulo",
    "Las Vegas": "Las Vegas",
    Qatar: "Qatar",
    "Abu Dhabi": "Abu Dhabi",
  };

  // Handle sprint races
  let isSprint = raceName.toLowerCase().includes('sprint');

  // Find the base race name
  let baseName = "";
  for (const [apiName, ourName] of Object.entries(raceMap)) {
    if (raceName.includes(apiName)) {
      baseName = ourName;
      break;
    }
  }

  if (!baseName) return null;

  // Return full name with Sprint if applicable
  return isSprint ? `${baseName} Sprint` : baseName;
}

export const racesSlice = createSlice({
  name: 'races',
  initialState,
  reducers: {
    updatePastResults: (state, action: PayloadAction<PastRaceResult>) => {
      state.pastResults = { ...state.pastResults, ...action.payload };
      
      // Update the completed status for races
      state.list = state.list.map(race => {
        const isCompleted = !!state.pastResults[race.name];
        return { ...race, completed: isCompleted };
      });
    },
    
    markRaceAsCompleted: (state, action: PayloadAction<{ raceId: string }>) => {
      const race = state.list.find(r => r.id === action.payload.raceId);
      if (race) {
        race.completed = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchPastRaceResults.fulfilled, (state, action) => {
      state.pastResults = { ...state.pastResults, ...action.payload };
      
      // Update the completed status for races
      state.list = state.list.map(race => {
        const isCompleted = !!state.pastResults[race.name];
        return { ...race, completed: isCompleted };
      });
    });
  }
});

export const { updatePastResults, markRaceAsCompleted } = racesSlice.actions;

export default racesSlice.reducer;