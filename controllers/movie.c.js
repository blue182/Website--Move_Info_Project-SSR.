const MyError = require("../cerror");
const movieM = require("../models/movie.m");
const path = require("path");
const TemplateEngine = require("../22393");
const templateEngine = new TemplateEngine(path.join(__dirname, "../views"));

function groupMoviesByIndex(movies, chunkSize = 3) {
  const groupedMovies = [];

  for (let i = 0; i < movies.length; i += chunkSize) {
    if (i + chunkSize > movies.length) {
      chunkSize = movies.length - i;
    }
    const group = {
      length: chunkSize,
      index: groupedMovies.length,
      movie: movies.slice(i, i + chunkSize),
    };
    groupedMovies.push(group);
  }

  return groupedMovies;
}
const parseNamesToString = (list) => {
  if (list && Array.isArray(list)) {
    return list
      .map((item) => item.name)
      .filter((name) => name)
      .join(", ");
  }
  return "";
};

module.exports = {
  getHome: async (req, res, next) => {
    try {
      const topFiveRatingMovies = await movieM.getTopRatedMovies();
      const topMoviesWithIndex = topFiveRatingMovies.map((movie, index) => ({
        ...movie,
        index,
      }));

      const topGrossingMovies = await movieM.getTopGrossingMovies();
      const groupedMovies = groupMoviesByIndex(topGrossingMovies);
      const data1 = {
        groupedMovies: groupedMovies,
        uniqueId: "carousel-" + Date.now(),
      };
      const layoutContent1 = templateEngine.loadTemplate(
        "partials/slideMovie.html"
      );
      const htmlContent1 = templateEngine.parseTemplate(layoutContent1, data1);

      const topFAVMovie = await movieM.getTopRatedFavoriteMovies();
      const groupedMoviesFAV = groupMoviesByIndex(topFAVMovie);
      const data2 = {
        groupedMovies: groupedMoviesFAV,
        uniqueId: "carousel-" + Date.now(),
      };
      const layoutContent2 = templateEngine.loadTemplate(
        "partials/slideMovie.html"
      );
      const htmlContent2 = templateEngine.parseTemplate(layoutContent2, data2);

      const data = {
        topFiveRatingMovies: topMoviesWithIndex,
        topFiveRatingMoviesLength: topFiveRatingMovies.length,
      };
      const layoutContent = templateEngine.loadTemplate("home.html");
      const partialsContent = {
        slidePoster: templateEngine.loadTemplate("partials/slidePoster.html"),
        slideMovie: htmlContent1,
        slideFAVMovie: htmlContent2,
      };

      const htmlContent = templateEngine.parseTemplate(
        layoutContent,
        data,
        partialsContent
      );

      const layout = templateEngine.loadTemplate("layouts/main.html");

      const partials = {
        Navbar: templateEngine.loadTemplate("partials/navbar.html"),
        Content: htmlContent,
      };

      const html = templateEngine.parseTemplate(layout, {}, partials);

      res.send(html);
    } catch (error) {
      return next(new MyError(500, error.message, error.stack));
    }
  },
  getMovieDetails: async (req, res, next) => {
    try {
      const { id } = req.params;
      const movie = await movieM.getMovieDetails(id);
      if (!movie) {
        return next(
          new MyError(404, "Movie Not Found", "The movie does not exist.")
        );
      }
      const directorsString = parseNamesToString(movie.directors);
      const writersString = parseNamesToString(movie.writers);
      const actorsString = (movie.actors || [])
        .filter((actor) => actor.name && actor.id)
        .map((actor) => `<a href="/actor/${actor.id}">${actor.name}</a>`)
        .join(", ");

      const data = {
        movie,
        directorsString,
        writersString,
        actorsString,
      };
      const layout = templateEngine.loadTemplate("layouts/main.html");
      const partials = {
        Navbar: templateEngine.loadTemplate("partials/navbar.html"),
        Content: templateEngine.loadTemplate("movieDetail.html"),
      };
      const html = templateEngine.parseTemplate(layout, data, partials);
      res.send(html);
    } catch (error) {
      return next(new MyError(500, error.message, error.stack));
    }
  },
  searchMovies: async (req, res, next) => {
    try {
      console.log("Search Movies");
      const { keyword, page, limit } = req.query;
      const movies = await movieM.searchMovies(keyword, page, limit);
      const total_pages = Math.ceil(movies.totalCount / limit);
      const data = {
        movies: movies.movies,
        page: page,
        limit: parseInt(limit),
        total_pages,
        keyword,
      };
      const layout = templateEngine.loadTemplate("layouts/main.html");
      const partials = {
        Navbar: templateEngine.loadTemplate("partials/navbar.html"),
        Content: templateEngine.loadTemplate("searchMovie.html"),
      };
      const html = templateEngine.parseTemplate(layout, data, partials);
      res.send(html);
    } catch (error) {
      return next(new MyError(500, error.message, error.stack));
    }
  },
  getFavMovies: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;

      const movies = await movieM.getFavMovies(page, limit);
      const data = {
        movies: movies.movies,
        page,
        limit,
        total_pages: movies.totalPages,
      };
      const layout = templateEngine.loadTemplate("layouts/main.html");
      const partials = {
        Navbar: templateEngine.loadTemplate("partials/navbar.html"),
        Content: templateEngine.loadTemplate("listfavmovie.html"),
      };
      const html = templateEngine.parseTemplate(layout, data, partials);
      res.send(html);
    } catch (error) {
      return next(new MyError(500, error.message, error.stack));
    }
  },
  deleteFavMovie: async (req, res, next) => {
    try {
      const { movie_id } = req.body;
      await movieM.deleteFavMovie(movie_id);
      res.redirect("/favorite-movies");
    } catch (error) {
      return next(new MyError(500, error.message, error.stack));
    }
  },
  addFavMovie: async (req, res, next) => {
    try {
      const { movie_id } = req.body;
      const result = await movieM.addFavMovie(movie_id);
      res.redirect("/movie/" + movie_id);
    } catch (error) {
      return next(new MyError(500, error.message, error.stack));
    }
  },
};
