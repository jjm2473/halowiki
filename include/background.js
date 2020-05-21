
(function() {
    var defaultOptions = {
        sites:[
            {name:"维基百科中文镜像",url:"https://zh.wikipedia.wikimirror.org/w/"},
            {name:"维基百科中文镜像2",url:"https://g0.nuaa.cf/extdomains/zh.wikipedia.org/w/"},
            {name:"维基百科中文",url:"https://zh.wikipedia.org/w/"},
            {name:"萌娘百科",url:"https://zh.moegirl.org/"},
            {name:"一把刀",url:"https://cn.18dao.net/"},
            {name:"wikiHow",url:"https://zh.wikihow.com/"},
            {name:"冰与火之歌",url:"https://asoiaf.huijiwiki.com/"},
            {name:"我的世界",url:"https://minecraft-zh.gamepedia.com/"},
            {name:"CityDatum",url:"http://wiki.citydatum.com/"},
            {name:"Fandom测试",url:"https://jjm2473.fandom.com/zh/"},
            {name:"wiki-site测试",url:"http://jjm2473.wiki-site.com/"},
            {name:"EditThis测试",url:"https://editthis.info/jjm2473/"}
        ],
        rules: [],
        defaultSite: 'https://zh.wikipedia.wikimirror.org/w/'
    };
    var check = ['sites', 'rules', 'defaultSite'];
    var handlers = {
        site:{
            put: function({data}){
                addSite(data, r => {
                    this.sendResponse(r);
                });
            },
            post: function({pathseg, data}) {
                var url = pathseg[1];
                updateSite(url, data, r => {
                    this.sendResponse(r);
                });
            },
            delete: function({pathseg}){
                var url = pathseg[1];
                removeSite(url, r => {
                    this.sendResponse(r);
                });
            },
        },
        'site:sort':{
            post: function({data}){
                var urls = data;
                getOptions('sites', ({sites}) => {
                    var map = {};
                    sites.forEach(site=>{
                        map[site.url] = site;
                    });
                    sites = urls.map(url=>map[url]).filter(site=>site !== undefined);
                    updateOptions({sites}, () => {
                        this.sendResponse({code:200});
                    });
                });
            }
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
        var mock = function() {
            chrome.extension.onMessage.addListener(
                function(request, sender, sendResponse) {
                    var url = new URL(request.url, 'http://localhost/');
                    request.pathname = url.pathname;
                    request.pathseg = url.pathname.substring(1).split('/');
                    if (request.pathseg[0] == 'api') {
                        request.pathseg = request.pathseg.slice(1);
                    }
                    request.pathseg = request.pathseg.map(s=>decodeURIComponent(s));
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

