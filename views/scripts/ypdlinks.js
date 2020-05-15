let buttons = document.querySelectorAll('button.download');

function sendID(id, title) {
    alert("redirecting you to " + id + " " + title);
    // fetch(`${window.location.hostname}/download?ID=${id}`, {
    //     method:'GET'
    // }).then(res => res.json())
    //     .then(json => console.log(json));
    window.location.href = `/download?ID=${id}&TITLE=${title}`;
}

for (let i=0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', () => {
        console.log(`URL: ${buttons[i].name}`);
        sendID(buttons[i].name, buttons[i].textContent);
    });
}