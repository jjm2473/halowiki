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