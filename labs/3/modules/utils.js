const fs = require("fs").promises;

exports.getDate = () => {
  return new Date();
};

exports.writeFile = async (data, query) => {
  let fileHandle;
  let text = data.text;

  try {
    fileHandle = await fs.open("file.txt", "a");
    await fileHandle.appendFile(text);
  } catch (err) {
    console.error(`Error: ${err}`);
  } finally {
    if (fileHandle) {
      await fileHandle.close();
    }
  }
};

exports.readFile = async (query) => {
  try {
    const data = await fs.readFile(query, "utf-8");
    return data;
  } catch (err) {
    console.error(`Error reading file: ${err}`);
  }
};
