import { Component, type ReactNode } from 'react';
import { useAppStore } from '../store';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  resetKey: number;
}

/**
 * Phase 20: if anything inside the 3D canvas throws (raycast edge case,
 * mid-mode-switch render, bad geometry), show a recoverable error panel
 * instead of a blank canvas. Reset clears tool/pick state (never the
 * project — the localStorage autosave still protects the worst case) and
 * remounts the canvas subtree.
 */
export default class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, resetKey: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[Viewport] canvas error caught by boundary:', error);
  }

  handleReset = () => {
    try {
      useAppStore.getState().cancelActiveAction();
    } catch {
      // even if the store call fails, still remount the canvas
    }
    this.setState((s) => ({ hasError: false, resetKey: s.resetKey + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-zinc-950">
          <div className="max-w-md text-center space-y-4 p-6 rounded-lg border border-zinc-700 bg-zinc-900">
            <p className="text-lg font-semibold text-amber-300">
              Something went wrong drawing the workspace.
            </p>
            <p className="text-base text-zinc-300">
              Your project is safe — this only affected the 3D view. Click below to
              reset the view and keep working.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2 rounded bg-amber-600 hover:bg-amber-500 text-base font-semibold text-zinc-950"
            >
              Reset view
            </button>
          </div>
        </div>
      );
    }
    return <div key={this.state.resetKey} className="w-full h-full">{this.props.children}</div>;
  }
}
