import { Longitude } from '../../../domain/value-objects/Longitude';

describe('Objeto de Valor: Longitude', () => {
  it('deve criar uma longitude válida', () => {
    const longitude = Longitude.create(90);
    expect(longitude).toBeInstanceOf(Longitude);
    expect(longitude.value).toBe(90);
  });

  it('deve lançar um erro para uma longitude inválida', () => {
  expect(() => Longitude.create(-181)).toThrow('Longitude inválida. A longitude deve estar entre -180 e 180.');
  expect(() => Longitude.create(181)).toThrow('Longitude inválida. A longitude deve estar entre -180 e 180.');
  });

  it('deve comparar corretamente dois objetos de longitude', () => {
    const longitude1 = Longitude.create(90);
    const longitude2 = Longitude.create(90);
    const longitude3 = Longitude.create(-90);
    expect(longitude1.equals(longitude2)).toBe(true);
    expect(longitude1.equals(longitude3)).toBe(false);
  });
});