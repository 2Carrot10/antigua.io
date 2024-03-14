import * as main from "/main.js";

const searchBox = document.getElementById("search-box");
searchBox.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    simpleSearchFunction();
  }
});

function simpleSearchFunction() {
    if(main.isSearchError())return;
    if (isSearchBroken) {
      main.searchIsBroken();
      return;
    }
    else if (!isSearchReady) {
      main.searchNotReady();
      return;
    }
  
    main.deleteAllTiles();
  
    var searchBoxValue = searchBox.value;
    var searchForPhrases = [];
    searchForPhrases[1]=searchBoxValue;//extra weight is given to exact term instead of individual parts
  
    //complecated regex to split string into string array based on spaces outside of quotes.
    searchBoxValue.match(/(".*?"|[^" \s]+)(?=\s* |\s*$)/g).
        forEach(
            function (val, index) { 
                searchForPhrases[index] = val.replaceAll("\"", "") 
            }
        );
    //purposfuly starts at 1, not zero. first element is already set.
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
      main.renderOneTile(serviceData[i].title, serviceData[i].description, serviceData[i].minAge, serviceData[i].address, serviceData[i].website, serviceData[i].zipcode, serviceData[i].tags, false);
      numberOfTiles++;
    }
    }
    if (numberOfTiles == 0) {
        main.renderNothingFoundCard();
    }
    document.documentElement.scrollTop = document.getElementById("groupDiv").getBoundingClientRect().top-4;
  
  }