# Toolbox Architecture

The toolbox is built upon Electron, using Vue and ElementUI for the user
interface. If you are interested mostly in creating a new UI module, see [How
Modules Work](howmoduleswork.md).

## AgentList

The first screen upon launch is the AgentList screen. The main vue component for
this window is `src/renderer/components/AgentList.vue`. This window is focused on
connecting to configured agents. Agents can also be added and removed.

Each agent receives it's own window upon opening, allowing easy interaction with
multiple agents at a time for demonstration or administrative purposes.

## AgentBase

This screen serves as an interface to each connected agent. The main component
is `src\renderer\components\AgentBase.vue` and is responsible for the top title
and left menu.

The menu is created at runtime based on the modules present in
`src/renderer/components` and the protocols supported by the connected agent.
Supported protocols are discovered through the _Discover Features Protocol_. 

The dynamic menu allows for the toolbox to support a very wide variety of
protocols, and only show the user the modules that can be used with a particular
connected agent. This prevents user confusion while allowing the widest possible
array of supported protocols and modules.

## Message Bus

The `message_bus.js` is included in each module, and provides a singleton vue
component used to route messages between vue components. Inbound messages are
passed through the message bus as well as a few internal notification messages.

## Share

The `share.js` is also included in each module, and is where the real magic
happens. This vue component is used as a shared place to manage state, manages
the listeners of each module, and provides the plumbing that allows each module
component to be coded up in a simple way.
