var words = [];
var headers = [];
var fileUploaded = false;


$(document).ready(function(){
  //enter is 13
$("#headinput").keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if (keycode == 13) {
    headers.push({
      keyword: $("#headinput").val().toLowerCase().trim(),
      items: []
    })
    refershList()
    $("#headinput").val("")
  }
  })
  
  $("#submit").click(function(){
    
    for (var word of words){
      word = word.toLowerCase();

      // var found = false;
      for (var header of headers) {
        // '\b' is the metacharacter for word boundary
        var regex = new RegExp('\\b' + header.keyword + '\\b', "i")
        console.log(regex)
        if (word.match(regex)){ 
          console.log(word, header)
          var index = headers.findIndex(x=>x.keyword === header.keyword)
          headers[index].items.push(word);
          // continue; 
          break;
        } 
      } 
    }
    refreshResultsList()
  })

  $("#upload").bind("change", handleFiles 
  );
}) 

function errorHandler(event) {
  if(evt.target.error.name == "NotReadableError") {
    alert("Cannot read file!");
  }
}

function refershList() {
  $("#headers").html("")
  for (var header of headers) {
    $("#headers").append("<li>" + header.keyword + "</li>")
  }
  }

function refreshResultsList() {
  $("#container").html("")
  for (var header of headers) {
    $("#container").append("<h1>" + header.keyword + "</h1><ul>") 
   
    for (var item of header.items) {
      $("#container").append("<li>" + item + "</li>")
    }
    $("#container").append("</ul>")
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
  // var csv = event.target.result;
  // processData(csv);
  var result = $.csv.toArrays(event.target.result);
  words = result.map(x=>x[0])
  words.shift()
  console.log(words);
}
