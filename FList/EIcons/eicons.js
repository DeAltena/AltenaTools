import { setUser, loadUserData, saveUserData } from "./eicons_firebase.js";


const src_link_template = "https://static.f-list.net/images/eicon/{name}.gif";
const clipboard_template = "[eicon]{name}[/eicon]";

const user_cookie_name = 'user_name';
const protected_class = 'protected';
const line_break = '[br]';

let eicons = {

};

let tables = {

}

document.addEventListener('DOMContentLoaded', function() {
    init();
  });

function init() {
    onCheckbox();

    let submit = (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("addeicon").click();
        }
    };

    $("#gallery").css('max-width', `${window.innerWidth - 36}px`);

    document.getElementById("eiconname").addEventListener("keypress", submit);
    document.getElementById("eicongroup").addEventListener("keypress", submit);

    initCollapsibles();
    initButtons();
    loadCookie();
}

function initButtons(){
    $("#groupdialog").hide();
    $("#mosaicdialog").hide();
    $("#logindialog").hide();

    document.getElementById("change_group_dialog_btn").onclick = changeGroupCont;
    document.getElementById("add_mosaic").onclick = addMosaic;
    document.getElementById("addeicon").onclick = addEIcon;
    document.getElementById("changegroup").onclick = changeGroup;
    document.getElementById("deleteEicons").onclick = deleteEicons;
    document.getElementById("createmosaic").onclick = createMosaic;
    document.getElementById("deletemode").onclick = enableDeleteMode;
    document.getElementById("selectmode").onclick = enableSelectMode;
    document.getElementById("change_user_btn").onclick = showLoginDialog;
    document.getElementById("save_btn").onclick = saveEicons;
    document.getElementById("mosaicinput").oninput = mosaicPreview;

    
    document.getElementById("login_btn").onclick = () => {
        login(document.getElementById("username").value);
        $("#logindialog").dialog('close');
    };
}

const regexp_tags = /\[?eicon\](.+?)\[\/eicon\],?(\s*[\r\n]+\s*\S+?)?/gm;
const regexp_normal = /([^\[\],]+)\s*,?\s*/gm;
function addEIcon() {
    let names = []
    let name_raw = document.getElementById("eiconname").value.trim();
    let group = document.getElementById("eicongroup").value;

    let matches = name_raw.matchAll(regexp_tags);
    for (const match of matches) {
        names.push(match[1].trim())
    }

    if (names.length === 0) {
        let matches = name_raw.matchAll(regexp_normal);
        for (const match of matches) {
            names.push(match[1].trim())
        }
    }


    for (const name of names) {
        let eicon_group = eicons[group.toLowerCase()]
        if (eicon_group === undefined) {
            eicon_group = []
            eicons[group.toLowerCase()] = eicon_group
        }
        let index = eicon_group.push(name) - 1;

        addImage(name, group, index);
    }

    fillPlaceholders();
}

function getPreviousSiblings(node) {
    let count = 0;
    let sibling = node;
    while((sibling = sibling.previousElementSibling) != null){
        count++;
    }
    return count;
}

function appendChildToTable(table, child) {
    const [last_row, next_sibling] = getFirstFreeRow(table, 1, 1);
    if(next_sibling != null){
        last_row.insertBefore(child, next_sibling);
    } else {
        last_row.appendChild(child);
    }
    
}

function addImage(name, group, index) {
    let entry = document.createElement("td");
    entry.classList.add("image");
    entry.dataset.index = index;

    let img = document.createElement("img");
    img.loading = "lazy";
    img.title = name;
    img.src = src_link_template.replaceAll("{name}", name);
    img.alt = "Failed to Load!";
    img.width = 100;
    img.height = 100;
    img.classList.add("OverlayFull");

    addFunctionality(entry, name, group.toLowerCase(), clipboard_template.replaceAll("{name}", name));

    entry.appendChild(img);
    let table_node = getOrCreateGroup(group);
    appendChildToTable(table_node, entry);
}

const entry_width = 104;
let entries_per_row = -1;
function getEntriesPerRow() {
    if (entries_per_row <= 0) {
        let width = window.innerWidth - 64;
        entries_per_row = Math.trunc(width / entry_width);
    }

    return entries_per_row;
}

function getOrCreateGroup(name) {
    let lower_name = name.toLowerCase().trim();

    let group_node = document.getElementById(lower_name);

    if (group_node != null) {
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

    tables[lower_name] = [];
    tables[lower_name][0] = new Array(getEntriesPerRow()).fill(0);

    collapseEvent(btn);

    let gallery = document.getElementById("gallery");
    gallery.appendChild(btn);
    gallery.appendChild(group_node);

    return group_node
}


function collapseEvent(collapsible) {
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

function initCollapsibles() {
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
    let prev_row = row_node;
    let next_row
    while ((next_row = prev_row.nextElementSibling) != null) {
        if (next_row.childElementCount > 0 &&
            getRowWidth(prev_row) <= getEntriesPerRow() - next_row.firstChild.colSpan) {
            prev_row.appendChild(next_row.firstChild);
        }
        prev_row = next_row;
    }
}

function deleteEicon(node, name, lower_group) {
    if (!should_confirm || confirm(`Do you want to delete the EIcon?`)) {
        let rows = node.rowSpan;
        let cols = node.colSpan;
        eicons[lower_group].splice(eicons[lower_group].indexOf(name), 1);
        let row_node = node.parentNode;
        let next_sibling = node.nextElementSibling;
        row_node.removeChild(node);

        /* 
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                fillRow(row_node);
            }
            row_node = row_node.nextElementSibling;
            if (row_node === null) {
                break;
            }
        }*/
    }
}

function deleteGroup(node, name) {
    if (confirm(`Do you want to delete the Group '${name.toUpperCase()}', including all contained EIcons?`)) {
        delete eicons[name];
        let gallery = node.parentNode;
        gallery.removeChild(node.nextElementSibling);
        gallery.removeChild(node);
    }
}

function renameGroup(node, name) {
    var group = prompt(`What do you want group '${name.toUpperCase()}' to be renamed to?`);
    if (group != null && group != "") {
        group = group.toLowerCase();

        if (group in eicons) {
            alert("A group with that name already exists!");
            return;
        }

        eicons[group] = eicons[name]
        delete eicons[name]
        tables[group] = tables[name]
        delete tables[name]

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

    }
}

function getSelectedImages() {
    let checkboxes = document.getElementsByClassName("select");
    let selected_images = [];

    for (const checkbox of checkboxes) {
        if (checkbox.checked) {
            selected_images.push(checkbox.parentNode);
        }
    }

    return selected_images;
}

function getOrderedSelectedImages() {
    let images = getSelectedImages();
    images.sort((a, b) => {
        const indexA = parseInt(a.dataset.index);
        const indexB = parseInt(b.dataset.index);
      
        if (indexA > indexB) {
          return -1;
        } else if (indexA < indexB) {
          return 1;
        } else {
          return 0;
        }
      });
    return images;
}

function deleteEicons() {
    selected_images = getSelectedImages();

    if (selected_images.length == 0) {
        return;
    }

    if (confirm(`Are you sure you want to delete all ${selected_images.length} EIcons?`)) {
        should_confirm = false;
        for (const image of getSelectedImages()) {
            image.querySelector(".delete").click();
        }
        should_confirm = true;
    }

    fillPlaceholders();
}

function onCheckbox() {
    let mass_buttons = document.getElementsByClassName("mass");
    let is_empty = getSelectedImages().length === 0;
    for (const btn of mass_buttons) {
        btn.disabled = is_empty;
    }

}

function changeGroup() {
    if (getSelectedImages().length == 0) {
        return;
    }

    let select = document.getElementById("groupselect");
    for (const group_name in eicons) {
        let opt = document.createElement("option");
        opt.value = group_name;
        opt.innerText = group_name.toUpperCase();
        select.appendChild(opt);
    }
    $("#groupdialog").show();
    $("#groupdialog").dialog({
        modal: true,
        width: 'auto'
    });
}

function changeGroupCont() {
    $("#groupdialog").dialog('close');

    let new_group = $("#group_change_name").val();
    if (new_group == null || new_group.trim() == "") {
        new_group = $("#groupselect").find(":selected").val();
    }

    new_group = new_group.trim().toLowerCase();

    //let group_node = getOrCreateGroup(group);

    let old_groups = new Set();
    

    for (const image of getOrderedSelectedImages()) {
        let old_row = image.parentNode;
        let old_group = old_row.parentNode.id;
        old_groups.add(old_group);

        //appendChildToTable(group_node, image);
        //fillRow(old_row);

        image.querySelector("input").checked = false;

        let item = eicons[old_group].splice(image.dataset.index, 1)[0];

        let eicon_group = eicons[new_group];
        if (eicon_group === undefined) {
            eicon_group = [];
            eicons[new_group] = eicon_group;
        }
        eicon_group.push(item);
    }

    for(const old_group of old_groups){
        reloadGroup(eicons, old_group);
    }
    reloadGroup(eicons, new_group);

    fillPlaceholders();
}

let delete_mode = false;
const enable_delete_mode = "Enable Delete Mode";
const disable_delete_mode = "Disable Delete Mode";
function enableDeleteMode() {
    if (delete_mode) {
        $("#deletemode").text(enable_delete_mode);
        $("#info").text("");
        should_confirm = true;
    } else {
        $("#deletemode").text(disable_delete_mode);
        if (select_mode) {
            enableSelectMode();
        }
        $("#info").text("There will be no delete confirmation!");
        alert("As long as Delete Mode is enabled, any EIcon you click on will be deleted without any confirmation!")
        should_confirm = false;
    }
    $("#deletemode").toggleClass("delete-mode");
    delete_mode = !delete_mode;
}

let select_mode = false;
const enable_select_mode = "Enable Select Mode";
const disable_select_mode = "Disable Select Mode";
function enableSelectMode() {
    if (select_mode) {
        $("#selectmode").text(enable_select_mode);
        $("#info").text("");
    } else {
        $("#selectmode").text(disable_select_mode);
        if (delete_mode) {
            enableDeleteMode();
        }

    }
    $("#selectmode").toggleClass("delete-mode");
    select_mode = !select_mode;

    console.log(tables)
    console.log(eicons)
}

let mosaic_width = -1;
let mosaic_height = -1;

function mosaicPreview() {
    mosaic_width = 0;
    mosaic_height = 1;
    let curr_width = 0;

    let text = document.getElementById("mosaicinput").value;

    let images = [];
    let matches = text.matchAll(regexp_tags);
    const preview = document.getElementById("mosaicpreview");
    preview.innerText = "";
    for (const match of matches) {
        let name = match[1].trim().toLowerCase();
        let img = document.createElement("img");
        img.loading = "lazy";
        img.title = name;
        img.alt = "Failed to Load!";
        img.classList.add("preload");

        img.src = src_link_template.replaceAll("{name}", name);
        let preload_img = new Image();
        preload_img.src = img.src;

        images.push(img);
        preview.appendChild(img);

        curr_width++;
        if (curr_width > mosaic_width) {
            mosaic_width = curr_width;
        }

        if (match[2] !== undefined) {
            let linebreak = document.createElement("br");
            linebreak.classList.add("gif-seperator");
            preview.appendChild(linebreak);
            mosaic_height++;
            curr_width = 0;
        }
    }

    for (const img of images) {
        img.classList.remove("preload");
    }
}

function createMosaic() {
    $("#mosaicinput").val("");
    $("#mosaicpreview").text("");
    $("#mosaicgroup").val($("#eicongroup").val());
    $("#mosaicdialog").show();
    $("#mosaicdialog").dialog({
        modal: true,
        width: 'auto'
    });
}

function setBorderClass(mosaic_piece, row, col) {
    
    if (mosaic_width == 1 && mosaic_height == 0) {
        mosaic_piece.classList.add("OverlayFull");
        return
    }

    if (col == 0) {
        if (mosaic_height == 1) {
            mosaic_piece.classList.add("OverlayFullLeft");
        }
        else if (row == 0 && mosaic_width == 1) {
            mosaic_piece.classList.add("OverlayFullUpper");
        }
        else if (row == mosaic_height - 1 && mosaic_width == 1) {
            mosaic_piece.classList.add("OverlayFullLower");
        }
        else if (row == 0) {
            mosaic_piece.classList.add("OverlayUL");
        }
        else if (row == mosaic_height - 1) {
            mosaic_piece.classList.add("OverlayLL");
        }
        else if (mosaic_width == 1) {
            mosaic_piece.classList.add("OverlayVer");
        }
        else {
            mosaic_piece.classList.add("OverlayLeft");
        }
    }
    else if (col == mosaic_width - 1) {
        if (mosaic_height == 1) {
            mosaic_piece.classList.add("OverlayFullRight");
        }
        else if (row == 0) {
            mosaic_piece.classList.add("OverlayUR");
        }
        else if (row == mosaic_height - 1) {
            mosaic_piece.classList.add("OverlayLR");
        }
        else {
            mosaic_piece.classList.add("OverlayRight");
        }
    }
    else if (row == 0) {
        if (mosaic_height == 1) {
            mosaic_piece.classList.add("OverlayHor");
        }
        else {
            mosaic_piece.classList.add("OverlayUpper");
        }
    }
    else if (row == mosaic_height - 1) {
        mosaic_piece.classList.add("OverlayLower");
    }
    else {
        mosaic_piece.classList.add("OverlayMid");
    }
}

function createMosaicEntry() {
    let entry = document.createElement("td");
    entry.classList.add("mosaic");
    entry.colSpan = mosaic_width;
    entry.rowSpan = mosaic_height;
    return entry;
}

let clipboard_buffer = "";
function addFunctionality(entry, identifier, group_name, clipboard_text) {
    let del = document.createElement("div");
    del.classList.add("delete");
    del.title = "Delete this EIcon"
    del.onclick = (e) => {
        deleteEicon(entry, identifier, group_name);
        e.stopPropagation();
        fillPlaceholders();
    }
    del.innerText = "❌";

    let select = document.createElement("input");
    select.type = "checkbox";
    select.classList.add("select");
    select.classList.add("image-select");
    select.title = "Select this EIcon";
    select.onclick = onCheckbox;

    entry.onclick = (e) => {
        if (delete_mode) {
            deleteEicon(entry, identifier, group_name);
        } else if (select_mode) {
            select.click();
        } else {
            if (e.shiftKey) {
                clipboard_buffer += clipboard_text;
            } else {
                clipboard_buffer = clipboard_text;
            }
            navigator.clipboard.writeText(clipboard_buffer);
            $.toast('EIcon copied to Clipboard!');
        }
    }

    entry.appendChild(del);
    entry.appendChild(select);
}

function getOwnWidth(row) {
    let row_width = 0;
    for (const child of Array.from(row.children)) {
        row_width += child.colSpan;
    }
    return row_width;
}

function getRowWidth(row) {
    let row_width = getOwnWidth(row);
    let prev_row = row;
    let depth = 0;
    while((prev_row = prev_row.previousElementSibling) != null){
        depth++;
        for (const child of Array.from(prev_row.children)) {
            if(child.rowSpan > depth){
                row_width += child.colSpan;
            }
        }
    }
    return row_width;
}

function addPlaceholders(table, row_ind, count){
    let row = table.children[row_ind];
    for(let i = 0; i < count; i++){
        let placeholder = document.createElement("td");
        row.appendChild(placeholder);
        placeholder.classList.add("placeholder");

        for(let j = 0; j < tables[table.id][row_ind].length; j++){
            if(tables[table.id][row_ind][j] == 0){
                tables[table.id][row_ind][j] = -1;
                break;
            }
        }
    }
}

function fillPlaceholders(){
    for(let table_id in tables){
        let table_node = document.getElementById(table_id);
        for(let row_id in tables[table_id]){
            let empty_count = 0;
            for(let value_id in tables[table_id][row_id]){
                if(tables[table_id][row_id][value_id] == 0){
                    empty_count++;
                }
            }
            if(empty_count > 0){
                addPlaceholders(table_node, row_id, empty_count);
            }
            console.log(table_id, row_id, empty_count, tables[table_id][row_id])
        }
    }
}

function removePlaceholders(row, offset, max){
    for(const cell of Array.from(row.children)){
        if(cell.classList.contains("placeholder")){
            if(offset > 0){
                offset--;
            } else {
                let nextSibling = cell.nextElementSibling;
                row.removeChild(cell);
                max--;
                if(max <= 0){
                    return nextSibling;
                }
            }
        }
    }

    return null;
}

function getPreviousPlaceholders(table, row, end_col) {
    let previous_placeholders = 0;

    for(let c = 0; c < end_col; c++){
        if(tables[table][row][c] == -1){
            previous_placeholders++;
        }
    }

    return previous_placeholders;
}

function createNewRow(table){
    let new_row = document.createElement("tr");
    table.appendChild(new_row);

    tables[table.id][tables[table.id].length] = new Array(getEntriesPerRow()).fill(0);

    return new_row;
}

function getFirstFreeRow(table, width, height) {
    for(let row = 0; row < tables[table.id].length; row++){
        let free_spaces = 0;
        for(let col = 0; col < tables[table.id][row].length; col++){

            //Check if a block of the required size is free
            let fit = true;
            for(let h = 0; h < height; h++){
                for(let w = 0; w < width; w++){
                    if(tables[table.id][row + h] == undefined){
                        createNewRow(table);
                    }
                    if(!(fit = tables[table.id][row + h][col + w] <= 0)){
                        break;
                    }
                }
                if(!fit){
                    break;
                }
            }

            if(tables[table.id][row + height] == undefined){
                createNewRow(table);
            }

            //block is free - set it to occupied and add/remove placeholders as needed.
            if(fit){
                let nextSibling = null;
                for (let h = 0; h < height; h++) {
                    const previousPlaceholders = getPreviousPlaceholders(table.id, row + h, col);
                    if (tables[table.id][row + h][col] === -1) {
                        const tmp = removePlaceholders(table.children[row + h], previousPlaceholders, width);
                        nextSibling = h === 0 ? tmp : nextSibling;
                    }
                    tables[table.id].slice(row + h, row + h + 1)[0].fill(1, col, col + width);
                }

                addPlaceholders(table, row, free_spaces);
                return [table.children[row], nextSibling];
            }

            if(tables[table.id][row][col] == 0){
                free_spaces++;
            }
        }
    }

    let row = tables[table.id].length;
    let new_row = null;
    for (let h = 0; h < height + 1; h++) {
        let r = createNewRow(table);
        if(new_row === null){
            new_row = r;
        }
        tables[table.id].slice(row + h, row + h + 1)[0].fill(1, 0, width);
    }

    return [new_row, null];

    /*
    for (const row of Array.from(table.children)) {
        if ((cell = getRowWidth(row)) <= getEntriesPerRow() - width) {
            return [cell, row];
        }
    }
    let new_row = document.createElement("tr");
    table.appendChild(new_row);

    let lower_name = table.id;
    tables[lower_name][tables[lower_name].length] = new Array(getEntriesPerRow()).fill(0);

    return [0, new_row];
    */
}

function addMosaic() {
    $("#mosaicdialog").dialog("close");
    let group_name = $("#mosaicgroup").val().toLowerCase();
    let preview = $("#mosaicpreview");

    let group = getOrCreateGroup(group_name);
    let [last_row, next_sibling] = getFirstFreeRow(group, mosaic_width, mosaic_height);
    let entry = createMosaicEntry();
    if(next_sibling != null){
        last_row.insertBefore(entry, next_sibling);
    } else {
        last_row.appendChild(entry);
    }

    let row = 0;
    let col = 0;
    let clipboard_text = "";
    let dict_entry = [];
    for (const child of Array.from(preview.children())) {
        setBorderClass(child, row, col);
        col++;

        if (child.nodeName == "BR") {
            col = 0;
            row++;
            clipboard_text += "\n";
            dict_entry.push(line_break);
        } else {
            clipboard_text += clipboard_template.replaceAll("{name}", child.title);
            dict_entry.push(child.title);
        }
        entry.appendChild(child);
    }

    for (let i = 1; i < mosaic_height; i++) {
        last_row.classList.add(protected_class);
    }

    addFunctionality(entry, dict_entry, group_name.toLowerCase(), clipboard_text);

    let eicon_group = eicons[group_name.toLowerCase()]
    if (eicon_group === undefined) {
        eicon_group = []
        eicons[group_name.toLowerCase()] = eicon_group
    }
    let index = eicon_group.push(dict_entry);
    entry.dataset.index = index;
    

    fillPlaceholders();
}

function loadMosaic(names, group_name, index) {
    let images = [];
    mosaic_width = 0;
    mosaic_height = 1;
    let curr_width = 0;

    for (const name of names) {
        if (name === line_break) {
            let linebreak = document.createElement("br");
            linebreak.classList.add("gif-seperator");
            images.push(linebreak);
            mosaic_height++;
            curr_width = 0;
        } else {
            let img = document.createElement("img");
            img.loading = "lazy";
            img.title = name;
            img.alt = "Failed to Load!";
            img.classList.add("preload");

            img.src = src_link_template.replaceAll("{name}", name);
            let preload_img = new Image();
            preload_img.src = img.src;

            images.push(img);

            curr_width++;
            if (curr_width > mosaic_width) {
                mosaic_width = curr_width;
            }
        }
    }

    let group = getOrCreateGroup(group_name);
    let [last_row, next_sibling] = getFirstFreeRow(group, mosaic_width, mosaic_height);
    let entry = createMosaicEntry();
    entry.dataset.index = index;
    if(next_sibling != null){
        last_row.insertBefore(entry, next_sibling);
    } else {
        last_row.appendChild(entry);
    }

    let row = 0;
    let col = 0;
    let clipboard_text = "";
    for (const img of images) {
        img.classList.remove("preload");
        setBorderClass(img, row, col);
        col++;

        if (img.nodeName == "BR") {
            col = 0;
            row++;
            clipboard_text += "\n";
        } else {
            clipboard_text += clipboard_template.replaceAll("{name}", img.title);
        }
        entry.appendChild(img);
    }

    addFunctionality(entry, names, group_name, clipboard_text);

    for (let i = 1; i < mosaic_height; i++) {
        if ((last_row = last_row.nextElementSibling) === null) {
            last_row = document.createElement("tr");
            tables[group_name][tables[group_name].length] = new Array(getEntriesPerRow()).fill(0);
            group.appendChild(last_row);
        }
        last_row.classList.add(protected_class);
    }
}
/*
[eicon]slime_dick1[/eicon][eicon]slime_dick2[/eicon]
[eicon]slime_dick3[/eicon][eicon]slime_dick4[/eicon]
*/

function saveEicons() {
    saveUserData(eicons);
}

function loadAll(eiconObj){
    eicons = eiconObj;
    for (const group in eiconObj) {
        let index = 0;
        for (const name of eiconObj[group]) {
            if (name instanceof Array) {
                loadMosaic(name, group, index);
            } else {
                addImage(name, group, index);
            }
            index++;
        }
    }

    fillPlaceholders();
}

function reloadGroup(eiconObj, group){
    group = group.toLowerCase();
    document.getElementById(group).innerHTML = "";
    tables[group] = [];

    let index = 0;
    for(const name of eiconObj[group]){
        if (name instanceof Array) {
            loadMosaic(name, group, index);
        } else {
            addImage(name, group, index);
        }
        index++;
    }
}

function disableButtonsRecursively(element, disabled) {
    if (element.tagName == 'BUTTON' || element.tagName == 'INPUT') {
        element.disabled = disabled;
    }

    var children = element.children;
    for (var i = 0; i < children.length; i++) {
        disableButtonsRecursively(children[i], disabled);
    }
  }

function login(username){
    username = username.toLowerCase();
    const mainDiv = document.getElementById("main_div");
    const userPara = document.getElementById("no_user_para");

    if (!isBlank(username)) {
        setUser(username);
        loadUserData(loadAll);
        disableButtonsRecursively(mainDiv, false);
        onCheckbox();
        userPara.style.display = "none";
        document.getElementById("change_user_btn").innerText = "Switch User";
        setCookie(user_cookie_name, username);
    } else {
        disableButtonsRecursively(mainDiv, true);
        onCheckbox();
        userPara.style.display = "block";
    }
}

function showLoginDialog(){
    $("#logindialog").show();
    $("#logindialog").dialog({
        modal: true,
        width: 'auto'
    });
}

function loadCookie() {
    let user = getCookie(user_cookie_name);
    login(user);
}