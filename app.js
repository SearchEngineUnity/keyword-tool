var keywords = [];
var headers = [];
var leftover = [];
var matched = [];
var purgedHeaders = [];
var fileUploaded = false;

new ClipboardJS(".copy")

// Paste fix for contenteditable
$(document).on('paste', '[contenteditable]', function (e) {
  e.preventDefault();

  if (window.clipboardData) {
      content = window.clipboardData.getData('Text');        
      if (window.getSelection) {
          var selObj = window.getSelection();
          var selRange = selObj.getRangeAt(0);
          selRange.deleteContents();                
          selRange.insertNode(document.createTextNode(content));
      }
  } else if (e.originalEvent.clipboardData) {
      content = (e.originalEvent || e).clipboardData.getData('text/plain');
      document.execCommand('insertText', false, content);
  }        
});

$(document).ready(function(){
  $("#reverseCopyAll").click(function(){
    reversePrint();
    $("#copyAll").click();
    reversePrint();
  })

  $("#copyPurgeAll").click(function(){
    $("#copyAll").click();
    $("#purgeAll").click();
  })

  $("#purgeAll").click(function(){
    var purgedList = []
    // console.log($(this).data("id"))
    $(".headerTag").each(function(i, el){
      var header = $(this).html().replace(/\s\-\s[0-9]*\s\bkws\b/g, "")
      purgedHeaders.push(header)
    })
    
    $("#entry").find("tr").each(function(i, el){
      var column = $(this).find('td'),
      keyword = column.eq(0).html()
      purgedList.push(keyword)

    })

    keywords = keywords.filter(el=>purgedList.indexOf(el.keyword) === -1 )
    // console.log(keywords)

    //prints headers
    $("#removedGroups").empty()
    for (var header of purgedHeaders) {
      $("#removedGroups").append(header + "<br>")
    }

    $("#myspan").empty()
    $('#submit').click(); //fakes a click or use .trigger("click") to fake stuff    
  })


  $("#copyAll").click(function(){
    
    $(".hideUsing").hide()
    $("#hide").trigger("click")
    setTimeout(function(){
      $(".hideUsing").show()
    },500)
  })
  
  $("#submit").click(function(){
    var inputs = $("#myspan").html().split("<br>")
    console.log(inputs)
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
        var regex = new RegExp(convertToRegExp(header.keyword), "i")
        
        // console.log(regex)
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
    // alert("Groups are now compiled.");
  })

  //binds the function to the document so that later appends can use it. (never needs to be readded always availible)
  $(document).on("click", ".purge", function() {
    var purgedList = []
    // console.log($(this).data("id"))
    var groupId = $(this).data("id")
    var getId = $(this).data("id").match(/\d+/)[0]
    // console.log(getId)
    $("#table" + getId).find("tr").each(function(i, el){
      var column = $(this).find('td'),
      keyword = column.eq(0).html()
      purgedList.push(keyword)

    })
    // console.log(purgedList)
    
    keywords = keywords.filter(el=>purgedList.indexOf(el.keyword) === -1 )
    // console.log(keywords)
    var wow = $("#" + groupId).find("h1").html().replace(/\s\-\s[0-9]*\s\bkws\b/g, "")
    // console.log(wow)
    purgedHeaders.push(wow)
    //prints headers
    $("#removedGroups").empty()
    for (var header of purgedHeaders) {
      $("#removedGroups").append(header + "<br>")
    }
    // console.log($("#myspan").text().split("<br>"))
    // remove header from search input box
    var inputs = $("#myspan").html().split("<br>").filter(x => x !== wow).join("<br>")

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
  // var clipboardText = ""
  // console.log(headers)
  for (var [i, el] of headers.entries()) {
    // console.log(i, el)
    var id = "group" + (i+1)
    var tableId = "table" + (i+1)

    // $("#container").append(
    //   $(`<div id=${id}>`).append($(`<h1 class="headerTag">${el.keyword} - ${el.items.length} kws</h1>`))
    //                     .append($(`<div class='topple overflow-auto border border-dark'><table id=${tableId}></div>`))
    //                     // .append($(`<h3 id="spacing">&shy;</h3>`))
    //                     // .append($(`<br>`))
    //                     // .append($(`<button type='button' data-clipboard-target='#${tableId}' data-id='${id}' class='btn btn-secondary btn-sm copy purge'>Copy/Purge</button>`))
    //                     // .append($(`<button type='button' data-clipboard-target='#${tableId}' class='btn btn-secondary btn-sm copy'>Copy</button>`))
    //                     // .append($(`<button type='button' data-id='${id}' class='btn btn-secondary btn-sm purge'>Purge</button>`))
    // )
    console.log(i, headers.entries())
    if(i !== (headers.length -1)) {
      $("#container").append(
        $(`<div id=${id}>`).append($(`<h1 ${el.items.length? 'class="headerTag"' : 'class="headerTag hideUsing"'}>${el.keyword} - ${el.items.length} kws</h1>`))
                          .append($(`<div ${el.items.length? 'class="topple overflow-auto border border-dark"' : 'class="topple overflow-auto border border-dark hideUsing"'}><table id=${tableId}></div>`))
                          // .append($(`<h3 id="spacing">&shy;</h3>`))
                          .append($(`${el.items.length? `<br>` : '<div/>'}`))
                          // .append($(`<button type='button' data-clipboard-target='#${tableId}' data-id='${id}' class='btn btn-secondary btn-sm copy purge'>Copy/Purge</button>`))
                          // .append($(`<button type='button' data-clipboard-target='#${tableId}' class='btn btn-secondary btn-sm copy'>Copy</button>`))
                          // .append($(`<button type='button' data-id='${id}' class='btn btn-secondary btn-sm purge'>Purge</button>`))
      )
      console.log('not last')
    } else {
      $("#container").append(
        $(`<div id=${id}>`).append($(`<h1 ${el.items.length? 'class="headerTag"' : 'class="headerTag hideUsing"'}>${el.keyword} - ${el.items.length} kws</h1>`))
                          .append($(`<div ${el.items.length? 'class="topple overflow-auto border border-dark"' : 'class="topple overflow-auto border border-dark hideUsing"'}><table id=${tableId}></div>`))
      )
        console.log('last')
    }

    for (var w of el.items) {
      $(`#${tableId}`).append(`<tr><td>${w.keyword}</td><td>${w.volume}</td></tr>`)
    }
    
    // clipboardText += $(`#${id}`).text()
    $(`#${id}`)
    .append($(`<button type='button' data-clipboard-target='#${tableId}' data-id='${id}' class='btn btn-secondary btn-sm copy purge hideUsing'>Copy/Purge</button>`))
    .append($(`<button type='button' data-clipboard-target='#${tableId, id}' class='btn btn-secondary btn-sm copy hideUsing'>Copy</button>`))
    .append($(`<button type='button' data-id='${id}' class='btn btn-secondary btn-sm purge hideUsing'>Purge</button>`))
  }
  // $('#copyAll').attr('data-clipboard-text', clipboardText)
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
    // alert ("Feeder List is now compiled.\nPress OK to print on screen.");
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
  $("#start").html("")
  $("#feeder").html("")
  // console.log(keywords)
  //pass element from keywords array to list if the el.keyword is not found in matched array
  var list = keywords.filter(el=>matched.indexOf(el.keyword) === -1 )
  // console.log(list)
  $('#start').append(`<h2>Feeder List - ${list.length} kws</h2>`)
  $('#feeder').append("<div id='main' class='overflow-auto border border-dark'><table id='original'></table></div>")
  for (var kw of list){
  $('#original').append(`<tr><td>${kw.keyword.trim()}</td><td>${kw.volume}</td></tr>`)
  }
  $('#feeder').append("<button type='button' data-clipboard-target='#original' class='btn btn-secondary btn-sm copy'>Copy</button>")
}


  //  var line = 'car, how, build &amp; deploy'; // needs to become a string as 'car &amp; build, how &amp; build, car &amp; deploy, how &amp; deploy'
  //  // words = [car, how, 'build &amp; deploy']

  // function findAllCartesianProduct() {
  //   // [car], [how], [build, deploy]
  //   // var cp = Combinatorics.cartesianProduct(["car"], ["how"], ["build", "deploy"])
  //   console.log(cp.toArray())
  //   // convertToRegExp()
  // }
  
  // findAllCartesianProduct();
   function convertToRegExp(line) {
      var regexp = '';
      var parts = line.toLowerCase().split(',');
      for (const part of parts) {
        regexp += regexp.length ? '|(' : '(';
        var keywords = part.split('+');
        for (const keyword of keywords) {
           regexp += '(?=.*\\b' + keyword.trim() + '\\b)';
        }
        regexp += '.*)';
      }
      return regexp;
    }
    
    // console.log(convertToRegExp(line));

function reversePrint (){
  $('#container > div').each(function() {
    $(this).prependTo(this.parentNode);
  });
}