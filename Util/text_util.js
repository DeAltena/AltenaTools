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

function selectTextRange(node, start, end) {
    if( node.createTextRange ) {
        var selRange = node.createTextRange();
        selRange.collapse(true);
        selRange.moveStart('character', start);
        selRange.moveEnd('character', end);
        selRange.select();
        node.focus();
    } else if( node.setSelectionRange ) {
        node.focus();
        node.setSelectionRange(start, end);
    } else if( typeof node.selectionStart != 'undefined' ) {
        node.selectionStart = start;
        node.selectionEnd = end;
        node.focus();
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

function disableOnChecked(id, checkbox){
    document.getElementById(id).disabled = checkbox.checked;
}

function enableOnChecked(id, checkbox){
    document.getElementById(id).disabled = !checkbox.checked;
}

function splitSentence(str){
    return str.match(/([\w.,\/#!$%\^&\*;:{}=\-`~()\\\[\]?]+)/g);
}

function splitDict(dict){
    var ret = [];
    dict.text.split(",").forEach(element => {
        ret.push(element.trim())
    });;
    return ret;
}

function isSameWord(str1, str2){
    tmp1 = str1.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\\\[\]?]/g,"");
    tmp2 = str2.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\\\[\]?]/g,"");
    return tmp1.toLowerCase() == tmp2.toLowerCase();
}

function getSelectedText(doc, area){
    if (area.selectionStart !== undefined){
        return {
            text : area.value.substring(area.selectionStart, area.selectionEnd),
            start : area.selectionStart,
            end : area.selectionEnd
        };
    }else if (document.selection !== undefined){
        area.focus();
        return {
            text : document.selection.createRange().text,
            start : document.selection.createRange().startOffset,
            end : document.selection.createRange().endOffset
        };
    }
    return "";
}

function updateSelection(selection, area, cursor_pos){
    area.value = area.value.substring(0, selection.start) 
                    + selection.text
                    +  area.value.substring(selection.end, area.value.length);
    if(cursor_pos != -1) {
        selectTextRange(area, cursor_pos, cursor_pos)
    } else {
        selectTextRange(area, selection.start, selection.start + selection.text.length)
    }
}

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";" + ";path=/ ;SameSite=Lax";
  }

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    let spaces = 0;
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        spaces++;
        }
        c = c.substring(spaces);
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
        spaces = 0;
    }
    return "";
}