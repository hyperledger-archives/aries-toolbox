<template>
  <el-row>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">Aries Toolbox</a>
    </nav>

    <el-card shadow="never" class="agent-card" v-for="a in agent_list" v-bind:key="a.id">
      <span slot="header"><strong>{{a.label}}</strong></span>
      <div>
        <div v-show="a.active_as_mediator" class="mediator">Mediator</div>
        <el-button type="text" @click="openConnection(a)">Open</el-button>
        <el-button type="text" @click="deleteConnection(a)">Delete</el-button>
      </div>
    </el-card>

    <hr v-if="agent_list.length > 0">

    <div class="invite-entry">
      <h5>New Agent Connection</h5>
      <el-form :inline="true">
        <el-input
          v-model="new_agent_invitation"
          placeholder="Paste agent invitation"
          @keypress.enter.native="connect_clicked">
        <el-button
          slot="append"
          type="primary"
          icon="el-icon-plus"
          @click="connect_clicked"
          >Connect</el-button>
        </el-input>
      </el-form>
    </div>
    <el-alert v-show="invitation_error != ''"
      title="Invitation Error"
      type="error"
      :description="invitation_error"
      show-icon>
    </el-alert>
    <el-card shadow="never" class="function_card" id="new_agent_invitation" v-show="hasMediator && false">
      <span slot="header">New Agent Invitation</span>
      <div>
        <el-form :inline="true">
          <el-input v-model="new_invitation_label" placeholder="Label"></el-input>
          <el-button type="primary" @click="generate_invitation">Generate</el-button>
        </el-form>
      </div>
      <el-alert v-show="invitation_error != ''"
        title="Invitation Error"
        type="error"
        :description="invitation_error"
        show-icon>
      </el-alert>
    </el-card>
    <div class="invite-entry">
    <h5>Connect to Mediator</h5>
      <el-form :inline="true">
        <el-input
          v-model="new_mediator_invitation"
          placeholder="Paste mediator invitation"
          @keypress.enter.native="process_mediator_invitation">
        <el-button
          slot="append"
          type="primary"
          icon="el-icon-plus"
          @click="process_mediator_invitation"
          >Connect</el-button>
        </el-input>
      </el-form>
    </div>
    <el-alert v-show="mediation_error != ''"
      title="Invitation Error"
      type="error"
      :description="mediation_error"
      show-icon>
    </el-alert>
  </el-row>
</template>

<script>
const electron = require('electron');
//import DIDComm from 'didcomm-js';
import { mapState, mapActions, mapGetters } from "vuex"
import message_bus from '@/message_bus.js';
import { from_store } from '../connection_detail.js';
import { base64_decode } from '../base64.js';
import ConnectionsProtocol from './ConnectionsProtocol.js';
import DIDExProtocol from './DIDExProtocol'
const uuidv4 = require('uuid/v4');
const coordinate_mediation =
  (type) => `did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/coordinate-mediation/1.0/${type}`;

export default {
  name: 'agent-list',
  components: {  },
  mixins: [
    message_bus({ events: {
      'toolbox-mediator-change': (vm) => {
        // broadcast via ipc to all the other windows
        for(const [key, win] of Object.entries(vm.agent_windows)){
          win.webContents.send("toolbox-mediator-change", {});
        }
      }
    }})
  ],
  computed: {
    ...mapState("Agents", ["agent_list"]),
    ...mapGetters("Agents", ["get_agent"]),
    hasMediator: function(){
      return this.agent_list.find(a => a.active_as_mediator === true);
    }
  },
  watch: {
    agent_list(newValue, oldValue) {
      // Do whatever makes sense now
      let mediator_agent = newValue.find(a => a.active_as_mediator === true);
      if (mediator_agent) {
        this.mediatorConnect(mediator_agent);
      } else {
        //mediator was deleted
        this.mediatorCleanup();
      }
      this.$message_bus.$emit('toolbox-mediator-change');
    },
  },
  methods: {
    ...mapActions("Agents", ["add_agent", "update_agent", "delete_agent"]),

    openConnection: async function(a) {
      const modalPath = process.env.NODE_ENV === 'development'
        ? 'http://localhost:9080/#/agent/'+a.id
        : `file://${__dirname}/index.html#agent/`+a.id;
      let win = new electron.remote.BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
          webSecurity: false,
          contextIsolation: false,
          nodeIntegration: true,
          enableRemoteModule: true,
        }
      })

      // TODO: Get the close handler to work to keep track of open windows only
      win.on('close', function () {
        win = null;
        delete this.agent_windows[a.id];
      });
      win.loadURL(modalPath);
      let window_key = a.my_key_b58.publicKey;
      this.agent_windows[window_key] = win;

    },

    deleteConnection: async function(a){
      this.delete_agent(a);
    },

    mediatorConnect: async function(mediator_agent){
      let vm = this; //hold reference
      let agent_info = await this.get_agent(mediator_agent.id);
      this.mediator_connection = from_store(agent_info);
      this.mediator_connection.enable_return_route();
      this.mediator_connection.unpacked_processor = this.mediatorInbound(this.mediator_connection);
      //start poll timer
      if(this.mediator_connection.needs_return_route_poll()){
        this.return_route_poll_timer = setInterval(this.return_route_poll, 10000);
      }
      //TODO: open connection?
      this.mediator_connection.on_disconnect = function(){
        vm.mediator_connection.send_message({
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping",
          "response_requested": false
        });
      };
      this.mediator_connection.send_message({
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping",
        "response_requested": false
      });
      console.log("mediator connected", this.mediator_connection);
    },

    /**
     * Process messages received through mediator.
     */
    mediatorInbound: function(connection) {
      return async (packed_msg) => {
        console.log("mediator inbound message", packed_msg);
        let recipients = await connection.extract_packed_message_recipients(packed_msg);
        // Allow the AgentList to obtain a message from the mediator through the
        // message_bus
        let found = recipients.find(
          r => r === connection.my_key.publicKey_b58
        );
        if(found != null) {
          console.log('Unpacking and notifying on the message bus');
          let msg = await connection.unpackMessage(packed_msg);
          console.log(this.$message_bus);
          this.$message_bus.$emit(msg['@type'], msg);
          console.log('Got message from mediator for toolbox:', msg);
        }
        console.log("inbound message recipients", recipients);
        // TODO: get inbound message to proper agent window. this needs to happen even if window not open.
        // store message
        let message_uuid = uuidv4();

        // send message
        let window_key = recipients[0];
        // TODO: detect lack of open window.
        let window = this.agent_windows[window_key];
        let msg_bundle = {
            id: message_uuid,
            recipient: recipients[0],
            msg: packed_msg
          };
        if(window !== undefined){
          window.webContents.send("inbound_message", msg_bundle);
          console.log("delivered", msg_bundle);
        } else {
          // Queue message for when window opens
          if(!(window_key in this.window_message_queue)){
            this.window_message_queue[window_key] = [];
          }
          this.window_message_queue[window_key].push(msg_bundle);
          console.log("queued", msg_bundle);
        }
        //TODO: deliver queued message after window opens.
      };
    },

    /**
     * Tear down mediator info after mediator connection deletion.
     */
    mediatorCleanup: function(){
      if(
        this.mediator_connection &&
        this.mediator_connection.needs_return_route_poll &&
        this.mediator_connection.needs_return_route_poll()
      ) {
        clearInterval(this.return_route_poll_timer)
      }
      this.mediator_connection = null;
    },

    /**
     * Generate an invitation for connecting to the toolbox through mediation.
     */
    generate_invitation: function(){
      // TODO Implement
    },

    /**
     * Inform the mediator of a new key to route to this agent.
     * @param {string} verkey Key to add to mediator routes.
     */
    async add_route_to_mediator(verkey) {
      // prepare message
      let msg = {
        "@type": coordinate_mediation('keylist-update'),
        updates: [
          {
            recipient_key: verkey,
            action: "add"
          }
        ]
      };
      this.mediator_connection.send_message(msg);
      let response = await this.message_of_type(
        coordinate_mediation('keylist-update-response')
      );
      for (let update of response.updated) {
        console.log(`${update.action}(${update.recipient_key}): ${update.result}`);
        // TODO do something with errors
      }
    },

    async send_mediation_request(connection) {
      // prepare message
      let msg = {
        "@type": coordinate_mediation('mediate-request'),
      };
      await connection.send_message(msg);
      try {
        let response = await this.message_of_type(
          coordinate_mediation('mediate-grant'), 1000
        );
        connection.active_as_mediator = true;
        connection.mediator_info = {
          endpoint: response.endpoint,
          routing_keys: response.routing_keys
        };
        this.update_agent(connection.to_store());
        console.log("connection to mediate through", connection, connection.mediator_info);
      } catch (err) {
        console.error("Encountered error while attempting to establish mediation:", err)
      }
    },

    async process_mediator_invitation() {
      let connection = await this.newAgentInvitationProcess(this.new_mediator_invitation);
      connection.unpacked_processor = this.mediatorInbound(connection);
      await this.send_mediation_request(connection);
      this.mediatorConnect(connection);
      this.new_mediator_invitation = "";
    },

    getUrlVars: function(url) {
        var vars = {};
        var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
          vars[key] = value;
        });
        return vars;
      },

    async newAgentInvitationProcess (raw_invitation) {
      let urlVars = this.getUrlVars(raw_invitation); 
      if ("oob" in urlVars) {
        //OOB Invitation
        let invite_b64 = this.getUrlVars(raw_invitation)["oob"];
      
        //base 64 decode
        let invite_string = base64_decode(invite_b64);
        let invite = JSON.parse(invite_string);
          
        const protocolToHandler = {
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0": ConnectionsProtocol,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/didexchange/1.0": DIDExProtocol,
          "https://didcomm.org/connections/1.0": ConnectionsProtocol,
          "https://didcomm.org/didexchange/1.0": DIDExProtocol,
        }

        let handled = false

        for (const protocol of invite.handshake_protocols) {
            if (protocol in protocolToHandler) {
                let connection = await protocolToHandler[protocol].connectByInvite(this, invite);
                handled = true;
                return connection;
            }
        }

        if (!handled) {
            throw new Error("No supported handshake_protocols supplied")
        }
      } else if ("c_i" in urlVars) {
        //Connections Invitation
        let invite_b64 = this.getUrlVars(raw_invitation)["c_i"];
        //base 64 decode
        let invite_string = base64_decode(invite_b64);
        let invite = JSON.parse(invite_string);

        return await ConnectionsProtocol.connectByInvite(this, invite);
      }
    },

    async connect_clicked() {
      try {
        await this.newAgentInvitationProcess(this.new_agent_invitation);
      } catch (err) {
        console.log("request post err", err);
        this.invitation_error = err.message;
      }
      this.new_agent_invitation = "";
      }
  },
  created: async function(){
    let mediator_agent = this.agent_list.find(a => a.active_as_mediator === true);
    if(mediator_agent == null) {
      return; //no connection needed
    }
    this.mediatorConnect(mediator_agent);
  },
  beforeDestory: function(){
    this.mediatorCleanup();
  },
  data() {
    return {
      new_agent_invitation: "",
      new_mediator_invitation: "",
      invitation_error: "",
      mediation_error: "",
      new_invitation_label: "",
      agent_windows: {},
      mediator_connection: {},
      window_message_queue: {},
    }

  }
}
</script>

<style>
.agent-card:first-of-type {
  margin-top: .5em;
}
.agent-card, .function_card {
  margin: .5em 1em;
  border: 1px solid rgba(0, 0, 0, 0.125);
}
.agent-card .el-card__header,
.function_card .el-card__header {
  padding: .75rem 1.25rem;
  background-color: rgba(0, 0, 0, 0.03);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}
.agent-card .el-card__body {
  padding: 0 1em;
}
  .mediator {
    font-size: .9em;
    font-style: italic;
    text-align: right;
    float:right;
    margin-top: 10px;
  }
  .invite-entry {
    margin: 1em 1em;
  }
  hr {
    margin: 1em;
  }
</style>
