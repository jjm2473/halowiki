function rpc(params) {
    var request = {url:params.url, method:params.method||'get', data:params.data};

    chrome.extension.sendMessage(request, function(response) {
        if (response && response.code == 200) {
            params.success && params.success(response.data);
        } else {
            params.error && params.error(response);
        }
    });
}