# ytb2mp3

A command-line client for extracting mp3s from YouTube videos

## Installation

### Prerequisites

You need a working installation of [ffmpeg](https://www.ffmpeg.org/) on your system. If you're on a Mac, you can use HomeBrew to install it like this:

```bash
$ brew install ffmpeg
```

### npm

`ytb2mp3` can be installed via npm:

```bash
$ npm install ytb2mp3 -g
```

## Configuration

### Configuration options

`ytb2mp3` can be configured by passing command-line flags. The following flags are available:

```bash
--set-output-path <path>                The absolute path where the downloaded files should be stored (default: /tmp)
                                        The directory is automatically created if it doesn't exist
--set-video-quality <quality>           The quality of the YouTube videos that should be requested (default: highesst)
--set-ffmpeg-path <path>                The absolute path to the ffmpeg binary (default: /usr/local/bin/ffmpeg)
--set-progress-timeout <milliseconds>   The time in milliseconds in which the download progress should be refreshed
                                        (default: 200ms)
```

This information is also displayed when `ytb2mp3` is called with the `--help` flag.

The configuration options will be persisted in `~/.config/configstore/ytb2mp3.json`.

## Usage

### Download a video's audio as mp3

```bash
$ ytb2mp3 https://www.youtube.com/watch?v=Vhd6Kc4TZls
```

This will yield in the following output:

```bash
Downloading [██████████████████████████░░░░░░░░░░░░░░] 65% | ETA: 3s | Runtime: 4s | Speed: 1518.28 kbytes/sec
```

After the finished download, it will point to the output file:

```bash
Song was downloaded: /Users/username/yt2mp3/Cold Funk - Funkorama.mp3
```

### Specifying a filename

You can use the `--name "filename.extension"` flag to specify a name for the output file:

```bash
$ ytb2mp3 --name "Cold Funk - Funkorama.mp3" https://www.youtube.com/watch?v=Vhd6Kc4TZls
```

This is useful if the algorithm of `youtube-mp3-downloader` cannot automatically determine a decent filename from the video's metadata.

### Pasting a copied URL from the clipboard (MacOS)

Copy a video URL from your browser. Then, you can use the command

```bash
$ pbpaste | ytb2mp3
```

to directly download the video's audio.
