const initOptions = {
  capSQL: true,
};

const pgp = require("pg-promise")(initOptions);
const cn = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  max: 30,
};
const db = pgp(cn);

module.exports = (schema) => {
  this.schema = schema;
  return {
    all: async (tbName) => {
      try {
        const data = await db.any(`SELECT * FROM "${this.schema}"."${tbName}"`);
        return data;
      } catch (error) {
        throw error;
      }
    },
    one: async (tbName, idField, id) => {
      try {
        const table = new pgp.helpers.TableName({
          table: tbName,
          schema: this.schema,
        });
        const data = await db.oneOrNone(`SELECT * FROM $1 WHERE $2:name = $3`, [
          table,
          idField,
          id,
        ]);
        return data;
      } catch (error) {
        throw error;
      }
    },
    add: async (tbName, entity) => {
      try {
        const table = new pgp.helpers.TableName({
          table: tbName,
          schema: this.schema,
        });
        const sql = pgp.helpers.insert(entity, null, table);
        const result = await db.oneOrNone(`${sql} RETURNING *`);
        return result;
      } catch (error) {
        throw error;
      }
    },
    delete: async (tbName, idField, id) => {
      console.log(`Deleting from table: ${tbName}, where ${idField} = ${id}`);

      try {
        console.log(`Deleting from table: ${tbName}, where ${idField} = ${id}`);
        const sql = `DELETE FROM ${tbName} WHERE ${idField} = $1 RETURNING *`;
        const result = await db.oneOrNone(sql, [id]);
        if (!result) {
          console.log("No record found to delete.");
          return null;
        }

        console.log(`Deleted row: `, result);
        return result;
      } catch (error) {
        console.error("Error during delete operation:", error);
        throw error;
      }
    },
    getMovieDetails: async (movieId) => {
      const sql = `
          SELECT 
              m.*,
              COALESCE(
                  JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', a.id, 'name', a.name, 'role', 'actor', 'as_character', ac.as_character))
                  FILTER (WHERE a.id IS NOT NULL), '[]'
              ) AS actors,
              COALESCE(
                  JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', d.id, 'name', d.name, 'role', 'director'))
                  FILTER (WHERE d.id IS NOT NULL), '[]'
              ) AS directors,
              COALESCE(
                  JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', w.id, 'name', w.name, 'role', 'writer'))
                  FILTER (WHERE w.id IS NOT NULL), '[]'
              ) AS writers
          FROM 
              s22393."movies" m
          LEFT JOIN s22393."actors" ac ON m.id = ac.movie_id
          LEFT JOIN s22393."persons" a ON ac.person_id = a.id
          LEFT JOIN s22393."directors" dir ON m.id = dir.movie_id
          LEFT JOIN s22393."persons" d ON dir.person_id = d.id
          LEFT JOIN s22393."writers" wr ON m.id = wr.movie_id
          LEFT JOIN s22393."persons" w ON wr.person_id = w.id
          WHERE 
              m.id = $1
          GROUP BY 
              m.id;
      `;
      try {
        const data = await db.oneOrNone(sql, [movieId]);
        if (!data) {
          console.error("No movie found with the given ID.");
          return null;
        }
        return data;
      } catch (err) {
        console.error("Error fetching movie details:", err);
        throw err;
      }
    },

    getFavoriteMovies: async (page = 1, limit = 10) => {
      const offset = (page - 1) * limit;
      const sql = `
          SELECT 
              m.id AS movie_id,
              m.title AS movie_title,
              m.runtime_str AS movie_runtime,
              m.genres AS movie_genre,
              m.image AS movie_image,
              m.filmaffinity_rating AS rating
          FROM 
              s22393."favorite_movies" fm
          JOIN s22393."movies" m ON fm.movie_id = m.id
          GROUP BY 
              m.id
          ORDER BY 
              m.title ASC
          LIMIT $1 OFFSET $2;
      `;
      const countSql = `
          SELECT COUNT(*) AS total
          FROM 
              s22393."favorite_movies" fm;
      `;
      try {
        const [movies, total] = await db.tx(async (t) => {
          const movieData = await t.any(sql, [limit, offset]);
          const totalData = await t.one(countSql);
          return [movieData, parseInt(totalData.total, 10)];
        });

        return { movies, total, totalPages: Math.ceil(total / limit) };
      } catch (err) {
        console.error("Error fetching favorite movies:", err);
        throw err;
      }
    },

    getTopGrossingMovies: async (limit = 23) => {
      const sql = `
            SELECT 
                m.id AS movie_id,
                m.title AS movie_title,
                m.runtime_str AS movie_runtime,
                m.image AS movie_image,
                m.cumulative_worldwide_gross AS gross
            FROM 
                s22393."movies" m
            WHERE 
                m.cumulative_worldwide_gross IS NOT NULL
            GROUP BY 
                m.id
            ORDER BY 
                CAST(REGEXP_REPLACE(m.cumulative_worldwide_gross, '[^0-9]', '', 'g') AS BIGINT) DESC
            LIMIT $1;
          `;
      try {
        const data = await db.any(sql, [limit]);
        return data;
      } catch (err) {
        console.error("Error fetching top-grossing movies:", err);
        throw err;
      }
    },

    getTopRatedMovies: async (limit = 5) => {
      const sql = `
            SELECT 
                m.id AS movie_id,
                m.title AS movie_title,
                m.runtime_str AS movie_runtime,
                m.image AS movie_image,
                m.filmaffinity_rating AS rating
            FROM 
                s22393."movies" m
            WHERE 
                m.filmaffinity_rating IS NOT NULL
            GROUP BY 
                m.id
            ORDER BY 
                m.filmaffinity_rating DESC
            LIMIT $1;
          `;
      try {
        const data = await db.any(sql, [limit]);
        return data;
      } catch (err) {
        console.error("Error fetching top-rated movies:", err);
        throw err;
      }
    },

    getTopRatedFavoriteMovies: async (limit = 17) => {
      const sql = `
            SELECT 
                m.id AS movie_id,
                m.title AS movie_title,
                m.runtime_str AS movie_runtime,
                m.image AS movie_image,
                m.filmaffinity_rating AS rating
            FROM 
                s22393."favorite_movies" fm
            JOIN 
                s22393."movies" m ON fm.movie_id = m.id
            WHERE 
                m.filmaffinity_rating IS NOT NULL
            GROUP BY 
                m.id
            ORDER BY 
                m.filmaffinity_rating DESC
            LIMIT $1;
          `;
      try {
        const data = await db.any(sql, [limit]);
        return data;
      } catch (err) {
        console.error("Error fetching top-rated favorite movies:", err);
        throw err;
      }
    },
    searchMovies: async (keyword, page = 1, limit = 10) => {
      const offset = (page - 1) * limit;

      const movieQuery = `
        SELECT 
            m.id AS movie_id,
            m.title AS movie_title,
            m.genres AS movie_genre,
            m.runtime_str AS movie_runtime,
            m.languages AS movie_language,
            m.image AS movie_image,
            m.filmaffinity_rating AS rating
        FROM 
            s22393."movies" m
        WHERE 
            LOWER(m.title) LIKE LOWER($1)
        ORDER BY 
            m.title
        LIMIT $2 OFFSET $3;
      `;
      const countQuery = `
        SELECT COUNT(*) AS count
        FROM s22393."movies" m
        WHERE LOWER(m.title) LIKE LOWER($1);
      `;

      try {
        const { movies, totalCount } = await db.tx(async (t) => {
          const movies = await t.any(movieQuery, [
            `%${keyword}%`,
            limit,
            offset,
          ]);
          const { count: totalCount } = await t.one(countQuery, [
            `%${keyword}%`,
          ]);
          return { movies, totalCount };
        });

        return { movies, totalCount };
      } catch (err) {
        console.error("Error searching movies:", err);
        throw err;
      }
    },

    searchActors: async (name, page = 1, limit = 10) => {
      const offset = (page - 1) * limit;

      const actorQuery = `
        SELECT 
            p.id AS actor_id,
            p.name AS actor_name,
            p.image AS actor_image,
            p.role AS actor_role
        FROM 
            s22393."persons" p
        WHERE 
            LOWER(p.name) LIKE LOWER($1)
            AND LOWER(p.role) LIKE LOWER('%actor%')
        LIMIT $2 OFFSET $3;
    `;

      const countQuery = `
        SELECT COUNT(*) 
        FROM s22393."persons" p
        WHERE LOWER(p.name) LIKE LOWER($1)
        AND LOWER(p.role) LIKE '%actor%';
      `;

      try {
        const [actors, totalCount] = await db.tx(async (t) => {
          const actorData = await t.any(actorQuery, [
            `%${name}%`,
            limit,
            offset,
          ]);
          const countData = await t.one(countQuery, [`%${name}%`]);
          return [actorData, parseInt(countData.count, 10)];
        });

        return { actors, totalCount };
      } catch (err) {
        console.error("Error searching actors:", err);
        throw err;
      }
    },
    deleteFavMovie: async (movieId) => {
      const sql = `
        DELETE FROM s22393."favorite_movies" 
        WHERE movie_id = $1 
        RETURNING *;  -- Trả về bản ghi bị xóa (tuỳ chọn, giúp kiểm tra nếu cần)
      `;

      try {
        const result = await db.oneOrNone(sql, [movieId]);
        if (result) {
          return result;
        } else {
          return null;
        }
      } catch (err) {
        throw err;
      }
    },
    addFavMovie: async (movieId) => {
      console.log("Adding DB movie to favorites:", movieId);
      const checkMovieSql = `
        SELECT 1 FROM s22393."movies" WHERE id = $1;
      `;

      try {
        const movieExists = await db.oneOrNone(checkMovieSql, [movieId]);

        if (!movieExists) {
          return { success: false, message: "Movie does not exist" };
        }
        const sql = `
          INSERT INTO s22393."favorite_movies" (movie_id)
          VALUES ($1)
          ON CONFLICT (movie_id) DO NOTHING;
        `;

        const result = await db.oneOrNone(sql, [movieId]);
        if (result === null) {
          return { success: false, message: "Movie already in favorites" };
        } else {
          return { success: true, message: "Movie added to favorites" };
        }
      } catch (err) {
        throw err;
      }
    },
  };
};
