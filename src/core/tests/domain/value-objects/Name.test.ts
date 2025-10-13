import { Name } from '../../../domain/value-objects/Name';

describe('Objeto de Valor: Name', () => {
  it('deve criar um nome válido', () => {
    const name = Name.create('Valid Name');
    expect(name).toBeInstanceOf(Name);
    expect(name.value).toBe('Valid Name');
  });

  it('deve lançar um erro para um nome inválido', () => {
  expect(() => Name.create('a')).toThrow('Nome inválido. O nome deve ter entre 2 e 50 caracteres e conter apenas letras e espaços.');
  expect(() => Name.create('a'.repeat(51))).toThrow('Nome inválido. O nome deve ter entre 2 e 50 caracteres e conter apenas letras e espaços.');
  expect(() => Name.create('Invalid123')).toThrow('Nome inválido. O nome deve ter entre 2 e 50 caracteres e conter apenas letras e espaços.');
  });

  it('deve comparar corretamente dois objetos de nome', () => {
    const name1 = Name.create('Name One');
    const name2 = Name.create('Name One');
    const name3 = Name.create('Name Two');
    expect(name1.equals(name2)).toBe(true);
    expect(name1.equals(name3)).toBe(false);
  });
});