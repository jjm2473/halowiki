function is_chinese(word) {
    return (/^[\u4e00-\u9fa5]+$/g).test(word);
}

function is_english(word) {
    return (/^[a-z\sA-Z]+$/g).test(word);
}

function valid_word(word) {
    if (word.length === 0 || word.length > 190) {
        return false;
    }
    if (word.startsWith("https://") || word.startsWith("http://")) {
        return false;
    }
    if (is_chinese(word)) {
        return "Chinese";
    }
    if (is_english(word)) {
        return "English";
    }
    return "Mixed";
}

var haloword_opened = false;
var haloword_html = '<div id="haloword-lookup" class="ui-widget-content">\
<div id="haloword-title">\
<span id="haloword-word"></span>\
<div id="haloword-control-container">\
<a herf="#" id="haloword-add" class="haloword-button" title="加入单词表"></a>\
<a herf="#" id="haloword-remove" class="haloword-button" title="移出单词表"></a>\
<a href="#" id="haloword-open" class="haloword-button" title="在新窗口打开" target="_blank"></a>\
<a herf="#" id="haloword-close" class="haloword-button" title="关闭查询窗"></a>\
</div>\
<br style="clear: both;" />\
</div><div id="haloword-content"></div></div>';
$("body").append(haloword_html);

// deal with Clearly
document.addEventListener("DOMNodeInserted", function(event) {
    var element = event.target;
    if ($(element).attr("id") == "readable_iframe") {
        // HACK: wait for iframe ready
        setTimeout(function() {
            $("body", element.contentDocument).mouseup(event_mouseup);
            $("body", element.contentDocument).click(event_click);
            if ($(element).css('z-index') >= 2147483647) {
                var style = $(element).attr('style') + ' z-index: 2147483646 !important';
                $(element).attr('style', style);
            }
        }, 1000);
    }
});

$("body").mouseup(event_mouseup);
$("body").click(event_click);

function event_click(event) {
    if (haloword_opened) {
        var target = $(event.target);
        if (target.attr("id") != "haloword-lookup" && !target.parents("#haloword-lookup")[0]) {
            $("#haloword-lookup").hide();
            $("#haloword-remove").hide();
            $("#haloword-add").show();
            haloword_opened = false;
        }
    }
}

var icon_url = chrome.extension.getURL("style/icon.css");
var style_content = '<link rel="stylesheet" type="text/css" href="' + icon_url + '" />';
if ($("head")[0]) {
    $($("head")[0]).append(style_content);
}
else {
    $($("body")[0]).prepend(style_content);
}

$("#haloword-lookup").draggable({ handle: "#haloword-title" });

function get_selection() {
    var selection = $.trim(window.getSelection());
    if (!selection) {
        $("iframe").each(function() {
            if (this.contentDocument) {
                selection = $.trim(this.contentDocument.getSelection());
            }
            if (selection) {
                return false;
            }
        });
    }
    return selection;
}

$("#haloword-add").click(function() {
    $("#haloword-add").hide();
    $("#haloword-remove").show();
    var selection = get_selection();
    chrome.extension.sendMessage({method: "add", word: selection});
});
$("#haloword-remove").click(function() {
    $("#haloword-remove").hide();
    $("#haloword-add").show();
    var selection = get_selection();
    chrome.extension.sendMessage({method: "remove", word: selection});
});

function event_mouseup(e) {
    // chrome.storage.local.set({'disable_querybox': true})
    chrome.storage.local.get('disable_querybox', function(ret) {
        if (!ret.disable_querybox) {
            if (!e.ctrlKey && !e.metaKey) {
                return;
            }
            var selection = get_selection();
            var lang = valid_word(selection);
            if (!lang) {
                return;
            }

            $("#haloword-word").html(selection);
            var wikiUrl = chrome.extension.getURL('wiki.html') + '?q=' + encodeURIComponent(selection);

            var windowWidth = $(window).outerWidth(),
                halowordWidth = $("#haloword-lookup").outerWidth(),
                left = Math.min(windowWidth + scrollX - halowordWidth, e.clientX);
            $("#haloword-lookup").attr("style", "left: " + left + "px;" + "top: " + e.clientY + "px;");
            $("#haloword-open").attr("href", wikiUrl);
            $("#haloword-close").click(function() {
                $("#haloword-lookup").hide();
                $("#haloword-remove").hide();
                $("#haloword-add").show();
                haloword_opened = false;
                return false;
            });

            $("#haloword-remove").hide();

            $("#haloword-content").html('<iframe id="halowiki-frame" src="' + wikiUrl + '"></iframe>');
            $("#haloword-lookup").show();

            // HACK: fix dict window not openable
            setTimeout(function() {
                haloword_opened = true;
            }, 100);
        }
    });
}
