const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: {
    type: String,
    required: true,
    max: 100
  },
  family_name: {
    type: String,
    required: true,
    max: 100
  },
  date_of_birth: {
    type: Date
  },
  date_of_death: {
    type: Date
  }
});

// Full name of Author
AuthorSchema.virtual("lifespan").get(function() {
  return (
    this.date_of_birth.getYear() - this.date_of_birth.getYear()
  ).toString();
});

// Author's url
AuthorSchema.virtual("url").get(function() {
  return "/catalog/author/" + this._id;
});

module.exports = mongoose.model("Author", AuthorSchema);
