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

function replaceLinebreaks(str){
    return str.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}