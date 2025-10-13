import React from 'react';
import { render } from '@testing-library/react-native';
import CurvedBackground from './CurvedBackground';

describe('CurvedBackground', () => {
  it('renders with default props', () => {
    const { toJSON } = render(<CurvedBackground />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('renderiza com cor, altura, borderRadius e posição personalizados', () => {
    const { toJSON } = render(
      <CurvedBackground
        color="#123456"
        height={200}
        borderRadius={50}
        position="top"
      />
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('renderiza com posição bottom', () => {
    const { toJSON } = render(
      <CurvedBackground position="bottom" />
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
