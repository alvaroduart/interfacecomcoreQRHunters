
import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import BaseScreen from './BaseScreen';
import { NavigationContainer } from '@react-navigation/native';

describe('BaseScreen', () => {
  function renderWithNav(children: React.ReactNode) {
    return render(<NavigationContainer>{children}</NavigationContainer>);
  }

  it('renders children correctly', () => {
    const { getByText } = renderWithNav(
      <BaseScreen>
        <Text>Test Child</Text>
      </BaseScreen>
    );
    expect(getByText('Test Child')).toBeTruthy();
  });

  it('applies style and backgroundColor props', () => {
    const { toJSON } = renderWithNav(
      <BaseScreen style={{ backgroundColor: 'red' }}>
        <Text>Styled</Text>
      </BaseScreen>
    );
    expect(toJSON()).toMatchSnapshot();
  });

  it('shows back button and calls onBackPress', () => {
    const onBackPress = jest.fn();
    const { UNSAFE_queryAllByType } = renderWithNav(
      <BaseScreen showBackButton onBackPress={onBackPress}>
        <Text>Back Test</Text>
      </BaseScreen>
    );
    // Find TouchableOpacity and simulate press
    const touchables = UNSAFE_queryAllByType(require('react-native').TouchableOpacity);
    expect(touchables.length).toBeGreaterThan(0);
    touchables[0].props.onPress();
    expect(onBackPress).toHaveBeenCalled();
  });

  it('renders CurvedBackground when showCurvedBackground is true', () => {
    const { UNSAFE_queryAllByType } = renderWithNav(
      <BaseScreen showCurvedBackground>
        <Text>Curved</Text>
      </BaseScreen>
    );
    expect(UNSAFE_queryAllByType(require('./CurvedBackground').default).length).toBeGreaterThan(0);
  });

  it('does not render CurvedBackground when showCurvedBackground is false', () => {
    const { UNSAFE_queryAllByType } = renderWithNav(
      <BaseScreen showCurvedBackground={false}>
        <Text>No Curve</Text>
      </BaseScreen>
    );
    expect(UNSAFE_queryAllByType(require('./CurvedBackground').default).length).toBe(0);
  });
});
