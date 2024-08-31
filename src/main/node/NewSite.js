const fs = require("fs");
const path = require("path");
const util = require("util");
const fsExtra = require("fs-extra");
const copyPromise = util.promisify(fsExtra.copy);

function NewSite(){
  
  this.start = async (name, projectBaseLocation, frameworkLocation) => {
    console.log(projectBaseLocation)
    console.log(name)
    var newSiteFolderLocation = path.join(projectBaseLocation, name)
    await fs.promises.mkdir(newSiteFolderLocation)
    await copyPromise(path.join(frameworkLocation, "src","main","resources","archetype"), newSiteFolderLocation)
    console.log("New site: "+newSiteFolderLocation)
  }
}

module.exports = NewSite;
