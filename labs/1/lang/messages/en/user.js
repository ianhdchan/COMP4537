// All user-facing messages for the notes app
const messages = {
  storedAt: (datetime) => `stored at: ${datetime}`,
  updatedAt: (datetime) => `updated at: ${datetime}`,
  studentName: "Student name: Ian Chan",
  labTitle: "Lab 1: JSON, Object Constructor, localStorage",
  writer: "Writer",
  reader: "Reader",
  add: "add",
  remove: "remove",
  back: "back",
};

// Makes the messages object available globally
window.messages = messages;
