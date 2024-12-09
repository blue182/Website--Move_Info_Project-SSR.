const MyError = require("../cerror");
const personM = require("../models/person.m");
const movieM = require("../models/movie.m");
const path = require("path");
const TemplateEngine = require("../22393");
const templateEngine = new TemplateEngine(path.join(__dirname, "../views"));

module.exports = {
  getActorDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const actor = await personM.getActorDetail(id);
      if (!actor) {
        return next(
          new MyError(404, "Actor Not Found", "No has information about actor.")
        );
      }
      const movies = await movieM.listMovieOfActor(id);
      const data1 = {
        movies: movies,
      };
      const layout1 = templateEngine.loadTemplate(
        "partials/listMovieOfActor.html"
      );
      const html1 = templateEngine.parseTemplate(layout1, data1);

      const data = {
        actor: actor,
        listMovieOfActor: html1,
      };
      const layout = templateEngine.loadTemplate("layouts/main.html");
      const partials = {
        Navbar: templateEngine.loadTemplate("partials/navbar.html"),
        Content: templateEngine.loadTemplate("actorDetail.html"),
      };
      const html = templateEngine.parseTemplate(layout, data, partials);
      res.send(html);
    } catch (error) {
      next(new MyError(500, "Internal Server Error", error.message));
    }
  },
  searchActors: async (req, res, next) => {
    try {
      const { keyword, page, limit } = req.query;
      const actors = await personM.searchActors(keyword, page, limit);
      const data = {
        actors: actors.actors,
        page: page,
        total_pages: Math.ceil(actors.totalCount / limit),
        limit: limit,
        keyword: keyword,
      };
      const layout = templateEngine.loadTemplate("layouts/main.html");
      const partials = {
        Navbar: templateEngine.loadTemplate("partials/navbar.html"),
        Content: templateEngine.loadTemplate("searchActor.html"),
      };
      const html = templateEngine.parseTemplate(layout, data, partials);
      res.send(html);
    } catch (error) {
      next(new MyError(500, "Internal Server Error", error.message));
    }
  },
};
