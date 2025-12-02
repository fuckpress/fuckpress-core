const appDir = process.cwd();
const chai = require('chai');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const expect = chai.expect;
const assert = chai.assert;
const Builder = require(`${appDir}/src/main/node/Builder.js`);
const yaml = require('js-yaml');

describe('Builder', function () {

  it('should render one page (default) with simple config', async function () {

    //replicating the fp-admin.yaml
    var folder = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'fuckpress-'));
    console.log(folder);

    var site_name = uuidv4();
    var yamlObject =  {"site_name":site_name};
    // var yamlString = yaml.dump(yamlObject, { skipInvalid: true, lineWidth: 200 });
    // await fs.promises.writeFile(path.join(folder, "fp-admin.yaml"), yamlString);
    
    //replicating the site folder
    var siteFolder = path.join(folder, "site");
    await fs.promises.mkdir(siteFolder);

    //start renderdization
    var webpageLocation = path.join(appDir, "theme");
    var builder = new Builder();
    await builder.renderSsrMonoLanguage(yamlObject, siteFolder, webpageLocation);
    
    //assert
    var indexHtmlContent = await fs.promises.readFile(path.join(folder, "site", "index.html"), "utf8");
    expect(indexHtmlContent).to.contains(`<title>${site_name}</title>`);
  });

});
