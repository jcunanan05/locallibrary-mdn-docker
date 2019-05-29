const mongoose = require("mongoose");

const database = (() => {
  const init = config => {
    const connectionString = `mongodb://${config.host}/${config.database}`;
    console.log(`Trying to connect to ${connectionString}`);
    mongoose.connect(connectionString, {
      useNewUrlParser: true
    });

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "MongoDB Connection Error"));
    db.once("open", function() {
      console.log("db connection open");
    });
    return db;
  };

  return {
    init
  };
})();

module.exports = database;
