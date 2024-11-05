const fs = require("fs");
const path = require("path");
const Handlebars = require('handlebars');

function Builder() {

  this.renderSsrMonoLanguage = async (configDataSource, siteFolderAbsoluteLocation, themeLocation) =>{

    var rawResults = await fs.promises.readdir(themeLocation);
    for (let relativeHtmlLocation of rawResults) {
      if (relativeHtmlLocation.endsWith(".html")) {
        console.log("Page to render: ", path.join(themeLocation, relativeHtmlLocation));
        var rawTemplateString = await fs.promises.readFile(path.join(themeLocation, relativeHtmlLocation), "utf-8");
        var pageTemplate = Handlebars.compile(rawTemplateString);    
        var renderedHtml = pageTemplate(configDataSource);
        await fs.promises.writeFile(path.join(siteFolderAbsoluteLocation, relativeHtmlLocation), renderedHtml);
      }
    }

    console.log("Static render completed")
  }

  this.renderSsrMultiLanguage = async (configDataSource, siteFolderAbsoluteLocation, themeLocation, initialHtmlFileNames) =>{

    var languages = configDataSource.i18n.languages;
    var defaultLanguage = languages[0];
    console.log("initialHtmlFileNames", initialHtmlFileNames)
    //for default language
    console.log("default language")
    for (let initialHtmlFileName of initialHtmlFileNames) {
      var sourceHtmlLocation = path.join(themeLocation, initialHtmlFileName);
      console.log("Page to render: ", sourceHtmlLocation);
      var rawTemplateString = await fs.promises.readFile(sourceHtmlLocation, "utf-8");
      var pageTemplate = Handlebars.compile(rawTemplateString);   
      //save the required language and overwrite deleting the others languages
      var requiredLanguage = configDataSource[defaultLanguage];
      var clonedConfig = JSON.parse(JSON.stringify(configDataSource));      
      for(let language of languages){
        delete clonedConfig[language]
      }
      clonedConfig = {...clonedConfig, ...requiredLanguage};

      var renderedHtml = pageTemplate(clonedConfig);
      await fs.promises.writeFile(path.join(siteFolderAbsoluteLocation, initialHtmlFileName), renderedHtml);
    }

    //for the rest of languages
    console.log("other languages")
    for(var language of languages){
      if(language===defaultLanguage) continue;
      console.log("language", language)
      for (let initialHtmlFileName of initialHtmlFileNames){
        var name = path.parse(initialHtmlFileName).name;
        var computedHtmlFileName = `${name}-${language}.html`;
        var sourceHtmlLocation = path.join(siteFolderAbsoluteLocation, computedHtmlFileName);         
        console.log("Page to render: ", sourceHtmlLocation);
        var rawTemplateString = await fs.promises.readFile(sourceHtmlLocation, "utf-8");
        var pageTemplate = Handlebars.compile(rawTemplateString);   
        //save the required language and overwrite deleting the others languages
        var requiredLanguage = configDataSource[language];
        var clonedConfig = JSON.parse(JSON.stringify(configDataSource));      
        for(let language of languages){
          delete clonedConfig[language]
        }
        clonedConfig = {...clonedConfig, ...requiredLanguage};
  
        var renderedHtml = pageTemplate(clonedConfig);
        await fs.promises.writeFile(path.join(siteFolderAbsoluteLocation, computedHtmlFileName), renderedHtml);
      }      
    }

    console.log("Static render completed")
  }
}

module.exports = Builder;
