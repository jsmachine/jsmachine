commandsDiv = elm(`<div id="commands">`);
document.body.appendChild(commandsDiv);
returnFormatters = [];
isDisplayResultOn = true;
isDisplayInputOn = true;

function toggleResultDisplay(state) {
    isDisplayResultOn = typeof state !== 'undefined' ? state : !isDisplayResultOn;
    return 'Result display ' + (isDisplayResultOn ? 'On' : 'Off');
}

function toggleInputDisplay(state) {
    isDisplayInputOn = typeof state !== 'undefined' ? state : !isDisplayInputOn;
    return 'Input display ' + (isDisplayInputOn ? 'On' : 'Off');

}

function registerReturnFormatter(filter, formatter) {
    const handle = {};
    returnFormatters.unshift({
        handle: handle,
        filter: filter,
        formatter: formatter
    });
}

// handle all types of results
registerReturnFormatter(
    function (result) {
        return true;
    },
    function (div, result) {
        return String(result);
    }
);

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
        div.appendChild(document.createTextNode(result));
        return Nothing;
    }
);

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

// handle show
registerReturnFormatter(
    function (result) {
        return (result instanceof Show);
    },
    function (div, result) {
        if (result._el instanceof Element) {
            div.appendChild(result._el);
            return Nothing;
        } else {
            throw Error('Not an element');
        }
    }
);


function handleResultValue(div, result) {
    for (let i = 0; i < returnFormatters.length; i++) {
        if (returnFormatters[i].filter(result)) {
            let newResult = returnFormatters[i].formatter(div, result);
            while (newResult !== Nothing) {
                newResult = handleResultValue(div, newResult);
            }
            return newResult;
        }
    }
}

function addInput(text) {
    const inputDiv = elm(`
        <x-input><delete-button></delete-button></x-input>
    `);
    inputDiv.appendChild(document.createTextNode(text));
    inputDiv.firstChild.addEventListener(
        'click',
        () => {
            let height = inputDiv.offsetHeight;
            if (inputDiv.nextSibling.nodeName === 'X-RESULT') {
                height += inputDiv.nextSibling.offsetHeight;
                document.getElementById('commands').removeChild(inputDiv.nextSibling);
            }
            const instruction = [].indexOf.call(document.getElementsByTagName('x-input'), inputDiv);

            const placeholder = elm(`<x-placeholder />`);
            placeholder.style.height = height + 'px';

            document.getElementById('commands').insertBefore(placeholder, inputDiv);
            document.getElementById('commands').removeChild(inputDiv);

            setTimeout(() => {
                placeholder.style.height = 0;
                placeholder.classList.add('collapse');
            }, 0);

            setTimeout(() => document.getElementById('commands').removeChild(placeholder), 1000);

            machine.code.splice(instruction, 1);
            if (machine.ip >= instruction) { machine.ip--; }

        }
    );
    commandsDiv.appendChild(inputDiv);
}

machine.onRunResult = function (result) {
    if (isDisplayInputOn) addInput(machine.code[machine.ip]);
    const div = elm(`<x-result/>`);
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
    machine.code.splice(machine.ip, 1);
    machine.ip--;
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
                let saves = localStorage.getItem('saves') ? JSON.parse(localStorage.getItem('saves')) : [];
                saves.push(key);
                localStorage.setItem('saves', JSON.stringify(saves));
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