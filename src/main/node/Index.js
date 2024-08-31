#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const Publisher = require("./Publisher.js");
const Builder = require("./Builder.js");
const Server = require("./Server.js");
const NewSite = require("./NewSite.js");
const { Command } = require('commander');
const finder = require('find-package-json');
const chokidar = require('chokidar');
const yaml = require('js-yaml');

const program = new Command();

(async () => {

    program
        .name('podcastjs')
        .description('static site generator for podcasters')
        .version('1.0.0');

    program
        .option('--new-site, --new-site <string>', 'Create a new podcastjs site')
        .option('--s, --start', 'start a local dev server')
        .option('--p, --publish', 'render all the web assets and move them to the output folder')
        .option('--o, --output <string>', 'folder name to store the web assets. Default is site', "site")

    program.parse();
    const options = program.opts();

    console.log("Shell arguments", options)

    var f = finder(__filename);
    var frameworkLocation = path.dirname(f.next().filename);

    if (typeof options.newSite !== 'undefined') {
        console.log("creating new site")
        var newSite = new NewSite();
        await newSite.start(options.newSite, process.cwd(), frameworkLocation);
        return;
    } 

    if (typeof options.start === 'undefined' && typeof options.publish === 'undefined'){
        console.log("One of this commands are required: --start or --publish")
        return;
    }

    if (options.start !== true && options.publish !== true){
        console.log("These parameters are mutually exclusive: --start and --publish")
        return;
    }
    
    var projectBaseLocation = process.cwd();

    var siteFolderName = options.output;

    var siteFolderLocation;
    var webpageLocation;
    var configDataSourceAbsoluteLocation;

    //calling is from inside of framework
    if (frameworkLocation === projectBaseLocation) {
        siteFolderLocation = path.join(frameworkLocation, siteFolderName)
        webpageLocation = path.join(frameworkLocation, "webpage");
        configDataSourceAbsoluteLocation = path.join(frameworkLocation, "fp-admin.yaml");
    }else{
        siteFolderLocation = path.join(projectBaseLocation, siteFolderName)
        configDataSourceAbsoluteLocation = path.join(projectBaseLocation, "fp-admin.yaml");      
        try {
            await fs.promises.access(path.join(projectBaseLocation, "webpage"), fs.constants.F_OK)
            webpageLocation = path.join(projectBaseLocation, "webpage");
        } catch (e) {
            //external theme folder was not found. Default will be used
            webpageLocation = path.join(__dirname, "..", "..", "..", "webpage");
        }
    }

    var port = process.env.PORT || 2708;    

    try {
      await fs.promises.access(siteFolderLocation, fs.constants.F_OK)      
      siteFolderExists = true;
    } catch (e) {
      siteFolderExists = false;
    }
    
    if(siteFolderExists===true){
        try {
          await fs.promises.rm(siteFolderLocation, { recursive: true });  
          console.log("Success purge: "+siteFolderLocation)
        } catch (e) {
          console.log("Failed to clear the site folder: "+siteFolderLocation);
          console.error(e);
          process.exit(1);
        } 
    }
    await fs.promises.mkdir(siteFolderLocation)
    
    console.log("Folders", { projectBaseLocation, siteFolderLocation, webpageLocation })

    //move from webpage to site
    var publisher = new Publisher();
    await publisher.start(webpageLocation, siteFolderLocation); 
    console.log("Initial publish completed")

    var builder = new Builder();
    var rawConfigDataSource = await fs.promises.readFile(configDataSourceAbsoluteLocation,"utf8");
    let configDataSource = yaml.load(rawConfigDataSource);  
    await builder.start(configDataSource, siteFolderLocation, webpageLocation);
    
    if(options.start===true){
        var server = new Server();
        await server.start(port, siteFolderLocation);

        chokidar
            .watch(projectBaseLocation, { ignoreInitial: true })
            .on('all', async (event, filename) => {
                if (filename && filename.startsWith(siteFolderLocation)) return;

                console.log("Detected change: " + filename)
                console.log("\nRebuilding")
                var rawConfigDataSource = await fs.promises.readFile(configDataSourceAbsoluteLocation,"utf8");
                let configDataSource = yaml.load(rawConfigDataSource);                  
                await publisher.start(webpageLocation, siteFolderLocation);
                await builder.start(configDataSource, siteFolderLocation, webpageLocation);
            })    
    }

})();