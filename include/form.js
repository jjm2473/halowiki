$.fn.form = function() {
    var map = {};
    this.map((i, e)=>e.name?map[e.name]=e.value:undefined);
    return map;
};