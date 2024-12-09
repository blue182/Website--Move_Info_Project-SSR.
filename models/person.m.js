const schema = process.env.DB_SCHEMA || "public";
const db = require("./db")(schema);
const tbName = "persons";
const idField = "id";

module.exports = {
  all: async () => {
    try {
      const data = await db.all(tbName);
      return data;
    } catch (error) {
      throw error;
    }
  },
  getActorDetail: async (id) => {
    try {
      const data = await db.one(tbName, idField, id);
      return data;
    } catch (error) {
      throw error;
    }
  },
};
