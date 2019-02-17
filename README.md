# Soundboard

A web browser app that collects sound clips into "boards" in various formats.
In short, it's a soundboard that has no server processing so that it can be
served from github pages.

# Goals:
* Able to run Entirely Offline
* Import files into database as Blobs / ArrayBuffers / Base64 Strings
* Calculate length of sound bytes
* Package Entire Boards for Distribution as ZIP files.
* Search feature
* Better UI.
* Get an actual domain name
* Twitter / Facebook Meta Graph Data
* Automated Build / Deployment
* Use CDN for react, react-router

# Current Status:
* Can Create Boards
* Can Navigate to Boards
* Can Add Sound Clips from URLs
* Can Play sound Clips from URLs

# If it's Hosted By Github Pages, Why do you have Express?
`index.js` simulates how github pages serves it's files, specifically how the 
path is matched against filenames first (or in the case of directories, 
`index.html`), then it looks for `200.html` which is served with a status of 
`200`, then a `404.html` with a status of `404`. It's convenient for local 
testing so that I don't have to continuously deploy to github pages branch.