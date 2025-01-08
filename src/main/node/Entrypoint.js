const path = require('path');
const fs = require('fs');
const Publisher = require("./Publisher.js");
const Builder = require("./Builder.js");
const Server = require("./Server.js");
const NewSite = require("./NewSite.js");
const Common = require("./Common.js");
const finder = require('find-package-json');
const chokidar = require('chokidar');
const yaml = require('js-yaml');
const { Exception } = require('handlebars');
const util = require("util");
const fsExtra = require("fs-extra");
const copyPromise = util.promisify(fsExtra.copy);
const I18nPlugin = require("./plugins/i18n/I18nPlugin.js");

function Entrypoint() {

    this.server;

    this.start = async (options, projectBaseLocationToOverride) => {

        console.log("Entrypoint arguments", options)

        var f = finder(__filename);
        var frameworkLocation = path.dirname(f.next().filename);
        console.debug("FrameworkLocation", frameworkLocation);

        if (typeof options.newSite !== 'undefined') {
            console.log("Creating new site")
            var newSite = new NewSite();
            await newSite.start(options.newSite, process.cwd(), frameworkLocation);
            return;
        }

        if (typeof options.start === 'undefined' && typeof options.publish === 'undefined') {
            console.log("One of this commands are required: --start or --publish")
            return;
        }

        if (options.start !== true && options.publish !== true) {
            console.log("These parameters are mutually exclusive: --start and --publish")
            return;
        }

        var projectBaseLocation = projectBaseLocationToOverride || process.cwd();

        var siteFolderName = options.output;

        var siteFolderLocation;
        var themeLocation;
        var configDataSourceAbsoluteLocation;

        //calling is from inside of framework
        if (frameworkLocation === projectBaseLocation) {
            siteFolderLocation = path.join(frameworkLocation, siteFolderName)
            themeLocation = path.join(frameworkLocation, "theme");
            configDataSourceAbsoluteLocation = path.join(frameworkLocation, "src", "main", "resources", "archetype", "fp-admin.yaml");
        } else { //calling is from any folder in the os
            siteFolderLocation = path.join(projectBaseLocation, siteFolderName)
            configDataSourceAbsoluteLocation = path.join(projectBaseLocation, "fp-admin.yaml");
            try {
                await fs.promises.access(path.join(projectBaseLocation, "theme"), fs.constants.F_OK)
                themeLocation = path.join(projectBaseLocation, "theme");
            } catch (e) {
                //external theme folder was not found. Default will be used
                themeLocation = path.join(__dirname, "..", "..", "..", "theme");
            }
        }

        console.log("Config", configDataSourceAbsoluteLocation);
        var port = process.env.PORT || 2708;

        try {
            await fs.promises.access(siteFolderLocation, fs.constants.F_OK)
            siteFolderExists = true;
        } catch (e) {
            siteFolderExists = false;
        }

        if (siteFolderExists === true) {
            try {
                await fs.promises.rm(siteFolderLocation, { recursive: true });
                console.debug("Success purge: " + siteFolderLocation)
            } catch (e) {
                console.log("Failed to clear the site folder: " + siteFolderLocation);
                console.error(e);
                process.exit(1);
            }
        }
        await fs.promises.mkdir(siteFolderLocation)

        var rawConfigDataSource = await fs.promises.readFile(configDataSourceAbsoluteLocation, "utf8");
        let configDataSource = yaml.load(rawConfigDataSource);
        //validation if minimal i18n configuration exist
        var hasI18nConfig = Common.hasTheMinimalI18nConfiguration(configDataSource);
        console.debug(`hasI18nConfig: ${hasI18nConfig}`);

        console.log("Folders", JSON.stringify({ projectBaseLocation, siteFolderLocation, themeLocation }));

        var i18nPlugin = new I18nPlugin();

        //TODO: move to another module or plugin
        if (hasI18nConfig === false) {
            //move from webpage to site
            var publisher = new Publisher();
            await publisher.start(themeLocation, siteFolderLocation);
            console.log("Move initial files to publish folder is completed")

            var builder = new Builder();
            await builder.renderSsrMonoLanguage(configDataSource, siteFolderLocation, themeLocation);

            if (options.start === true) {
                this.server = new Server();
                await this.server.start(port, siteFolderLocation);

                chokidar
                    .watch(projectBaseLocation, { ignoreInitial: true })
                    .on('all', async (event, filename) => {
                        if (filename && filename.startsWith(siteFolderLocation)) return;

                        console.log("Detected change: " + filename)
                        console.log("\nRebuilding")
                        var rawConfigDataSource = await fs.promises.readFile(configDataSourceAbsoluteLocation, "utf8");
                        let configDataSource = yaml.load(rawConfigDataSource);
                        await publisher.start(themeLocation, siteFolderLocation);
                        await builder.renderSsrMonoLanguage(configDataSource, siteFolderLocation, themeLocation);
                    })
            }
        } else {
            var publisher = new Publisher();
            var builder = new Builder();

            await i18nPlugin.start(frameworkLocation, configDataSourceAbsoluteLocation, siteFolderLocation, themeLocation, publisher, builder);

            if (options.start === true) {
                this.server = new Server();
                await this.server.start(port, siteFolderLocation);
    
                chokidar
                    .watch(projectBaseLocation, { ignoreInitial: true })
                    .on('all', async (event, filename) => {
                        if (filename && filename.startsWith(siteFolderLocation)) return;
    
                        console.log("Detected change: " + filename)
                        console.log("\nRebuilding")
    
                        await i18nPlugin.start(frameworkLocation, configDataSourceAbsoluteLocation, siteFolderLocation, themeLocation, publisher, builder);
                    })
            }
        }

    };

    this.getServer = () => {
        return this.server;
    }

}

module.exports = Entrypoint;