initCollapsibles();
document.addEventListener('keydown', onKeyPress)

let col, cols, bold, italic, underline, strikethrough, altCols, sub, sup, wholeText, affectWords;
initVars();

//needed in case browser saves state after reload
function initVars(){
    bold = document.getElementById("bold").checked;
    italic = document.getElementById("italic").checked;
    underline = document.getElementById("underline").checked;
    strikethrough = document.getElementById("strikethrough").checked;
    sub = document.getElementById("sub").checked;
    sup = document.getElementById("super").checked;
    wholeText = document.getElementById("tags").checked;

    if(document.getElementById("rainbow").checked){
        altCols = true;
        affectWords = document.getElementById("wordmode").checked;
        cols = rainbowCols;
    } else if(document.getElementById("gothbow").checked){
        altCols = true;
        affectWords = document.getElementById("wordmode").checked;
        cols = gothCols;
    } else if(document.getElementById("custbow").checked){
        altCols = true;
        affectWords = document.getElementById("wordmode").checked;
        cols = readCols();
    } else {
        altCols = false;
        col = document.getElementById("colours").value;
    }

}

function readCols(){
    let curcol, arr = [];
    for(let i = 0; i < colnum; i++){
        if(curcol = document.getElementById(`colours${i}`)){
            arr.push(curcol.value);
        }
    }
    return arr;
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
            if(affectWords)
                out += alternateColourWords(cols, str);
            else
                out += alternateColourLetters(cols, str);
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
                    if(affectWords)
                        out += alternateColourWords(cols, i - newBegin + 1);
                    else
                        out += alternateColourLetters(cols, str.substr(newBegin, i - newBegin + 1));
                else
                    out += str.substr(newBegin, i - newBegin + 1);

                out += endTags();

                newBegin = i + 1;
                start = 0;  
            }
        }

        if(start != 0 && altCols)
            if(affectWords)
                out += alternateColourWords(cols, str.substr(newBegin));
            else
                out += alternateColourLetters(cols, str.substr(newBegin));  
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

let colnum = 0;
const colourstemplate = `
    <select name="colour" id="colours{colnum}">
        <option value="red">Red</option>
        <option value="orange">Orange</option>
        <option value="yellow">Yellow</option>
        <option value="green">Green</option>
        <option value="cyan">Cyan</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
        <option value="pink">Pink</option>
        <option value="black">Black</option>
        <option value="brown">Brown</option>
        <option value="white">White</option>
        <option value="gray">Gray</option>
    </select>
    <button id="buttons{colnum}" onclick="removeColour(this)">Delete Colour</button>
    <br>`;

function addColour(){
    document.getElementById("colourlist").innerHTML += colourstemplate.replace("{colnum}", colnum).replace("{colnum}", colnum);
    colnum++;
}

function removeColour(btn){
    let id = btn.id.substr(-1);
    document.getElementById("colourlist").innerHTML = document.getElementById("colourlist").innerHTML.replace(
        colourstemplate.replace("{colnum}", id).replace("{colnum}", id), ""
    );
}