var webComponentsSupported = ('registerElement' in document
    && 'import' in document.createElement('link')
    && 'content' in document.createElement('template')),
    fetchSupported = 'fetch' in window;

window.Polymer = {
    dom: 'shadow',
    lazyRegister: true
};

function loadElements (cb) {
    var link = document.createElement('link');

    link.rel = 'import';
    link.href = '/elements/elements.html';
    link.onload = cb;

    document.head.appendChild(link);
}

function loadPolyfill (cb) {
    var scriptsToLoad = [],
        loaded = 0;
    function loadScript (url) {
        var script = document.createElement('script');

        script.src = url;
        script.onload = function () {
            loaded++;
            if (loaded === scriptsToLoad.length - 1) {
                cb();
            }
        };

        document.head.appendChild(script);
    }
    if (!webComponentsSupported) {
        scriptsToLoad.push('/vendor/webcomponents-lite.min.js');
    }
    if (!fetchSupported) {
        scriptsToLoad.push('/vendor/es6-promise.js');
        scriptsToLoad.push('/vendor/fetch.js');
    }

    for (var i = 0; i < scriptsToLoad.length; i++) {
        loadScript(scriptsToLoad[i]);
    }
}

function onLoad () {
    console.log('ready');
}

window.addEventListener('load', () => {
    var loader = function () {
        loadElements(onLoad);
    };
    if (!webComponentsSupported) {
        loadPolyfill(loader);
    } else {
        loader();
    }
});

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(function () {
            // SW registration successfull
        })
        .catch(function (e) {
            console.error(e);
        });
} else {
    // Add fallback using appcache
    document.write('<iframe src="/appcache.html" width="0" height="0" style="display: none"></iframe>');
}
