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
  addFavMovie: async (movie) => {
    try {
      console.log("Model movie: ", movie);
      const result = await db.addFavMovie(movie);
      console.log("Model result: ", result);
      return result;
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
  deleteFavMovie: async (id) => {
    try {
      const result = await db.deleteFavMovie(id);
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
  searchMovies: async (keyword, page = 1, limit = 10) => {
    try {
      const data = await db.searchMovies(keyword, page, limit);
      return data;
    } catch (error) {
      throw error;
    }
  },
  getFavMovies: async (page = 1, limit = 10) => {
    try {
      const data = await db.getFavoriteMovies(page, limit);
      return data;
    } catch (error) {
      throw error;
    }
  },
};
