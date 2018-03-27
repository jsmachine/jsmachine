const Input = require('input.js');

module.exports = class {
    constructor(container, code) {
        container._ref = this;
        this._code = code;
        this._containerElm = container;
        this._headerElm = elm(`
            <x-cell-header>
                <x-cell-header-left>
                    <i class="material-icons" title="Play">play_arrow</i>
                </x-cell-header-left>
                <x-cell-header-right>
                    <i class="material-icons" title="Merge with above">call_merge</i>
                    <i class="material-icons" title="Remove">clear</i>
                </x-cell-header-right>
            </x-cell-header>
        `);



        this._footerElm = elm(`<x-cell-footer><i class="material-icons">keyboard_arrow_down</i></x-cell-footer>`);
        this._inputElm = elm(`<x-input></x-input>`);
        this._input = new Input(this._inputElm, code);
        this._outputElm = elm(`<x-output></x-output>`);
        this._containerElm.appendChild(this._headerElm);
        this._containerElm.appendChild(this._inputElm);
        this._containerElm.appendChild(this._outputElm);
        this._containerElm.appendChild(this._footerElm);

        this._resizerElm = this._footerElm.querySelector('i');

        const resizerMouseDown = () => {
            window.addEventListener('mousemove', resizerMouseMove, false);
        };
        const resizerMouseMove = (e) => {
            this._inputElm.style.height = (e.clientY - this._inputElm.offsetTop) + 'px';
            window.dispatchEvent(new Event('resize'))
        };
        const resizerMouseUp = () => {
            window.removeEventListener('mousemove', resizerMouseMove, false);
            // this._resizerElm.removeEventListener('mouseup', resizerMouseUp, false);
        };
        this._resizerElm.addEventListener('mousedown', resizerMouseDown, false);
        window.addEventListener('mouseup', resizerMouseUp, false);

        this._playElm = this._headerElm.querySelector('x-cell-header-left>i');
        this._playElm.addEventListener('click', () => {
            if (this.onPlay) { this.onPlay(this._code.id); };
        });


    }
};