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
    let options = document.querySelector('.qualityDropDown');
    let itag = options.options[options.selectedIndex].id;
    let userFileName = document.querySelector('.fileName').value;
    let fileName;

    if (userFileName !== "") {
        fileName = userFileName
    } else {
        fileName = title.textContent;
    }

    console.log(`URL: ${img.id}`);
    sendID(img.id, fileName, itag);
});