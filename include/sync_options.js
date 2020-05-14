(function(exports){
    var syncing = false;
    var getPendingOptions = function(cb) {
        chrome.storage.local.get('pendingOptions', r => {
            cb(r.pendingOptions);
        });
    }

    var updatePendingOptions = function(cached, cb) {
        chrome.storage.local.set({pendingOptions: cached}, cb);
    }

    var sync = function() {
        console.log('sync called');
        syncing = false;
        getPendingOptions(cached => {
            if (cached) {
                console.log('chrome sync set');
                chrome.runtime.lastError = false;
                chrome.storage.sync.set(cached, ()=>{
                    if (chrome.runtime.lastError) {
                        console.error('sync failed', chrome.runtime.lastError);
                    } else {
                        console.log('clean pendingOptions');
                        chrome.storage.local.remove('pendingOptions');
                    }
                });
            }
        });
    }

    /**
     * 
     * @param {(string|string[])} keys 
     * @param {Callback} cb
     */
    exports.getOptions = function(keys, cb) {
        keys = keys instanceof Array?keys:[keys];
        getPendingOptions(cached => {
            var remains = keys;
            var ret = {};
            if (cached) {
                remains = keys.filter(k=>!cached.hasOwnProperty(k));
                keys.filter(k=>cached.hasOwnProperty(k)).forEach(k=>ret[k]=cached[k]);
            }
            if (remains) {
                chrome.storage.sync.get(remains, r => {
                    cb($.extend(ret, r));
                });
            } else {
                cb(ret);
            }
        });
    }

    /**
     * 
     * @param {*} options
     * @param {emptyCallback} cb 
     */
    exports.updateOptions = function(options, cb) {
        getPendingOptions(cached => {
            cached = $.extend(cached, options);
            updatePendingOptions(cached, () => {
                if (!syncing) {
                    setTimeout(sync, 5000);
                    syncing = true;
                }
                cb();
            });
        });
    }
}).bind(window)(window);

/**
 * @callback emptyCallback
 */