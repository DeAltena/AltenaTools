const rainbowCols = ["red", "orange", "yellow", "green", "cyan", "blue", "purple"];
const gothCols = ["gray", "purple", "blue", "cyan", "black"];

function alternateColourText(col, str) {
    let res = `[color=${col[0]}]`;
    for (let i = 0; i < str.length; i++){
        if(str[i] == " ") {
            res += str[i];
            continue;
        }
        if(i % col.length == 0) continue;
        res += `[color=${col[i % col.length]}]${str[i]}[/color]`;
    }

    return res+`[/color]`;
}

function alternateColourLetters(col, str) {
    let res = `[color=${col[0]}]${str[0]}`, offset = 0, ascend = true, i=0
        tmp = col.shift();
    str = str.substr(1);
    for (; i < str.length; i++){
        if(str[i] == " ") {
            res += str[i];
            offset++;
            continue;
        }

        if(ascend){
            res += `[color=${col[(i - offset) % col.length]}]${str[i]}`;
        } else {
            res += `[/color]${str[i]}`;
        }

        if((i - offset) % col.length == (col.length-1)) {
            ascend = !ascend;
        }
    }

    let col_adjust;
    if(ascend){
        col_adjust = ((i - offset) % col.length);
    }
    else {
        col_adjust = col.length -((i - offset) % col.length)
    }

    for(let j = 0; j < col_adjust; j++){
        res += `[/color]`;
    }

    res += `[/color]`;

    col.unshift(tmp);
    return res;
}

function alternateColourWords(col, str) {
    let words = str.split(" ");
    let res = `[color=${col[0]}]`;
    for (let i = 0; i < words.length; i++){
        if(words[i] == " " || i % col.length == 0) {
            res += words[i] + " ";
            continue;
        }
        res += `[color=${col[i % col.length]}]${words[i]}[/color] `;
    }
    res = res.substr(0, res.length-1);

    return res+`[/color]`;
}