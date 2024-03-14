require("main.js");

function require(script) {
    $.ajax({
        url: script,
        dataType: "script",
        async: false,           // <-- This is the key
        success: function () {
            // all good...
        },
        error: function () {
            throw new Error("Could not load script " + script);
        }
    });
}



const searchBox = document.getElementById("search-box");
searchBox.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    simpleSearchFunction();
  }
});

function simpleSearchFunction() {

    if (isSearchBroken) {
      searchIsBroken();
      return;
    }
    else if (!isSearchReady) {
      searchNotReady();
      return;
    }
  
    main.deleteAllTiles();
  
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