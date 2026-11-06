import React from 'react';

/**
 * Standard ErrorBoundary component
 * Prevents unhandled JavaScript / React rendering exceptions
 * from unmounting the entire application and producing a blank white screen.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught rendering error:', error, errorInfo);
    this.setState({ errorInfo });
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        console.warn('onError callback failed:', e);
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        if (typeof this.props.fallback === 'function') {
          return this.props.fallback(this.state.error, this.handleReset);
        }
        return this.props.fallback;
      }

      return (
        <div
          style={{
            margin: '20px auto',
            maxWidth: '700px',
            padding: '24px',
            backgroundColor: '#fff7ed',
            border: '1.5px solid #fed7aa',
            borderRadius: '10px',
            color: '#9a3412',
            fontFamily: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#9a3412' }}>
              {this.props.title || 'Form Viewer Display Notice'}
            </h3>
          </div>
          <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', lineHeight: '1.6', color: '#7c2d12' }}>
            {this.props.description ||
              'A formatting discrepancy occurred while rendering this filing. The underlying submission is preserved and safely stored.'}
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={this.handleReset}
              style={{
                backgroundColor: '#ea580c',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 Refresh View
            </button>
            {this.props.onDismiss && (
              <button
                type="button"
                onClick={this.props.onDismiss}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close View
              </button>
            )}
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details style={{ marginTop: '16px', fontSize: '11.5px', color: '#64748b' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Technical Details</summary>
              <pre
                style={{
                  marginTop: '8px',
                  padding: '10px',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  border: '1px solid #fed7aa',
                  overflowX: 'auto',
                  color: '#dc2626',
                  fontFamily: 'monospace',
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
