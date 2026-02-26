import { Component, type ReactNode } from 'react'
import Logo from '../ui/Logo'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: string
}

export default class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }

  componentDidCatch(error: Error) {
    console.warn('3D viewer error:', error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-bg-primary">
          <div className="text-center space-y-4 max-w-[300px]">
            <div className="flex justify-center opacity-20">
              <Logo size="lg" showText={false} />
            </div>
            <div>
              <div className="text-text-secondary text-sm font-medium mb-1">
                3D Viewer Unavailable
              </div>
              <div className="text-text-muted text-xs leading-relaxed">
                WebGL is required for the molecular viewer.
                The simulation engine is still running — check the stats panel.
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
