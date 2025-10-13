const React = require('react');
const { View, Text } = require('react-native');

function MockIcon(props) {
  const { name, size, color, style } = props || {};
  return React.createElement(View, { style }, React.createElement(Text, null, name || 'icon'));
}

// Export as named and default so both `import { Ionicons }` and `import Icon from` work
module.exports = {
  Ionicons: MockIcon,
  default: MockIcon,
};
