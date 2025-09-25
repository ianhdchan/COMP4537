const http = require("http");
const { getDate, writeFile, readFile } = require("./modules/utils");
const { helloDate } = require("./lang/en/en");
const url = require("url");

// Handles the /getDate endpoint: returns a greeting and current server date/time
class GetDateHandler {
  handle(host, qdata) {
    let date = getDate();
    return `<h1 style="color: blue">${helloDate(host, qdata.name, date)}</h1>`;
  }
}

// Handles the /writeFile endpoint: appends text to file.txt
class WriteFileHandler {
  async handle(q, qdata, key) {
    if (q.search && key == "text") {
      await writeFile(qdata, qdata.text);
      return `Written to file.txt`;
    } else {
      return `Please ensure it follows this format .../writeFile/?text=TEXT`;
    }
  }
}

// Handles the /readFile endpoint: reads and returns file content, or 404 if not found
class ReadFileHandler {
  async handle(endsWith) {
    let textFromFile = await readFile(endsWith);
    return textFromFile
      ? `<h1>Read from file.txt:</h1> <h3>${textFromFile}</h3>`
      : `<h1>404 <br/>${endsWith} does not exist</h1>`;
  }
}

// Main server class: sets up HTTP server and delegates requests to handler classes
class Server {
  constructor(port) {
    this.port = port;
    this.server = http.createServer(this.requestHandler.bind(this));
    this.getDateHandler = new GetDateHandler();
    this.writeFileHandler = new WriteFileHandler();
    this.readFileHandler = new ReadFileHandler();
  }

  async requestHandler(req, res) {
    let q = url.parse(req.url, true); // Parse URL and query string
    let host = req.headers.host; // Get request host
    let qdata = q.query; // e.g., this will be { name: bob }
    let splitPathname = q.pathname.split("/");
    let endsWith = splitPathname[2]; // Grab the last pathname
    let key = Object.keys(qdata)[0]; // Grab the key of the object (e.g., name: bob, key is name)

    console.log(q.query);

    // Set response headers
    res.writeHead(200, {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
    });

    // Route request to appropriate handler
    let responseContent = "";
    if (q.pathname === "/getDate" || q.pathname === "/getDate/") {
      responseContent = this.getDateHandler.handle(host, qdata);
    } else if (q.pathname === "/writeFile/") {
      responseContent = await this.writeFileHandler.handle(q, qdata, key);
    } else if (q.pathname.includes("/readFile/")) {
      responseContent = await this.readFileHandler.handle(endsWith);
    }
    res.end(responseContent);
  }

  // Start server
  start() {
    this.server.listen(this.port, () => {
      console.log(`Server running on ${this.port}`);
    });
  }
}

// Create and start the server on port 8080
const app = new Server(8080);
app.start();
