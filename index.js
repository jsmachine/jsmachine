require('stdlib.js');
const Notebook = require('notebook.js');

async function init() {
    const notebook = new Notebook(notebook1);
    await notebook._machine.loadURL('default.js');
    await notebook._machine.runStep(true);
    window.notebook = notebook;
    window.machine = notebook._machine;
    const mapDisplay = {
        '.hide-loading' : 'block',
        '.hide-loaded' : 'none'
    };
    for (let [selector, display] of Object.entries(mapDisplay)) {
        for (let elm of document.querySelectorAll(selector)) {
            elm.style.display = display;
        }
    }
}

init();
