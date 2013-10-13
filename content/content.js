var current_word, timer;
function getHjPage(word) {
  current_word = word;
  chrome.runtime.sendMessage({
    translate: true,
    word: word })
};

function render_translation(translate_options) {
  $("#hj-translation-pop-inserter .content").html(translate_options);
  setTimeout(function() {
    var images = $("#hj-translation-pop-inserter .content").find("img")
    for (var i = 0; i < images.length; i ++) {
      img = images[i];
      var origin_src = $(img).attr("src");
      var src = chrome.extension.getURL(origin_src);
      $(img).attr("src", src);
    }
    set_pop_disappear();
  }, 0)
};

function set_pop_disappear() {
  timer = setTimeout(function() {
    $(".hj-translation-pop-inserter").remove();
  }, 6000);
};

function render_net_error() {};

function renderPop(selectionInfo) {
  // 插入span relative定位元素
  var $anchorNode = selectionInfo.anchorNode;
  var word = selectionInfo.word;
  var offset = $anchorNode.html().indexOf(word) + word.length;
  var popDivHtml =
  '<span id="hj-translation-pop-inserter" class="hj-translation-pop-inserter">\
    <div class="hj-translation">\
      <div class="angle"></div>\
      <div class="content">资料查找中...</div>\
    </div>\
  </span>'

  var html = $anchorNode.html().substring(0, offset) +
               popDivHtml +
               $anchorNode.html().substring(offset);

  $(".hj-translation-pop-inserter").remove();
  $anchorNode.html(html);
};

function isEnglish(word) {
  return !!word.match(/^[a-zA-Z]+$/)
};

function getSelectionInfo() {
  var anchorNode = document.getSelection().anchorNode
  var $anchorNode = $(anchorNode).parent();
  var selectWord = document.getSelection().toString().replace(/\W/g, "");

  return {
    anchorNode: $anchorNode,
    word: selectWord }
};

function dealSelecton() {
  var selectionInfo = getSelectionInfo();
  var word = selectionInfo.word;
  if (isEnglish(word)) {
    renderPop(selectionInfo);
    getHjPage(word);
  }
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.finished && request.got) { // 获取翻译成功
      var translate_options = request.translate_options;
      render_translation(translate_options)
    } else if (request.finished) { // 获取翻译失败
      render_net_error();
    } else if (request.added) { //添加生词成功
      $("a.hj-extension-addNewWord").remove();
      timer = setTimeout(function() {
        $(".hj-translation-pop-inserter").remove();
      }, 6000);
    }
  })

document.body.addEventListener("dblclick", dealSelecton);

$(document).on("click", "a.hj-extension-addNewWord", function(event){
  if (timer) {
    clearTimeout(timer);
  }
  var comment = $("#hj-translation-pop-inserter .content .comment").text().replace(/ +/, " ");
  chrome.runtime.sendMessage({
    addNewWord: true,
    comment: comment,
    word: current_word
  })
})