var commandsDiv = document.createElement('div');
commandsDiv.id = 'commands';
document.body.appendChild(commandsDiv);
var returnFormatters = [];
var isDisplayResultOn = true;
var isDisplayInputOn = true;

function toggleResultDisplay(state) {
    isDisplayResultOn = typeof state !== 'undefined' ? state : !isDisplayResultOn
}

function toggleInputDisplay(state) {
    isDisplayInputOn = typeof state !== 'undefined' ? state : !isDisplayInputOn
}

function registerReturnFormatter(filter, formatter) {
    var handle = {};
    returnFormatters.unshift({
        handle: handle,
        filter: filter,
        formatter: formatter
    });
}

var Nothing = {};
// handle all types of results
registerReturnFormatter(
    function (result) {
        return true;
    },
    function (div, result) {
        return String(result);
    }
);

function CallbackFunction(func) {
    this._func = func;
}

const cb = (func) => new CallbackFunction(func);

// handle CallbackFunction
registerReturnFormatter(
    function (result) {
        return (result instanceof CallbackFunction);
    },
    function (div, result) {
        try {
            return result._func(div) === NOOP ? NOOP : Nothing;
        } catch (e) {
            return e;
        }
    }
);

// handle NOOP
registerReturnFormatter(
    (result) => result === NOOP,
    (div, result) => {
        machine.code.splice(machine.code[machine.ip - 1], 1);
        machine.ip--;
        return Nothing;
    }
);


// handle strings
registerReturnFormatter(
    (result) => typeof result === 'string',
    (div, result) => {
        div.innerHTML = result;
        return Nothing;
    }
);

function Html(strInput) {
    this._html = strInput;
}

const html = (str) => new Html(str);

// handle html
registerReturnFormatter(
    function (result) {
        return (result instanceof Html);
    },
    function (div, result) {
        div.innerHTML = result._html;
        return Nothing;
    }
);


function handleResultValue(div, result) {
    for (var i = 0; i < returnFormatters.length; i++) {
        if (returnFormatters[i].filter(result)) {
            var newResult = returnFormatters[i].formatter(div, result);
            while (newResult !== Nothing) {
                newResult = handleResultValue(div, newResult);
            }
            return newResult;
        }
    }
}

function addText(text) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    div.setAttribute('class', 'input');
    commandsDiv.appendChild(div);
}

machine.onRunResult = function (result) {
    addText(machine.code[machine.ip]);
    var div = document.createElement('div');
    div.setAttribute('class', 'result');
    if (isDisplayResultOn) {
        commandsDiv.appendChild(div);
    }
    handleResultValue(div, result);
    commandsDiv.scrollTo(0, commandsDiv.scrollHeight);
};

let canSave = false;
setTimeout(() => canSave = true, 1000);

function save(override) {
    if ((!canSave || !machine.hasFinished) && !override) return "Save skipped";
    canSave = false;
    setTimeout(() => canSave = true, 10000);
    const codeString = JSON.stringify(machine.code);
    const url = 'https://us-central1-jsmachine-us.cloudfunctions.net/save';

    return new CallbackFunction((div) => {
        div.innerHTML = 'saving...';

        fetch(url, {
            body: codeString,
            method: 'POST'
            })
            .then(response => response.json())
            .then(resp => {
                if (resp.error && resp.error.code === 14) {
                    // this is some google error (TCP read failed). Try again should work..
                    save(true)._func(div);
                }
                const key = resp.key;
                const a = document.createElement('a');
                a.href = window.location.href.split('?')[0] + '?key=' + key;
                a.innerHTML = 'link';
                div.innerHTML = 'Saved at this ';
                div.appendChild(a);
                window.history.pushState(key, key, '?key=' + key);
            })
            .catch(e => {
                div.innerHTML = 'Error saving :(';
                console.error(e)
            });

        return NOOP;
    });

}

function clear() {
    return new CallbackFunction(function () {
        machine.code = [];
        machine.ip = -1;
        commandsDiv.innerHTML = '';
    });
}