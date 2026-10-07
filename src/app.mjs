import { calculate, formatResult } from './calculator.mjs';

const form = document.querySelector('#calculator');
const input = document.querySelector('#expression');
const result = document.querySelector('#result');
const message = document.querySelector('#message');
const historyList = document.querySelector('#history');
const history = [];
let answer = null;

function clearError() {
  input.removeAttribute('aria-invalid');
  message.textContent = 'Enter no campo calcula · Esc limpa';
}

function inputChanged() {
  answer = null;
  result.textContent = '—';
  clearError();
}

function reset() {
  input.value = '';
  result.textContent = '0';
  answer = null;
  clearError();
}

function append(value) {
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? start;
  if (input.value.length - (end - start) + value.length > input.maxLength) return;
  input.setRangeText(value, start, end, 'end');
  inputChanged();
}

function evaluate() {
  try {
    answer = calculate(input.value);
    result.textContent = formatResult(answer);
    clearError();
    history.unshift(`${input.value} = ${formatResult(answer)}`);
    history.splice(5);
    historyList.replaceChildren(...history.map((entry) => {
      const item = document.createElement('li');
      item.textContent = entry;
      return item;
    }));
  } catch (error) {
    answer = null;
    result.textContent = '—';
    message.textContent = error.message;
    input.setAttribute('aria-invalid', 'true');
  }
}

form.addEventListener('submit', (event) => { event.preventDefault(); evaluate(); });
form.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.value) append(button.dataset.value);
  if (button.dataset.action === 'clear') reset();
  if (button.dataset.action === 'backspace') {
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    input.setRangeText('', start === end ? Math.max(0, start - 1) : start, end, 'end');
    inputChanged();
  }
});
input.addEventListener('input', inputChanged);
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.key === 'Escape') { event.preventDefault(); reset(); return; }
  if (event.target === input) return;
  if (/^[\d.,()+\-*/]$/.test(event.key)) { event.preventDefault(); append(event.key); }
  if (event.key === '=') { event.preventDefault(); evaluate(); }
});
document.querySelector('#copy').addEventListener('click', async () => {
  if (answer === null) { message.textContent = 'Calcule um resultado antes de copiar.'; return; }
  try {
    await navigator.clipboard.writeText(String(answer));
    message.textContent = 'Resultado copiado.';
  } catch {
    message.textContent = 'Seleciona o resultado para copiar neste navegador.';
  }
});
