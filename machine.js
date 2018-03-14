function Machine() {
    this.ip = 0;
    this.code = [];
}

Machine.prototype.runStep = function (keepRunning = false) {
    if (this.ip < this.code.length) {
        let result = null;
        try {
            result = eval(this.code[this.ip]);
        } catch (e) {
            result = e;
        }
        $$ = result;
        this.onRunResult && this.onRunResult(result);
        this.ip++;
        if (result instanceof Promise) {
            result.then(() => keepRunning && this.runStep(keepRunning))
        } else {
            keepRunning && this.runStep(keepRunning);
        }
    } else {
        this.hasFinished = true;
    }
};

Machine.prototype.runUrl = function (url) {
    fetch(url)
        .then((result) => result.text())
        .then(code => {
            let codeArr;
            try {
                codeArr = JSON.parse(code)
            } catch (e) {
                codeArr = code.split('\n')
            }
            this.ip = 0;
            this.code = codeArr;
            this.runStep(true);

        })
        .catch(console.error);
};

machine = new Machine();