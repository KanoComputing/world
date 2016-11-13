var webComponentsSupported = ('registerElement' in document
    && 'import' in document.createElement('link')
    && 'content' in document.createElement('template')),
    fetchSupported = 'fetch' in window,
    pathPrefix = document.head.querySelector('meta[name="path-prefix"]').getAttribute('data-value');

window.dataLayer = [];

window.Polymer = {
    dom: 'shadow',
    lazyRegister: true
};

function loadElements (cb) {
    var link = document.createElement('link');

    link.rel = 'import';
    link.href = pathPrefix + 'elements/elements.html';
    link.onload = cb;

    document.head.appendChild(link);
}

function loadPolyfill (cb) {
    var scriptsToLoad = 0,
        scriptLoaded = function () {
            scriptsToLoad--;
            if (scriptsToLoad === 0) {
                cb();
            }
        };
    if (!webComponentsSupported) {
        scriptsToLoad++;
        loadScript(pathPrefix + 'vendor/webcomponents-lite.min.js', scriptLoaded);
    }
    if (!fetchSupported) {
        scriptsToLoad++;
        loadScript(pathPrefix + 'vendor/es6-promise.js', function () {
            ES6Promise.polyfill();
            loadScript(pathPrefix + 'vendor/fetch.js', scriptLoaded);
        });
    }
}

function loadScript (src, cb) {
    var script = document.createElement('script');
    script.onload = cb;
    script.src = src;
    document.body.appendChild(script);
}

function onLoad () {}

window.addEventListener('load', function () {
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
    navigator.serviceWorker.register(pathPrefix + 'sw.js')
        .then(function () {
            // SW registration successfull
        })
        .catch(function (e) {
            console.error(e);
        });
} else {
    // Add fallback using appcache
    document.write('<iframe src="' + pathPrefix + 'appcache.html" width="0" height="0" style="display: none"></iframe>');
}
