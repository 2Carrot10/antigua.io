var canUseWebWorker = (typeof (Worker) !== "undefined");
var serviceData = new Array();
const prefillServiceLearningOpportunitiesFeedbackUrl = "https://docs.google.com/forms/d/e/1FAIpQLScdaHfP6BeGAFyy3abi7YNacV48-gfRoezyBUzPY-OPuzRH_g/viewform?usp=pp_url&entry.576703126="
var ServiceLearningFeedback = "";
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0asHvHVHwgNFDWpKgD0wV9k79Fiqs9Zvrjse3_KHMvhUtmvXFGOv0JQh3d7C01uPHlYTVvYkAo1lO/pub?gid=0&single=true&output=csv';
const alertTimeFadeLengthLong = 1;
const alertTimeUntilFadeLong = 10;

const alertTimeFadeLengthShort = 1;
const alertTimeUntilFadeShort = 5;
var mostReccentAlertMessage;

var isSearchReady = false;
var isSearchBroken = false;

var tileTemplate;
var nothingFoundTemplate;
var dataNotRetrievedError;
var searchDataError;
var dataNotReadyError;

//todo: add advanced search
var params = new URLSearchParams(window.location.search);
var text = params.get('search'); 
document.getElementById('search-box').value = text;

fetchTemplates();
downloadAndDisplayCSV();

export function getServiceData() { return serviceData }


export async function fetchTemplates() {
    var templates = document.createElement('template')
    templates.innerHTML = await (await fetch('assets/templates.html')).text()
    tileTemplate = templates.content.querySelector('#tile-template');
    nothingFoundTemplate = templates.content.querySelector('#no-tiles');
    dataNotRetrievedError = templates.content.querySelector('#data-not-retrieved-error')
    searchDataError = templates.content.querySelector('#search-data-error')
    dataNotReadyError = templates.content.querySelector('#data-not-ready-error')
}

class opportunity {
    constructor(data) {
        this.data = data;
        this.title = data[0];
        this.minAge = data[1];
        this.description = data[2];
        this.website = data[4]
        this.address = data[3];
        this.zipcode = data[5];
        this.searchRating = 0;

        this.tags = new Array(0)

        if (data[6] != null) this.tags.push(data[6].replace(/(\r\n|\n|\r)/gm, ""));
        if (data[7] != null) this.tags.push(data[7].replace(/(\r\n|\n|\r)/gm, ""));
        if (data[8] != null) this.tags.push(data[8].replace(/(\r\n|\n|\r)/gm, ""));
    }
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

export function searchIsBroken() {
    createAlert(searchDataError, alertTimeFadeLengthLong, alertTimeUntilFadeLong);
}
export function searchNotReady() {
    createAlert(dataNotReadyError, alertTimeFadeLengthShort, alertTimeUntilFadeShort);
}

export function dataRetrievalError() {
    createAlert(dataNotRetrievedError, alertTimeFadeLengthLong, alertTimeUntilFadeLong);
}

function createAlert(template, timeToFade, timeUntilFade) {

    //ensures only one message is on screen at a time
    if ((null != mostReccentAlertMessage) && (null != mostReccentAlertMessage.parentNode)) {
        mostReccentAlertMessage.parentNode.removeChild(mostReccentAlertMessage);
    }
    let clone = template.content.cloneNode(true);
    let container = document.createElement('div');
    container.appendChild(clone);
    document.body.appendChild(container);
    mostReccentAlertMessage = container;
    removeFadeOut(container, timeToFade, timeUntilFade);
}

function removeFadeOut(el, timeToFade, timeUntilStart) {
    //TODO: clean evaluated code
    el.style = "opacity: 1;-webkit-transition: opacity 1000ms linear;transition: opacity " + (timeToFade * 1000) + "ms linear;";
    setTimeout(function () {
        el.style.opacity = 0;
    }, timeUntilStart * 1000)
    setTimeout(function () {
        if (null != el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }, (timeToFade + timeUntilStart) * 1000);
}

export function searchFunction() {
    if (window.getSelection) { window.getSelection().removeAllRanges(); }
    else if (document.selection) { document.selection.empty(); }
    //simpleSearchFunction();
    if (isSearchBroken) {
        searchIsBroken();
        return;
    }
    else if (!isSearchReady) {
        searchNotReady();
        return;
    }

}

export function highlightKeywords(text, keywords) {
    let highlightedText = text;
    keywords.forEach(function (keyword) {
        const regex = new RegExp(`(${keyword})`, 'gi'); // 'gi' for case-insensitive and global search
        highlightedText = highlightedText.replace(regex, `<span class="highlight">$1</span>`);
    });
    return highlightedText;
}

function ensureHttps(url) {
    // Check if the URL starts with 'http://' or 'https://'
    if (/^https?:\/\//i.test(url)) {
        return url; // URL is already complete with http or https
    } else {
        return 'https://' + url; // Add 'https://' to the URL
    }
}


export function deleteAllTiles() {
    var myNode = document.getElementById("groupDiv");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.lastChild);
    }
}
export function isSearchError() {
    if (isSearchBroken) {
        searchIsBroken();
        return true;
    }
    else if (!isSearchReady) {
        searchNotReady();
        return true;
    }
    return false;
}

export function renderNothingFoundCard() {
    let clone = nothingFoundTemplate.content.cloneNode(true);
    var myNode = document.getElementById("groupDiv");
    myNode.appendChild(clone);

}
export function renderOneTile(opp, highlightWords = []) {
    renderOneTileFromVal(opp.title,
        opp.description,
        opp.minAge,
        opp.address,
        opp.website,
        opp.zipcode,
        opp.tags, highlightWords);
}

async function renderOneTileFromVal(title, description, minAge, address, website, zipcode, tags, highlightWords) {
    await fetchTemplates()

    let clone = tileTemplate.content.cloneNode(true);
    clone.getElementById("minAge").innerHTML = minAge;
    clone.getElementById("description").innerHTML = highlightKeywords(description, highlightWords);
    clone.getElementById("title").innerHTML = highlightKeywords(title, highlightWords);
    clone.getElementById("website").innerHTML = highlightKeywords(website, highlightWords);
    clone.getElementById("website").setAttribute('href', website);

    //clone.getElementById("report-opportunity-link").setAttribute('href', prefillServiceLearningOpportunitiesFeedbackUrl + `${encodeURIComponent(title)}`);

    if (/\d/.test(address)) {
        clone.getElementById("address").innerHTML = "<a class=\"hyperlink\" href=" + "https://www.google.com/maps/search/?api=1&query=" + `${encodeURIComponent(address)}` + ">" + address + "<\a>"
    } else {
        clone.getElementById("address").innerHTML = address;
    }

    for (let i = 0; i < tags.length; i++) {
        if (tags[i] == "" || tags[i] == "\r") continue;
        let tagA = document.createElement("span");
        tagA.classList.add("category");
        tagA.innerHTML = tags[i];
        clone.getElementById("tags").appendChild(tagA);
    }
    var myNode = document.getElementById("groupDiv");
    myNode.appendChild(clone);
}

function parseCSV(str) {
    var arr = [];
    var quote = false;
    var row = 0;
    var col = 0;
    var c = 0;
    for (; c < str.length; c++) {
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
export function downloadAndDisplayCSV() {
    class opportunity {
        constructor(data) {
            this.data = data;
            this.title = data[0];
            this.minAge = data[1];
            this.description = data[2];
            this.website = data[4]
            this.address = data[3];
            this.zipcode = data[5];
            this.searchRating = 0;
    
            this.tags = new Array(0)
    
            if (data[6] != null) this.tags.push(data[6].replace(/(\r\n|\n|\r)/gm, ""));
            if (data[7] != null) this.tags.push(data[7].replace(/(\r\n|\n|\r)/gm, ""));
            if (data[8] != null) this.tags.push(data[8].replace(/(\r\n|\n|\r)/gm, ""));
        }
    }

    const rows = JSON.parse(localStorage.getItem('csvData'))

    for (let i = 1; i < rows.length; i++) {//skip heading row
        serviceData.push(new opportunity(rows[i]));
    }

    console.log(serviceData)

    isSearchReady = true;

}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

window.setupMap = function setupMap() {

    function setupMapDictionary() {
        let myNodes = mySvg[0].querySelectorAll('path[id]');
        for (var i = 0; i < myNodes.length; i++) {
            myNodes[i].setAttribute("data-selected", "false");
            myNodes[i].updateMapColor(this, false, false);
            zipDictionary.set(myNodes[i].id, false);
        }
    }
    var defaultMapColor = "#cccccc55";
    var defaultLineWidth = 1;
    var highlightMapColor = "#55555555";
    var highlightLineWidth = 2;
    var selectedMapColor = "#00ff0055";
    var selectedLineWidth = 1;
    var selectedAndHighlightedMapColor = "#00990055";
    var selectedAndHighlightedLineWidth = 2;
    var mySvg = document.getElementById("svgobject").contentDocument.querySelectorAll('svg');

    var myNodes = mySvg[0].querySelectorAll('path[id]');

    for (var i = 0; i < myNodes.length; i++) {

        //avoids clicing on tiny zipcodes
        if (i == 4 || i == 7 || i == 8) continue;
        /*myNodes[i].addEventListener('click', function () { updateMapColor(this, true, true) });
        myNodes[i].addEventListener("mouseover", function () { updateMapColor(this, true, false) }, false);
        myNodes[i].addEventListener("mouseout", function () { updateMapColor(this, false, false) }, false);*/
        myNodes[i].style.fill = defaultMapColor;
        zipDictionary.set(myNodes[i].id, false);
    }

    function updateMapColor(self, mouseOnElement, clicked) {

        //tiny zipcodes are part of larger zipcode so you can select them easily.
        if (self.id == "98104") {
            updateMapColor(self.parentNode.children[8], mouseOnElement, clicked)
            updateMapColor(self.parentNode.children[7], mouseOnElement, clicked)
            updateMapColor(self.parentNode.children[4], mouseOnElement, clicked)
        }
        var currentState = self.getAttribute("data-selected") === "true";
        if (clicked) {
            currentState = !currentState;
            self.setAttribute("data-selected", currentState.toString());
        }


        zipDictionary.set(self.id, currentState);

        if (mouseOnElement) {
            if (currentState) {
                self.style.fill = selectedAndHighlightedMapColor;
                self.setAttribute("stroke-width", selectedAndHighlightedLineWidth);
            } else {
                self.setAttribute("stroke-width", highlightLineWidth);
                self.style.fill = highlightMapColor;
            }
        }
        else {
            if (currentState) {
                self.style.fill = selectedMapColor;
                self.setAttribute("stroke-width", selectedLineWidth);
            } else {
                self.style.fill = defaultMapColor;
                self.setAttribute("stroke-width", defaultLineWidth);
            }
        }
    }

}

