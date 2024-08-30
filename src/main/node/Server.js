const path = require("path");
const express = require('express');

function Server(){
  
  this.start = async (port, absoluteSiteFolder) => {
    const app = express();    
    app.use(express.static(absoluteSiteFolder));

    // set the home page route
    app.get('/', function(req, res) {
        res.sendFile(path.join(absoluteSiteFolder, 'index.html'));
    });

    return new Promise((resolve, reject) => {
      server = app.listen(port, () => {
        console.log('FuckPress is running on ' + port);
        resolve(server);
      });
    });

  }
}

module.exports = Server;
