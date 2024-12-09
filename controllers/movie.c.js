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
      index: groupedMovies.length, // Use the current group number as index
      movie: movies.slice(i, i + chunkSize),
    };
    groupedMovies.push(group);
  }

  return groupedMovies;
}

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
      //   console.log("TOP GROSSING MOVIES: ", topGrossingMovies);
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
};
