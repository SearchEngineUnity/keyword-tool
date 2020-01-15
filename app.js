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
    
    $("#myspan").val("")
  
    headers = headers.map(x => {
      return {
        keyword: x.keyword,
        items: []
      }
    })
    console.log(headers)
    for (var kw of keywords){
      var word = kw.keyword.toLowerCase();
     
      for (var header of headers) {
        // var regex = new RegExp('\\b' + header.keyword + '\\b', "i")
        var regex = new RegExp(convertToRegExp(header.keyword), "i")
        
        console.log(regex)
        if (word.match(regex)){
          console.log(word, header)
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
    console.log(getId)
    $("#table" + getId).find("tr").each(function(i, el){
      var column = $(this).find('td'),
      keyword = column.eq(0).text()
      purgedList.push(keyword)

    })
    console.log(purgedList)
    
    keywords = keywords.filter(el=>purgedList.indexOf(el.keyword) === -1 )
    console.log(keywords)
    var wow = $("#" + groupId).find("h1").text()
    console.log(wow)
    purgedHeaders.push(wow)
    $('#submit').click(); //fakes a click
    //also does not remove from input box
    
    
    
    //add headers to an array or purged headers
    
    // var timeout = $(this).data("id")
    // setInterval(function (){
    //   // $("#" + timeout).empty() 
    // },1000)
  })
  
  $("#upload").bind("change", handleFiles 
  );
}) 
 //we need to print purged headers on page

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
                        .append($(`<table id=${tableId}>`))
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
  $("#original").html("")
  console.log(keywords)
  //pass element from keywords array to list if the el.keyword is not found in matched array
  var list = keywords.filter(el=>matched.indexOf(el.keyword) === -1 )
  console.log(list)
  for (var kw of list){
  $('#original').append(`<tr><td>${kw.keyword}</td><td>${kw.volume}</td></tr>`)
  }
}

   // TRY THIS FUNCTION!!!
   var line = 'car, how, build & deploy';

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
    
    console.log(convertToRegExp(line));

