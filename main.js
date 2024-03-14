//TODO: fix icon transperency
//TODO: clean code
//TODO: add category select
//TODO: add fullscreen mode
//TODO: add mobile scaling
//Age<9

let isSearchReady
var serviceData = new Array();

const alertTimeFadeLengthLong = .1;
const alertTimeUntilFadeLong = 10;

const alertTimeFadeLengthShort = 1;
const alertTimeUntilFadeShort = 5;
var mostReccentAlertMessage;

var tileTemplate;
var nothingFoundTemplate;
var dataNotRetrievedError;
var searchDataError;
var dataNotReadyError;


fetchTemplates();

async function fetchTemplates(){
    dataNotRetrievedError = templates.content.querySelector('#data-not-retrieved-error')
}


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
  let time1 = Date.now()
  console.log("search initiated");
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

  var searchForTags = document.getElementById("tagsBox").value.replace(/\s/g, '').toLowerCase().split(",");
  var searchForPhrases = document.getElementById("phraseBox").value.toLowerCase().split(",");
  for (var i = 0; i < searchForPhrases; i++) {
    searchForPhrases[i] = searchForPhrases[i].trim();
  }
  var myNode = document.getElementById("groupDiv");
  /*let dummyTop = document.createElement('div')
  dummyTop.classList = "h-0"
  dummyTop.id = 'dummyTop'
  myNode.appendChild(dummyTop)*/
  let currentTags = document.getElementById("tagsBox").value.split(",")
  if (currentTags.length > 0 && currentTags[0] != '') {



    let topkey = document.createElement('div')
    topkey.classList = "flex sticky top-0 bg-slate-200/70 h-fit rounded-lg p-2 backdrop-blur-sm z-50 -mb-2 -mx-2"
    currentTags.map((tag) => {
      let miniTag = document.createElement('div')
      miniTag.classList = "category flex pr-0 my-auto"
      miniTag.innerHTML = tag

      const template = document.getElementById("close");
      console.log('asdf')
      console.log(template)
      const clone = template.content.cloneNode(true);

      clone.querySelector('#button').addEventListener('click', () => {
        currentTags = currentTags.filter(item => item !== tag)
        document.getElementById('tagsBox').setAttribute('value', currentTags.join(', '))
        searchFunction()
      })

      miniTag.appendChild(clone)

      topkey.appendChild(miniTag)


    })
    const template = document.getElementById("trash");
    const clone = template.content.cloneNode(true);

    clone.querySelector('#button').addEventListener('click', () => {

      document.getElementById('tagsBox').setAttribute('value', '')
      searchFunction()
    })

    topkey.appendChild(clone)
    myNode.appendChild(topkey)
  } else {

  }



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
  if(numberOfTiles > 0){
    console.log(numberOfTiles)
    let time2 = Date.now()
    document.getElementById('results_number').innerHTML = 
    (numberOfTiles > 9 ? 
    ("About " + (Math.round(numberOfTiles/10)*10).toString() +" results")
    : numberOfTiles.toString() + (numberOfTiles == 1 ? " result" : " results"))
     + " (" +((time2 - time1)/1000).toString() + " seconds)"
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
    tagA.addEventListener('click', () => {
      let text = tagA.innerHTML.toLowerCase()

      let currentTags = document.getElementById("tagsBox").value.toLowerCase().split(",")

      if (!currentTags.includes(text)) {
        if (currentTags.length == 1 && currentTags[0] == '') {
          currentTags = [text]
        } else {
          currentTags.push(text)
        }
      }
      console.log(currentTags)

      document.getElementById('tagsBox').setAttribute('value', currentTags.join(', '))


    })
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
        isSearchReady = true
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


function dataRetrievalError() {
  let template = document.getElementById("data-not-retrieved-error");
  createAlert(template, alertTimeFadeLengthLong, alertTimeUntilFadeLong);
}


function createAlert(template, timeToFade, timeUntilFade) {

  //ensures only one message is on screen at a time
  if ((null != mostReccentAlertMessage) && (null != mostReccentAlertMessage.parentNode)) {
    mostReccentAlertMessage.parentNode.removeChild(mostReccentAlertMessage);
  }

  console.log(template)
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

let oldinput = ""
let times = 0
function loadChat() {
  //todo: make this update only on change
  setInterval(() => {
    if (!isSearchReady) {
      dataRetrievalError()
    }
    let testStr = document.getElementById('phraseBox').value
    + document.getElementById('titleBox').value
    + document.getElementById('minAgeBox').value
    + document.getElementById('tagsBox').value
    + document.getElementById('search mode').value
    if(oldinput != testStr || times == 0){
      oldinput = testStr
      times++
      searchFunction()
    }
  }, 100)
}