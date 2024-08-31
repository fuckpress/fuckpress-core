const appDir = process.cwd();
const chai = require('chai');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const expect = chai.expect;
const assert = chai.assert;
const Server = require(`${appDir}/src/main/node/Server.js`);

describe('Publisher', function () {

  it('should start the server and serve the site folder', async function () {

    //replicating the fp-admin.yaml
    var folder = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'fuckpress-'));
    console.log(folder);

    //replicating the site folder
    var siteFolder = path.join(folder, "site");
    await fs.promises.mkdir(siteFolder);
    await fs.promises.writeFile(path.join(siteFolder, "index.html"), `
    <h1>foo</h1>
    `);

    var server = new Server();
    var port = 2708;
    await server.start(port, siteFolder);

    const response = await fetch('http://localhost:2708/');
    var indexHtmlContent = await response.text();
    console.log(indexHtmlContent);

    //assert
    expect(indexHtmlContent.trim()).to.eq("<h1>foo</h1>");
    await server.shutdown();
  });

});
