$(document).ready(function() {
    window.onhashchange = function() {
        $("#worddef").html('');
        show(location.hash.substring(1));
        $("#wordlist li").each((i,e)=>e.parentNode.href==location.href?e.classList.add("current"):e.classList.remove("current"));
    };
    if (location.hash) {
        window.onhashchange();
    } else {
        location.hash = '#rules';
    }
});

function show(page) {
    $.get("options/" + page + ".html", function(data) {
        $("#worddef").html(data);
    });
}