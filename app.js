const request = require('request');
// const rp = require('request-promise');
const p = require('path');
const fs = require('fs');
const multer = require('multer');
const express = require('express');
const ytdl = require('ytdl-core');
// const pug = require('pug');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const { google } = require('googleapis');
const youtube = google.youtube('v3');

const app = express();
const port = process.env.PORT || 8000;
const clientId = process.env.CLIENTID;
const clientSecret = process.env.CSECRET;
const ykey = process.env.YKEY;

app.set('view engine', 'pug');
app.set("views", p.join(__dirname, "views"));
app.locals.basedir = p.join(__dirname, "views");
app.use(express.static('views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.json());
let upload = multer({dest: 'uploads/'});

let clips = [];
let wordID = [];

let bearerToken = "";
app.get('/', function(req, res) {
    res.render('index');
});

app.post('/', function(req, response) {
    console.log(req.body);
    let b = req.body.textarea;
    let userFilePath;

    if(b != null) {
        userFilePath = 'uploads/clips.txt';
        fs.writeFileSync(userFilePath, b);
    } else {
        console.log('error');
    }

    let file = fs.readFileSync(userFilePath, 'utf8');
    clips = file.toString().split('\n');
    
    console.log(clips.length);

    for (let i = 0; i < clips.length; i++) {
        console.log(clips[i]);
        let lastSlash = clips[i].lastIndexOf("/");
        wordID[i] = clips[i].slice(lastSlash+1);
        console.log(wordID[i]);
    }

    console.log(userFilePath);

    fs.unlinkSync(userFilePath);
    let videoLinks = [];
    let videoTitles = [];
    let thumbImg = [];
    let imgSizeX = [];
    let imgSizeY = [];
    let imgRatio = [];
    let index = 0;

    const bearerOptions = {
        method: 'POST',
        url: "https://id.twitch.tv/oauth2/token?client_id=" + clientId +"&client_secret=" + clientSecret + "&grant_type=client_credentials",
        headers: {
        }
    };
    request(bearerOptions, (err, res, body) => {
        if (err) {console.log(err);}
        const contents = JSON.parse(body);
        console.log(contents);
        bearerToken = contents.access_token;
        
        for (let i = 0; i < wordID.length; i++) {
            const options = {
                url: 'https://api.twitch.tv/helix/clips?id=' + wordID[i],
                headers: {
                    'Authorization': "Bearer " + bearerToken,
                    'Client-ID': clientId
                }
            };
    
            request(options, (err,res, body) => {
                if (err) {console.log(err);}
                const contents = JSON.parse(body);
                console.log(contents);
                console.log('\n' + contents.data[0].thumbnail_url);

                let thumbStr = contents.data[0].thumbnail_url;
                let thumbArr = thumbStr.split("-preview-");
                videoLinks[i] = thumbArr[0] + ".mp4";

                imgSizeX[i] = (thumbArr[1].split(".jpg")[0].split("x")[0]);
                imgSizeY[i] = (thumbArr[1].split(".jpg")[0].split("x")[1]);
                imgRatio[i] = (imgSizeX[i]/imgSizeY[i]);
                console.log(imgSizeX[i] + " " + imgSizeY[i] + " " + imgRatio[i]);
                imgSizeX[i] = 400;
                imgSizeY[i] = 400/imgRatio[i];
                // let vidTitle = contents.data[0].title;
                // videoTitles.push(vidTitle);
                videoTitles[i] = contents.data[0].title;
                thumbImg[i] = thumbStr;

                index++;
                if (index == wordID.length) {
                    console.log(videoLinks, videoTitles);
                    response.render('links', {
                        links: videoLinks,
                        titles: videoTitles,
                        images: thumbImg,
                        imgNum: clips.length,
                        imgX: imgSizeX,
                        imgY: imgSizeY
                    });
                }
            });
        }
    });
});

app.get('/ydl', function(req, res) {
    res.render('ydl');
});

app.post('/ydl', function(req, res) {
    let youplaylink = "";

    if (req.body.ylink === "") {
        youplaylink = req.body.ypdlink;
        let youplayid = youplaylink.split("list=")[1];

        youtube.playlistItems.list({
            key: ykey,
            part: 'snippet,contentDetails',
            playlistId: youplayid,
            maxResults: 25,
        }, (err, results) => {
            if (err) {console.log(err);}

            let ypdlId = [];
            let ypdlTitle = [];
            let ypdlImgs = [];

            let yItems = results.data.items;
            for (let i=0; i < yItems.length; i++) {
                ypdlId[i] = yItems[i].contentDetails.videoId;
                ypdlTitle[i] = yItems[i].snippet.title;
                if (yItems[i].snippet.thumbnails.high !== undefined) {
                    ypdlImgs[i] = yItems[i].snippet.thumbnails.high.url;
                }
            }

            res.render('ypdlinks', {
                videoIds: ypdlId,
                videoTitles: ypdlTitle,
                videoImgs: ypdlImgs
            });
        });
    } else if (req.body.ypdlink === "") {
        let format = [];
        let quality = [];

        youplaylink = req.body.ylink;
        let youid = youplaylink.split("?v=")[1];

        youtube.videos.list({
            key: ykey,
            part: 'snippet,contentDetails',
            id: youid
        }, (err, results) => {
            if (err) {console.log(err);}

            ytdl.getInfo(youid, (err, info) => {
                if (err) throw err;

                let audioFormats = ytdl.filterFormats(info.formats, 'audioandvideo');

                let int = 0;
                for (let i=0; i<audioFormats.length; i++) {
                    quality[i] = {
                        'itag': audioFormats[i].itag,
                        'quality': audioFormats[i].qualityLabel
                    }
                }

                console.log(quality);
                res.render('ydlinks', {
                    videoId: youid,
                    videoImg: results.data.items[0].snippet.thumbnails.high.url,
                    videoTitle: results.data.items[0].snippet.title,
                    videoQuality: quality
                });
            });
        });
    }
});

app.get('/download', function(req, res) {
    let id = req.query.ID;
    let title = req.query.TITLE;
    let itag = req.query.ITAG;

    res.header('Content-Disposition', 'attachment; filename="' + title + '.mp4"');

    ytdl(id, {
        quality: itag,
        format: 'mp4'
    }).pipe(res);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
