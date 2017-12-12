var YoutubeMp3Downloader = require("youtube-mp3-downloader");
var Progress = require('cli-progress');

var Downloader = function(options) {

    var self = this;

    //Configure YoutubeMp3Downloader with your settings
    self.YD = new YoutubeMp3Downloader({
        "ffmpegPath": (options && options.ffmpegPath) || "/usr/local/bin/ffmpeg",  // Where is the FFmpeg binary located?
        "outputPath": (options && options.outputPath) || "/tmp",                   // Where should the downloaded and encoded files be stored?
        "youtubeVideoQuality": (options && options.videoQuality) || "highest",     // What video quality should be used?
        "queueParallelism": 1,                                                     // How many parallel downloads/encodes should be started?
        "progressTimeout": (options && options.progressTimeout) || 200             // How long should be the interval of the progress reports
    });

    self.callbacks = {};
    self.progressBars = {};

    self.YD.on("finished", function(error, data) {

        if (self.callbacks[data.videoId]) {
            self.callbacks[data.videoId](error, data);
        } else {
            console.log("Error: No callback for videoId!");
        }

    });

    self.YD.on("error", function(error, data) {

        console.error(error + " on videoId " + data.videoId);

        if (self.callbacks[data.videoId]) {
            self.callbacks[data.videoId](error, data);
        } else {
            console.log("Error: No callback for videoId!");
        }

    });

    self.YD.on("progress", function(progressObj) {
        var progr = {percentage: progressObj.progress.percentage, eta: progressObj.progress.ety, runtime: progressObj.progress.runtime, speed: parseFloat((progressObj.progress.speed/1024).toFixed(2))};
        self.progressBars[progressObj.videoId].update(progressObj.progress.percentage, progr);
    });

};

Downloader.prototype.getMP3 = function(track, callback){

    var self = this;

    // Register callback
    self.callbacks[track.videoId] = callback;
    self.progressBars[track.videoId] = new Progress.Bar({
        hideCursor: true,
        format: 'Downloading [{bar}] {percentage}% | ETA: {eta}s | Runtime: {runtime}s | Speed: {speed} kbytes/sec',
        stopOnComplete: true,
        clearOnComplete: true
    }, Progress.Presets.shades_classic);
    // Start bar
    self.progressBars[track.videoId].start(100, 0);
    // Initial "update" to show sensible values instead of placeholders
    self.progressBars[track.videoId].update(0, { percentage: 0, eta: 0, runtime: 0, speed: 0});
    // Trigger download
    self.YD.download(track.videoId, track.name);

};

module.exports = Downloader;