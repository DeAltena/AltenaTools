let colnum = 0; let dictnum = 0;
let coltag = "C"; let dicttag = "D";
let COL_NONE = "none";
let colCookie = "cols";
let dictCookie = "dicts";
const coltemplate = `
    <select name="colour" id="colours{colnum}">
        <option value="${COL_NONE}" selected="selected">None</option>
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
    </select>`;

const colourstemplate = `
    ${coltemplate}
    <button id="buttons{colnum}" onclick="removeColour(this)">Delete Colour</button>
    <br>`;

const dicttemplate = `
    <textarea id="textarea{colnum}" class="dictentry" name="textarea" rows="1" cols="10"></textarea>
    ${coltemplate}
    <label><input type="checkbox" id="bold{colnum}">Bold</label>
    <label><input type="checkbox" id="italic{colnum}">Italic</label>
    <label><input type="checkbox" id="underline{colnum}">Underline</label>
    <label><input type="checkbox" id="strikethrough{colnum}">Strikethrough</label>
    <button id="buttons{colnum}" onclick="removeDict(this)">Delete Keyword Group</button>
    <br>`;
var availableCols = []; var availableDicts = []; 
var textArea = document.getElementById("textarea");
var colSelector = document.getElementById("colours");
let col, cols, bold, italic, underline, strikethrough, altCols, sub, sup, wholeText, affectWords, excludeTags, dicts, inDia;
let colmap = new Map([["red", "red"], ["ora", "orange"], ["yel", "yellow"], ["gre", "green"], ["cya", "cyan"], ["blu", "blue"], ["pur", "purple"], 
    ["pin", "pink"], ["bla", "black"], ["bro", "brown"], ["whi", "white"], ["gra", "gray"], [COL_NONE.substr(0, 3), COL_NONE]]);

initCollapsibles();
document.addEventListener('keydown', onKeyPress)
loadCols(); loadDicts();

function initVars(){
    bold = document.getElementById("bold").checked;
    italic = document.getElementById("italic").checked;
    underline = document.getElementById("underline").checked;
    strikethrough = document.getElementById("strikethrough").checked;
    sub = document.getElementById("sub").checked;
    sup = document.getElementById("super").checked;
    wholeText = document.getElementById("tags").checked;
    excludeTags = document.getElementById("excludeTags").checked;

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
        col = colSelector.value;
    }

    if(document.getElementById("dict").checked){
        dicts = readDicts();
        inDia = document.getElementById("inDia").checked;
    } else {
        dicts = []
    }

}

function startTags(){
    let res = "";
    if(!altCols && col != COL_NONE)
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
    if(!altCols && col != COL_NONE)
        res += `[/color]`;

    return res;
}

function applyDict(str){
    let ret = "";
    let pre, post;
    let brk = false;

    let text = splitSentence(str), words;
    for(let t = 0; t < text.length; t++){
        for(let d = 0; d < dicts.length; d++){
            if(dicts[d].text === "") continue;

            pre = ""; post = "";
            if(dicts[d].col != COL_NONE){
                pre = `[color=${dicts[d].col}]` + pre;
                post += `[/color]`;
            }
            if(dicts[d].ita){
                pre = `[i]` + pre;
                post += `[/i]`;
            }
            if(dicts[d].bol){
                pre = `[b]` + pre;
                post += `[/b]`;
            }
            if(dicts[d].sti){
                pre = `[s]` + pre;
                post += `[/s]`;
            }
            if(dicts[d].und){
                pre = `[u]` + pre;
                post += `[/u]`;
            }
            words = splitDict(dicts[d]);
            for(let w = 0; w < words.length; w++){
                if(isSameWord(words[w], text[t])){
                    ret += pre + text[t] + post + " ";
                    brk = true;
                    break;
                }   
            }
            if(brk){
                break;
            }
        }
        if(!brk){
            ret += text[t] + " ";
        } else {
            brk = false;
        }
    }    

    ret = ret.slice(0, -1);
    return ret;
}

function colorizeDialogue(){
    let str = textArea.value,
        start = 0, newBegin = 0, out = "",
        startTag = document.getElementById("starttag").value,
        endTag = document.getElementById("endtag").value,
        startLen = startTag.length,
        endLen = endTag.length,
        tmp = "";

    initVars();
    
    if(startLen > 1 || endLen > 1) {
        excludeTags = true;
    }
    
    if(wholeText){
        out += startTags();
        if(altCols || dicts.length != 0){
            tmp = str;
            if(altCols)
                if(affectWords)
                    tmp = alternateColourWords(cols, str);
                else
                    tmp = alternateColourLetters(cols, str);
            if(dicts.length != 0)
                tmp = applyDict(tmp);
            out += tmp;
        }else{
            out += str;
        }
        out += endTags();
    } else {
        for(let i = 0; i < str.length; i++) {
            if(str.substr(i, startLen) == startTag && start == 0) {
                if(excludeTags) {
                    tmp = str.substr(newBegin, i - newBegin + startLen);
                    if(dicts.length != 0){
                        tmp = applyDict(tmp);
                    }
                    out += tmp
                    newBegin = i + startLen;
                } else {
                    tmp = str.substr(newBegin, i - newBegin);
                    if(dicts.length != 0){
                        tmp = applyDict(tmp);
                    }
                    out += tmp;
                    newBegin = i;
                }
                out += startTags();

                start = 1;
            } else if(str.substr(i, endLen) == endTag && start != 0) {
                let substring;
                if(excludeTags) {
                    substring = str.substr(newBegin, i - newBegin);
                } else {
                    substring = str.substr(newBegin, i - newBegin + endLen);
                }

                if(dicts.length != 0 && inDia){
                    substring = applyDict(substring);
                }

                if(altCols){
                    if(affectWords)
                        out += alternateColourWords(cols, substring);
                    else
                        out += alternateColourLetters(cols, substring);
                } else {
                    out += substring;
                }

                out += endTags();

                if(excludeTags) {
                    newBegin = i;
                } else {
                    newBegin = i + 1;
                }
                start = 0;  
            }
        }

        let substring = str.substr(newBegin);
        if(dicts.length != 0 && ((inDia && start != 0) || start == 0))
            substring = applyDict(substring);

        if(start != 0 && altCols)
            if(affectWords)
                out += alternateColourWords(cols, substring);
            else
                out += alternateColourLetters(cols, substring);  
        else 
            out += substring;
        

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

let boldStart = "[b]", boldEnd = "[/b]", italicStart = "[i]", italicEnd = "[/i]", strikeStart = "[s]", strikeEnd = "[/s]",
    underStart = "[u]", underEnd = "[/u]", colStart = "[color={}]", colEnd = "[/color]";

function onKeyPress(e){
    let selection = getSelectedText(document, textArea);
    if(e.altKey || e.ctrlKey){
        switch(e.keyCode){
            case 13/* enter */:
                colorizeDialogue();
                break;
            case 66/* b */:
                selection.text = boldStart + selection.text + boldEnd;
                updateSelection(selection, textArea);
                break;
            case 68/* d */:
                selection.text = colStart.replace("{}", colSelector.value) + selection.text + colEnd;
                updateSelection(selection, textArea);
                break;
            case 71/* g */:
                break;
            case 73/* i */:
                selection.text = italicStart + selection.text + italicEnd;
                updateSelection(selection, textArea);
                break;
            case 83/* s */:
                selection.text = strikeStart + selection.text + strikeEnd;
                updateSelection(selection, textArea);
                break;
            case 85/* u */:
                selection.text = underStart + selection.text + underEnd;
                updateSelection(selection, textArea);
                break;
            default:
                return;
        }
        e.preventDefault();
    }   
}

//Variable Colour Code

function addColour(){
    let col = readCols();

    document.getElementById("colourlist").innerHTML += colourstemplate.replaceAll("{colnum}", coltag+colnum);
    availableCols.push(colnum);
    colnum++;
    setCols(col);
}

function removeColour(btn){
    let col = readCols();
    let id = parseInt(btn.id.substr("buttons".length + coltag.length));
    
    col.splice(availableCols.indexOf(id), 1);

    btn.parentElement.innerHTML = btn.parentElement.innerHTML.replace(
        colourstemplate.replaceAll("{colnum}", coltag+id), ""
    );
    availableCols.splice(availableCols.indexOf(id), 1);

    setCols(col);
}

function setCols(col){
    let i = 0;
    for(; i < availableCols.length; i++){
        if(i >= col.length) {document.getElementById(`colours${coltag}${availableCols[i]}`).value = "red"; continue;}
        document.getElementById(`colours${coltag}${availableCols[i]}`).value = col[i];
    }

    for(; i < col.length; i++){
        addColour();
        document.getElementById(`colours${coltag}${availableCols[i]}`).value = col[i];
    }
}

function readCols(){
    let arr = [];
    for(let i = 0; i < availableCols.length; i++){
        arr.push(document.getElementById(`colours${coltag}${availableCols[i]}`).value);
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

function saveCols(){
    setCookie(colCookie, colsToString(readCols()));
}

function loadCols(){
    var colStr = getCookie(colCookie);
    if(!isBlank(colStr))
        setCols(stringToCols(colStr));
}

//Variable Dictionary Code

function addDict(){
    let dicts = readDicts();

    document.getElementById("dictlist").innerHTML += dicttemplate.replaceAll("{colnum}", dicttag+dictnum);
    availableDicts.push(dictnum);
    dictnum++;
    setDicts(dicts);
}

function removeDict(btn){
    let dicts = readDicts();
    let id = parseInt(btn.id.substr("buttons".length + dicttag.length));
    
    dicts.splice(availableDicts.indexOf(id), 1);

    btn.parentElement.innerHTML = btn.parentElement.innerHTML.replace(
        dicttemplate.replaceAll("{colnum}", dicttag+id), ""
    );
    availableDicts.splice(availableDicts.indexOf(id), 1);

    setDicts(dicts);
}

function readDicts(){
    let arr = [];
    for(let i = 0; i < availableDicts.length; i++){
        arr.push({
            text : document.getElementById(`textarea${dicttag}${availableDicts[i]}`).value,
            col : document.getElementById(`colours${dicttag}${availableDicts[i]}`).value,
            ita : document.getElementById(`italic${dicttag}${availableDicts[i]}`).checked,
            bol : document.getElementById(`bold${dicttag}${availableDicts[i]}`).checked,
            sti : document.getElementById(`strikethrough${dicttag}${availableDicts[i]}`).checked,
            und : document.getElementById(`underline${dicttag}${availableDicts[i]}`).checked
        });
    }
    return arr;
}

function setDicts(dicts){
    let i = 0;
    for(; i < availableDicts.length; i++){
        if(i >= dicts.length) {
            document.getElementById(`colours${dicttag}${availableDicts[i]}`).value = COL_NONE; 
            document.getElementById(`italic${dicttag}${availableDicts[i]}`).checked = false; 
            document.getElementById(`bold${dicttag}${availableDicts[i]}`).checked = false; 
            document.getElementById(`strikethrough${dicttag}${availableDicts[i]}`).checked = false; 
            document.getElementById(`underline${dicttag}${availableDicts[i]}`).checked = false; 
            continue;
        }
        document.getElementById(`textarea${dicttag}${availableDicts[i]}`).value = dicts[i].text;
        document.getElementById(`colours${dicttag}${availableDicts[i]}`).value = dicts[i].col;
        document.getElementById(`italic${dicttag}${availableDicts[i]}`).checked = dicts[i].ita; 
        document.getElementById(`bold${dicttag}${availableDicts[i]}`).checked = dicts[i].bol; 
        document.getElementById(`strikethrough${dicttag}${availableDicts[i]}`).checked = dicts[i].sti; 
        document.getElementById(`underline${dicttag}${availableDicts[i]}`).checked = dicts[i].und; 
    }

    for(; i < dicts.length; i++){
        addDict();
        document.getElementById(`textarea${dicttag}${availableDicts[i]}`).value = dicts[i].text;
        document.getElementById(`colours${dicttag}${availableDicts[i]}`).value = dicts[i].col;
        document.getElementById(`italic${dicttag}${availableDicts[i]}`).checked = dicts[i].ita; 
        document.getElementById(`bold${dicttag}${availableDicts[i]}`).checked = dicts[i].bol; 
        document.getElementById(`strikethrough${dicttag}${availableDicts[i]}`).checked = dicts[i].sti; 
        document.getElementById(`underline${dicttag}${availableDicts[i]}`).checked = dicts[i].und; 
    }
}

function saveDicts(){
    var dictStr = "";
    readDicts().forEach(element => {
        console.log(element)
        dictStr += JSON.stringify(element);
    });
    setCookie(dictCookie, dictStr);
}

function loadDicts(){
    var dictStr = getCookie(dictCookie);
    if(!isBlank(dictStr))
        setDicts(JSON.parse(dictStr));
}
//Shared Code

function updateCount(area){
    document.getElementById("chars").innerHTML = area.value.length;
    document.getElementById("words").innerHTML = (splitSentence(area.value) || []).length;
}