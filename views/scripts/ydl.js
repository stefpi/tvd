let yptext = document.querySelector('#ypdlink');
let ytext = document.querySelector('#ylink');

function returnToPreviousPage() {
    window.history.back();
}

function validateMyForm() {
    if (yptext.value !== "" && ytext.value !== "") {
        alert("please only enter a single video link or multiple");
        // returnToPreviousPage();
        return false;
    }
    return true;
}

const ylink = document.querySelector('#ylink');
const ypdlink = document.querySelector('#ypdlink');

// function disableL() {
//     ylink.disabled = true;
// }
//
// function disablePl() {
//     ypdlink.disabled = true;
// }