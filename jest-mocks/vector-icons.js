const React = require('react');
const { View, Text } = require('react-native');

function MockIcon(props) {
  const { name, size, color, style } = props || {};
  return React.createElement(View, { style }, React.createElement(Text, null, name || 'icon'));
}

module.exports = MockIcon;
