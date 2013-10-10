// var hjenglish_html;

// if (notHjenglish()) {
//   var iframeHtml ="<iframe id='hjenglish-extension-iframe' src='http://dict.hjenglish.com/w/english' style='display: none;'></iframe>"
//   $("html body").append(iframeHtml);
// }

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello") {
      sendResponse({farewell: "goodbye"});
      // if (isHjenglisth()) {
      //   $.ajax({
      //     type: 'POST',
      //     dataType:'json',
      //     url:'/ajax/en/AddMyWord',
      //     contentType:'application/json;charset=utf-8',
      //     data: JSON.stringify({word:'hello',comment:'n. 特权；优待；权益v. 给与…特权；特免',langs:11})
      //   })
      // }
    }
  }
);

function isHjenglisth() {
  return $(location).attr('href').indexOf("hjenglish.com/") != -1
};

function notHjenglish() {
  return !isHjenglisth();
};

function getSelectionInfo() {
  debugger
  var anchorNode = document.getSelection().anchorNode
  var $anchorNode = $(anchorNode).parent();
  // var offset = document.getSelection().anchorOffset;
  var selectWord = document.getSelection().toString().replace(/\W/g, "");

  return {
    anchorNode: $anchorNode,
    // offset: offset,
    word: selectWord
  }
};

function isEnglish(word) {
  return !!word.match(/^[a-zA-Z]+$/)
};

function getHjPage(word, selectionInfo, callback) {
  $.ajax("http://dict.hjenglish.com/w/" + word).
    success(function(data, status, xhr) {
      var hjenglish_html = data;
      callback(selectionInfo, hjenglish_html);
    })
};

function renderPop(selectionInfo, pageHtml) {
  // $(".hj-translation-pop-extention").remove();

  var $anchorNode = selectionInfo.anchorNode;
  var word = selectionInfo.word;
  var offset = $anchorNode.html().indexOf(word) + word.length;
  var popDivHtml =
  '<span style="position: relative;">\
    <div class="hj-translation-pop-extention">\
      <div class="angle"></div>\
      <div class="content"></div>\
    </div>\
  </span>'

  var html = $anchorNode.html().substring(0, offset) +
               popDivHtml +
               $anchorNode.html().substring(offset);

  if (!pageHtml) {
    $(".hj-translation-pop-extention").remove();
    $anchorNode.html(html)
  } else {
    var $hjpage = $("<div></div>").append(pageHtml);
    var html;

    // 判断是否为各种词态校正原型
    if ($hjpage.find("#panel_regulate").length > 0) {
      var $word_info = $hjpage.find("#word_info");
      var word_info_html = "<div>" + $word_info.html() + "</div>";

      var $panel_comment = $hjpage.find("#panel_comment");
      var panel_comment_html = "<div>" + $panel_comment.html() + "</div>";

      var $panel_regulate = $hjpage.find("#panel_regulate");
      var panel_regulate_html = "<div>" + $panel_regulate.html() + "</div>";

      html = word_info_html + panel_comment_html + panel_regulate_html
    } else {
      var $word_title = $hjpage.find(".word_title");
      var word_title_html = "<div>" + $word_title.html() + "</div>";

      var $simple_content = $hjpage.find(".simple_content");
      var simple_content_html = "<div>" + $simple_content.html()+ "</div>";

      html = word_title_html + simple_content_html;
    }

    $(".hj-translation-pop-extention .content").html(html);
  }
}

function dealSelecton() {
  var selectionInfo = getSelectionInfo();
  var word = selectionInfo.word;
  if (isEnglish(word)) {
    renderPop(selectionInfo, null)
    getHjPage(word, selectionInfo, renderPop);
  }
};


document.body.addEventListener("dblclick", dealSelecton)