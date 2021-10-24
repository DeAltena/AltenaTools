function colorize() {
    const str = document.getElementById("input").value;
    let out = rainbowText(str);

    copyToClipboard(out);
    document.getElementById("info").innerHTML = "Output successfully copied to clipboard!";

    let tmpout = replaceLinebreaks(out)
    document.getElementById("output").innerHTML = tmpout;
    selectText("output");
}