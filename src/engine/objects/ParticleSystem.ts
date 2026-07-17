import type { Vec3 } from '../core/contract'

export interface Particle {
  position: Vec3
  velocity: Vec3
  life: number
  maxLife: number
}

export interface ParticleSystem {
  particles: Particle[]
  active: boolean
  emitRate: number
}

export function createParticleSystem(): ParticleSystem {
  return {
    particles: [],
    active: false,
    emitRate: 10,
  }
}

export function emitParticle(system: ParticleSystem, position: Vec3): void {
  const particle: Particle = {
    position: [...position],
    velocity: [
      (Math.random() - 0.5) * 0.01,
      Math.random() * 0.01,
      (Math.random() - 0.5) * 0.01,
    ],
    life: 0,
    maxLife: 2 + Math.random() * 2,
  }
  system.particles.push(particle)
}

export function updateParticles(system: ParticleSystem, dt: number): void {
  for (let i = system.particles.length - 1; i >= 0; i--) {
    const p = system.particles[i]
    p.life += dt / 1000
    p.position[0] += p.velocity[0] * dt
    p.position[1] += p.velocity[1] * dt
    p.position[2] += p.velocity[2] * dt

    if (p.life >= p.maxLife) {
      system.particles.splice(i, 1)
    }
  }
}
