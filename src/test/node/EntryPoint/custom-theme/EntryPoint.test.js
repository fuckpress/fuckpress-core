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

  it('should work the custom theme', async function () {

    //this value is hardcoded in src/test/node/EntryPoint/minimal-and-default/fp-admin.yaml
    var siteName = 'ed9fe511-665c-48e9-ae2e-dec37ed18693';
    var description = 'a2b67348-ee2c-4548-9b43-3340f03154a0';

    //creating the main folder
    var folder = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'fuckpress-'));
    console.log(folder);

    //adding the yaml file
    await copyPromise(path.join(__dirname,"fp-admin.yaml"), path.join(folder, "fp-admin.yaml"))

    //adding the custom theme
    await fs.promises.mkdir(path.join(folder, 'theme'));
    await fs.promises.writeFile(path.join(folder, 'theme', "index.html"), `
    <html>
    <head>
      <title>{{site_name}}</title>
    </head>
    <body>
      <h1>My First Heading</h1>
      <p>{{description}}</p>
    </body>
    </html>
    `);    

    var entrypoint = new Entrypoint();
    //output is by default = site
    await entrypoint.start({start: true, output: "site"}, folder);

    //get the home page of online web page
    const response = await fetch('http://localhost:2708/');
    var indexHtmlContent = await response.text();
    
    //assert
    expect(indexHtmlContent).to.contains(siteName);
    expect(indexHtmlContent).to.contains(description);
    console.log("entrypoint.getServer()", entrypoint.getServer())
    await entrypoint.getServer().shutdown();
  });

});
