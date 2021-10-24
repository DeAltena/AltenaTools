initCollapsibles();

let col, bold, italic, underline, strikethrough, coloured, rainbow, sub, sup;

function startTags(){
    let res = "";
    if(coloured && !rainbow)
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
    if(coloured && !rainbow)
        res += `[/color]`;

    return res;
}

function colorizeDialogue(){
    let str = document.getElementById("textarea").value,
        start = 0, newBegin = 0, out = "",
        startTag = document.getElementById("starttag").value,
        endTag = document.getElementById("endtag").value,
        wholeText = document.getElementById("tags").checked;

    col = document.getElementById("colours").value;
    bold = document.getElementById("bold").checked;
    italic = document.getElementById("italic").checked;
    underline = document.getElementById("underline").checked;
    strikethrough = document.getElementById("strikethrough").checked;
    coloured = !isBlank(col);
    rainbow = document.getElementById("rainbow").checked;
    sub = document.getElementById("sub").checked;
    sup = document.getElementById("super").checked;

    if(wholeText){
        out += startTags();
        if(rainbow)
            out += rainbowText(str);
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
                if(rainbow)
                    out += rainbowText(str.substr(newBegin, i - newBegin + 1));
                else
                    out += str.substr(newBegin, i - newBegin + 1);

                out += endTags();

                newBegin = i + 1;
                start = 0;  
            }
        }

        if(rainbow && start != 0)
            out += rainbowText(str.substr(newBegin));
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