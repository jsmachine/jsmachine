let incrementer = 1;

class Machine {
    get code() { return this._code; }
    set code(code) {
        if (this.onCodeChange) {
            this.onCodeChange(this._code, code);
        }
        this._code = code;
    }

    constructor() {
        this.ip = 0;
        this.isRunning = false;
        this._code = [];
        this.onRunResult = null;
    }

    async loadURL(url) {
        const result = await fetch(url);
        const code = await result.text();
        let codeArr;
        try {
            codeArr = JSON.parse(code)
        } catch (e) {
            codeArr = code.split('\n')
        }
        this.ip = 0;
        this.code = codeArr.map(code => ({
            code: code,
            id: incrementer++
        }));
    };
}

/*
    runStep cannot be defined as a class method, because class methods appear to run as "use strict", which means
    there would be no way to assign a variable in an eval() statement without it being out of scope immediately.
 */
Machine.prototype.runStep = async function (keepRunning = false) {
    this.isRunning = true;
    let $$, $$$ = null;
    while (this.ip < this.code.length) {
        let result = null;
        if (this.onBeforeRun) {
            this.onBeforeRun();
        }
        try {
            result = eval(this.code[this.ip].code);
        } catch (e) {
            result = e;
        }
        $$ = result;
        if (this.onRunResult) {
            this.onRunResult(result);
        }
        try {
            $$$ = await result;
        } catch (e) {
            $$$ = e;
        }
        if (this.onAfterRun) {
            this.onAfterRun(result, $$$);
        }
        this.ip++;
        if (!keepRunning) {
            break;
        }
    }
    this.isRunning = false;
};

module.exports = Machine;
