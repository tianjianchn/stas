
const React = require('react');
const { PureComponent, PropTypes } = React;
const { Store } = require('stas');

function connect(selector = defaultSelector) {
  return (TargetComponent) => {
    class ConnectComponent extends PureComponent {
      static propTypes = {
      }

      static contextTypes = {
        store: PropTypes.instanceOf(Store).isRequired,
      }

      constructor(props, context) {
        super(props, context);

        const { store } = context;
        this.state = { ...this.getPropsForTargetComponent(store.state) };

        this._unsubscribe = store.subscribe((newState) => {
          this.setState({ ...this.getPropsForTargetComponent(newState) });
        });
      }

      componentWillUnmount() {
        if (this._unsubscribe) {
          this._unsubscribe();
          this._unsubscribe = null;
        }
      }

      getPropsForTargetComponent(state) {
        const { store } = this.context;
        const dispatch = store.dispatch;
        const selectorParams = { state, dispatch, props: this.props, store };
        const props = selector(selectorParams) || defaultSelector(selectorParams);
        return {...this.props, dispatch, ...props};
      }

      render() {
        return <TargetComponent {...this.state} />;
      }
    }
    return ConnectComponent;
  };
}

function defaultSelector({ state, dispatch, props }) {
  return { state };
}

module.exports = connect;
