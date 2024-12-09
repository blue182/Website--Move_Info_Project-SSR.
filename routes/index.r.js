const router = require("express").Router();
const movieC = require("../controllers/movie.c");
const personC = require("../controllers/person.c");

router.get("/", movieC.getHome);
router.get("/movie/:id", movieC.getMovieDetails);
router.get("/actor/:id", personC.getActorDetail);
router.post("/search", (req, res) => {
  const { keyword, searchType } = req.body;
  console.log("searchType: ", searchType);
  console.log("keyword: ", keyword);
  if (searchType === "title") {
    console.log("title");
    res.redirect(
      `/search/movie?keyword=${encodeURIComponent(keyword)}&page=1&limit=8`
    );
  } else if (searchType === "actor") {
    console.log("actor");
    res.redirect(
      `/search/actor?keyword=${encodeURIComponent(keyword)}&page=1&limit=8`
    );
  }
});
router.get("/search/movie", movieC.searchMovies);
router.get("/search/actor", personC.searchActors);

module.exports = router;
