/*
 *  Shelljs-based build system.
 *  Allows to build the various parts of the thesis or everything together
 *
 *  #makefile2.0
 */

const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const chalk = require('chalk');

const start = Date.now();

const log = str => {
    let msToTime = duration => {
        let milliseconds = parseInt((duration%1000)/100);
        let seconds = parseInt((duration/1000)%60);
        let minutes = parseInt((duration/(1000*60))%60);
        let hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    }
    console.log(chalk`[{gray ${msToTime(Date.now() - start)}}] ${str}`);
};

log("Thesis Builder - Started");
log("This script requires umlet and inkscape in the PATH variable");

log("Converting thesis diagrams to PNG...");
let out = "tex/Figs/diagrams/sequence";
shell.mkdir("-p", out);
fs.readdirSync("diagrams/sequence/").forEach(file => {
    log(chalk`Converting '{blue ${file}}'`);
    shell.exec(`umlet -action=convert -format=svg -filename=diagrams/sequence/${file} -output=${out}`, {silent: true});
    shell.exec(`phantomjs scripts/phantom-render.js ${out}/${file}.svg ${out}/${path.basename(file, path.extname(file))}.png`, {silent: true});
    shell.rm(`${out}/*.svg`);
})

out = "tex/Figs/diagrams/state";
shell.mkdir("-p", out);
fs.readdirSync("diagrams/state/").forEach(file => {
    log(chalk`Converting '{blue ${file}}'`);
    shell.exec(`umlet -action=convert -format=svg -filename=diagrams/state/${file} -output=${out}`, {silent: true});
    shell.exec(`phantomjs scripts/phantom-render.js ${out}/${file}.svg ${out}/${path.basename(file, path.extname(file))}.png`, {silent: true});
    shell.rm(`${out}/*.svg`);
})

log("Converting presentations diagrams to PNG...");
out = "tex-slides/Figs";
shell.mkdir("-p", out);
fs.readdirSync("diagrams/slides/").forEach(file => {
    log(chalk`Converting '{blue ${file}}'`);
    shell.exec(`umlet -action=convert -format=svg -filename=diagrams/slides/${file} -output=${out}`, {silent: true});
    shell.exec(`phantomjs scripts/phantom-render.js ${out}/${file}.svg ${out}/${path.basename(file, path.extname(file))}.png`, {silent: true});
    shell.rm(`${out}/*.svg`);
})

log("Done");
