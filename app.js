//When I purge I will purge from the Keywords
var keywords = [];
var headers = [];
var leftover = [];
var matched = [];
var fileUploaded = false;

$(document).ready(function(){
  //enter is 13
$("#myspan").keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if (keycode == 13) {
    var inputs = $("#myspan").html().split("<br>")
    // console.log(inputs)
    headers = [];
    inputs.forEach(input => {
      if(input !== ""){
        headers.push({
          keyword: input.toLowerCase().trim(),
          items: []
        })      
      }
    });
    // console.log(`headers array ${JSON.stringify(headers)}`)
    // refershList()
    $("#myspan").val("")
  }
  })
  
  $("#submit").click(function(){
    headers = headers.map(x => {
      return {
        keyword: x.keyword,
        items: []
      }
    })
    console.log(headers)
    for (var kw of keywords){
      var word = kw.keyword.toLowerCase();
      // var remove = keywords.findIndex(x=>x.keyword.toLowerCase() === word)
      // var found = false;
      for (var header of headers) {
        // '\b' is the metacharacter for word boundary
        //gmi as modifier did not work (m for multi line)
        //g as the modifier did not work (global)
        //i as the modifier did not work (in case sensitive)
        //\\w did not work
        //\w did not work
        //\\m did not work
        var regex = new RegExp('\\b' + header.keyword + '\\b', "i")
        console.log(regex)
        if (word.match(regex)){
          console.log(word, header)
          var index = headers.findIndex(x=>x.keyword === header.keyword)
          headers[index].items.push(kw);
          matched.push(word)
          // keywords.splice(remove, 1)
          // continue; 
          break;
        } 
      } 
    }
    refreshResultsList()
    printCsv()
  })

  $("#upload").bind("change", handleFiles 
  );
}) 

function errorHandler(event) {
  if(evt.target.error.name == "NotReadableError") {
    alert("Cannot read file!");
  }
}

// function refershList() {
//   $("#headers").html("")
//   for (var header of headers) {
//     $("#headers").append("<li>" + header.keyword + "</li>")
//   }
//   }

function refreshResultsList() {
  $("#container").empty()
  // console.log(headers)
  for (var [i, el] of headers.entries()) {
    // console.log(i, el)
    var id = "group" + (i+1)
    var tableId = "table" + (i+1)
    $("#container").append(
      $(`<div id=${id}>`).append($(`<h1>${el.keyword}</h1>`))
                        //  .append($(`<button type='button' class='btn btn-primary'>Copy/Purge</button>`))
                        //  .append($(`<button type='button' class='btn btn-success'>Copy</button>`))
                        //  .append($(`<button type='button' class='btn btn-danger'>Purge</button>`))
                          .append($(`<table id=${tableId}>`))
                        .append($(`<button type='button' class='btn btn-primary'>Copy/Purge</button>`))
                        .append($(`<button type='button' class='btn btn-success'>Copy</button>`))
                        .append($(`<button type='button' class='btn btn-danger'>Purge</button>`))
    )
    for (var w of el.items) {
      $(`#${tableId}`).append(`<tr><td>${w.keyword}</td><td>${w.volume}</td></tr>`)
    }
  }
  // for (var header of headers) {
  //   $("#container").append("<div>")
  //                   .append("<h1>")
  //   $("#container").append("<h1>" + header.keyword + "</h1>" + "<button type='button' class='btn btn-primary'>Copy/Purge</button>" +
  //   "<button type='button' class='btn btn-success'>Copy</button>" + "<button type='button' class='btn btn-danger'>Purge</button>") 
   
  //   $('#container').append("table").id("")
  //   for (var item of header.items) {
  //     $("#container").append("<li>" + item + "</li>")
  //   }

  // }
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

//Keyword Group input box
// (function() {
//   window.MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
//   let onAddedElement = function(element) {
//     if (!element.matches("span[contenteditable=true]"))
//       return;
//     new MutationObserver(function(mutationsList) {
//       if (this.innerText === this.oldInnerText)
//         return;
//       this.oldInnerText = this.innerText;
//       this.dispatchEvent(new Event("textchanged"));
//     }.bind(element)).observe(element, { attributes: false, childList: true, subtree: true, characterData: true });
//   }
//   new MutationObserver(function(mutationsList) {
//       for (let mutation of mutationsList) {
//           for (let child of mutation.addedNodes) {
//             if (!child.matches)
//               continue;
//             onAddedElement(child);
//           }
//       }
//   }).observe(document.body, { attributes: false, childList: true, subtree: true });

//   (function findElements(parent) {
//     for (let child of parent.children) {
//       if (child.matches)
//         onAddedElement(child);
//       findElements(child);
//     }
//     delete findElements;
//   })(document.body);
// })();

// window.addEventListener("DOMContentLoaded", function() {
// 	let myspan = document.getElementById("myspan");
//   myspan.addEventListener("textchanged", function() {
//   	document.getElementById("hello").innerText = myspan.innerText;
//   });
// });

// if (document.readyState === "complete") {
// 	window.dispatchEvent(new Event("DOMContentLoaded"));
// 	window.dispatchEvent(new Event("load"));
// }