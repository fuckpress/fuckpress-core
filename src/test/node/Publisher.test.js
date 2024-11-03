const appDir = process.cwd();
const chai = require('chai');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const expect = chai.expect;
const assert = chai.assert;
const Publisher = require(`${appDir}/src/main/node/Publisher.js`);

describe('Publisher', function () {

  //This test is strictly relate to the webpage initial demo
  //changes in the webpage (files and folder names) will crash this test
  it('should publish the webpage to the site folder', async function () {

    //replicating the fp-admin.yaml
    var folder = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'fuckpress-'));
    console.log(folder);

    //replicating the site folder
    var siteFolder = path.join(folder, "site");
    await fs.promises.mkdir(siteFolder);

    var webpageLocation = path.join(appDir, "theme");
    
    //start publish
    var publisher = new Publisher();
    await publisher.start(webpageLocation, siteFolder);
    
    //assert
    var rawResults = await fs.promises.readdir(webpageLocation);
    console.log(rawResults)
    expect(rawResults.length).to.eq(6);
    //index.html should exist
    expect(rawResults.includes("index.html")).to.eq(true);
  });

});
