var includes = [];

function include(url) {
    var script = document.createElement('script');
    var promise = new Promise(function(resolve) {
      script.onload = resolve;
    });
    promise.type = 'include';
    script.src = url;
    document.body.appendChild(script);
    includes.push(url);
    return promise;
}

function includeOnce(url) {
    if (includes.indexOf(url) === -1) {
        return include(url);
    }
    else return "already included";
}