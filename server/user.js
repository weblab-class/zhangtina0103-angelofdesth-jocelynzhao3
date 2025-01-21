const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  elo: { type: Number, default: 1 },
  log: {
    type: [
      {
        Opponent: String,
        Result: String,
        Language: String,
        Date: String,
      },
    ],
    default: [],
  },
});

// compile model from schema
module.exports = mongoose.model("User", UserSchema);
