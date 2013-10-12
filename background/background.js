chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.translate && request.word) {
      $.ajax("http://dict.hjenglish.com/w/" + request.word).
        success(function(data, status, xhr) {
          deal_with_and_send(data);
        })
    }
  })

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
            "<div>" +
              $hjpage.find("#panel_comment").html() +
            "</div>" + 
            "<div>" +
              $hjpage.find("#panel_regulate").html() +
            "</div>";
  } else {
    html =  "<div>" +
              $hjpage.find(".word_title").html() +
            "</div>" +
            "<div>" +
              $hjpage.find(".simple_content").html() +
            "</div>";
  }
  return html;
}