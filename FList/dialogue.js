initCollapsibles();
document.getElementById("endtag").disabled = true;

function colorizeDialogue(){
    let str = document.getElementById("textarea").value,
        col = document.getElementById("colour").value,
        start = 0, newBegin = 0, out = "",
        bold = document.getElementById("bold").checked,
        italic = document.getElementById("italic").checked,
        underline = document.getElementById("underline").checked,
        strikethrough = document.getElementById("strikethrough").checked,
        coloured = !isBlank(col),
        rainbow = document.getElementById("rainbow").checked,
        sub = document.getElementById("sub").checked,
        sup = document.getElementById("super").checked,
        startTag = document.getElementById("starttag").value,
        endTag = (document.getElementById("diftag").checked) ? startTag : document.getElementById("endtag").value;

    for(let i = 0; i < str.length; i++)
    {
        if(str[i] == startTag && start == 0) {
            out += str.substr(newBegin, i - newBegin);
            if(coloured && !rainbow)
                out += `[color=${col}]`;
            if(bold)
                out += `[b]`;
            if(italic)
                out += `[i]`;
            if(underline)
                out += `[u]`;
            if(strikethrough)
                out += `[s]`;
            if(sub)
                out += `[sub]`;
            if(sup)
                out += `[sup]`;

            newBegin = i;
            start = 1;
        }
        else if(str[i] == endTag && start != 0) {
            if(rainbow)
                out += rainbowText(str.substr(newBegin, i - newBegin + 1));
            else
                out += str.substr(newBegin, i - newBegin + 1);

            if(sup)
                out += `[/sup]`;
            if(sub)
                out += `[/sub]`;
            if(strikethrough)
                out += `[/s]`;
            if(underline)
                out += `[/u]`;
            if(italic)
                out += `[/i]`;
            if(bold)
                out += `[/b]`;
            if(coloured && !rainbow)
                out += `[/color]`;

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
        if(strikethrough)
            out += `[/s]`;
        if(underline)
            out += `[/u]`;
        if(italic)
            out += `[/i]`;
        if(bold)
            out += `[/b]`;
        if(coloured && !rainbow)
            out += `[/color]`;
    }

    let tmpout = replaceLinebreaks(out)
    document.getElementById("dialogueOutput").innerHTML = tmpout;
    selectText("dialogueOutput");

    copyToClipboard(out);
    document.getElementById("info").innerHTML = "Output successfully copied to clipboard!";
}