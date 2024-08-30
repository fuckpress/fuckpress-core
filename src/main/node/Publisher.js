const util = require("util");
const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");
const copyPromise = util.promisify(fsExtra.copy);

function Publisher(){
  
  this.start = async (themeLocation, siteFolderLocation) => {        
    await copyPromise(themeLocation, siteFolderLocation)
  }
}

module.exports = Publisher;
