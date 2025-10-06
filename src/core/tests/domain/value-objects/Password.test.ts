import { Password } from '../../../domain/value-objects/Password';

describe('Objeto de Valor: Password', () => {
  it('deve criar uma senha válida', () => {
    const password = Password.create('ValidPass123!');
    expect(password).toBeInstanceOf(Password);
    expect(password.value).toBe('ValidPass123!');
  });

  it('deve lançar um erro para uma senha inválida', () => {
    // Too short
    expect(() => Password.create('Vp1!')).toThrow();
    // No uppercase
    expect(() => Password.create('validpass123!')).toThrow();
    // No lowercase
    expect(() => Password.create('VALIDPASS123!')).toThrow();
    // No number
    expect(() => Password.create('ValidPassword!')).toThrow();
    // No special character
    expect(() => Password.create('ValidPassword123')).toThrow();
  });

  it('deve comparar corretamente dois objetos de senha', () => {
    const password_1 = Password.create('ValidPass123!');
    const password_2 = Password.create('ValidPass123!');
    const password_3 = Password.create('AnotherValidPass123!');
    expect(password_1.equals(password_2)).toBe(true);
    expect(password_1.equals(password_3)).toBe(false);
  });
});