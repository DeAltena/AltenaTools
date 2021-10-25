function rainbowText(str) {
    const col = ["red", "orange", "yellow", "green", "cyan", "blue", "purple"];
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