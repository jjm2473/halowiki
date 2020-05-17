$(document).ready(function() {

    var params = new URLSearchParams(location.search);

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
/* QUERY */

function show_def(word) {
    $("#footer").hide();
    if (!word) {
        $("#worddef").html('');
        return;
    }

    show_builtin("wiki_loading", function () {
        document.title = word + ' - Halo Wiki';
        getConfig(config => {
            var url = config.defaultSite;
            var site = config.sites.filter(s=>s.url==url)[0] || {url:url, name:url};
            show_wiki(site, word);
        }, error => {
            show_error(error.message);
        });
    });
}

function wiki_path(encodedWord) {
    return 'index.php?title=' + encodedWord;
}

function edit_path(encodedWord) {
    return wiki_path(encodedWord) + '&veaction=edit';
}

function show_error(info) {
    $("#worddef").html('<p style="color:red">' + info + '</p>');
}

function show_wiki(site, word) {
    var encodedWord = encodeURIComponent(word);
    var wikihost = site.url;
    var baseUrl = new URL(wikihost);
    $.ajax({
        url: wikihost + 'api.php?action=parse&format=json&redirects=1&disabletoc=1&page=' + encodedWord,
        dataType: "json",
        success: function(data) {
            $("#site-link").attr('href', wikihost).text(site.name);
            $("#footer").show();
            if (data.error) {
                if (data.error.code === 'missingtitle') {
                    $("#worddef").html('<h1>词条不存在，<a href="' + wikihost + edit_path(encodedWord) + '" target="_blank">创建</a></h1>');
                } else {
                    $("#worddef").html('<p style="color:red">' + data.error.info + '</p>');
                }
            } else {
                $("#wordtitle").html(data.parse.displaytitle);
                var redirects = '';
                if (data.parse.redirects && data.parse.redirects.length > 0) {
                    redirects = '<span class="small">(' 
                        + data.parse.redirects.map(e=>e.from).map(k=>'<a href="' + wikihost + wiki_path(encodeURIComponent(k)) + '&redirect=no" target="_blank">' + k + '</a>').join('/')
                            + ')</span>';
                }
                $("#worddef").html('<div><h1 id="' + word + '">' + data.parse.displaytitle + '&nbsp;<a style="float: right;" href="' + wikihost + edit_path(encodeURIComponent(data.parse.title)) + '" target="_blank">编辑</a>' 
                    + redirects + '</h1><hr/>' 
                    + data.parse.text["*"] 
                    + '</div>');
                fix_links(baseUrl, '#worddef .mw-parser-output a');
                fix_imgs(baseUrl, '#worddef .mw-parser-output img');
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
        } else if (origHref.startsWith('#')) {
            // in page hash link
            //a.href = 'javascript:void(0);';
            //a.onclick = scrollTo.bind(null, origHref);
        } else {
            a.href = new URL(origHref, baseUrl).href;
            a.target = '_blank';
        }
    });
}

function fix_imgs(baseUrl, selector) {
    $(selector).each(function(i,a) {
        if (a.attributes.srcset) {
            a.srcset = a.attributes.srcset.value.split(', ')
                .map(s=>s.replace(' ','#'))
                .map(s=>new URL(s, baseUrl).href)
                .map(s=>s.replace('#', ' '))
                .join(', ');
        }
        if (a.attributes.src) {
            var origHref = a.attributes.src.value;
            a.src = new URL(origHref, baseUrl).href;
        }
    });
}

function is_wiki(baseUrl, href) {
    if (!href.startsWith('/')) {
        return;
    }
    var candidate = null;
    if (href.startsWith('/wiki/') && href.indexOf('?') == -1) {
        // wikipedia
        candidate = href.substring(6);
    } else if (href.startsWith(baseUrl.pathname)) {
        var word = href.substring(baseUrl.pathname.length);
        if (word.startsWith('index.php?title=') && href.indexOf('&') == -1) {
            // wiki.citydatum.com
            return word.substring('index.php?title='.length);
        }
        if (word.indexOf('?') == -1) {
            if (word.startsWith('wiki/')) {
                // wikipedia, fandom, etc.
                candidate = word.substring(5);
            } else if (word.indexOf('/')) {
                // zh.moegirl.org, minecraft-zh.gamepedia.com
                candidate = word;
            }
        }
    }
    if (candidate) {
        if (!candidate.endsWith('.php') && candidate.indexOf('.php#') == -1 && !candidate.startsWith('File:')) {
            // zh.moegirl.org, minecraft-zh.gamepedia.com
            return candidate;
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
