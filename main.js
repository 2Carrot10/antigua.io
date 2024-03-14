var serviceData = new Array();
const prefillServiceLearningOpportunitiesFeedbackUrl = "https://docs.google.com/forms/d/e/1FAIpQLScdaHfP6BeGAFyy3abi7YNacV48-gfRoezyBUzPY-OPuzRH_g/viewform?usp=pp_url&entry.576703126="
var ServiceLearningFeedback = "";
var zipDictionary = new Map();
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

downloadAndDisplayCSV(csvUrl);

fetchTemplates();

async function fetchTemplates(){
  var templates = document.createElement( 'template' )
    templates.innerHTML = await ( await fetch('templates.html')).text()
    tileTemplate = templates.content.querySelector('#tile-template');
    nothingFoundTemplate = templates.content.querySelector('#no-tiles');
    dataNotRetrievedError = templates.content.querySelector('#data-not-retrieved-error')
    searchDataError = templates.content.querySelector('#search-data-error')
    dataNotReadyError = templates.content.querySelector('#data-not-ready-error')
}

const searchBox = document.getElementById("search-box");
searchBox.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    simpleSearchFunction();
  }
});

class oppertunity {
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

/*var array = []
var checkboxes = document.querySelectorAll('input[type=checkbox]:checked')
 
for (var i = 0; i < checkboxes.length; i++) {
  array.push(checkboxes[i].value)
}
 
*/


function searchIsBroken() {
  createAlert(searchDataError, alertTimeFadeLengthLong, alertTimeUntilFadeLong);
}
function searchNotReady() {
  createAlert(dataNotReadyError, alertTimeFadeLengthShort, alertTimeUntilFadeShort);
}

function dataRetrievalError() {
  createAlert(dataNotRetrievedError, alertTimeFadeLengthLong, alertTimeUntilFadeLong);
}

function createAlert(template, timeToFade, timeUntilFade) {

  //ensures only one message is on screen at a time
  if ((null != mostReccentAlertMessage) && (null != mostReccentAlertMessage.parentNode)) {
    mostReccentAlertMessage.parentNode.removeChild(mostReccentAlertMessage);
  }
  console.log(template);
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

function simpleSearchFunction() {

  if (isSearchBroken) {
    searchIsBroken();
    return;
  }
  else if (!isSearchReady) {
    searchNotReady();
    return;
  }

  deleteAllTiles();

  var searchBoxValue = document.getElementById("search-box").value;
  var searchForPhrases = [];
  searchForPhrases[1]=searchBoxValue;//extra weight is given to exact term instead of individual parts

  //complecated regex to split string into string array based on spaces outside of quotes.
  searchBoxValue.match(/(".*?"|[^" \s]+)(?=\s* |\s*$)/g).forEach(function (val, index) { searchForPhrases[index] = val.replaceAll("\"", "") });
  for (var i = 1; i < searchForPhrases.length; i++) {
    searchForPhrases[i] = searchForPhrases[i].trim();
  }

  serviceData.sort(function (a, b) {
    var aVal = getSimpleSearchRating(a, searchForPhrases);
    var bVal = getSimpleSearchRating(b, searchForPhrases);
    return -(aVal - bVal);
  });

  var numberOfTiles = 0;
  for (let i = 0; i < serviceData.length; i++) {
  if (serviceData[i].searchRating>0) {
    renderOneTile(serviceData[i].title, serviceData[i].description, serviceData[i].minAge, serviceData[i].address, serviceData[i].website, serviceData[i].zipcode, serviceData[i].tags, false);
    numberOfTiles++;
  }
  }
  if (numberOfTiles == 0) {
    let clone = nothingFoundTemplate.content.cloneNode(true);
    var myNode = document.getElementById("groupDiv");
    myNode.appendChild(clone);
  }
  document.documentElement.scrollTop = document.getElementById("groupDiv").getBoundingClientRect().top-4;

}

function countInstances(string, word) {
  return string.split(word).length - 1;
}

//retune function
function getSimpleSearchRating(oppertunity, search) {
  var value = 0;

  //TODO: retune this
  for (var i = 0; i < search.length; i++) {
    value += 5 * countInstances(oppertunity.description, search[i]);
    value += 20 * countInstances(oppertunity.title, search[i])
    value += 6 * countInstances(oppertunity.address, search[i])
    value += 10 * countInstances(oppertunity.website, search[i])
    value += 30 * countInstances(oppertunity.zipcode, search[i])
  }
  oppertunity.searchRating = value;
  return value;
}


function searchFunction(isAdvanced) {
  simpleSearchFunction();
  if (isSearchBroken) {
    searchIsBroken();
    return;
  }
  else if (!isSearchReady) {
    searchNotReady();
    return;
  }

  var advancedMode = false;
  var hasRun = false;


  var numberOfTiles = 0;
  deleteAllTiles();
  if (document.getElementById("search mode").selectedIndex == 0) {
    serviceData.sort(function (a, b) {
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
    serviceData = shuffleArray(serviceData)
  }
  var searchForTags = true//document.getElementById("tagsBox").value.replace(/\s/g, '').toLowerCase().split(",");
  var searchForPhrases = document.getElementById("phraseBox").value.toLowerCase().split(",");
  for (var i = 0; i < searchForPhrases; i++) {
    searchForPhrases[i] = searchForPhrases[i].trim();
  }

  for (let i = 0; i < serviceData.length; i++) {
    var existsInZip = zipDictionary.get(serviceData[i].zipcode);
    if (existsInZip == false) existsInZip = false;
    existsInZip = !!existsInZip;
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

    if (serviceData[i] != null && existsInTags && existsInZip &&
      existsInPhrases &&
      serviceData[i].title.toLowerCase().includes(document.getElementById("titleBox").value.toLowerCase()) &&
      existsAge
    ) {
      renderOneTile(serviceData[i].title, serviceData[i].description, serviceData[i].minAge, serviceData[i].address, serviceData[i].website, serviceData[i].zipcode, serviceData[i].tags, false);
      numberOfTiles++;
    }
  }
  if (numberOfTiles == 0) {
    let template = document.getElementById("no tiles");
    let clone = template.content.cloneNode(true);
    var myNode = document.getElementById("groupDiv");
    myNode.appendChild(clone);
  }
  document.documentElement.scrollTop = 620;
}

function deleteAllTiles() {
  var myNode = document.getElementById("groupDiv");
  while (myNode.firstChild) {
    myNode.removeChild(myNode.lastChild);
  }
}

function renderOneTile(title, description, minAge, address, website, zipcode, tags) {

  let clone = tileTemplate.content.cloneNode(true);
  clone.getElementById("minAge").innerHTML = minAge;
  clone.getElementById("description").innerHTML = description;
  clone.getElementById("title").innerHTML = title;
  clone.getElementById("website").innerHTML = website;
  clone.getElementById("website").setAttribute('href', website);

  clone.getElementById("report-oppertunity-link").setAttribute('href', prefillServiceLearningOpportunitiesFeedbackUrl + `${encodeURIComponent(title)}`);

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
function downloadAndDisplayCSV(url) {

  fetch(url)
    .then(response => response.text()) // Get the text from the response
    .then(csvData => {
      rows = parseCSV(csvData);

      for (let i = 1; i < rows.length; i++) {//skip heading row
        serviceData.push(new oppertunity(rows[i]));
      }

      isSearchReady = true;

    })
    .catch(error => {
      isSearchBroken = true;
      dataRetrievalError();
    });
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
    myNodes[i].addEventListener('click', function () { updateMapColor(this, true, true) });
    myNodes[i].addEventListener("mouseover", function () { updateMapColor(this, true, false) }, false);
    myNodes[i].addEventListener("mouseout", function () { updateMapColor(this, false, false) }, false);
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
