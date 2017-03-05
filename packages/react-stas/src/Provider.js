
const { Component, PropTypes, Children } = require('react');
const { Store } = require('stas-core');

class Provider extends Component {
  static propTypes = {
    store: PropTypes.instanceOf(Store).isRequired,
    children: PropTypes.element.isRequired,
  }

  static childContextTypes = {
    store: PropTypes.instanceOf(Store),
  }

  getChildContext() {
    return { store: this.props.store };
  }

  render() {
    return Children.only(this.props.children);
  }
}

module.exports = Provider;
