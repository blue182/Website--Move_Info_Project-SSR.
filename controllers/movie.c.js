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
      console.log("GET HOME");
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

      const data = {
        topFiveRatingMovies: topMoviesWithIndex,
        topFiveRatingMoviesLength: topFiveRatingMovies.length,
      };
      const layoutContent = templateEngine.loadTemplate("home.html");
      const partialsContent = {
        slidePoster: templateEngine.loadTemplate("partials/slidePoster.html"),
        slideMovie: htmlContent1,
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
      console.log("Movie: ", movie);

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

      console.log("Actors: ", actorsString);
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
};
