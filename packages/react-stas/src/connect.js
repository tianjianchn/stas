
const React = require('react');
const { PureComponent, PropTypes } = React;
const { Store } = require('stas');

function connect(mapToProps = defaultMapToProps) {
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
        this.state = { ...this.getMapProps(store.state) };

        this._unsubscribe = store.subscribe((newState) => {
          this.setState({ ...this.getMapProps(newState) });
        });
      }

      componentWillUnmount() {
        if (this._unsubscribe) {
          this._unsubscribe();
          this._unsubscribe = null;
        }
      }

      getMapProps(state) {
        const dispatch = this.context.store.dispatch;
        const mprops = mapToProps(state, dispatch);
        if (!mprops) return { state, dispatch };
        if (!mprops.dispatch) mprops.dispatch = dispatch;
        return mprops;
      }

      render() {
        return <TargetComponent {...this.props} {...this.state} />;
      }
    }
    return ConnectComponent;
  };
}

function defaultMapToProps(state, dispatch) {
  return { state, dispatch };
}

module.exports = connect;
