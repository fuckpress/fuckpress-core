const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const util = require("util");
const fsExtra = require("fs-extra");
const copyPromise = util.promisify(fsExtra.copy);
const Handlebars = require('handlebars');

function I18nPlugin() {

    this.start = async (frameworkLocation, configDataSourceAbsoluteLocation, siteFolderLocation, themeLocation, publisher, builder) => {
        var rawConfigDataSource = await fs.promises.readFile(configDataSourceAbsoluteLocation, "utf8");
        let configDataSource = yaml.load(rawConfigDataSource);
        await publisher.start(themeLocation, siteFolderLocation);
        await builder.renderSsrMonoLanguage(configDataSource, siteFolderLocation, themeLocation);


        //--
        renderMode = configDataSource.i18n.render_mode || "rename";

        switch(renderMode){
        
            case "sub-folders" : 
              await performSubfoldersRenderMode(frameworkLocation, configDataSourceAbsoluteLocation, siteFolderLocation, themeLocation, publisher, builder, configDataSource)
            break; 

            case "rename" : 
             await performRenameRenderMode(frameworkLocation, configDataSourceAbsoluteLocation, siteFolderLocation, themeLocation, publisher, builder);
            break;

            default: throw new Error(`Not supported i18n.render_mode: ${configDataSource.i18n.render_mode}`);
        }
       
    }

    async function performSubfoldersRenderMode(frameworkLocation, configDataSourceAbsoluteLocation, siteFolderLocation, themeLocation, publisher, builder, configDataSource) {

        console.log("Rendering mode: sub-folders");
        
        let languages = configDataSource.i18n.languages;
        let defaultLanguage = languages[0];

        var htmlLanguageSelector = await createFloatingLanguageSelectorForSubfolders(languages, defaultLanguage, frameworkLocation);
        
        console.log("Applying the default language at the root:", defaultLanguage)
        await publisher.start(themeLocation, siteFolderLocation);

        //aplying the default language at the root
        let requiredLanguageConfig = configDataSource[defaultLanguage];
        let clonedConfig = JSON.parse(JSON.stringify(configDataSource));      
        for(let language of languages){
          delete clonedConfig[language]
        }
        clonedConfig = {...clonedConfig, ...requiredLanguageConfig};        
        
        await builder.renderSsrFolder(clonedConfig, siteFolderLocation, htmlLanguageSelector);

        //applying render to the other languages which should be in a folder
        let pendingLanguages = languages.filter(function(item) {
            return item !== defaultLanguage
        })

        console.log("Applying render to the other languages: ", pendingLanguages)
        
        for(let language of pendingLanguages){
            var newSiteLocation = path.join(siteFolderLocation, language);
            await publisher.start(themeLocation, newSiteLocation);

            let requiredLanguageConfig = configDataSource[language];
            let clonedConfig = JSON.parse(JSON.stringify(configDataSource));      
            for(let language of languages){
              delete clonedConfig[language]
            }
            
            clonedConfig = {...clonedConfig, ...requiredLanguageConfig};   

            await builder.renderSsrFolder(clonedConfig, newSiteLocation, htmlLanguageSelector);
        }
    }

    async function performRenameRenderMode(frameworkLocation, configDataSourceAbsoluteLocation, siteFolderLocation, themeLocation, publisher, builder) {
        showFloatingLanguageSelector = configDataSource.i18n.show_selector || true;

        await publisher.start(themeLocation, siteFolderLocation);

        let filenames = await fs.promises.readdir(siteFolderLocation);
        let initialHtmlFileNames = [];
        for (let filename of filenames) {
            if (filename.endsWith(".html")) initialHtmlFileNames.push(filename);
        }

        let languages = configDataSource.i18n.languages;
        // more languages: en.html, fr.html, etc
        for (let i = 1; i < languages.length; i++) {
            for (let initialHtmlFileName of initialHtmlFileNames) {
                var name = path.parse(initialHtmlFileName).name;
                console.log(`Creating: ${name}-${languages[i]}.html`);
                await copyPromise(path.join(siteFolderLocation, initialHtmlFileName), path.join(siteFolderLocation, `${name}-${languages[i]}.html`))
            }
        }

        await builder.renderSsrMultiLanguage(frameworkLocation, configDataSource, siteFolderLocation, themeLocation, initialHtmlFileNames, showFloatingLanguageSelector);
    }

    async function createFloatingLanguageSelectorForSubfolders(languages, defaultLanguage, frameworkLocation){
        var rawTemplateString = await fs.promises.readFile(path.join(frameworkLocation, "src","main","resources","plugins","i18n","template.html"), "utf-8");
        var pageTemplate = Handlebars.compile(rawTemplateString); 
    
        var data = [];
        for(let language of languages){
            var upperCaseLanguage = language.toUpperCase();
            if(language === defaultLanguage){
                data.push({short_name: upperCaseLanguage, url: "/"});
            }else{
                data.push({short_name: upperCaseLanguage, url: `/${language}`});
            }
        }
    
        var html = pageTemplate({languages: data});
    
        return html;
      }    
}

module.exports = I18nPlugin;