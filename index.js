import * as main from "/main.js";

var advancedMode = false;
export function expandContract(){
    advancedMode=!advancedMode;
    let el = document.getElementById("simple-search")
    el.classList.toggle('expanded')
    el.classList.toggle('collapsed')

    let el2 = document.getElementById("advanced-search")
    el2.classList.toggle('expanded')
    el2.classList.toggle('collapsed')
    
}

expandContract()

const searchBox = document.getElementById("search-box");
searchBox.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    simpleSearchFunction();
  }
});

function simpleSearchFunction() {
    if(main.isSearchError())return;
  
    main.deleteAllTiles();
  
    var searchBoxValue = searchBox.value.toLowerCase();
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
    document.documentElement.scrollTop = document.getElementById("groupDiv").offsetTop-4;
  }

  
//retune function
function getSimpleSearchRating(opportunity, search) {
    var value = 0;
  
    //TODO: retune this
    for (var i = 0; i < search.length; i++) {
      value += 5 * countInstances(opportunity.description.toLowerCase(), search[i]);
      value += 20 * countInstances(opportunity.title.toLowerCase(), search[i])
      value += 6 * countInstances(opportunity.address.toLowerCase(), search[i])
      value += 10 * countInstances(opportunity.website.toLowerCase(), search[i])
      value += 30 * countInstances(opportunity.zipcode.toLowerCase(), search[i])
    }
    opportunity.searchRating = value;
    return value;
  }

  function countInstances(string, word) {
    return string.split(word).length - 1;
  }