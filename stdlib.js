// elm = (str) => new DOMParser().parseFromString(str, 'text/html');
elm = (str) => {
    const _e = document.createElement('div');
    _e.innerHTML = str;
    return _e.firstElementChild;
};


include = str => SystemJS.import(str);
function CallbackFunction(func) {
    this._func = func;
}
cb = (func) => new CallbackFunction(func);
function Html(strInput) {
    this._html = strInput;
}

html = (str) => new Html(str);

function Show(el) {
    this._el = el;
}

show = el => new Show(el);


Nothing = {};
NOOP = {};

function includeCSS(url) {
    const link = document.createElement('link');
    const promise = new Promise(function(resolve) {
        link.onload = resolve;
    });
    promise.type = 'includeCSS';
    link.rel = 'stylesheet';
    link.href = url;
    document.body.appendChild(link);
    return promise;
}

// allInputs = () => [].filter.call(document.getElementsByTagName('x-input'));
// allResults = () => [].filter.call(document.getElementById('commands').childNodes, n => n.classList.contains('result'));