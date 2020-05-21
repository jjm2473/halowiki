/**
 * 
 * @param {queryCallback} onsuccess 
 * @param {*} onerror 
 */
function getConfig(onsuccess, onerror) {
    rpc({url: 'api/config',
        success: onsuccess,
        error: onerror
    });
}

/**
 * 
 * @param {Object} site
 * @param {string} site.url
 * @param {string} site.name
 * @param {updateCallback} onsuccess 
 * @param {*} onerror 
 */
function addSite(site, onsuccess, onerror) {
    rpc({url: 'api/site',
        method: 'put',
        data: site,
        success: onsuccess,
        error: onerror
    });
}

/**
 * 
 * @param {string} url 
 * @param {updateCallback} onsuccess 
 * @param {*} onerror 
 */
function removeSite(url, onsuccess, onerror) {
    rpc({url: 'api/site/'+encodeURIComponent(url),
        method: 'delete',
        success: onsuccess,
        error: onerror
    });
}

/**
 * 
 * @param {string} url 
 * @param {Object} site
 * @param {string} site.url
 * @param {string} site.name
 * @param {updateCallback} onsuccess 
 * @param {*} onerror
 */
function updateSite(url, site, onsuccess, onerror) {
    rpc({url: 'api/site/'+encodeURIComponent(url),
        method: 'post',
        data: site,
        success: onsuccess,
        error: onerror
    });
}

/**
 * 
 * @param {string[]} urls 
 * @param {updateCallback} onsuccess 
 * @param {*} onerror
 */
function sortSite(urls, onsuccess, onerror) {
    rpc({url: 'api/site:sort',
        method: 'post',
        data: urls,
        success: onsuccess,
        error: onerror
    });
}