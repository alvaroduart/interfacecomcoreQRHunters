import { Location } from '../../../domain/value-objects/Location';

describe('Objeto de Valor: Location', () => {
  it('deve criar uma localização válida', () => {
    const location = Location.create('valid-location');
    expect(location).toBeInstanceOf(Location);
    expect(location.value).toBe('valid-location');
  });

  it('deve lançar um erro para uma localização inválida', () => {
    expect(() => Location.create('')).toThrow('Invalid location. Location must be a non-empty string.');
    expect(() => Location.create('  ')).toThrow('Invalid location. Location must be a non-empty string.');
  });

  it('deve comparar corretamente dois objetos de localização', () => {
    const location1 = Location.create('location1');
    const location2 = Location.create('location1');
    const location3 = Location.create('location2');
    expect(location1.equals(location2)).toBe(true);
    expect(location1.equals(location3)).toBe(false);
  });
});