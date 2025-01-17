const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema({
  language: String,
  word: String,
  english: String,
  difficulty: Number,
});

// compile model from schema
module.exports = mongoose.model("user", WordSchema);
