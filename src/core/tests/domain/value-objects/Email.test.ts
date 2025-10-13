import { Email } from '../../../domain/value-objects/Email';

describe('Objeto de Valor: Email', () => {
  it('deve criar um email válido', () => {
    const email = Email.create('test@example.com');
    expect(email).toBeInstanceOf(Email);
    expect(email.value).toBe('test@example.com');
  });

  it('deve lançar um erro para um email inválido', () => {
  expect(() => Email.create('invalid-email')).toThrow('Endereço de e-mail inválido');
  expect(() => Email.create('test@')).toThrow('Endereço de e-mail inválido');
  expect(() => Email.create('@example.com')).toThrow('Endereço de e-mail inválido');
  });

  it('deve comparar corretamente dois objetos de email', () => {
    const email1 = Email.create('test@example.com');
    const email2 = Email.create('test@example.com');
    const email3 = Email.create('another@example.com');
    expect(email1.equals(email2)).toBe(true);
    expect(email1.equals(email3)).toBe(false);
  });
});