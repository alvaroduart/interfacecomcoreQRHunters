import { Latitude } from '../../../domain/value-objects/Latitude';

describe('Objeto de Valor: Latitude', () => {
  it('deve criar uma latitude válida', () => {
    const latitude = Latitude.create(45);
    expect(latitude).toBeInstanceOf(Latitude);
    expect(latitude.value).toBe(45);
  });

  it('deve lançar um erro para uma latitude inválida', () => {
    expect(() => Latitude.create(-91)).toThrow('Invalid latitude. Latitude must be between -90 and 90.');
    expect(() => Latitude.create(91)).toThrow('Invalid latitude. Latitude must be between -90 and 90.');
  });

  it('deve comparar corretamente dois objetos de latitude', () => {
    const latitude1 = Latitude.create(45);
    const latitude2 = Latitude.create(45);
    const latitude3 = Latitude.create(-45);
    expect(latitude1.equals(latitude2)).toBe(true);
    expect(latitude1.equals(latitude3)).toBe(false);
  });
});