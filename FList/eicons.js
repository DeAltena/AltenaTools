const img_template = `
    <img loading="lazy" title="{name}" src="https://static.f-list.net/images/eicon/{name}.gif" alt="Failed to load!" width="100" height="100"
        onclick="navigator.clipboard.writeText('[eicon]{name}[/eicon]');">
    <div class="delete" onclick="deleteEicon(this, '{name}', '{group}')">❌</div>
    <input type="checkbox" class="select" id="select" title="Select this EIcon" onclick="selectedEicon(this)">
`;

const cookie_name = 'eicons';

eicons = {

};

function init() {
    $("#groupdialog").hide();

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

function appendChildToTable(table, child, group) {
    let last_row = table.lastChild;

    if(last_row.childElementCount >= getEntriesPerRow(group) - 1) {
        last_row = document.createElement("tr");
        table.appendChild(last_row);
    }
    last_row.appendChild(child);
}

function addImage(name, group) {
    let entry = document.createElement("td");
    entry.classList.add("image");
    entry.id = name.toLowerCase();
    entry.innerHTML = img_template.replaceAll("{name}", name).replaceAll("{group}", group.toLowerCase());
    let table_node = getOrCreateGroup(group);
    appendChildToTable(table_node, entry, group);
}

const entry_width = 104;
let entries_per_row = -1;
function getEntriesPerRow(group_name) {
    if (entries_per_row <= 0) {
        const group_node = document.getElementById(group_name.toLowerCase());
        const style = getComputedStyle(group_node);

        let total_width = window.innerWidth;
        let padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);

        let width = total_width - padding;
        entries_per_row = width / entry_width;
    }

    return entries_per_row;
}

function getOrCreateGroup(name) {
    lower_name = name.toLowerCase();

    let group_node = document.getElementById(lower_name);

    if(group_node != null) {
        return group_node;
    }
    
    let del = document.createElement("div");
    del.classList.add("deletegroup");
    del.onclick = (e) => {
        deleteGroup(btn, lower_name);
        e.stopPropagation();
    }
    del.innerText = "❌";

    let edit = document.createElement("div");
    edit.classList.add("renamegroup");
    edit.onclick = (e) => {
        renameGroup(edit, lower_name);
        e.stopPropagation();
    }
    edit.innerText = "✏️";

    let title = document.createElement("p");
    title.classList.add("big");
    title.innerText = name.toUpperCase();

    let btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("collapsible");
    btn.appendChild(del);
    btn.appendChild(edit);
    btn.appendChild(title);
    
    group_node = document.createElement("table");
    group_node.classList.add("content");
    group_node.classList.add("centre");
    group_node.id = lower_name;

    let row_node = document.createElement("tr");
    group_node.appendChild(row_node);

    collapseEvent(btn);

    let gallery = document.getElementById("gallery");
    gallery.appendChild(btn);
    gallery.appendChild(group_node);

    return group_node
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

let should_confirm = true

function fillRow(row_node) {
    let next_row = row_node.nextElementSibling;
    if(next_row != null) {
        row_node.appendChild(next_row.firstChild);
        if(next_row.childElementCount <= 0) {
            next_row.parentNode.removeChild(next_row);
        }
    } else {
        if(row_node.childElementCount <= 0) {
            row_node.parentNode.removeChild(row_node);
        }
    }
}

function deleteEicon(node, name, lower_group){
    if (!should_confirm || confirm(`Do you want to delete the EIcon '${name}'?`)) {
        eicons[lower_group].splice(eicons[lower_group].indexOf(name), 1);
        let row_node = node.parentNode.parentNode;
        row_node.removeChild(node.parentNode);
        saveCookie();
        fillRow(row_node);
    }
}

function deleteGroup(node, name) {
    if (confirm(`Do you want to delete the Group '${name.toUpperCase()}', including all contained EIcons?`)) {
        delete eicons[name];
        let gallery = node.parentNode;
        gallery.removeChild(node.nextElementSibling);
        gallery.removeChild(node);
        saveCookie();
    }
}

function renameGroup(node, name) {
    var group = prompt(`What do you want group '${name.toUpperCase()}' to be renamed to?`);
    if (group != null && group != "") {
        group = group.toLowerCase();

        if (group in eicons){
            alert("A group with that name already exists!");
            return;
        }

        eicons[group] = eicons[name]
        delete eicons[name]

        node.onclick = (e) => {
            renameGroup(node, group);
            e.stopPropagation();
        }
        node.previousElementSibling.onclick = (e) => {
            deleteGroup(node.previousElementSibling, group);
            e.stopPropagation();
        }
        node.nextElementSibling.innerText = group.toUpperCase();

        node.parentNode.nextElementSibling.id = group;

        saveCookie();
    }
}

function selectedEicon(node) {
    
}

function getSelectedImages() {
    checkboxes = document.getElementsByClassName("select");
    let selected_images = [];

    for(const checkbox of checkboxes) {
        if(checkbox.checked) {
            selected_images.push(checkbox.parentNode);
        }   
    }

    return selected_images;
}

function deleteEicons(){
    selected_images = getSelectedImages();

    if(selected_images.length == 0) {
        return;
    }

    if (confirm(`Are you sure you want to delete all ${selected_images.length} EIcons?`)){
        should_confirm = false;
        for(const image of getSelectedImages()) {
            image.querySelector(".delete").click();
        }
        should_confirm = true;
    }
}

function changeGroup() {
    if(getSelectedImages().length == 0) {
        return;
    }

    select = document.getElementById("groupselect");
    for(const group_name in eicons) {
        let opt = document.createElement("option");
        opt.value = group_name;
        opt.innerText = group_name.toUpperCase();
        select.appendChild(opt);
    }
    $("#groupdialog").show();
    $("#groupdialog").dialog({
        modal: true,
        width:'auto'
    });
}

function changeGroupCont(){
    $("#groupdialog").dialog('close');

    let group = $("#group_change_name").val();
    if(group == null || group.trim() == "") {
        group = $("#groupselect").find(":selected").val();
    }

    group = group.trim().toLowerCase();

    let group_node = getOrCreateGroup(group);

    for(const image of getSelectedImages()) {
        old_row = image.parentNode;
        old_group = old_row.parentNode.id;
        
        appendChildToTable(group_node, image, group);
        fillRow(old_row);

        image.querySelector("input").checked = false;

        eicons[old_group].splice(eicons[old_group].indexOf(image.id), 1);

        let eicon_group = eicons[group];
        if (eicon_group === undefined) {
            eicon_group = [];
            eicons[group] = eicon_group;
        }
        eicon_group.push(image.id);
    }
    saveCookie();
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