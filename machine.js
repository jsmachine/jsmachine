function Machine() {
    this.ip = 0;
    this.code = [];
}

const NOOP = {};

Machine.prototype.runCode = () => {
      let result = null;
      try {
        result = eval(this.code[this.ip]);
      } catch (e) {
        result = e;
      }
      this.onRunResult && this.onRunResult(result);
      return result;
};

Machine.prototype.runUrl = function (url) {
    return fetch(url)
        .then((result) => result.json())
        .then(codeArr => {
            if (typeof codeArr === 'string') {
                codeArr = codeArr.split('\n');
            }
            this.ip = 0;
            this.code = codeArr;
            while (this.ip < this.code.length) {
                let result = this.runLine(this.code[this.ip]);
                if (result instanceof Promise) {
                    result.then(() => this.runLine());
                } else {
                    this.runLine();
                }
            }
            this.hasFinished = true;
            this.runLine();
        })
        .catch(console.error);
};
