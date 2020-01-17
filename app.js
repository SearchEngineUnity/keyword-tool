var keywords = [];
var headers = [];
var leftover = [];
var matched = [];
var purgedHeaders = [];
var fileUploaded = false;

new ClipboardJS(".copy")

$(document).ready(function(){
  
  $("#submit").click(function(){
    var inputs = $("#myspan").html().split("<br>")
    headers = [];
    inputs.forEach(input => {
      if(input !== ""){
        headers.push({
          keyword: input.toLowerCase().trim(),
          items: []
        })      
      }
    });
    
    headers = headers.map(x => {
      return {
        keyword: x.keyword,
        items: []
      }
    })
    // console.log(headers)
    for (var kw of keywords){
      var word = kw.keyword.toLowerCase();
     
      for (var header of headers) {
        // var regex = new RegExp('\\b' + header.keyword + '\\b', "i")
        var cpKeyword = convertStringToCPString(header.keyword)
        var regex = new RegExp(convertToRegExp(cpKeyword), "i")
        
        console.log(regex)
        if (word.match(regex)){
          // console.log(word, header)
          var index = headers.findIndex(x=>x.keyword === header.keyword)
          headers[index].items.push(kw);
          matched.push(word)
 
          break;
        } 
      } 
    }
    refreshResultsList()
    printCsv()
  })

  //binds the function to the document so that later appends can use it. (never needs to be readded always availible)
  $(document).on("click", ".purge", function() {
    var purgedList = []
    console.log($(this).data("id"))
    var groupId = $(this).data("id")
    var getId = $(this).data("id").match(/\d+/)[0]
    // console.log(getId)
    $("#table" + getId).find("tr").each(function(i, el){
      var column = $(this).find('td'),
      keyword = column.eq(0).text()
      purgedList.push(keyword)

    })
    // console.log(purgedList)
    
    keywords = keywords.filter(el=>purgedList.indexOf(el.keyword) === -1 )
    // console.log(keywords)
    var wow = $("#" + groupId).find("h1").text()
    // console.log(wow)
    purgedHeaders.push(wow)
    //prints headers
    $("#removedGroups").empty()
    for (var header of purgedHeaders) {
      $("#removedGroups").append(header + "<br>")
    }
    // remove header from search input box
    var inputs = $("#myspan").html().split("<br>").filter(x => x !== wow).join("<br>")
    // console.log(inputs)

    $("#myspan").html(inputs)

    $('#submit').click(); //fakes a click or use .trigger("click") to fake stuff

  })
  
  $("#upload").bind("change", handleFiles 
  );
}) 

function errorHandler(event) {
  if(evt.target.error.name == "NotReadableError") {
    alert("Cannot read file!");
  }
}

function refreshResultsList() {
  $("#container").empty()
  // console.log(headers)
  for (var [i, el] of headers.entries()) {
    // console.log(i, el)
    var id = "group" + (i+1)
    var tableId = "table" + (i+1)
    $("#container").append(
      $(`<div id=${id}>`).append($(`<h1>${el.keyword}</h1>`))
                        .append($(`<div class='topple overflow-auto border border-dark'><table id=${tableId}></div>`))
                        .append($(`<button type='button' data-clipboard-target='#${tableId}' data-id='${id}' class='btn btn-primary copy purge'>Copy/Purge</button>`))
                        .append($(`<button type='button' data-clipboard-target='#${tableId}' class='btn btn-success copy'>Copy</button>`))
                        .append($(`<button type='button' data-id='${id}' class='btn btn-danger purge'>Purge</button>`))
    )
    for (var w of el.items) {
      $(`#${tableId}`).append(`<tr><td>${w.keyword}</td><td>${w.volume}</td></tr>`)
    }
  }
}
function getAsText(fileToRead) {
  var reader = new FileReader();
  reader.readAsText(fileToRead);
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
}
//fix handler confirm browser compatability 
function handleFiles(event) {
  var files = event.target.files 
  var file = files[0]
  if (window.FileReader) {
    getAsText(file);
    fileUploaded = true;
  } else {
    alert ("FileReader not supported in browser.");
  }
}

function loadHandler(event) {
  keywords = []
  matched = []
  leftover = []
  var result = $.csv.toArrays(event.target.result);
  keywords = result.map(([keyword, volume]) => ({keyword, volume}))
  keywords.shift()
  printCsv();
}

function printCsv() {
  $("#feeder").html("")
  // console.log(keywords)
  //pass element from keywords array to list if the el.keyword is not found in matched array
  var list = keywords.filter(el=>matched.indexOf(el.keyword) === -1 )
  // console.log(list)
  $('#feeder').append("<div id='main' class='overflow-auto border border-dark'><table id='original'></table></div>")
  for (var kw of list){
  $('#original').append(`<tr><td>${kw.keyword}</td><td>${kw.volume}</td></tr>`)
  }
  $('#feeder').append("<button type='button' data-clipboard-target='#original' class='btn btn-success copy'>Copy</button>")
}

var line = 'car, how, build &amp; deploy'; // needs to become a string as 'car &amp; build, how &amp; build, car &amp; deploy, how &amp; deploy'
// words = [car, how, 'build &amp; deploy']

function convertStringToCPString(line) {
  console.log(typeof line)
  var arr = []
  //from 'car, how, build &amp; deploy' to [["car"], ["how"], ["build", "deploy"]]
  var lineArr = line.toLowerCase().split('&amp;')
  
  lineArr.forEach(x => {
    if(x.match(',')) {
      let subArr = x.split(",")
      subArr.map(x => x.trim())
      arr.push(subArr)
    } else {
      arr.push([x.trim()])
    }
  }) //[['car'], ['how'], ['build', 'deploy']]
  
  var cp = Combinatorics.cartesianProduct(...arr).toArray()
  console.log(cp) //[['car', 'how', 'build'], ['car', 'how', 'deploy']]

  var newString = ''

  for (const el of cp) {
    newString += newString.length ? ", " : "";
    for ( const [i, x] of el.entries()) {
      if (i === 0) {
        newString += (x.trim() + ' ')
      } else {
        newString += ('&amp; ' + x.trim() + ' ')
      }
    }
  }

  console.log(newString)
  return newString
}

function convertToRegExp(line) {
  var regexp = '';
  var parts = line.toLowerCase().split(','); 
  for (const part of parts) {
    regexp += regexp.length ? '|(' : '(';
    var keywords = part.split('&amp;');
    for (const keyword of keywords) {
        regexp += '(?=.*\\b' + keyword.trim() + '\\b)';
    }
    regexp += '.*)';
  }
  return regexp;
}


