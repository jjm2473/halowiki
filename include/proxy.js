chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        init_db();
        if (request.method == "find") {
            is_word_exist(request.word, function(tx, result) {
                sendResponse( {exist: result.rows.item(0).exist} );
            });
            return true;
        }
        else if (request.method == "add") {
            storage_word(request.word);
        }
        else if (request.method == "remove") {
            remove_word(request.word);
        }
        else if (request.method == "lookup") {
            // sendResponse({status: "error", data: {statusCode: 500, statusText: "500"}});
            // return;
            $.ajax({
                url: 'https://jjm2473.fandom.com/zh/api.php?action=parse&format=json&redirects=1&prop=text%7Cdisplaytitle&disabletoc=1&page='+encodeURI(request.word),
                dataType: "json",
                async: false,
                success: function(data) {
                    sendResponse({status: "success", data: data});
                },
                error: function(data) {
                    sendResponse({status: "error", data: data});
                }
            });
        }
    }
);
