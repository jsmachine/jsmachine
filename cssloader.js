function includeCSS(url) {
    var link = document.createElement('link');
    var promise = new Promise(function(resolve) {
        link.onload = resolve;
    });
    promise.type = 'includeCSS';
    link.rel = 'stylesheet';
    link.href = url;
    document.body.appendChild(link);
    return promise;
}
