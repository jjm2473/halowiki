
/**
 * 
 * @param {Object} site
 * @param {string} site.url
 * @param {string} site.name
 * @param {updateCallback} cb 
 */
function addSite(site, cb) {
    getOptions('sites', r => {
        if (r.sites.filter(s => s.url == site.url).length > 0) {
            cb({code:400, message:site.url + ' existed'});
        } else {
            r.sites.unshift(site);
            updateOptions(r, ()=>cb({code:200}));
        }
    });
}

/**
 * 
 * @param {string} url 
 * @param {updateCallback} cb 
 */
function removeSite(url, cb) {
    getOptions('sites', r => {
        r.sites = r.sites.filter(s => s.url != url);
        updateOptions(r, ()=>cb({code:200}));
    });
}

/**
 * 
 * @param {string} url 
 * @param {queryCallback} cb 
 */
function getSite(url, cb) {
    getOptions('sites', r => {
        var found = r.sites.filter(s => s.url == url);
        if (found.length > 0) {
            cb({code:200, data:found[0]});
        } else {
            cb({code:404});
        }
    });
}

/**
 * 
 * @param {queryCallback} cb 
 */
function getSites(cb) {
    getOptions('sites', r => {
        cb({code:200, data:r.sites});
    });
}

/**
 * 
 * @param {string} url 
 * @param {Object} site 
 * @param {string} site.url
 * @param {string} site.name
 * @param {updateCallback} cb 
 */
function updateSite(url, site, cb) {
    getOptions('sites', r => {
        r.sites[r.sites.findIndex(s=>s.url==url)] = site;
        updateOptions(r, ()=>cb({code:200}));
    });
}

/**
 * @callback updateCallback
 * @param {Object} error error or null
 */
/**
 * @callback queryCallback
 * @param {Object} response
 * @param {number} response.code 
 * @param {*} response.data
 */
