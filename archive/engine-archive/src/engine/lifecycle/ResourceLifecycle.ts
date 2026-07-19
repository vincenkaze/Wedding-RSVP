export type LifecycleState = 'mount' | 'engine' | 'textures' | 'meshes' | 'run' | 'dispose' | 'freed'

export interface ResourceLifecycleCallbacks {
  onStateChange: (state: LifecycleState) => void
}

export class ResourceLifecycle {
  private state: LifecycleState = 'mount'
  private callbacks: ResourceLifecycleCallbacks

  constructor(callbacks: ResourceLifecycleCallbacks) {
    this.callbacks = callbacks
  }

  getState(): LifecycleState {
    return this.state
  }

  transitionTo(newState: LifecycleState): void {
    if (this.state === 'freed') return
    if (this.state === 'dispose' && newState !== 'freed') return

    this.state = newState
    this.callbacks.onStateChange(newState)
  }

  isDisposed(): boolean {
    return this.state === 'dispose' || this.state === 'freed'
  }
}
