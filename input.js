const inputDiv = document.createElement('div');
inputDiv.id = 'console';
inputDiv.innerHTML =
    `
        &gt;
        <textarea id="console-input" class="active"></textarea>
        <input type="button" id="console-input-toggle" value="^" />
    `;
document.body.appendChild(inputDiv);
const button = document.getElementById('console-input-toggle');

button.onclick = e => inputDiv.classList.toggle('multi');

var input = document.getElementById('console-input');

var cycleInstructionIndex = machine.code.length;

input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13 && (event.shiftKey || !inputDiv.classList.contains('multi'))) { // enter
        machine.code.push(this.value);
        this.value = '';
        machine.runLine();
        cycleInstructionIndex = machine.ip;
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
        if ((this.value === machine.code[cycleInstructionIndex]) && cycleInstructionIndex < machine.code.length) {
            cycleInstructionIndex++;
            this.value = machine.code[cycleInstructionIndex];
        }
    }
});
