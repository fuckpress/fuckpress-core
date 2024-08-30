const util = require("util");
const fs = require("fs");
const fsExtra = require("fs-extra");
const path = require("path");
const markdownit = require('markdown-it');
const Handlebars = require('handlebars');
const md = markdownit({ breaks: true,html: true })

function SsrHtmlRender() {

  this.start = async (configDataSource, siteFolder, webpageLocation) => {

    Handlebars.registerHelper('if_strint_eq', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    Handlebars.registerHelper('toDateString', function(arg1, options) {
      try {
          var parts = arg1.split("-");
          var date = new Date(parts[0], parts[1]-1, parts[2]);
          return date.toDateString().replace(/^\S+\s/,'')
      } catch (error) {
          console.log("Failed to evaluate helper: toDateString")
          console.log(error)
          return arg1;
      }
    });       

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
