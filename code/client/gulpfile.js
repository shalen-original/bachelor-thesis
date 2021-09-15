'use strict'; 
const gulp = require("gulp");
const nodemon = require("gulp-nodemon");
const path = require("path");
const del = require("del");

/* Useful constants */
const DEV_PATH = "src";
const BUILD_PATH = "build";

/* Easy access to dev and deploy folders*/
const dev = function(subpath) {
    return !subpath ? DEV_PATH : path.join(DEV_PATH, subpath);
};

const build = function(subpath) {
    return !subpath ? BUILD_PATH : path.join(BUILD_PATH, subpath);
};


/* Cleaning deploy folder */
const clean = function () {
    return del(build('**/*'), {force:true, read:false});
};

const js = function(f) {
    return gulp.src(dev('**/*.js'))
            .pipe(gulp.dest(f()));
};

const html = function(f) {
    return gulp.src(dev('views/*.html'))
            .pipe(gulp.dest(f('views')));
};

const json = function(f) {
    return gulp.src(dev('*.json'))
            .pipe(gulp.dest(f()));
};

const abi = function(f){
    return gulp.src("./../dapp/build/contracts/*.json")
            .pipe(gulp.dest(f('abi')));
};

const watch = function(f){
    nodemon({script: f('index.js'), 
        ignore: [f()], 
        tasks:['clean-build']});

    gulp.watch("src/views/*.html", ['clean-build']);
};

gulp.task('watch', ['clean-build'], () => watch(build));

gulp.task('clean', clean);
gulp.task('clean-js', ['clean'], _ => js(build));
gulp.task('clean-html', ['clean'], _ => html(build));
gulp.task('clean-abi', ['clean'], _ => abi(build));
gulp.task('clean-json', ['clean'], _ => json(build));

gulp.task('clean-build', ['clean-js', 'clean-html', 'clean-abi', 'clean-json'], function(){});
