initCollapsibles();
document.addEventListener('keydown', onKeyPress)

let col, cols, bold, italic, underline, strikethrough, altCols, sub, sup, wholeText;
initVars();

//needed in case browser saves state after reload
function initVars(){
    bold = document.getElementById("bold").checked;
    italic = document.getElementById("italic").checked;
    underline = document.getElementById("underline").checked;
    strikethrough = document.getElementById("strikethrough").checked;
    sub = document.getElementById("sub").checked;
    sup = document.getElementById("super").checked;

    if(document.getElementById("rainbow").checked){
        altCols = true;
        cols = rainbowCols;
    } else if(document.getElementById("gothbow").checked){
        altCols = true;
        cols = gothCols;
    } else {
        altCols = false;
        col = document.getElementById("colours").value;
    }

}

function startTags(){
    let res = "";
    if(!altCols)
        res += `[color=${col}]`;
    if(bold)
        res += `[b]`;
    if(italic)
        res += `[i]`;
    if(underline)
        res += `[u]`;
    if(strikethrough)
        res += `[s]`;
    if(sub)
        res += `[sub]`;
    if(sup)
        res += `[sup]`;

    return res;
}

function endTags(){
    let res = "";
    if(sup)
        res += `[/sup]`;
    if(sub)
        res += `[/sub]`;
    if(strikethrough)
        res += `[/s]`;
    if(underline)
        res += `[/u]`;
    if(italic)
        res += `[/i]`;
    if(bold)
        res += `[/b]`;
    if(!altCols)
        res += `[/color]`;

    return res;
}

function colorizeDialogue(){
    let str = document.getElementById("textarea").value,
        start = 0, newBegin = 0, out = "",
        startTag = document.getElementById("starttag").value,
        endTag = document.getElementById("endtag").value;

    initVars();

    if(wholeText){
        out += startTags();
        if(altCols)
            out += alternateColourText(cols, str);
        else
            out += str;
        out += endTags();
    } else {
        for(let i = 0; i < str.length; i++) {
            if(str[i] == startTag && start == 0) {
                out += str.substr(newBegin, i - newBegin);
                out += startTags();

                newBegin = i;
                start = 1;
            } else if(str[i] == endTag && start != 0) {
                if(altCols)
                    out += alternateColourText(cols, str.substr(newBegin, i - newBegin + 1));
                else
                    out += str.substr(newBegin, i - newBegin + 1);

                out += endTags();

                newBegin = i + 1;
                start = 0;  
            }
        }

        if(start != 0 && altCols)
            out += alternateColourText(cols, str.substr(newBegin));  
        else 
            out += str.substr(newBegin);
        

        //if a closing " is missing, close it at the end.
        if(start != 0){
            out += endTags();
        }
    }

    let tmpout = replaceLinebreaks(out)
    document.getElementById("dialogueOutput").innerHTML = tmpout;
    selectText("dialogueOutput");

    copyToClipboard(out);
    document.getElementById("result").innerHTML = "Output successfully copied to clipboard!";
}

function onKeyPress(e){
    if((e.altKey || e.ctrlKey) && e.keyCode == 13){
        colorizeDialogue();
        e.preventDefault()
    }
    else if((e.altKey || e.ctrlKey) && e.keyCode == 66){
        document.getElementById("bold").checked = !document.getElementById("bold").checked;
        e.preventDefault()
    }
    else if((e.altKey || e.ctrlKey) && e.keyCode == 73){
        document.getElementById("italic").checked = !document.getElementById("italic").checked;
        e.preventDefault()
    }
    else if((e.altKey || e.ctrlKey) && e.keyCode == 71){
        document.getElementById("rainbow").checked = !document.getElementById("rainbow").checked;
        e.preventDefault()
    }
    else if((e.altKey || e.ctrlKey) && e.keyCode == 85){
        document.getElementById("super").checked = !document.getElementById("super").checked;
        document.getElementById("sub").checked = false;
        e.preventDefault()
    }
    else if((e.altKey || e.ctrlKey) && e.keyCode == 76){
        document.getElementById("sub").checked = !document.getElementById("sub").checked;
        document.getElementById("super").checked = false;
        e.preventDefault()
    }
        
}