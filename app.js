const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//get movies
app.get("/movies/", async (request, response) => {
  const getQuery = `
select
movie_name
from
movie`;
  const movies = await db.all(getQuery);
  response.send(
    movies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

//post movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postmovieQuery = `
INSERT INTO
movie (director_id, movie_name, lead_actor)
VALUES
('${directorId}', '${movieName}', '${leadActor}');`;
  await db.run(postmovieQuery);
  response.send("Movie Successfully Added");
});

//get:movieId
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
SELECT
*
FROM
movie
WHERE
movie_id = ${movieId};`;

  const moviedetails = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(moviedetails));
});

//put-movieid
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateQuery = `
UPDATE
movie
SET
director_id = ${directorId},
movie_name = '${movieName}',
lead_actor = '${leadActor}'
WHERE
movie_id = ${movieId};`;

  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

//delete
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletemovieQuery = `
DELETE FROM
movie
WHERE
movie_id = ${movieId};`;
  await db.run(deletemovieQuery);
  response.send("Movie Removed");
});

//directorstableget
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
SELECT
  *
FROM
  director;`;
  const directordetails = await db.all(getDirectorsQuery);
  response.send(
    directordetails.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

///directors/:directorId/movies/
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsQuery = `
SELECT
  movie_name
FROM
   movie
WHERE
   director_id=${directorId};`;
  const movies = await db.all(getDirectorsQuery);
  response.send(
    movies.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
