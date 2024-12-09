const MyError = require("../cerror");
const personM = require("../models/person.m");
const path = require("path");
const TemplateEngine = require("../22393");
const templateEngine = new TemplateEngine(path.join(__dirname, "../views"));

module.exports = {
  getActorDetail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const actor = await personM.getActorDetail(id);
      console.log(actor);
      if (!actor) {
        return next(
          new MyError(404, "Actor Not Found", "No has information about actor.")
        );
      }

      const data = {
        actor: actor,
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
};
