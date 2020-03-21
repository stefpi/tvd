const request = require('request');
const rp = require('request-promise');
const p = require('path');
const fs = require('fs');
const multer = require('multer');
const express = require('express');
const pug = require('pug');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'pug');
app.set("views", p.join(__dirname, "views"));
app.use(express.static('public'));
let upload = multer({dest: 'uploads/'});

let clips = [];
let wordID = [];
var id;

app.get('/', function(req, res) {
    res.render('index');
});

app.post('/', upload.single('userFile'), function(req, response) {
    // res.render('index');
    // res.writeHead(200, {'Content-Type': 'text/html'});

    let userFilePath = req.file.path;

    let file = fs.readFileSync(userFilePath, 'utf8');
    clips = file.toString().split('\n');
    id = clips[0].split(' ')[0];
    clips.splice(0, 1);
    console.log(clips);
    console.log(id);
    for (let i = 0; i < clips.length; i++) {
        console.log(clips[i]);
        wordID[i] = clips[i].split(".tv/").pop().split(" ")[0];
        console.log(wordID[i] + "\n");
    }

    // fs.unlinkSync(userFilePath);
    let videoLinks = [];
    let videoTitles = [];
    let index = 0;

    for (let i = 0; i < clips.length; i++) {
        const options = {
            url: 'https://api.twitch.tv/helix/clips?id=' + wordID[i],
            headers: {
                'Client-ID': id
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

            // let vidTitle = contents.data[0].title;
            // videoTitles.push(vidTitle);
            videoTitles[i] = contents.data[0].title;

            if(index == clips.length - 1) {
                response.render('links', {links: videoLinks, titles: videoTitles})
            }
            index++;
        });

        // rp(options)
        //     .then(function($) {
        //         const contents = JSON.parse($);
        //         let thumbStr = contents.data[0].thumbnail_url;
        //         let thumbArr = thumbStr.split("-preview-");
        //         // let vidLink = thumbArr[0] + ".mp4";
        //         // videoLinks.push(vidLink);
        //         videoLinks[i] = thumbArr[0] + ".mp4";
        //
        //         // let vidTitle = contents.data[0].title;
        //         // videoTitles.push(vidTitle);
        //         videoTitles[i] = contents.data[0].title;
        //     })
        //     .catch(function(err) {
        //         console.log(err);
        //     });

    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
