const router = require("express").Router();
const movieC = require("../controllers/movie.c");
const personC = require("../controllers/person.c");

router.get("/", movieC.getHome);
router.get("/movie/:id", movieC.getMovieDetails);
router.get("/actor/:id", personC.getActorDetail);

module.exports = router;
