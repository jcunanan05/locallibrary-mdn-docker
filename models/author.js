const mongoose = require("mongoose");
const moment = require("moment");

var Schema = mongoose.Schema;

var AuthorSchema = new Schema({
  first_name: { type: String, required: true, max: 100 },
  family_name: { type: String, required: true, max: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date }
});

// Virtual for author "full" name.
AuthorSchema.virtual("name").get(function() {
  return this.family_name + ", " + this.first_name;
});

AuthorSchema.virtual("lifespan").get(function() {
  const birthDate = this.date_of_birth
    ? moment(this.date_of_birth).format("YYYY-MM-DD")
    : "";
  const deathDate = this.date_of_death
    ? moment(this.date_of_death).format("YYYY-MM-DD")
    : "";

  return `${birthDate} - ${deathDate}`;
});

// Author's url
AuthorSchema.virtual("url").get(function() {
  return "/catalog/author/" + this._id;
});

module.exports = mongoose.model("Author", AuthorSchema);
