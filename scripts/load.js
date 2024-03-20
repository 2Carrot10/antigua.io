
const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR0asHvHVHwgNFDWpKgD0wV9k79Fiqs9Zvrjse3_KHMvhUtmvXFGOv0JQh3d7C01uPHlYTVvYkAo1lO/pub?gid=0&single=true&output=csv';


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

function downloadAndDisplayCSV() {
    fetch(csvUrl)
        .then(response => response.text()) // Get the text from the response
        .then(csvData => {
            var rows = parseCSV(csvData);
            localStorage.setItem('csvData', JSON.stringify(rows));

        })
        .catch(error => {
            console.error("Error fetching CSV data:", error);
        });
}

downloadAndDisplayCSV()