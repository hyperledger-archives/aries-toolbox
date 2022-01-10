# Aries Toolbox

The Toolbox makes interacting with Aries Agent easier for developers and system
administrators.  Toolbox Modules provide user interface for protocols. Debugging
information and details are included and visible.

The ToolBox uses the Discover Features Protocol to determine which protocols are
supported by the connected agent, and will customize the menu of modules to
match supported protocols.

The toolbox can connect to multiple agents simultaneously, each with it's own
window. This makes it possible to manage multiple agents, either in production
or in technical training exercises.

#### Project State

The structure of the project is well formed and ready for contribution.

Consult the [Architecture](docs/architecture.md) and [How Modules
Work](docs/howmoduleswork.md) to learn more or contribute a new module.

Many of the included modules rely on administrative protocols that have not yet
been through a thorough review. These protocols are supported for ACApy via an
extension that can be loaded at runtime.  As administrative protocols are
reviewed, both the appropriate toolbox modules and the ACApy extensions will be
updated.


#### Build Setup

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:9080
yarn run dev

# build electron application for production
yarn run build


```

---

This project was created with [vue-electron-template](https://github.com/mubaidr/vue-electron-template/).

Documentation about the original structure
([electron-vue](https://github.com/SimulatedGREG/electron-vue)) can be found
[here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
