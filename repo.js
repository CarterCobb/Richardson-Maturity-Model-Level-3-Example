import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

export const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Gets the JSON interpretation of the ideas from a ideas.json file
 * @return {Array} [{...idea}, {...idea}]
 */
export const getIdeasFromFile = () => {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "ideas.json"), "utf8")
  );
};

/**
 * Writes the json object of ideas to ideas.json file
 * @param {Object} ideas json object of idea array
 */
export const writeIdeasToFile = (ideas) => {
  fs.writeFileSync(
    path.resolve(__dirname, "ideas.json"),
    JSON.stringify(ideas),
    "utf-8"
  );
};

/**
 * Gets the JSON interpretation of the categories from a categories.json file
 * @return {Array} [{...category}, {...category}]
 */
export const getCategoriesFromFile = () => {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "categories.json"), "utf8")
  );
};

/**
 * Writes the json object of categories to categories.json file
 * @param {Object} categories json object of category array
 */
export const writeCategoriesToFile = (categories) => {
  fs.writeFileSync(
    path.resolve(__dirname, "categories.json"),
    JSON.stringify(categories),
    "utf-8"
  );
};
