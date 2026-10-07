/** A small arithmetic parser. Input is treated as data, never as JavaScript. */
export function calculate(expression) {
  if (typeof expression !== 'string' || !expression.trim()) {
    throw new Error('Digite uma operação.');
  }
  if (expression.length > 160) throw new Error('Use uma expressão de até 160 caracteres.');
  const source = expression.replaceAll(',', '.');
  let position = 0;
  const skipSpaces = () => { while (/\s/.test(source[position] ?? '') && position < source.length) position++; };
  const peek = () => { skipSpaces(); return source[position]; };
  const take = (character) => {
    if (peek() !== character) return false;
    position++;
    return true;
  };

  function primary() {
    if (take('(')) {
      const value = sum();
      if (!take(')')) throw new Error('Feche os parênteses.');
      return value;
    }
    skipSpaces();
    const match = source.slice(position).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);
    if (!match) throw new Error('Confira os números e os operadores.');
    position += match[0].length;
    return Number(match[0]);
  }

  function unary() {
    if (take('+')) return unary();
    if (take('-')) return -unary();
    return primary();
  }

  function product() {
    let value = unary();
    while (true) {
      if (take('*')) value *= unary();
      else if (take('/')) {
        const divisor = unary();
        if (divisor === 0) throw new Error('Não é possível dividir por zero.');
        value /= divisor;
      } else return value;
    }
  }

  function sum() {
    let value = product();
    while (true) {
      if (take('+')) value += product();
      else if (take('-')) value -= product();
      else return value;
    }
  }

  const result = sum();
  if (position !== source.length && peek() !== undefined) {
    throw new Error('Use apenas números, +, −, ×, ÷ e parênteses.');
  }
  if (!Number.isFinite(result)) throw new Error('O resultado excede o limite numérico.');
  return Object.is(result, -0) ? 0 : result;
}

export function formatResult(value) {
  return new Intl.NumberFormat('pt-BR', { maximumSignificantDigits: 12 }).format(value);
}
