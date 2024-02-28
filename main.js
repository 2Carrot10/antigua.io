//TODO: fix icon transperency
//TODO: clean code
//TODO: add category select
//TODO: add fullscreen mode
//TODO: add mobile scaling
//Age<9

var serviceData = new Array();

class oppertunity {
    constructor(data) {
        this.data = data;
        this.title = data[0];
        this.minAge = data[1];
        this.description = data[2];
        this.website = data[4]
        this.address = data[3];
        //I got rid of zipcode
        if (data[8] == "\r")
            this.tags = new Array(3)
        this.tags = [data[6].replace(/(\r\n|\n|\r)/gm, ""), data[7].replace(/(\r\n|\n|\r)/gm, ""), data[8].replace(/(\r\n|\n|\r)/gm, "")];
    }


}

var progress = 0;
var hasRun = false;



function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {

        // Generate random number 
        var j = Math.floor(Math.random() * (i + 1));

        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    return array;
}


function searchFunction() {
    var numberOfTiles = 0;
    deleteTiles()
    console.log("search initiated");
    if (document.getElementById("search mode").selectedIndex == 0) {
        serviceData.sort(function (a, b) {
            console.log("0")
            var textA = a.title.toUpperCase();
            var textB = b.title.toUpperCase();
            return (textA > textB) ? 1 : (textA < textB) ? -1 : 0;
        });
    }
    else if (document.getElementById("search mode").selectedIndex == 1) {
        serviceData.sort(function (a, b) {
            var textA = a.title.toUpperCase();
            var textB = b.title.toUpperCase();
            return (textA < textB) ? 1 : (textA > textB) ? -1 : 0;
        });
    } else if (document.getElementById("search mode").selectedIndex == 2) {
        serviceData.sort(function (a, b) {
            var aT = a.description.length;
            var bT = b.description.length;
            return -(aT - bT);
        });
    }
    else if (document.getElementById("search mode").selectedIndex == 3) {
        serviceData.sort(function (a, b) {
            var aT = a.description.length;
            var bT = b.description.length;
            return (aT - bT);
        });
    }
    else {
        console.log("else")
        serviceData = shuffleArray(serviceData)

    }

    var searchForTags = document.getElementById("tagsBox").value.replace(/\s/g, '').toLowerCase().split(",");
    var searchForPhrases = document.getElementById("phraseBox").value.toLowerCase().split(",");
    for (var i = 0; i < searchForPhrases; i++) {
        searchForPhrases[i] = searchForPhrases[i].trim();
    }
    console.log(searchForTags)
    var myNode = document.getElementById("groupDiv");
    /*let dummyTop = document.createElement('div')
    dummyTop.classList = "h-0"
    dummyTop.id = 'dummyTop'
    myNode.appendChild(dummyTop)*/



    for (let i = 0; i < serviceData.length; i++) {

        var existsInTags = true;

        for (let j = 0; j < searchForTags.length; j++) {
            let q = [];
            for (let k = 0; k < serviceData[i].tags.length; k++) {
                if (serviceData[i].tags[k] != null) q[k] = serviceData[i].tags[k].replace(/\s/g, '').toLowerCase()
            }
            if (!q.includes(searchForTags[j])) existsInTags = false;

        }
        if (searchForTags == "") existsInTags = true;

        var existsInPhrases = true;
        for (let j = 0; j < searchForPhrases.length; j++) {

            if (!serviceData[i].description.toLowerCase().includes(searchForPhrases[j])) existsInPhrases = false;

        }
        var existsAge = (document.getElementById("minAgeBox").value == null || document.getElementById("minAgeBox").value == "" || isNaN(document.getElementById("minAgeBox").value) || document.getElementById("minAgeBox").value == "" || isNaN(document.getElementById("minAgeBox").value) || (parseInt(serviceData[i].minAge) <= parseInt(document.getElementById("minAgeBox").value)));

        if (serviceData[i] != null && existsInTags &&
            existsInPhrases &&
            serviceData[i].title.toLowerCase().includes(document.getElementById("titleBox").value.toLowerCase()) &&
            existsAge
        ) {
            renderOneTile(searchForPhrases, serviceData[i].title, serviceData[i].description, serviceData[i].minAge, serviceData[i].address, serviceData[i].website, serviceData[i].tags, false);
            numberOfTiles++;
        }
    }
    if (numberOfTiles == 0) {

        let template = document.getElementById("no tiles");
        let clone = template.content.cloneNode(true);
        var myNode = document.getElementById("groupDiv");
        myNode.appendChild(clone);


    }
    /*
    for (let i = 0; i < searchData.length; i++) {
      if(searchData[i]!=null)if((searchData[i].title!=null) && (searchData[i].title != ""))
    }*/
    //document.documentElement.scrollTop = 620;
}
//https://docs.google.com/spreadsheets/d/e/2PACX-1vR0asHvHVHwgNFDWpKgD0wV9k79Fiqs9Zvrjse3_KHMvhUtmvXFGOv0JQh3d7C01uPHlYTVvYkAo1lO/pub?gid=0&single=true&output=csv
function createPannel() {
    const para = document.createElement("p");
    const node = document.createTextNode("This is new.");
    para.appendChild(node);

    const element = document.getElementById("div1");
    element.appendChild(para);
}
function deleteTiles() {
    var myNode = document.getElementById("groupDiv");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }

}

window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
        document.getElementById("myBtn").style.display = "block";
    } else {
        document.getElementById("myBtn").style.display = "none";
    }
}

function renderOneTile(phrases, title, description, minAge, address, website, tags, minView) {

    let template = document.getElementById("tileTemplate");
    let clone = template.content.cloneNode(true);
    clone.getElementById("minAge").innerHTML = minAge;
    clone.getElementById("description").innerHTML = phrases[0] != '' ? highlightKeywords(description, phrases) : description
    clone.getElementById("title").innerHTML = phrases[0] != '' ? highlightKeywords(title, phrases) : title
    clone.getElementById("website").innerHTML = phrases[0] != '' ? highlightKeywords(website, phrases) : website;
    clone.getElementById("websiteURL").setAttribute('href', website);
    clone.getElementById("address").innerHTML = address;
    clone.getElementById("addressURL").setAttribute('href', "https://www.google.com/maps/search/?api=1&query=" + `${encodeURIComponent(address)}`);
    for (let i = 0; i < tags.length; i++) {//test
        if (tags[i] == "" || tags[i] == "\r") continue;
        let tagA = document.createElement("span");
        tagA.classList.add("category");
        tagA.innerHTML = tags[i];
        clone.getElementById("tags").appendChild(tagA);
    }

    var myNode = document.getElementById("groupDiv");
    myNode.appendChild(clone);
}


function addItemToTags() {

}

function csvFind() {
    var url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0asHvHVHwgNFDWpKgD0wV9k79Fiqs9Zvrjse3_KHMvhUtmvXFGOv0JQh3d7C01uPHlYTVvYkAo1lO/pub?gid=0&single=true&output=csv';
    var a = document.createElement("a");
    a.href = url;
    fileName = url.split("/").pop();
    alert(fileName);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}


function parseCSV(str) {
    var arr = [];
    var quote = false;
    for (var row = col = c = 0; c < str.length; c++) {
        var cc = str[c], nc = str[c + 1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        if (cc == '"') { quote = !quote; continue; }
        if (cc == ',' && !quote) { ++col; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }

        arr[row][col] += cc;
    }
    return arr;
}
async function downloadAndDisplayCSV(url) {
    //let a= /(?!\B"[^"]*),(?![^"]*"\B)/g //finds , outside ""
    //let b = /"/g
    //let c = /("[^"\n]*)\r?\n(?!(([^"]*"){2})*[^"]*$)/; //finds new lines inside ""

    await fetch(url)
    .then(response => response.text()) // Get the text from the response
    .then(csvData => {

        rows = parseCSV(csvData);
        for (let i = 1; i < rows.length; i++) {//skip heading row
            serviceData.push(new oppertunity(rows[i]));


        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
    loadChat()
    
}

// Replace 'url_to_csv_file' with the actual URL of the CSV file you want to download and display
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0asHvHVHwgNFDWpKgD0wV9k79Fiqs9Zvrjse3_KHMvhUtmvXFGOv0JQh3d7C01uPHlYTVvYkAo1lO/pub?gid=0&single=true&output=csv';

downloadAndDisplayCSV(csvUrl);

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function handleFiles(files) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        const textNode = document.createElement("p"); // Create a paragraph element for displaying text
        textNode.classList.add("text");
        const element = document.getElementById("div1");
        element.appendChild(textNode); // Assuming that "div1" is the div output where the content will be displayed.

        const reader = new FileReader();
        reader.onload = (e) => {
            textNode.innerText = e.target.result; // Set the text content with the file content
        };
        reader.readAsText(file);
    }
}

function highlightKeywords(text, keywords) {
    let highlightedText = text;
    keywords.forEach(function (keyword) {
        const regex = new RegExp(`(${keyword})`, 'gi'); // 'gi' for case-insensitive and global search
        highlightedText = highlightedText.replace(regex, `<span class="highlight">$1</span>`);
    });
    return highlightedText;
}



function loadChat() {
    searchFunction()
    //dummyTop.scrollIntoView({behavior:'smooth'});        
    document.getElementById("phraseBox").addEventListener("input", function () {
        searchFunction()
        console.log('runs')
    })
    document.getElementById("search mode").addEventListener("input", function () {
        searchFunction()
        console.log('runs')
    })
}