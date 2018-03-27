const Machine = require('machine.js');
const Cell = require('cell.js');

module.exports = class {
    updateDisplay(oldCode, newCode) {
        const oldCodeIds = oldCode.map(code => code.id);
        for (let i = 0; i < newCode.length; i++) {
            let cellElm = null;
            if (!oldCodeIds.includes(newCode[i].id)) {
                cellElm = elm(`<x-cell id="x_cell_${newCode[i].id}"></x-cell>`);
                this._cells.push(new Cell(cellElm, newCode[i]));
            } else {
                cellElm = this._cells.find(cell => cell._code.id === newCode[i].id)._containerElm;
            }
            console.log(cellElm);
            this._containerElm.appendChild(cellElm);
        }
    }
    constructor(container) {
        this._machine = new Machine();
        this._machine._display = this;
        this._machine.onCodeChange = this.updateDisplay.bind(this);
        this._cells = [];
        this._containerElm = container;

        this.returnFormatters = [
            {
                handle: {},
                filter: (result) => typeof result === 'string',
                formatter: (div, result) => {
                    div.appendChild(document.createTextNode(result));
                    return Nothing;
                }
            },
            {
                handle: {},
                filter: (result) => result instanceof Html,
                formatter: (div, result) => {
                    div.innerHTML = result._html;
                    return Nothing;
                }
            },
            {
                handle: {},
                filter: (result) => result instanceof Show,
                formatter: (div, result) => {
                    if (result._el instanceof Element) {
                        div.appendChild(result._el);
                        return Nothing;
                    } else {
                        throw Error('Not an element');
                    }
                }
            },
            {
                handle: {},
                filter: (result) => result instanceof CallbackFunction,
                formatter: (div, result) => {
                    try {
                        return result._func(div) === NOOP ? NOOP : Nothing;
                    } catch (e) {
                        return e;
                    }
                }
            },
            // {
            //     handle: {},
            //     filter: (result) => result === NOOP,
            //     formatter: (div, result) => {
            //         this._machine.code.splice(this._machine.code[this._machine.ip - 1], 1);
            //         this._machine.ip--;
            //         return Nothing;
            //     }
            // },
            {
                handle: {},
                filter: () => true,
                formatter: (div, result) => String(result)
            },

        ];


        this._machine.onBeforeRun = () => {
            const cell = this._cells.find(cell => cell._code.id === this._machine.code[this._machine.ip].id);
            cell._containerElm.classList.add('running');
        };
        this._machine.onRunResult = (result) => {
            const cell = this._cells.find(cell => cell._code.id === this._machine.code[this._machine.ip].id);
            cell._containerElm.classList.remove('running');
            if (result instanceof Error) {
                cell._containerElm.classList.add('error');
            } else {
                cell._containerElm.classList.add('done');
            }
            this.handleResultValue(cell._outputElm, result);
        };

        let canSave = false;
        setTimeout(() => canSave = true, 1000);
    }

    registerReturnFormatter(filter, formatter) {
        const handle = {};
        this.returnFormatters.unshift({
            handle: handle,
            filter: filter,
            formatter: formatter
        });
        return "OK";
    }

    handleResultValue(div, result) {
        if (result !== Nothing) {
            for (let i = 0; i < this.returnFormatters.length; i++) {
                if (this.returnFormatters[i].filter(result)) {
                    let newResult = this.returnFormatters[i].formatter(div, result);
                    while (newResult !== Nothing) {
                        newResult = this.handleResultValue(div, newResult);
                    }
                    return newResult;
                }
            }
        }
    }

    save(override) {
        if ((!this.canSave || !this._machine.hasFinished) && !override) return "Save skipped";
        this._machine.code.splice(this._machine.ip, 1);
        this._machine.ip--;
        this.canSave = false;
        setTimeout(() => this.canSave = true, 10000);
        const codeString = JSON.stringify(this._machine.code);
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
};
