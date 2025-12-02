const appDir = process.cwd();
const chai = require('chai');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const expect = chai.expect;
const assert = chai.assert;
const Entrypoint = require(`${appDir}/src/main/node/Entrypoint.js`);
const util = require("util");
const fsExtra = require("fs-extra");
const copyPromise = util.promisify(fsExtra.copy);

describe('EntryPoint', function () {

  it('should work the minimal yaml and with default theme', async function () {

    //this value is hardcoded in src/test/node/EntryPoint/minimal-and-default/fp-admin.yaml
    var siteName = 'ed9fe511-665c-48e9-ae2e-dec37ed18693';

    //creating the main folder
    var folder = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'fuckpress-'));
    console.log(folder);

    //adding the yaml
    await copyPromise(path.join(__dirname,"fp-admin.yaml"), path.join(folder, "fp-admin.yaml"))

    var entrypoint = new Entrypoint();
    //output is by default = site
    await entrypoint.start({start: true, output: "site"}, folder);

    //get the home page of online web page
    const response = await fetch('http://localhost:2708/');
    var indexHtmlContent = await response.text();
    
    //assert
    expect(indexHtmlContent).to.contains(siteName);
    console.log("entrypoint.getServer()", entrypoint.getServer())
    await entrypoint.getServer().shutdown();
  });

});
