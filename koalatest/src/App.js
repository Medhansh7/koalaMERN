import React, { useState, useReducer, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import "./App.css";
import { ReactSketchCanvas } from "react-sketch-canvas";
import axios from "axios";

const initialNotesState = {
  lastNoteCreated: null,
  totalNotes: 0,
  notes: [],
};

const styles = {
  border: "0.0625rem solid #9c9c9c",
  borderRadius: "0.25rem",
};

const notesReducer = (prevState, action) => {
  switch (action.type) {
    case "ADD_NOTE": {
      const newState = {
        notes: [...prevState.notes, action.payload],
        totalNotes: prevState.notes.length + 1,
        lastNoteCreated: new Date().toTimeString().slice(0, 8),
      };
      console.log("After ADD_NOTE: ", newState);
      return newState;
    }

    case "DELETE_NOTE": {
      const newState = {
        ...prevState,
        notes: prevState.notes.filter(
          (note) => note._id !== action.payload._id
        ),
        totalNotes: prevState.notes.length - 1,
      };
      console.log("After DELETE_NOTE: ", newState);
      return newState;
    }
  }
};

export default function App() {
  const [notesState, dispatch] = useReducer(notesReducer, initialNotesState);
  const [noteInput, setNoteInput] = useState("");
  const [file, setfile] = useState([]);
  const [oneFile, setOneFile] = useState();

  React.useEffect(() => {
    axios
      .get("http://localhost:3001/note")
      .then((res) => {
        if (res.data.length != 0) {
          res.data.map((e) => {
            dispatch({ type: "ADD_NOTE", payload: e });
          });
        }
      })
      .catch((err) => console.log(err));
  }, []);

  let handleChange = (e) => {
    console.log(e);
    setOneFile(e.target.files[0]);
    setfile({
      file: URL.createObjectURL(e.target.files[0]),
    });
  };

  const addNote = (event) => {
    event.preventDefault();
    if (!noteInput) {
      alert("Write some note before creating");
      return;
    }

    let formData = new FormData();

    formData.append("text", noteInput);
    formData.append("rotate", Math.floor(Math.random() * 20));
    formData.append("image", oneFile);
    // const newNote = {
    //   id: uuid(),
    //   text: noteInput,
    //   rotate: Math.floor(Math.random() * 20),
    //   image: file,
    // };

    axios
      .post("http://localhost:3001/note/addNote", formData)
      .then((res) => {
        dispatch({ type: "ADD_NOTE", payload: res.data });
        setNoteInput("");
        setfile([]);
        console.log("note added", res);
      })
      .catch((err) => console.log("error is", err));
  };

  const dragOver = (event) => {
    event.stopPropagation();
    event.preventDefault();
  };

  let canvas = useRef();

  const dropNote = (event) => {
    event.target.style.left = `${event.pageX - 50}px`;
    event.target.style.top = `${event.pageY - 50}px`;
  };

  function clear() {
    canvas.current.clearCanvas();
  }

  let deleteNote = (e) => {
    console.log(e._id);

    axios
      .delete(`http://localhost:3001/note/deleteNote/${e._id}`)
      .then((res) => {
        dispatch({ type: "DELETE_NOTE", payload: e });
        console.log("Note deleted", res);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="row app1" onDragOver={dragOver}>
      <div className="col">
        <h1>
          You have {notesState.totalNotes} Notes
          <span>
            {notesState.notes.length
              ? `Last note created: ${notesState.lastNoteCreated}`
              : " "}
          </span>
        </h1>{" "}
        <br />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: "30px",
          }}
        >
          <form
            className="note-form"
            onSubmit={addNote}
            enctype="multipart/form-data"
          >
            <textarea
              placeholder="What to note...?"
              value={noteInput}
              onChange={(event) => setNoteInput(event.target.value)}
            ></textarea>
            <input name="image" type="file" onChange={(e) => handleChange(e)} />
            {console.log(file)}
            <img src={file.file} />
            <button>Create Note</button>
          </form>
        </div>
        <h2 className="text-center" style={{ color: "white" }}>
          Draw Anything below
        </h2>
        <div className="row">
          <div
            className="btn btn-primary"
            style={{ marginLeft: "50px" }}
            onClick={() => clear()}
          >
            Clear all
          </div>
          <ReactSketchCanvas
            // id="myCanvasID"
            ref={canvas}
            canvasColor={
              "radial-gradient( 63.33% 152.22% at -0.66% 1.07%, #4b29aa 0%, #090d24 100% )"
            }
            style={styles}
            width="100%"
            height="100vw"
            strokeWidth={4}
            strokeColor="white"
          />
          {notesState.notes.map((note) => (
            <div
              className="note"
              style={{ transform: `rotate(${note.rotate}deg)` }}
              onDragEnd={dropNote}
              draggable="true"
              key={note.id}
            >
              {console.log(note)}
              <div onClick={() => deleteNote(note)} className="close">
                {/* Medhansh Note, this icon is taken from https://heroicons.com/  */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {console.log(note, window.location.origin)}
              {note.image | (note.image != null) ? (
                <img
                  style={{ height: "90px", width: "145px" }}
                  src={`/uploads/${note.image}`}
                  alt="..."
                />
              ) : null}
              <pre className="text">{note.text}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
