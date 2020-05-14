
(function() {
    var defaultOptions = {
        sites:[
            {url:'https://zh.moegirl.org/', name:'萌娘百科'},
            {url:'https://minecraft-zh.gamepedia.com/', name:'我的世界'},
            {url:'http://wiki.citydatum.com/', name:'CityDatum'},
            {url:'https://zh.wikipedia.org/w/', name:'维基百科中文'},
            {url:'https://jjm2473.fandom.com/zh/', name:'Fandom测试'}
        ],
        rules: [],
        defaultSite: 'https://zh.wikipedia.org/w/'
    };
    var check = ['sites', 'rules', 'defaultSite'];
    var handlers = {
        site:{
            put: function({data}){
                addSite(data, (e)=>{
                    this.sendResponse(e?e:{code:200});
                });
            },
            delete: function({pathseg}){
                var url = pathseg[1];
                removeSite(url, (e)=>{
                    this.sendResponse(e?e:{code:200});
                });
            },
        },
        rule:{
            put: function(){},
            delete: function(){},
        },
        config:{
            get: function(){
                getOptions(check, options => {
                    this.sendResponse({code:200, data:options});
                });
            },
            post: function({data}){
                updateOptions(data, () => {
                    this.sendResponse({code:200});
                });
            }
        },
        '*': {
            '*': function(){
                this.sendResponse({code:404, message:'not found'});
            }
        }
    };
    /**
     * 
     * @param {Object} request
     * @param {string} request.method
     * @param {string} request.url
     * @param {Object} request.data
     * @param {string} request.pathname
     * @param {string} request.query
     * @param {string[]} request.pathseg
     * @param {URLSearchParams} request.searchParams
     * @param {Callback} sendResponse
     */
    var handle = function(request, sendResponse) {
        var handler = handlers[request.pathseg[0]] || handlers['*'];
        (handler[request.method.toLowerCase()] 
            || handler['*'] 
            || function(){this.sendResponse({code:405, message:'method not allowed'});}
        ).bind({request, sendResponse})(request);
    };
    getOptions(check, options => {
        var mod = {};
        var update = false;
        check.forEach(k=>{
            if (options[k] === null || options[k] === undefined) {
                mod[k] = defaultOptions[k];
                update = true;
            }
        });
        var mock = function(){
            chrome.extension.onMessage.addListener(
                function(request, sender, sendResponse) {
                    var url = new URL(request.url, 'http://localhost/');
                    request.pathname = url.pathname;
                    request.pathseg = url.pathname.substring(1).split('/');
                    if (request.pathseg[0] == 'api') {
                        request.pathseg = request.pathseg.slice(1);
                    }
                    request.query = url.search;
                    request.searchParams = url.searchParams;
                    handle(request, sendResponse);
                    return true;
                }
            );
        };
        if (update) { 
            updateOptions(mod, mock);
        } else {
            mock();
        }
    });
})();

