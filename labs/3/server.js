const http = require('http');
const getDate = require('./modules/utils').getDate;
const url = require('url');

http.createServer((req, res) => {
    let q = url.parse(req.url, true);
    let pathname = q.search;
    res.writeHead(200, {'Content-Type': 'text/html', "Access-Control-Allow-Origin": "*"});
    res.end("Hello <b>World</b>");
}).listen(8080);

