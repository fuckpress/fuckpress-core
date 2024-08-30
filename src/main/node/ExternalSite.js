const fs = require("fs");
const path = require("path");
const util = require("util");
const fsExtra = require("fs-extra");
const copyPromise = util.promisify(fsExtra.copy);

function ExternalSite(){
  
  this.start = async (name, projectBaseLocation, frameworkLocation) => {
    console.log(projectBaseLocation)
    console.log(name)
    var newPodcastSiteFolderLocation = path.join(projectBaseLocation, name)
    await fs.promises.mkdir(newPodcastSiteFolderLocation)
    await copyPromise(path.join(frameworkLocation, "src","main","resources","archetype"), newPodcastSiteFolderLocation)
    console.log("New site: "+newPodcastSiteFolderLocation)
  }
}

module.exports = ExternalSite;
