const SsrHtmlRender = require("./SsrHtmlRender.js");

function Builder(){
  
  this.start = async (configDataSource, siteFolder, webpageLocation) => {
    var ssrHtmlRender = new SsrHtmlRender();
    await ssrHtmlRender.start(configDataSource, siteFolder, webpageLocation);        
  }
}

module.exports = Builder;
