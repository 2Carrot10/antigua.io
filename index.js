import * as main from "/main.js";

const searchBox = document.getElementById("search-box");
searchBox.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    simpleSearchFunction();
  }
});
function simpleSearchFunction() {
    if(main.isSearchError())return;
  
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
  
    main.getServiceData().sort(function (a, b) {
      var aVal = getSimpleSearchRating(a, searchForPhrases);
      var bVal = getSimpleSearchRating(b, searchForPhrases);
      return -(aVal - bVal);
    });
  
    var numberOfTiles = 0;
    for (let i = 0; i < main.getServiceData().length; i++) {
    if (main.getServiceData()[i].searchRating>0) {
        main.renderOneTile(main.getServiceData()[i]);
        numberOfTiles++;
    }
    }
    if (numberOfTiles == 0) {
        main.renderNothingFoundCard();
    }
    document.documentElement.scrollTop = document.getElementById("groupDiv").getBoundingClientRect().top-4;
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

  function countInstances(string, word) {
    return string.split(word).length - 1;
  }