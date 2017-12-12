#!/usr/bin/env node

// Global modules
var path = require("path");
var mkdirp = require("mkdirp");
var Configstore = require("configstore");
var Downloader = require("../lib/downloader");

// Local modules
var argv = require("minimist")(process.argv.slice(2));
var homeDir = require("home-dir");
var conf = new Configstore("ytb2mp3", {});

function findVideoId (url) {
    var temp = url.replace(/\\/g, "");
    var videoId = null;
    if (temp.indexOf("?") > -1) {
        var tempArray = temp.split("?");
        if (tempArray.length === 2) {
            var params = tempArray[1].split("&");
            if (params.length > 0) {
                params.forEach(function (param) {
                    var paramArray = param.split("=");
                    if (paramArray[0] === "v") {
                        videoId = paramArray[1];
                        return videoId;
                    }
                });
            }
        }
    }
    return videoId;
}

if (process.stdin.isTTY) {
    // Just call the handler function
    handler();
} else {
    // Capture stdin
    var data = "";
    process.stdin.setEncoding("utf-8");

    process.stdin.on("readable", function() {
        var chunk;
        while (chunk = process.stdin.read()) {
            data += chunk;
        }
    });

    process.stdin.on("end", function () {
        // There will be a trailing \n from the user hitting enter. Get rid of it.
        data = data.replace(/\n$/, "");
        // Set the stdin data as first argument
        argv._[0] = data.toString();
        // Call the handler function
        handler();
    });
}

function handler() {

    if (argv.hasOwnProperty("help")) {
        console.log("ytb2mp3 usage:");
        console.log("--------------------------");
        console.log(" ");
        console.log("Arguments:");
        console.log("--set-output-path <path>                The absolute path where the downloaded files should be stored (default: /tmp)");
        console.log("                                        The directory is automatically created if it doesn't exist");
        console.log("--set-video-quality <quality>           The quality of the YouTube videos that should be requested (default: highesst)");
        console.log("--set-ffmpeg-path <path>                The absolute path to the ffmpeg binary (default: /usr/local/bin/ffmpeg)");
        console.log("--set-progress-timeout <milliseconds>   The time in milliseconds in which the download progress should be refreshed");
        console.log("                                        (default: 200ms)");
        process.exit(0);
    } else if (argv.hasOwnProperty("set-output-path")) {
        conf.set("outputPath", argv["set-output-path"]);
        console.log("Output path has been changed to " + argv["set-output-path"]);
    } else if (argv.hasOwnProperty("set-video-quality")) {
        conf.set("videoQuality", argv["set-video-quality"]);
        console.log("Video quality path has been changed to " + argv["set-video-quality"]);
    } else if (argv.hasOwnProperty("set-ffmpeg-path")) {
        conf.set("ffmpegPath", argv["set-ffmpeg-path"]);
        console.log("ffmpeg path has been changed to " + argv["set-ffmpeg-path"]);
    } else if (argv.hasOwnProperty("set-progress-timeout")) {
        conf.set("progressTimeout", argv["set-progress-timeout"]);
        console.log("Progress timeout path has been changed to " + argv["set-progress-timeout"]);
    } else {
        if (argv._ && argv._.length !== 1) {
            console.error("Please just specify ONE argument, the YouTube video URL... Exiting!");
            process.exit(-1);
        } else {

            // Check for default output path
            if (!conf.hasOwnProperty("outputPath")) {
                // Set default
                var outputPath = path.join(homeDir.directory, "/yt2mp3");
                conf.set("outputPath", outputPath);
            }

            var videoConfig = {};

            // Check if video name is set, if so write it to video config
            if (argv.hasOwnProperty("name")) {
                videoConfig.name = argv["name"];
            }

            // Create downloader configuration
            var downloaderConfig = {};
            if (conf.has("outputPath")) downloaderConfig.outputPath = conf.get("outputPath");
            if (conf.has("videoQuality")) downloaderConfig.videoQuality = conf.get("videoQuality");
            if (conf.has("ffmpegPath")) downloaderConfig.ffmpegPath = conf.get("ffmpegPath");
            if (conf.has("progressTimeout")) downloaderConfig.progressTimeout = conf.get("progressTimeout");

            // Instantiate Downloader
            var dl = new Downloader(downloaderConfig);

            // Find videoId
            var videoId = findVideoId(argv._[0]);

            if (!videoId) {
                console.log("Couldn't find a valid video id from the given URL. Exiting!");
                process.exit(-1);
            } else {

                // Set videoId
                videoConfig.videoId = videoId;

                // Create output path if it doesn"t exist yet
                mkdirp(conf.get("outputPath"), function (err) {
                    if (err) {
                        console.error(err);
                        process.exit(-1);
                    } else {
                        // Download video and create MP3
                        dl.getMP3(videoConfig, function(err,res){
                            if(err) {
                                console.error(err);
                                process.exit(-1);
                            } else {
                                console.log("Song was downloaded: " + res.file);
                            }
                        });
                    }
                });

            }

        }
    }
}
