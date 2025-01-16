const mongoose = require("mongoose");

const WordSchema = new mongoose.Schema({
  word: String,
  difficulty: Number,
});

// compile model from schema
module.exports = mongoose.model("user", WordSchema);
