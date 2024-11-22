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

  it('I18N - SSR: should work the default_language with 2 languages', async function () {

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
      <title>{{site_name}} index</title>
    </head>
    <body>
      <h1>{{phone}}</h1>
      <p>{{description}}</p>
    </body>
    </html>
    `);   
    
    await fs.promises.writeFile(path.join(folder, 'theme', "foo.html"), `
    <html>
    <head>
      <title>{{site_name}} foo</title>
    </head>
    <body>
      <h1>{{phone}}</h1>
      <p>{{description}}</p>
    </body>
    </html>
    `);       

    var entrypoint = new Entrypoint();
    //output is by default = site
    await entrypoint.start({start: true, output: "site"}, folder);

    //site folder should contain the other languages
    var filenames = await fs.promises.readdir(path.join(folder, 'site'));
    console.log(filenames);

    expect(filenames).to.contains("index.html");
    expect(filenames).to.contains("foo.html");

    expect(filenames).to.contains("index-en.html");
    expect(filenames).to.contains("index-fr.html");
    expect(filenames).to.contains("foo-en.html");
    expect(filenames).to.contains("foo-fr.html");

    //validate if spanish (default) was injected successfully in the index
    var defaultIndexContent = await fs.promises.readFile(path.join(folder, "site", "index.html"), "utf8");
    expect(defaultIndexContent).to.contains("Corporacion Tierra");
    expect(defaultIndexContent).to.contains("Division de investigacion de O4aCorp");
    expect(defaultIndexContent).to.contains("+ 123 456 789");

    //validate if spanish (default) was injected successfully in the foo
    var fooContent = await fs.promises.readFile(path.join(folder, "site", "foo.html"), "utf8");
    expect(fooContent).to.contains("Corporacion Tierra");
    expect(fooContent).to.contains("Division de investigacion de O4aCorp");
    expect(fooContent).to.contains("+ 123 456 789");

    //validate if english was injected successfully in the index
    var englishIndexContent = await fs.promises.readFile(path.join(folder, "site", "index-en.html"), "utf8");
    expect(englishIndexContent).to.contains("Land Corporation");
    expect(englishIndexContent).to.contains("Research divison of O4aCorp");
    expect(englishIndexContent).to.contains("+ 123 456 789");

    //validate if english was injected successfully in the foo
    var englishFooContent = await fs.promises.readFile(path.join(folder, "site", "foo-en.html"), "utf8");
    expect(englishFooContent).to.contains("Land Corporation");
    expect(englishFooContent).to.contains("Research divison of O4aCorp");
    expect(englishFooContent).to.contains("+ 123 456 789");
    
    //validate if french was injected successfully in the index
    var frIndexContent = await fs.promises.readFile(path.join(folder, "site", "index-fr.html"), "utf8");
    expect(frIndexContent).to.contains("Société de la Terre");
    expect(frIndexContent).to.contains("Division de recherche d&#x27;O4aCorp");
    expect(frIndexContent).to.contains("+ 123 456 789");

    //validate if french was injected successfully in the foo
    var frFooContent = await fs.promises.readFile(path.join(folder, "site", "foo-fr.html"), "utf8");
    expect(frFooContent).to.contains("Société de la Terre");
    expect(frFooContent).to.contains("Division de recherche d&#x27;O4aCorp");
    expect(frFooContent).to.contains("+ 123 456 789");

    //get the home page of online web page
    // const response = await fetch('http://localhost:2708/');
    // var indexHtmlContent = await response.text();
    
    //assert
    // expect(indexHtmlContent).to.contains(siteName);
    // expect(indexHtmlContent).to.contains(description);
    // console.log("entrypoint.getServer()", entrypoint.getServer())
    await entrypoint.getServer().shutdown();
  });

});
