function selectText(node) {
    node = document.getElementById(node);

    if (document.body.createTextRange) {
        const range = document.body.createTextRange();
        range.moveToElementText(node);
        range.select();
    } else if (window.getSelection) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
    } else {
        console.warn("Could not select text in node: Unsupported browser.");
    }
}

function copyToClipboard(str){
    navigator.clipboard.writeText(str).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.log('Async: Copying to clipboard had to fall back on execCommand!');
        document.execCommand("copy");
    });
}

function initCollapsibles(){
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
            content.style.display = "none";
            } else {
            content.style.display = "block";
            }
        });
    }
}

function replaceLinebreaks(str){
    return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function enableOnChecked(id, checkbox){
    document.getElementById(id).disabled = checkbox.checked;
}

function disableOnChecked(id, checkbox){
    document.getElementById(id).disabled = !checkbox.checked;
}