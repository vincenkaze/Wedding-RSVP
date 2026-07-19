import type { SceneNode } from '../core/contract'

export class Scene {
  private nodes: SceneNode[] = []

  addNode(node: SceneNode): void {
    this.nodes.push(node)
  }

  removeNode(id: string): void {
    this.nodes = this.nodes.filter((n) => n.id !== id)
  }

  getNode(id: string): SceneNode | undefined {
    return this.nodes.find((n) => n.id === id)
  }

  getVisibleNodes(): SceneNode[] {
    return this.nodes.filter((n) => n.visible)
  }

  getAllNodes(): SceneNode[] {
    return [...this.nodes]
  }

  setNodeVisible(id: string, visible: boolean): void {
    const node = this.nodes.find((n) => n.id === id)
    if (node) node.visible = visible
  }

  clear(): void {
    this.nodes = []
  }
}
