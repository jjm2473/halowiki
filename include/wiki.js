$(document).ready(function() {

    var params = new URLSearchParams(location.search);
    console.log('params', params.toString());
    window.onhashchange = function() {
        var word = get_current_word();
        show_def(word);
    };
    $(window).load(on_resize);
    $(window).resize(on_resize);

    /* Special fixes for Windows */
    if (get_OS() == "Windows") {
        $('html').addClass('windows');
    }

    show_def(get_current_word());
});

function get_OS() {
    var ua = navigator.userAgent;
    var os;
    if (typeof process == "object") {
        os = "node-webkit";
    }
    else if (ua.indexOf("Windows") > 0) {
        os = "Windows";
    }
    else if (ua.indexOf("Mac OS X") > 0) {
        os = "Mac OS X";
    }
    return os;
}

/* UI */

function on_resize() {
    var OS = get_OS();
    if (OS == "Mac OS X") {
        $("#wordlist").height($(window).height() - 146);
    }
    else if (OS == "node-webkit") {
        $("#wordlist").height($(window).height() - 102);
    }
    else {
        $("#wordlist").height($(window).height() - 156);
    }
}

/* QUERY */
function get_current_word() {
    return decodeURIComponent(location.hash.substring(1));
}

function show_def(word) {
    if (!word) {
        $("#wordtitle").html('');
        $("#worddef").html('');
        return;
    }

    /* fixing a refresh issue. */
    window.word = word;

    show_builtin("wiki_loading", function () {
        document.title = word + " \u2039 Halo Word";
        $("#wordtitle").html(word);

        show_wiki(word);
    });
}

var wikihost = 'https://jjm2473.fandom.com/zh/';

function show_wiki(word) {
    var encodedWord = encodeURIComponent(word);
    var baseUrl = new URL(wikihost);
    $.ajax({
        url: wikihost + 'api.php?action=parse&format=json&redirects=1&disabletoc=1&page=' + encodedWord,
        dataType: "json",
        success: function(data) {
            if (data.error) {
                if (data.error.code === 'missingtitle') {
                    $("#worddef").html('<h1>词条不存在，<a href="' + wikihost + 'wiki/' + encodedWord + '?veaction=edit">创建</a></h1>');
                } else {
                    $("#worddef").html('<p style="color:red">' + data.error.info + '</p>');
                }
            } else {
                $("#wordtitle").html(data.parse.displaytitle);
                $("#worddef").html('<div><h1 id="' + word + '">' + data.parse.displaytitle + '&nbsp;<a style="float: right;" href="' + wikihost + 'wiki/' + encodedWord + '?veaction=edit">编辑</a></h1><hr/>' 
                    + data.parse.text["*"] 
                    + '</div>');
                fix_links(baseUrl, '#worddef .mw-parser-output a');
            }
        }
    });
}

function fix_links(baseUrl, selector) {
    var wikiPrefix = baseUrl.pathname + 'wiki/';
    $(selector).each(function(i,a) {
        var origHref = a.attributes.href.value;
        if (origHref.startsWith(wikiPrefix) && origHref.indexOf('#') == -1 && origHref.indexOf('?') == -1) {
            // wiki
            var encodedWord = origHref.substring(wikiPrefix.length);
            var hashIdx = encodedWord.indexOf('#');
            if (hashIdx != -1) {
                encodedWord = encodedWord.substring(0, hashIdx);
            }
            a.href = '#'+encodedWord;
        } else if (origHref.startsWith('//')) {
            // external link
            a.href = baseUrl.protocol + origHref;
        } else if (origHref.startsWith('/')) {
            // inner link
            a.href = baseUrl.origin + origHref;
        } else if (origHref.startsWith('#')) {
            // in page hash link
            a.href = 'javascript:void(0);';
            a.onclick = scrollTo.bind(null, origHref);
        } else if (origHref.indexOf('://') == -1) {
            var lastSlash = baseUrl.href.lastIndexOf('/');
            if (lastSlash == -1) {
                a.href = baseUrl.href + origHref;
            } else {
                a.href = baseUrl.href.substring(0, lastSlash+1) + origHref;
            }
        }
    });
}

function scrollTo(selector) {
    $(selector)[0].scrollIntoView();
}

function show_builtin(builtin, callback) {
    $.get("builtin/" + builtin + ".html", function(data) {
        $("#worddef").html(process_builtin(data));

        var title = $("#builtin-title").html();
        if (title) {
            $("#extradef").hide();
            $("#wordtitle").html(title);
            if (title != "Halo Word") {
                title = title + " \u2039 Halo Word";
            }
            document.title = title;
        }

        if (builtin == "welcome") {
            $("#toolbar").show();
        }

        if (callback) {
            callback();
        }
    });
}

function process_builtin(data) {
    return data;
}
