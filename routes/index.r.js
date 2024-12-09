const router = require("express").Router();
const movieC = require("../controllers/movie.c");

router.get("/", movieC.getHome);

module.exports = router;
