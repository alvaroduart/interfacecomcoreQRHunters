import { Name } from '../../../domain/value-objects/Name';

describe('Objeto de Valor: Name', () => {
  it('deve criar um nome válido', () => {
    const name = Name.create('Valid Name');
    expect(name).toBeInstanceOf(Name);
    expect(name.value).toBe('Valid Name');
  });

  it('deve lançar um erro para um nome inválido', () => {
    expect(() => Name.create('a')).toThrow('Invalid name. Name must be between 2 and 50 characters and contain only letters and spaces.');
    expect(() => Name.create('a'.repeat(51))).toThrow('Invalid name. Name must be between 2 and 50 characters and contain only letters and spaces.');
    expect(() => Name.create('Invalid123')).toThrow('Invalid name. Name must be between 2 and 50 characters and contain only letters and spaces.');
  });

  it('deve comparar corretamente dois objetos de nome', () => {
    const name1 = Name.create('Name One');
    const name2 = Name.create('Name One');
    const name3 = Name.create('Name Two');
    expect(name1.equals(name2)).toBe(true);
    expect(name1.equals(name3)).toBe(false);
  });
});