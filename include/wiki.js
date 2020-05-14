$(document).ready(function() {

    var params = new URLSearchParams(location.search);
    $(window).load(on_resize);
    $(window).resize(on_resize);

    /* Special fixes for Windows */
    if (get_OS() == "Windows") {
        $('html').addClass('windows');
    }

    show_def(params.get("q"));
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

function wiki_path(encodedWord) {
    return 'index.php?title=' + encodedWord;
}

function edit_path(encodedWord) {
    return wiki_path(encodedWord) + '&veaction=edit';
}

function show_wiki(word) {
    var encodedWord = encodeURIComponent(word);
    var baseUrl = new URL(wikihost);
    $.ajax({
        url: wikihost + 'api.php?action=parse&format=json&redirects=1&disabletoc=1&page=' + encodedWord,
        dataType: "json",
        success: function(data) {
            if (data.error) {
                if (data.error.code === 'missingtitle') {
                    $("#worddef").html('<h1>词条不存在，<a href="' + wikihost + edit_path(encodedWord) + '">创建</a></h1>');
                } else {
                    $("#worddef").html('<p style="color:red">' + data.error.info + '</p>');
                }
            } else {
                $("#wordtitle").html(data.parse.displaytitle);
                var redirects = '';
                if (data.parse.redirects) {
                    redirects = '<span class="small">(' 
                        + data.parse.redirects.map(e=>e.from).map(k=>'<a href="' + wikihost + wiki_path(encodeURIComponent(k)) + '&redirect=no">' + k + '</a>').join('/')
                            + ')</span>';
                }
                $("#worddef").html('<div><h1 id="' + word + '">' + data.parse.displaytitle + '&nbsp;<a style="float: right;" href="' + wikihost + edit_path(encodeURIComponent(data.parse.title)) + '">编辑</a>' 
                    + redirects + '</h1><hr/>' 
                    + data.parse.text["*"] 
                    + '</div>');
                fix_links(baseUrl, '#worddef .mw-parser-output a');
            }
        }
    });
}

function fix_links(baseUrl, selector) {
    $(selector).each(function(i,a) {
        if (!a.attributes.href) {
            return;
        }
        var origHref = a.attributes.href.value;
        if (origHref.startsWith(baseUrl.origin)) {
            origHref = origHref.substring(baseUrl.origin.length);
        }
        var encodedWord = is_wiki(baseUrl, origHref);
        if (encodedWord !== undefined) {
            // wiki
            a.href = '?q=' + encodedWord;
        } else if (origHref.startsWith('//')) {
            // external link
            a.href = baseUrl.protocol + origHref;
        } else if (origHref.startsWith('/')) {
            // inner link
            a.href = baseUrl.origin + origHref;
        } else if (origHref.startsWith('#')) {
            // in page hash link
            //a.href = 'javascript:void(0);';
            //a.onclick = scrollTo.bind(null, origHref);
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

function is_wiki(baseUrl, href) {
    if (!href.startsWith('/')) {
        return;
    }
    if (href.startsWith('/wiki/') && href.indexOf('?') == -1) {
        // wikipedia
        return href.substring(6);
    }
    if (href.startsWith(baseUrl.pathname)) {
        var word = href.substring(baseUrl.pathname.length);
        if (word.startsWith('index.php?title=') && href.indexOf('&') == -1) {
            // wiki.citydatum.com
            return word.substring('index.php?title='.length);
        }
        if (word.indexOf('?') == -1) {
            if (word.startsWith('wiki/')) {
                // wikipedia, fandom, etc.
                return word.substring(5);
            }

            if (word.indexOf('/') == -1 && !word.endsWith('.php') && word.indexOf('.php#') == -1 && !word.startsWith('File:')) {
                // zh.moegirl.org, minecraft-zh.gamepedia.com
                return word;
            }
        }
    }
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
