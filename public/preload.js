const { contextBridge } = require('electron')
const indy = require('indy-sdk')
const NodeFileSystem = require('@aries-framework/node').agentDependencies.FileSystem

const fs = new NodeFileSystem()

// Exposes indy to the main world.
contextBridge.exposeInMainWorld('indy', indy)

// Exposes the filesystem, created by @aries-framework/node, to the main world
contextBridge.exposeInMainWorld('fs', {
  write: fs.write,
  read: fs.read,
  basePath: fs.basePath,
  exists: fs.exists,
})
