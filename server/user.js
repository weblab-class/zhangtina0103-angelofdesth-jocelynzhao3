const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  elo: { type: Number, default: 1 },
  log: {
    type: [
      {
        Result: String,
        Opponent: String,
        Language: String,
        Date: String,
      }, // also track # words typed?
    ],
    default: [],
  },
});

// compile model from schema
module.exports = mongoose.model("User", UserSchema);
