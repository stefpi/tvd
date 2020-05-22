let textInput = document.querySelector('#textarea');
let fileInput = document.querySelector('#fileupload');
let fileInputLabel = document.querySelector('#upload-button');

function validateMyForm() {
    if (textInput.value !== "" && fileInput.value !== "") {
        alert("please choose only one option");
        // returnToPreviousPage();
        return false;
    }
    return true;
}

function updateText() {
    fileInputLabel.textContent = fileInput.value.split("h\\")[1];
}