function getHjPage(word) {
  chrome.runtime.sendMessage({
    translate: true,
    word: word })
};

function render_translation(translate_options) {
  $("#hj-translation-pop-inserter .hj-translation").html(translate_options);
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
    if (request.finished && request.got) {
      var translate_options = request.translate_options;
      render_translation(translate_options)
    } else if (request.finished) {
      render_net_error();
    }
  })

document.body.addEventListener("dblclick", dealSelecton);