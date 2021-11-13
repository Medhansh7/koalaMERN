const moongoose = require("mongoose");

const NoteModel = moongoose.Schema({
  text: String,
  rotate: Number,
  image: String,
});

module.exports = moongoose.model("Notes", NoteModel);
