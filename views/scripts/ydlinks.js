let button = document.querySelector('.download');
let img = document.querySelector('.videoImage');
let title = document.querySelector('#title');

function sendID(id, title, itag) {
    alert("redirecting you to " + id + " " + title + " with this quality: " + itag);
    // fetch(`${window.location.hostname}/download?ID=${id}`, {
    //     method:'GET'
    // }).then(res => res.json())
    //     .then(json => console.log(json));
    window.location.href = `/download?ID=${id}&TITLE=${title}&ITAG=${itag}`;
}

button.addEventListener('click', () => {
    let quality = document.querySelector('.qualityDropDown').value;
    let userFileName = document.querySelector('.fileName').value;
    let itag, fileName;

    if (userFileName !== "") {
        fileName = userFileName
    } else {
        fileName = title.textContent;
    }

    if (quality === '240p') {
        itag = 133;
    } else if (quality === '360p') {
        itag = 134
    } else if (quality === '480p') {
        itag = 135
    } else if (quality === '720p') {
        itag = 136
    } else if (quality === '1080p') {
        itag = 137
    } else if (quality === '2160p60') {
        itag = 138
    }


    console.log(`URL: ${img.id}`);
    sendID(img.id, fileName, itag);
});