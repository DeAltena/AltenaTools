const img_template = `
    <img loading="lazy" title="{name}" src="https://static.f-list.net/images/eicon/{name}.gif" alt="Failed to load!" width="100" height="100"
        onclick="navigator.clipboard.writeText('[eicon]{name}[/eicon]');">
    <div class="delete" onclick="deleteEicon(this, '{name}', '{group}')">❌</div>
`;

const collapsible_template = `
    <p class="big">{group}</p>
`;

const cookie_name = 'eicons';

eicons = {
    "default" : []
};

function init() {
    let submit = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("addeicon").click();
        }
    };

    document.getElementById("eiconname").addEventListener("keypress", submit);
    document.getElementById("eicongroup").addEventListener("keypress", submit);

    initCollapsibles();
    loadCookie();
}

const regexp_tags = /\[eicon\](.+?)\[\/eicon\],?\s*/gm;
const regexp_normal = /([^\[\],]+)\s*,?\s*/gm;
function addEIcon() {
    let names = []
    let name_raw = document.getElementById("eiconname").value.trim();
    let group = document.getElementById("eicongroup").value;

    let matches = name_raw.matchAll(regexp_tags);
    for(const match of matches) {
        names.push(match[1].trim())
    }

    if (names.length === 0) {
        let matches = name_raw.matchAll(regexp_normal);
        for(const match of matches) {
            names.push(match[1].trim())
        }
    }


    for(const name of names) {
        addImage(name, group);

        let eicon_group = eicons[group.toLowerCase()]
        if (eicon_group === undefined) {
            eicon_group = []
            eicons[group.toLowerCase()] = eicon_group
        }
        eicon_group.push(name);
    }
   
    saveCookie();
}

function addImage(name, group) {
    const lower_group = group.toLowerCase();
    let div = document.createElement("div");
    div.classList.add("image");
    div.innerHTML = img_template.replaceAll("{name}", name).replaceAll("{group}", lower_group);

    let group_node = document.getElementById(lower_group);

    if (group_node === null) {
        let btn = document.createElement("button");
        btn.type = "button";
        btn.classList.add("collapsible");
        btn.innerHTML = collapsible_template.replaceAll("{group}", group);

        group_node = document.createElement("div");
        group_node.classList.add("content");
        group_node.id = lower_group;

        btn.onmousedown = e => {
            if (e.button === 1) {
                if (confirm(`Do you want to delete the group '${group}'?`)) {
                    delete eicons[lower_group];
                    document.getElementById("gallery").removeChild(btn);
                    document.getElementById("gallery").removeChild(group_node);
                    saveCookie();
                }
    
                e.preventDefault();
            }
        }

        collapseEvent(btn);

        let gallery = document.getElementById("gallery");
        gallery.appendChild(btn);
        gallery.appendChild(group_node);
    }

    group_node.appendChild(div);
}

function collapseEvent(collapsible){
    if (collapsible.getAttribute('listener') != null) {
        return;
    }
    collapsible.addEventListener("click", () => {
        //collapsible.classList.toggle("active");
        var content = collapsible.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}   

function initCollapsibles(){
    var visibles = document.getElementsByClassName("visible-content");
    for (i = 0; i < visibles.length; i++) {
        visibles[i].style.display = "block";
    }

    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        collapseEvent(coll[i]);
    }
}

function deleteEicon(node, name, lower_group){
    if (confirm(`Do you want to delete the EIcon '${name}'?`)) {
        eicons[lower_group].splice(eicons[lower_group].indexOf(name), 1);
        document.getElementById(lower_group).removeChild(node.parentNode);
        saveCookie();
    }
}

function saveCookie(){
    let eicon_string = JSON.stringify(eicons);

    if (new Blob([eicon_string]).size > 4096) {
        alert("The space needed to save your EIcon gallery has exceeded 4096 bytes!\nThis means it can no longer be stored in a Cookie.\nPlease save it to your harddrive instead!")
        return;
    }

    setCookie(cookie_name, eicon_string);
}

function loadCookie(){
    let tmp = getCookie(cookie_name);
    
    if(!isBlank(tmp)){
        eicons = JSON.parse(tmp);
    }

    for (const group in eicons) {
        for (const name of eicons[group]) {
            addImage(name, group);
        }
    }
}