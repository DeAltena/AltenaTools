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
var availableCols = [];
let col, cols, bold, italic, underline, strikethrough, altCols, sub, sup, wholeText, affectWords;
let colmap = new Map([["red", "red"], ["ora", "orange"], ["yel", "yellow"], ["gre", "green"], ["cya", "cyan"], ["blu", "blue"], ["pur", "purple"], ["pin", "pink"], ["bla", "black"], ["bro", "brown"], ["whi", "white"], ["gra", "gray"]]);
initVars();
initCollapsibles();
document.addEventListener('keydown', onKeyPress)
restoreFromCookie();

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
        if(document.getElementById("savetocookies").checked)
            saveCookie(cols);
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

function addColour(){
    let col = readCols();

    document.getElementById("colourlist").innerHTML += colourstemplate.replace("{colnum}", colnum).replace("{colnum}", colnum);
    availableCols.push(1);
    colnum++;
    setFromCols(col);
}

function removeColour(btn){
    let col = readCols();
    let id = btn.id.substr(-1);
    let offset = 0;

    for(let i = 0; i < id; i++)
        if(availableCols[i] === 0) offset++;
    
    col.splice(id - offset, 1);

    document.getElementById("colourlist").innerHTML = document.getElementById("colourlist").innerHTML.replace(
        colourstemplate.replace("{colnum}", id).replace("{colnum}", id), ""
    );
    availableCols[id] = 0;

    setFromCols(col);
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

function colsToString(col) {
    let str = "";
    for(let i = 0; i < col.length; i++){
        str += col[i].substr(0, 3) + " ";
    }
    str = str.substr(0, str.length-1);
    return str;
}

function stringToCols(str){
    let col = [];
    let tmp = str.split(" ");
    for(let i = 0; i < tmp.length; i++){
        col.push(colmap.get(tmp[i]));
    }
    return col;
}

function setFromCols(col){
    let offset = 0, i = 0;
    for(; i < availableCols.length; i++){
        if(i - offset >= col.length) {document.getElementById(`colours${i}`).value = "red"; continue;}
        if(availableCols[i] == 0) { offset++; continue; }

        document.getElementById(`colours${i}`).value = col[i-offset];
    }

    for(; i - offset < col.length; i++){
        addColour();
        document.getElementById(`colours${i}`).value = col[i-offset];
    }
}

function saveCookie(col){
    document.cookie = `${colsToString(col)}`;
    console.log(`Saved ${document.cookie}`);
}

function restoreFromCookie(){
    console.log(document.cookie);
    console.log(stringToCols(document.cookie));
    if(!isBlank(document.cookie))
        setFromCols(stringToCols(document.cookie));
}