const inputDiv = elm(`
    <div id="console">
        &gt;
        <textarea id="console-input" class="active"></textarea>
        <input type="button" id="console-input-toggle" value="^" />
    </div>
`);

document.body.appendChild(inputDiv);

const button = document.getElementById('console-input-toggle');
const input = document.getElementById('console-input');
button.onclick = e => inputDiv.classList.toggle('multi');

let cycleInstructionIndex = machine.code.length - 1;

input.addEventListener("keydown", function(event) {
    if (
        event.keyCode === 13 &&
        (event.shiftKey || !inputDiv.classList.contains('multi'))
    ) { // enter
        event.preventDefault();
        event.stopPropagation();
        if (this.value !== '') {
            machine.code.push(this.value);
            this.value = '';
            machine.runStep();
            cycleInstructionIndex = machine.ip;
        }
    } else if (event.keyCode === 38) { // key up
        event.preventDefault();
        event.stopPropagation();
        if ((this.value === "" || this.value === machine.code[cycleInstructionIndex]) && machine.ip > 0) {
            cycleInstructionIndex--;
            this.value = machine.code[cycleInstructionIndex];
        }
    } else if (event.keyCode === 40) { // key down
        event.preventDefault();
        event.stopPropagation();
        if ((this.value === machine.code[cycleInstructionIndex]) && cycleInstructionIndex < machine.code.length - 1) {
            cycleInstructionIndex++;
            this.value = machine.code[cycleInstructionIndex];
        }
    }
});
