document.addEventListener("DOMContentLoaded", () => {
  // User-facing string constants
  const MSG_STORED_AT = window.messages?.storedAt;
  const MSG_UPDATED_AT = window.messages?.updatedAt;
  const MSG_REMOVE = window.messages?.remove;
  const MSG_ADD = window.messages?.add;
  const MSG_BACK = window.messages?.back;
  const MSG_WRITER = window.messages?.writer;
  const MSG_READER = window.messages?.reader;
  
  // Create and style the 'stored at' timestamp element
  const storedAtDiv = document.createElement("div");
  storedAtDiv.id = "stored-at";
  document.body.appendChild(storedAtDiv);

  // Helper to update the timestamp display and save to localStorage
  function updateStoredAt() {
    const now = new Date();
    const formatted = now.toLocaleString();
    storedAtDiv.textContent = window.location.pathname.endsWith("writer.html")
      ? MSG_STORED_AT(formatted)
      : MSG_UPDATED_AT(formatted);
    localStorage.setItem("notes_stored_at", formatted);
  }

  // On page load, show the last stored time if available
  function setStoredAtFromLocalStorage() {
    const lastStored = localStorage.getItem("notes_stored_at");
    if (lastStored) {
      storedAtDiv.textContent = window.location.pathname.endsWith("writer.html")
        ? MSG_STORED_AT(lastStored)
        : MSG_UPDATED_AT(lastStored);
    }
  }
  setStoredAtFromLocalStorage();

  // If on reader.html, update the timestamp every second from localStorage
  if (window.location.pathname.endsWith("reader.html")) {
    setInterval(setStoredAtFromLocalStorage, 1000);
  }

  class Note {
    constructor(id, text, onUpdate, onRemove) {
      this.id = id;
      this.text = text;
      this.onUpdate = onUpdate;
      this.onRemove = onRemove;
    }

    // Render the note as a textarea with a remove button
    render() {
      const note = document.createElement("textarea");
      note.style.backgroundColor = "royalblue";
      note.value = this.text || "";
      note.style.border = "1px solid black";
      note.style.color = "white";

      // When the textarea content changes, update the note and save
      note.addEventListener("input", () => {
        this.text = note.value;
        if (this.onUpdate) this.onUpdate(this);
      });

      const removeButton = document.createElement("button");
      removeButton.textContent = MSG_REMOVE;

      // When the remove button is clicked, remove the note
      removeButton.addEventListener("click", () => {
        if (this.onRemove) this.onRemove(this);
        noteAndRemove.remove();
      });

      // Container for the textarea and remove button
      const noteAndRemove = document.createElement("div");
      noteAndRemove.appendChild(note);
      noteAndRemove.appendChild(removeButton);
      noteAndRemove.style.display = "flex";
      noteAndRemove.style.gap = "2em";
      noteAndRemove.style.marginBottom = "2em";
      return noteAndRemove;
    }
  }

  class NoteList {
    constructor(containerId, addButtonId) {
      this.container = document.getElementById(containerId);
      this.addButton = document.getElementById(addButtonId);
      // Load notes from localStorage
      this.notes = this.loadNotes();
      // Set the next id to use for new notes
      this.nextId = 1;
      // Render all notes on page load
      this.renderAll();
      // Add event listener to the add button (if it exists)
      if (this.addButton) {
        this.addButton.textContent = MSG_ADD;
        this.addButton.addEventListener("click", () => this.addNote());
      }
    }

    // Load notes array from localStorage
    loadNotes() {
      return JSON.parse(localStorage.getItem("notes")) || [];
    }

    // Save notes array to localStorage and update timestamp
    saveNotes() {
      localStorage.setItem("notes", JSON.stringify(this.notes));
      updateStoredAt();
    }

    // Add a new note, save, and render it
    addNote() {
      const noteObj = { id: this.nextId++, text: "" };
      this.notes.push(noteObj);
      this.saveNotes();
      this.container.appendChild(
        new Note(
          noteObj.id,
          noteObj.text,
          this.updateNote.bind(this),
          this.removeNote.bind(this)
        ).render()
      );
    }

    // Update a note's text and save
    updateNote(updatedNote) {
      const idx = this.notes.findIndex((n) => n.id === updatedNote.id);
      // If no note with idx equals to -1, then update note's text and save the note
      if (idx !== -1) {
        this.notes[idx].text = updatedNote.text;
        this.saveNotes();
      }
    }

    // Remove a note and save
    removeNote(noteToRemove) {
      this.notes = this.notes.filter((n) => n.id !== noteToRemove.id);
      this.saveNotes();
    }

    // Render all notes in the container
    renderAll() {
      this.container.innerHTML = "";
      this.notes.forEach((n) => {
        this.container.appendChild(
          new Note(
            n.id,
            n.text,
            this.updateNote.bind(this),
            this.removeNote.bind(this)
          ).render()
        );
      });
      // If on reader.html, disable editing and hide remove buttons
      if (window.location.pathname.endsWith("reader.html")) {
        getNotes(this);
      }
    }
  }

  // Disables all textareas and hides remove buttons in the note list (for reader.html)
  function getNotes(noteList) {
    const textareas = noteList.container.querySelectorAll("textarea");
    textareas.forEach((textarea) => {
      textarea.disabled = true;
      textarea.style.color = "white";
    });
    const removeButtons = noteList.container.querySelectorAll("button");
    removeButtons.forEach((button) => {
      button.style.display = "none";
    });
  }

  // Setup containers and NoteList
  // Get references to main containers and add button
  const noteAddContainer = document.getElementById("note-add-container");
  const noteContainer = document.getElementById("note-container");
  const addButton = document.getElementById("add-button");
  const backButton = document.getElementById("back-button");
  backButton.addEventListener("click", () => {
    document.location.href = "../index.html";
  });
  // Ensure noteContainer is above the add button
  noteAddContainer.insertBefore(noteContainer, addButton);

  // Initialize NoteList (renders notes and sets up add button)
  const noteListInstance = new NoteList("note-container", "add-button");

  // Save notes to localStorage every 2 seconds (auto-save)
  setInterval(() => {
    noteListInstance.saveNotes();
  }, 2000);

  // Real-time update: Listen for localStorage changes and re-render notes on reader.html
  if (window.location.pathname.endsWith("reader.html")) {
    window.addEventListener("storage", (event) => {
      if (event.key === "notes") {
        noteListInstance.notes =
          JSON.parse(localStorage.getItem("notes")) || [];
        noteListInstance.renderAll();
      }
    });
  }

  // Set UI text content from centralized user messages
  // Set UI text content from centralized user messages (for localization and consistency)
  if (window.messages) {
    const readerTitle = document.getElementById("reader-title");
    if (readerTitle) readerTitle.textContent = MSG_READER;
    const backBtn = document.getElementById("back-button");
    if (backBtn) backBtn.textContent = MSG_BACK;
    const writerTitle = document.getElementById("writer-title");
    if (writerTitle) writerTitle.textContent = MSG_WRITER;
    const addBtn = document.getElementById("add-button");
    if (addBtn) addBtn.textContent = MSG_ADD;
  }
});
