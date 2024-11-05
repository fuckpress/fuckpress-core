#!/usr/bin/env node

const LoggerFactory = require("./LoggerFactory");
LoggerFactory.init();

const { Command } = require('commander');
const Entrypoint = require("./Entrypoint.js");

var entrypoint = new Entrypoint();
const program = new Command();
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
entrypoint.start(options);