/* eslint-disable */
// elm = (str) => new DOMParser().parseFromString(str, 'text/html');
window.elm = (str) => {
    const _e = document.createElement('div');
    _e.innerHTML = str;
    return _e.firstElementChild;
};


window.include = str => SystemJS.import(str);
window.CallbackFunction = function(func) {
    this._func = func;
}
window.cb = (func) => new CallbackFunction(func);
window.Html = function(strInput) {
    this._html = strInput;
}

window.html = (str) => new Html(str);

window.Show = function (el) {
    this._el = el;
}

window.show = el => new Show(el);


window.Nothing = {};
window.NOOP = {};

window.includeCSS = function(url) {
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

window.findLib = (s) => fetch(`https://api.cdnjs.com/libraries?search=${s}`).then(r => r.json()).then(r => r.results);

window.loadFirst = (s) => findLib(s).then(r => r[0].latest).then(r => SystemJS.import(r));

// allInputs = () => [].filter.call(document.getElementsByTagName('x-input'));
// allResults = () => [].filter.call(document.getElementById('commands').childNodes, n => n.classList.contains('result'));
