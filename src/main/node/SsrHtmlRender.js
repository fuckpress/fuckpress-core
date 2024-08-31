const fs = require("fs");
const path = require("path");
const Handlebars = require('handlebars');

function SsrHtmlRender() {

  this.start = async (configDataSource, siteFolder, webpageLocation) => {   
    await renderPages(configDataSource, siteFolder, webpageLocation);
  }

  async function renderPages(configDataSource, siteFolderAbsoluteLocation, webpageLocation) {

    var rawResults = await fs.promises.readdir(webpageLocation);
    for (let relativeHtmlLocation of rawResults) {
      if (relativeHtmlLocation.endsWith(".html")) {
        console.log("Page to render: ", path.join(webpageLocation, relativeHtmlLocation));
        var rawTemplateString = await fs.promises.readFile(path.join(webpageLocation, relativeHtmlLocation), "utf-8");
        var pageTemplate = Handlebars.compile(rawTemplateString);    
        var renderedHtml = pageTemplate(configDataSource);
        await fs.promises.writeFile(path.join(siteFolderAbsoluteLocation, relativeHtmlLocation), renderedHtml);
      }
    }

    console.log("Static render completed")
  }
}

module.exports = SsrHtmlRender;
