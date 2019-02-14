var request_times, limite_times = 5; // 已请求次数，请求失败次数
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    request_time = 1;
    if (request.translate && request.word) { // 请求获取翻译
      get_hj_translaton(request.word)
    } else if (request.addNewWord && request.word && request.comment) { // 请求添加生词
      var word = request.word;
      var comment = request.comment;
      request_add_new_word(word, comment);
    }
  })

function get_hj_translaton(word) {
  $.ajax("http://dict.hjenglish.com/w/" + word).
    success(function(data, status, xhr) {
      request_time = 1;
      deal_with_and_send(data);
    }).
    error(function(){
      if (request_time < limite_times) {
        request_time ++;
        get_hj_translaton(word);
      }
    })
};

function request_add_new_word(word, comment) {
  $.ajax({
    type: 'POST',
    dataType:'json',
    url:'http://dict.hjenglish.com/ajax/en/AddMyWord',
    contentType:'application/json;charset=utf-8',
    data: JSON.stringify({word: word, comment: comment, langs:11})
  }).success(function(data, response, xhr){
    request_time = 1;
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        addedWord: true
      })
    });
  }).error(function(){
    if (request_time < limite_times) {
      request_time ++;
      request_add_new_word(word, comment);
    }
  })
}

function deal_with_and_send(hjenglish_html) {
  var $hjpage = $(hjenglish_html);
  $hjpage.find("script").remove();
  var html = get_html_from($hjpage);

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {
      finished: true,
      got: true,
      translate_options: html });
  });
}

function get_html_from($hjpage) {
  var html;

  // 判断是否为各种词态校正原型
  if ($hjpage.find("#panel_regulate").length > 0) {
    html =  "<div>" +
              $hjpage.find("#word_info").html() +
            "</div>" +
            "<div class='comment'>" +
              $hjpage.find("#panel_comment").html() +
            "</div>" + 
            "<div>" +
              $hjpage.find("#panel_regulate").html() +
            "</div>";
  } else {
    html =  "<div>" +
              $hjpage.find(".word-details-pane-header").html() +
            "</div>";
  }
  return html.replace("href=\"javascript:void(0);\" onclick=\"NewAddMyWord();return false;\"", "class=\"hj-extension-addNewWord\" href=\"javascript: void(0);\"");
}