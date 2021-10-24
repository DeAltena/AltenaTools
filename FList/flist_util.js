function rainbowText(str) {
    const col = ["red", "orange", "yellow", "green", "cyan", "blue", "purple"];
    let res = "";
    for (let i = 0; i < str.length; i++)
        res += `[color=${col[i % col.length]}]${str[i]}[/color]`;

    return res;
}