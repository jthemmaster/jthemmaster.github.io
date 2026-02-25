import { SimulationEngine } from './engine'
import type { SimConfig, Atom } from './types'
import type { WorkerCommand, WorkerResponse } from './workerMessages'

let engine: SimulationEngine | null = null
let running = false
let intervalId: ReturnType<typeof setInterval> | null = null
let lastPerfTime = performance.now()
let stepsThisInterval = 0
let stepsPerSecond = 0
let stepsPerUpdate = 10

function sendResponse(response: WorkerResponse) {
  self.postMessage(response)
}

function sendState(result: ReturnType<SimulationEngine['doStep']>) {
  const response: WorkerResponse = {
    type: 'STATE_UPDATE',
    positions: result.atoms.map((a) => [...a.position] as [number, number, number]),
    forces: result.atoms.map((a) => [...a.force] as [number, number, number]),
    elements: result.atoms.map((a) => a.element),
    bonds: result.bonds,
    species: result.species,
    temperature: result.temperature,
    kineticEnergy: result.kineticEnergy,
    potentialEnergy: result.potentialEnergy,
    totalEnergy: result.totalEnergy,
    step: result.step,
    time: result.time,
    stepsPerSecond,
  }
  sendResponse(response)
}

function runSteps() {
  if (!engine || !running) return

  let result
  for (let i = 0; i < stepsPerUpdate; i++) {
    result = engine.doStep()
    stepsThisInterval++
  }

  // Measure performance
  const now = performance.now()
  const elapsed = now - lastPerfTime
  if (elapsed >= 1000) {
    stepsPerSecond = (stepsThisInterval / elapsed) * 1000
    stepsThisInterval = 0
    lastPerfTime = now
  }

  if (result) {
    sendState(result)
  }
}

function startLoop() {
  if (intervalId !== null) return
  running = true
  lastPerfTime = performance.now()
  stepsThisInterval = 0
  // ~30 updates per second to main thread
  intervalId = setInterval(runSteps, 33)
}

function stopLoop() {
  running = false
  if (intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const msg = e.data

  switch (msg.type) {
    case 'INIT': {
      engine = new SimulationEngine(msg.config)
      stepsPerUpdate = msg.config.stepsPerUpdate || 10
      engine.init(msg.atoms)
      // Send initial state
      const initResult = engine.doStep()
      sendState(initResult)
      sendResponse({ type: 'READY' })
      break
    }

    case 'START': {
      if (!engine) {
        sendResponse({ type: 'ERROR', message: 'Engine not initialized' })
        return
      }
      startLoop()
      break
    }

    case 'STOP': {
      stopLoop()
      break
    }

    case 'STEP': {
      if (!engine) {
        sendResponse({ type: 'ERROR', message: 'Engine not initialized' })
        return
      }
      const stepResult = engine.doStep()
      sendState(stepResult)
      break
    }

    case 'UPDATE_CONFIG': {
      if (!engine) return
      if (msg.config.stepsPerUpdate !== undefined) {
        stepsPerUpdate = msg.config.stepsPerUpdate
      }
      engine.updateConfig(msg.config)
      break
    }

    case 'RESET': {
      stopLoop()
      engine = new SimulationEngine(msg.config)
      stepsPerUpdate = msg.config.stepsPerUpdate || 10
      engine.init(msg.atoms)
      const resetResult = engine.doStep()
      sendState(resetResult)
      break
    }
  }
}
