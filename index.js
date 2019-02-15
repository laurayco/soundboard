const express = require("express");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);

const PORT = 8080;// to-do: make this actually use .ENV or something.
const ROOT_DIR = path.resolve(__dirname, "bin");
const app = express();

// serve files that exist first,
// or index.html for directories.
app.use(express.static(ROOT_DIR));

// look for 200.html
app.use("*",async (request,response,next)=>{
    try {
        const filename = path.resolve(ROOT_DIR,"200.html");
        const filecontents = await readFile(filename);
        response.status(200);
        response.contentType("html");
        response.send(filecontents);
        response.end();
    } catch(ex) {
        next();
    }
});

// look for 404.html
app.get("*",async (request,response)=>{
    response.status(404);
    try {
        const filename = path.resolve(ROOT_DIR,"404.html");
        const filecontents = await readFile(filename);
        response.contentType("html");
        response.send(filecontents);
    } catch(ex) {
    } finally {
        response.end();
    }
});

app.listen(PORT);