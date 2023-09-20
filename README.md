# Deprecation Notice

This project is no longer receiving updates. The Aries Toolbox was an
invaluable tool in helping to bootstrap the Aries Ecosystem by providing ways to
interact with Agents in development. It was one of the earliest UIs to an agent
and it helped shape our thinking of Agents, DIDComm, AnonCreds, and more.

While it served a critical role in the early days of the Aries project, the
Aries Toolbox has worked itself out of a job. Today, we have a rich ecosystem
of agents. It is no longer necessary to demonstrate DIDComm and Credential
Issuance and Verification over DIDComm using the Toolbox because we can do it
with any number of available Issuer, Verifier, and Holder agents.

There are some components of the Toolbox that remain relevant and valuable
tools during Agent development, such as live composition of DIDComm messages
and being able to analyze and inspect DIDComm messages in plaintext. These
concepts will live on in other tools and projects.

If you have questions about this project or replacements for this project, feel
free to reach out on Hyperledger's Discord: https://discord.gg/hyperledger

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
