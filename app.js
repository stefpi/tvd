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
const port = process.env.PORT || 80;
const clientId = process.env.CLIENTID;
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

app.get('/', function(req, res) {
    res.render('index');
});

// app.get('/howto', function(req, res) {
//     res.render('howto');
// });

app.post('/', upload.single('userFile'), function(req, response) {
    // let a = req.file.path;
    let b = req.body.textarea;
    let userFilePath;

    if(req.file != null) {userFilePath = req.file.path;}
    else if(b != null) {
        userFilePath = 'uploads/clips.txt';
        fs.writeFileSync(userFilePath, b);
    } else {
        console.log('error');
    }

    let file = fs.readFileSync(userFilePath, 'utf8');
    clips = file.toString().split('\n');
    // id = clips[0].split(' ')[0];
    // clips.splice(0, 1);
    // console.log(clips);
    // console.log(id);
    for (let i = 0; i < clips.length; i++) {
        console.log(clips[i]);
        wordID[i] = clips[i].split("clip/").pop().split(" ")[0];
        console.log(wordID[i] + "\n");
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

    for (let i = 0; i < clips.length; i++) {
        const options = {
            url: 'https://api.twitch.tv/helix/clips?id=' + wordID[i],
            headers: {
                'Client-ID': clientId
            }
        };

        request(options, (err,res, body) => {
            if (err) {console.log(err);}
            const contents = JSON.parse(body);
            let thumbStr = contents.data[0].thumbnail_url;
            let thumbArr = thumbStr.split("-preview-");
            // let vidLink = thumbArr[0] + ".mp4";
            // videoLinks.push(vidLink);
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

            if(index === clips.length - 1) {
                response.render('links', {
                    links: videoLinks,
                    titles: videoTitles,
                    images: thumbImg,
                    imgNum: clips.length,
                    imgX: imgSizeX,
                    imgY: imgSizeY
                });
            }
            index++;
        });
    }
});

app.get('/ypdl', function(req, res) {
    res.render('ypdl');
});

app.post('/ypdl', function(req, res) {
    let youplaylink = req.body.yplink;
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
            ypdlImgs[i] = yItems[i].snippet.thumbnails.high.url;
        }

        res.render('ypdlinks', {
            videoIds: ypdlId,
            videoTitles: ypdlTitle,
            videoImgs: ypdlImgs
        });
    });
});

app.get('/ypdlinks', function(req, res) {

});

app.get('/download', function(req, res) {
    let id = req.query.ID;
    let title = req.query.TITLE;

    res.header('Content-Disposition', 'attachment; filename="' + title + '.mp4"');

    ytdl(id, {
        format: 'mp4'
    }).pipe(res);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
