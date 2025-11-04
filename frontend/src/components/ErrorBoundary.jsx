import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-2xl mx-auto p-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Oups ! Une erreur est survenue
                </h1>
                <p className="text-gray-600 mb-6">
                  Nous sommes désolés, quelque chose s'est mal passé.
                </p>
                
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                      Détails de l'erreur (développement)
                    </summary>
                    <div className="bg-red-50 border border-red-200 rounded p-4 text-sm">
                      <p className="text-red-800 font-mono mb-2">
                        {this.state.error.toString()}
                      </p>
                      <pre className="text-xs text-red-700 overflow-auto">
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </div>
                  </details>
                )}

                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 btn btn-primary"
                >
                  Recharger la page
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
