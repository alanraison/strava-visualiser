import React, { ReactElement } from 'react';

interface Props {
  children: ReactElement,
}

interface State {
  hasError: boolean,
  error?: Error,
  errorInfo?: any,
}

class ErrorHandler extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ hasError: true, error, errorInfo })
  }
  render() {
    if (this.state.hasError) {
      return (
        <div>
          Error rendering component:
          {this.state.error ? this.state.error.toString():''} 
          {JSON.stringify(this.state.errorInfo)}
        </div>)
    } else {
      return this.props.children;
    }
  }
}

export default ErrorHandler;