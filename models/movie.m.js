const { search } = require("../routes/index.r");

const schema = process.env.DB_SCHEMA || "public";
const db = require("./db")(schema);
const tbName = "movies";
const idField = "id";

module.exports = {
  all: async () => {
    try {
      const data = await db.all(tbName);
      return data;
    } catch (error) {
      throw error;
    }
  },
  one: async (id) => {
    try {
      const data = await db.getMovieDetails(id);
      return data;
    } catch (error) {
      throw error;
    }
  },
  add: async (movie) => {
    try {
      const movieId = await db.add(tbName, movie);
      return movieId;
    } catch (error) {
      throw error;
    }
  },
  delete: async (id) => {
    try {
      const result = await db.delete(tbName, idField, id);
      return result;
    } catch (error) {
      throw error;
    }
  },
  getFavMovies: async () => {
    try {
      const data = await db.getfavMovies();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getTopGrossingMovies: async () => {
    try {
      const data = await db.getTopGrossingMovies();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getTopRatedFavoriteMovies: async () => {
    try {
      const data = await db.getTopRatedFavoriteMovies();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getTopRatedMovies: async () => {
    try {
      const data = await db.getTopRatedMovies();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getMovieDetails: async (id) => {
    try {
      const data = await db.getMovieDetails(id);
      return data;
    } catch (error) {
      throw error;
    }
  },
};
