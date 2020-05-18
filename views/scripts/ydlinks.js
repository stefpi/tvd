let button = document.querySelector('.download');
let img = document.querySelector('.videoImage')
let title = document.querySelector('#title');

function sendID(id, title) {
    alert("redirecting you to " + id + " " + title);
    // fetch(`${window.location.hostname}/download?ID=${id}`, {
    //     method:'GET'
    // }).then(res => res.json())
    //     .then(json => console.log(json));
    window.location.href = `/download?ID=${id}&TITLE=${title}`;
}

button.addEventListener('click', () => {
    console.log(`URL: ${img.id}`);
    sendID(img.id, title.textContent);
});