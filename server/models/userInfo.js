const mongoose = require("mongoose");

const UserInfoSchema = new mongoose.Schema({
  name: String,
  googleid: String,
  elo: { type: Number, default: 1 },
  picture: String,
  log: [{ Opponent: String, Result: String }],
});

// compile model from schema
module.exports = mongoose.model("userInfo", UserInfoSchema);
