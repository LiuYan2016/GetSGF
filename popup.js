// JavaScript source code

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  var current = tabs[0];
  url = current.url;
  console.log(url);
  getPageSource(url);



});


function click(e) {
  chrome.tabs.executeScript(null,
      {code:"document.body.style.backgroundColor='" + e.target.id + "'"});
  window.close();
}

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
});


function getPageSource(url) {
  var format = "text";

  var onResponseReceived = function () {

    this.onload = this.onerror = this.ontimeout = null;
    // xhr for local files gives status 0, but actually succeeds
    var status = this.status || 200;
    if (status < 200 || status >= 300) {
      return;
    }
    // consider an empty result to be an error
    if (this.response.byteLength == 0) {
      return;
    }

    console.log(this.response);
    getSGF(this.response);
    return;
  };

  var onErrorReceived = function () {

    this.onload = this.onerror = this.ontimeout = null;
    return;
  };

  var xhrTimeout = 30000;
  // The function specified in jsonCallback will be called with a single argument representing the JSON object
  var xhr = new XMLHttpRequest();
  try {
    xhr.open('get', url, true);
    xhr.timeout = xhrTimeout;
    xhr.onload = onResponseReceived;
    xhr.onerror = onErrorReceived;
    xhr.ontimeout = onErrorReceived;
    xhr.responseType = format;
    xhr.setRequestHeader("Origin", "*");
    xhr.send();
  } catch (e) {
    onErrorReceived.call(xhr);
  }
}

function getSGF(text){
  var patt1 = /(http:\/\/duiyi.sina.com.cn\/cgibo)(.*\n?)(\.sgf)/g;
  var array1 = text.match(patt1);
  console.log(array1);

  var patt2 = /(<td width="74" height="25"><div align='center'>)(.*\n?)(<\/div><\/td>)/g;
  var array2 = text.match(patt2);

  date = [];
  for (i = 0; i < array2.length; i ++) {
    date[i] = array2[i].slice(47, -11)
  }

  console.log(date);

  var patt3 = /(<div align="center">)(.*\n?)(<\/div><\/a><\/td>)/g;
  var array3 = text.match(patt3);

  array4 = [];
  for (i = 0, j = 0; i < array3.length; i += 3, j ++) {
    black = array3[i].slice(20, -15);
    white = array3[i + 1].slice(20, -15);
    game = array3[i + 2].slice(20, -15);
    array4[j] = date[j] + "-" + black + "-" + white + "-" + game + ".sgf";
  }

  console.log(array4);
  for (i = 0, j = 0; i < array1.length; i += 3, j++) {
    chrome.downloads.download({
      url: array1[i],
      filename: "sgf6/" + array4[j]
    });
  }
//    document.getElementById("downloadSGF").setAttribute("href", array[i]);
//    document.getElementById("downloadSGF").click();

}
