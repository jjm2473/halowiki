var RuleMatcher = (function(){
    var compile = function(r) {
        if (r === undefined) {
            return;
        }
        return new RegExp('^' + r.replace(/\\/g, '\\\\').replace(/\?/, '\\?').replace(/\*\./, '(*.)?').replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    };
    return function(rule) {
        var parts = /(([^:]+:)\/\/)?([^\/:]+)?(:(\d+))?(\/.*)?/.exec(rule);
        this.protocol = compile(parts[2]);
        this.host = compile(parts[3]);
        this.port = compile(parts[5]);
        this.path = compile(parts[6]);
    };
})();
RuleMatcher.prototype = {
    match: (function(){
        var match = function(r, s) {
            if (r === undefined) {
                return true;
            }
            return r.test(s);
        };
        return function(u){
            var url = u instanceof URL?u:new URL(u);
            return [
                [this.protocol, url.protocol], 
                [this.host, url.hostname],
                [this.port, url.port||'80'],
                [this.path, url.pathname + url.search]
            ].filter(args=>!match.apply(null, args)).length == 0;
        };
    })()
};

function compileRule(rule) {
    return new RuleMatcher(rule);
}