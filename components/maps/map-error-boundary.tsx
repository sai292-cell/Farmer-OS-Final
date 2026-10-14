'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { message: string; reloadLabel: string; children: ReactNode }
type State = { hasError: boolean }

export class MapErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Boundary map failed to render', error, info)
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div className="space-y-3 rounded-3xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
        <p>{this.props.message}</p>
        <button type="button" className="min-h-[48px] rounded-2xl bg-primary px-4 font-semibold text-white" onClick={() => window.location.reload()}>
          {this.props.reloadLabel}
        </button>
      </div>
    )
  }
}
