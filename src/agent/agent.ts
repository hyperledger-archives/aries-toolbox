import { Agent, AriesFrameworkError, ConsoleLogger, FileSystem, IndySdkError, LogLevel } from '@aries-framework/core'
import fetch from 'electron-fetch'
import events from 'events'
import Indy from 'indy-sdk'
import nodeFetch from 'node-fetch'
import ws from 'ws'

// agentDependencies in the config requires filesystem to a class instance
class ElectronFileSystem implements FileSystem {
  basePath = window.fs.basePath
  exists = window.fs.exists
  read = window.fs.read
  write = window.fs.write
}

// Adds "correct" error handling to indy functions
// TODO: Improve on typings
// TODO: Extract to a more logical location
const wrapIndyCallWithErrorHandling = (func: any) => {
  return async (...args: any[]) => {
    try {
      return await func(...args)
    } catch (e) {
      if (e instanceof Error || e instanceof AriesFrameworkError || e instanceof IndySdkError) {
        const error = {
          name: 'IndyError',
          indyName: e.message,
          message: e.message,
          stack: e.stack,
        }
        throw error
      }
    }
  }
}

const indyWithErrorHandling = Object.fromEntries(
  Object.entries(window.indy).map(([funcName, funcImpl]) => [funcName, wrapIndyCallWithErrorHandling(funcImpl)])
)

export const setupAndInitializeAgent = async (label = 'test agent') => {
  // Electron specific agent dependencies
  const electronAgentDependencies = {
    indy: indyWithErrorHandling as unknown as typeof Indy,
    FileSystem: ElectronFileSystem,
    fetch: fetch as unknown as typeof nodeFetch,
    EventEmitterClass: events.EventEmitter,
    WebSocketClass: ws,
  }

  const agent = new Agent(
    { label, walletConfig: { id: label, key: label }, logger: new ConsoleLogger(LogLevel.test) },
    electronAgentDependencies
  )

  await agent.initialize()

  return agent
}
