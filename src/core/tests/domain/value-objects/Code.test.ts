import { Code } from '../../../domain/value-objects/Code';

describe('Objeto de Valor: Code', () => {
  it('deve criar um código válido', () => {
    const code = Code.create('valid-code');
    expect(code).toBeInstanceOf(Code);
    expect(code.value).toBe('valid-code');
  });

  it('deve lançar um erro para um código inválido', () => {
    expect(() => Code.create('')).toThrow('Invalid code. Code must be a non-empty string.');
    expect(() => Code.create('  ')).toThrow('Invalid code. Code must be a non-empty string.');
  });

  it('deve comparar corretamente dois objetos de código', () => {
    const code1 = Code.create('code1');
    const code2 = Code.create('code1');
    const code3 = Code.create('code2');
    expect(code1.equals(code2)).toBe(true);
    expect(code1.equals(code3)).toBe(false);
  });
});