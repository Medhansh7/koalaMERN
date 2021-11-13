const express = require("express");
const router = express.Router();
const Note = require("../models/NoteModel");
const multer = require("multer");

const path = require("path");

const storage = multer.diskStorage({
  destination: "./koalatest/public/uploads",
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  //   res.send("we are on home")
  try {
    let allNotes = await Note.find();
    res.json(allNotes);
  } catch (err) {
    res.json({ message: err });
  }
});

router.post("/addNote", upload.single("image"), async (req, res) => {
  // console.log(req.file);
  const note = new Note({
    text: req.body.text,
    rotate: req.body.rotate,
    image: req.file ? req.file.originalname : null,
  });

  try {
    let AddedNote = await note.save();
    res.json(AddedNote);
  } catch (err) {
    res.json({ message: err });
  }
});

router.delete("/deleteNote/:noteId", async (req, res) => {
  try {
    const deletedNote = await Note.remove({ _id: req.params.noteId });
    res.json(deletedNote);
  } catch (err) {
    res.json({ message: err });
  }
});

module.exports = router;
