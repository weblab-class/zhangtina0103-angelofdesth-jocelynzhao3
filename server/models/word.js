const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema({
  language: String,
  word: String,
  english: String,
  difficulty: Number, // 1-4
});

// compile model from schema
module.exports = mongoose.model("word", WordSchema);
