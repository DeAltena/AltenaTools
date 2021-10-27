function rainbowText(str) {
    const col = ["red", "orange", "yellow", "green", "cyan", "blue", "purple"];
    return alternateColourText(col, str);
}

function gothbowText(str) {
    const col = ["gray", "white", "black"];
    return alternateColourText(col, str);
}

function alternateColourText(col, str) {
    let res = "";
    for (let i = 0; i < str.length; i++){
        if(str[i] == " ") {
            res += str[i];
            continue;
        }
        res += `[color=${col[i % col.length]}]${str[i]}[/color]`;
    }

    return res;
}