var keywords = [];
var headers = [];
var fileUploaded = false;

$(document).ready(function(){
  //enter is 13
$("#myspan").keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if (keycode == 13) {
    var inputs = $("#myspan").html().split("<br>")
    console.log(inputs)
    headers = [];
    inputs.forEach(input => {
      if(input !== ""){
        headers.push({
          keyword: input.toLowerCase().trim(),
          items: []
        })      
      }
    });
    console.log(`headers array ${JSON.stringify(headers)}`)
    refershList()
    $("#myspan").val("")
  }
  })
  
  $("#submit").click(function(){
    for (var word of keywords){
      word = word.keyword.toLowerCase();
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
    $("#container").append("<h1>" + header.keyword + "</h1>" + "<button type='button' class='btn btn-primary'>Copy/Purge</button>" +
    "<button type='button' class='btn btn-success'>Copy</button>" + "<button type='button' class='btn btn-danger'>Purge</button>") 
   
    $('#container').append("table").id("")
    for (var item of header.items) {
      $("#container").append("<li>" + item + "</li>")
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
  // var csv = event.target.result;
  // processData(csv);
  var result = $.csv.toArrays(event.target.result);
  keywords = result.map(([keyword, volume]) => ({keyword, volume}))
  keywords.shift()
  printCsv();
}

function printCsv() {
  $("#original")
  console.log(keywords)
  for (var kw of keywords){
  $('#original').append(`<tr><td>${kw.keyword}</td><td>${kw.volume}</td></tr>`)
  }
}

//Keyword Group input box
(function() {
  window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
  let onAddedElement = function(element) {
    if (!element.matches("span[contenteditable=true]"))
      return;
    new MutationObserver(function(mutationsList) {
      if (this.innerText === this.oldInnerText)
        return;
      this.oldInnerText = this.innerText;
      this.dispatchEvent(new Event("textchanged"));
    }.bind(element)).observe(element, { attributes: false, childList: true, subtree: true, characterData: true });
  }
  new MutationObserver(function(mutationsList) {
      for (let mutation of mutationsList) {
          for (let child of mutation.addedNodes) {
            if (!child.matches)
              continue;
            onAddedElement(child);
          }
      }
  }).observe(document.body, { attributes: false, childList: true, subtree: true });

  (function findElements(parent) {
    for (let child of parent.children) {
      if (child.matches)
        onAddedElement(child);
      findElements(child);
    }
    delete findElements;
  })(document.body);
})();

window.addEventListener("DOMContentLoaded", function() {
	let myspan = document.getElementById("myspan");
  myspan.addEventListener("textchanged", function() {
  	document.getElementById("hello").innerText = myspan.innerText;
  });
});

if (document.readyState === "complete") {
	window.dispatchEvent(new Event("DOMContentLoaded"));
	window.dispatchEvent(new Event("load"));
}