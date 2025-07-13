// Script to update race results from the API
// This maintains compatibility with the original project's update script

import fs from 'fs/promises';
import path from 'path';

class F1DataFetcher {
  constructor(year) {
    this.year = year;
    this.baseUrl = "https://api.jolpi.ca/ergast/f1";
  }

  async fetchRaceSchedule() {
    const response = await fetch(`${this.baseUrl}/${this.year}`);
    const data = await response.json();
    return data.MRData.RaceTable.Races;
  }

  async fetchRaceResult(round) {
    const response = await fetch(
      `${this.baseUrl}/${this.year}/${round}/results`,
    );
    const data = await response.json();
    return data.MRData.RaceTable.Races[0].Results;
  }

  async initializeDataFileIfEmpty() {
    const filePath = path.resolve('./src/data/pastResults.ts');
    const template = `import { PastRaceResult } from '../types';

export const pastRaceResults: PastRaceResult = {
};

export default pastRaceResults;`;
    
    try {
      await fs.access(filePath);
      const content = await fs.readFile(filePath, "utf8");
      if (!content.includes("pastRaceResults")) {
        await fs.writeFile(filePath, template);
      }
    } catch (error) {
      // File doesn't exist, create it
      await fs.writeFile(filePath, template);
    }
  }

  formatResults(results) {
    if (!results) return null;
    return results.map((result) => result.Driver.familyName);
  }

  getRaceCode(raceName) {
    // Map API race names to your race names
    const raceMap = {
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
    for (const [apiName, yourName] of Object.entries(raceMap)) {
      if (raceName.includes(apiName)) {
        baseName = yourName;
        break;
      }
    }

    // Return full name with Sprint if applicable
    return isSprint ? `${baseName} Sprint` : baseName;
  }

  async updateDataFile(raceCode, drivers) {
    try {
      const filePath = path.resolve('./src/data/pastResults.ts');
      const dataFile = await fs.readFile(filePath, "utf8");

      // Find the position to insert the new race results
      const match = dataFile.match(
        /export const pastRaceResults: PastRaceResult = {([\s\S]*?)};/,
      );
      if (!match) {
        throw new Error("Could not find pastRaceResults object in data.js");
      }

      const existingResults = match[1];

      // Check if this race already exists
      const raceExists = new RegExp(`"${raceCode}":`).test(existingResults);
      if (raceExists) {
        return;
      }

      // Add comma to the end of the last entry if there are existing entries
      const hasExistingEntries = existingResults.trim().length > 0;
      const newRaceEntry = `  "${raceCode}": ${JSON.stringify(drivers, null, 2)}`;

      let updatedContent;
      if (hasExistingEntries) {
        // Add comma to the last entry and then add new entry
        updatedContent = dataFile.replace(
          /export const pastRaceResults: PastRaceResult = {([\s\S]*?)(\n?)};/,
          `export const pastRaceResults: PastRaceResult = {$1,\n${newRaceEntry}\n};`,
        );
      } else {
        // First entry - no comma needed
        updatedContent = dataFile.replace(
          /export const pastRaceResults: PastRaceResult = {([\s\S]*?)};/,
          `export const pastRaceResults: PastRaceResult = {\n${newRaceEntry}\n};`,
        );
      }

      await fs.writeFile(filePath, updatedContent);
    } catch (error) {
      console.error("Error updating data file:", error);
    }
  }

  async updateAllResults() {
    try {
      // Initialize data file if empty
      await this.initializeDataFileIfEmpty();

      const races = await this.fetchRaceSchedule();

      for (const race of races) {
        try {
          const results = await this.fetchRaceResult(race.round);
          const raceCode = this.getRaceCode(race.raceName);
          const formattedResults = this.formatResults(results);

          if (formattedResults && raceCode) {
            await this.updateDataFile(raceCode, formattedResults);
          } else {
          }

          // Respect API rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error processing race ${race.raceName}:`, error);
        }
      }
    } catch (error) {
      console.error("Error updating results:", error);
    }
  }
}

// Run the fetcher
const fetcher = new F1DataFetcher(2025);
fetcher.updateAllResults().catch(console.error);