<template>
  <div id="wrapper" class="container-fluid">

    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <a class="navbar-brand" href="#">{{connection.label}}</a>
      <!-- active privileged did -->
      <el-form :model=active_ledger_selector>
          <el-select v-model="active_ledger_selector.did" filterable placeholder="activate did" >
            <el-option
              v-for="did in dids"
              :key="did.did"
              :label="did.did"
              :value="did.did">
            </el-option>
          </el-select>
          <el-select v-model="active_ledger_selector.ledger" filterable placeholder="activate ledger" >
            <el-option
              v-for="ledger in ledgers"
              :key="ledger.name"
              :label="ledger.name"
              :value="ledger.name">
            </el-option>
          </el-select>
      </el-form>
    </nav>

    <el-tabs type="border-card">
    <el-tab-pane label="Dids">
      <p>Dids:</p>
      <el-collapse v-model="expanded_dids_items">
            <div v-for="(did, key) in dids" :key="key">
                <el-collapse-item v-bind:title="'did: ' + did.did + ', vk: ' + did.verkey" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="did">
                              </vue-json-pretty>
                              <!--
                                - button identify did permission on ledger
                                - button activate did
                                - publish did on active ledger -->
                            <el-button v-on:click="collapse_expanded_did_item(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Create a Did:</p>
        <el-form :model=did_form>
        <el-form-group >
          <span slot="label">Did:</span>
            <el-input v-model="did_form.did" style="width:100px;"> </el-input>
          <span slot="label">Seed:</span>
            <el-input v-model="did_form.seed" style="width:100px;"> </el-input>
          <span slot="label">Alias:</span>
            <el-input v-model="did_form.label" style="width:100px;"> </el-input>
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="createDid()">add trusted issuer</el-button>
        </el-form-item>
        </el-form>
      </el-tab-pane>

    <el-tab-pane label="Ledger">
      <p>Ledgers:</p>
      <el-collapse v-model="expanded_ledger_items">
            <div v-for="(ledger, key) in ledgers" :key="key">
                <el-collapse-item v-bind:title="'Name: ' + ledger.name" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="ledger">
                              </vue-json-pretty>
                              <el-form class="ledger-form">
                                <!-- activate ledger -->
                                <el-form-item >
                                  <el-button type="primary" @click="removeLedger(ledger)">delete</el-button>
                                </el-form-item>
                            <el-button v-on:click="collapse_expanded_ledger_item(key)">^</el-button>
                            </el-form>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Add new ledger:</p>
        <el-form :model=ledger_form>
        <el-form-group >
          <span slot="label">Name:</span>
            <el-input v-model="ledger_form.name" style="width:100px;"> </el-input>
          <span slot="label">Url to genesis file:</span>
            <el-input v-model="ledger_form.gen_url" style="width:100px;"> </el-input>
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="addLedger()">add new ledger</el-button>
        </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Connections">
        <el-row>
          <agent-connection-list
            title="Active Connections:"
            editable="true"
            v-bind:list="activeConnections"
            v-on:connection-editted="updateAgentConnection"
            v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
          <agent-connection-list
            title="Pending Connections:"
            editable="true"
            v-bind:list="pendingConnections"
            v-on:connection-editted="updateAgentConnection"
            v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
          <agent-connection-list
            title="Open Invitations:"
            editable="true"
            v-bind:list="openInvitations"
            v-on:connection-editted="updateAgentConnection"
            v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
          <agent-connection-list
            title="Multiuse Invitations:"
            editable="true"
            v-bind:list="multiUseInvitations"
            v-on:connection-editted="updateAgentConnection"
            v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
          <agent-connection-list
            title="New Invitations:"
            editable="false"
            v-bind:list="invitations"
            v-on:connection-editted="updateAgentConnection"
            v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>
          <agent-connection-list
            title="Failed Connections:"
            editable="false"
            v-bind:list="errorStateConnections"
            v-on:connection-editted="updateAgentConnection"
            v-on:connection-deleted="deleteAgentConnection"></agent-connection-list>

        <p>Create Invitations:</p>
        <el-form>
        <el-form-group >
          <span slot="label">Label:</span>
            <el-input v-model="invite_label_form" style="width:100px;"> </el-input>
          <span slot="label">Role:</span>
            <el-input v-model="invite_role_form" style="width:100px;"> </el-input>
          <span slot="label">Acceptance:</span>
            <el-input v-model="invite_accept_form" style="width:100px;"> </el-input>
          <span slot="label">Public:</span>
            <el-switch label="Public:" v-model="invite_public_form"></el-switch>
          <span slot="label">Multi Use:</span>
            <el-switch label="Multi Use:" v-model="invite_multi_use_form"></el-switch>
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="fetchNewInvite()">create new invite</el-button>
        </el-form-item>
        </el-form>
        <p>Add connection from invitation:</p>
        <el-form :model=agent_invitation_form>
        <el-form-group >
          <span slot="label">invitation:</span>
            <el-input v-model="agent_invitation_form.invitation" style="width:100px;"> </el-input>
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="addAgent()">Add Agent</el-button>
        </el-form-item>
        </el-form>
        <p>Add Static Agent:</p>
        <el-form :model=static_agent_form>
        <el-form-group >
          <span slot="label">Label:</span>
            <el-input v-model="static_agent_form.label" style="width:100px;"> </el-input>
          <span slot="label">Role:</span>
            <el-input v-model="static_agent_form.role" style="width:100px;"> </el-input>
          <span slot="label">Static Did:</span>
            <el-input v-model="static_agent_form.static_did" style="width:100px;"> </el-input>
          <span slot="label">Static Key:</span>
            <el-input v-model="static_agent_form.static_key" style="width:100px;"> </el-input>
          <span slot="label">Static Endpoint:</span>
            <el-input v-model="static_agent_form.static_endpoint" style="width:100px;"> </el-input>
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="addStaticAgent()">Add Static Agent</el-button>
        </el-form-item>
        </el-form>

        </el-row>
      </el-tab-pane>

      <el-tab-pane label="Compose">
        <input type="button" class="btn btn-secondary" v-on:click="compose_send()" value="Send"/>
        <v-jsoneditor v-model="compose_json">
        </v-jsoneditor>
        <div class="message-display" v-for="(msg, index) in most_recent_sent_msgs" :key="index">
          <i>{{msg.direction}}</i>
          <vue-json-pretty
            :deep=1
            :data="msg.msg">
          </vue-json-pretty>
        </div>
      </el-tab-pane>

      <el-tab-pane label="BasicMessage">
        <div style="margin-bottom: 1em;">
          <el-input placeholder="Message to send" @keyup.enter.native="basicmessage_send" v-model="basicmessage_compose" style="width:500px;"></el-input>
          <el-button type="primary" @click="basicmessage_send">Send</el-button>

        </div>
        <div v-for="m in basicmessage_history.slice().reverse()" :key="m.msg['@id']">
          <div :class="'basicmessage-'+m.direction">{{m.msg.content}}</div>
        </div>

      </el-tab-pane>
      <el-tab-pane label="Message History">

        <input type="button" class="btn btn-secondary" v-on:click="message_history_clear()" value="Clear"/>
        <div class="message-display" v-for="m in message_history.slice().reverse()" :key="m.msg['@id']">
         <i>{{m.direction}}</i>
          <vue-json-pretty
            :deep=1
            :data="m.msg">
          </vue-json-pretty>
        </div>

      </el-tab-pane>
      <el-tab-pane label="Schema">
      <p>Schemas:</p>
      <el-collapse v-model="exspanded_schemas_items">
            <div v-for="(schema, key, index) in schemas">
                <el-collapse-item v-bind:title="schema.name +','+ schema.version" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="schema">
                              </vue-json-pretty>
                            <el-button @click="publishSchema(key,'global_pool')">Publish</el-button>
                            <el-button v-if="!schema.ledger" type="primary" @click="removeSchema(key,'global_pool')">delete</el-button>
                            <el-button v-on:click="collapse_expanded_schemas(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Create schema:</p>
        <el-form :model=schemas_form>
        <el-form-group >
          <span slot="label">Name:</span>
            <el-input v-model="schemas_form.name" style="width:100px;"> </el-input>
          <span slot="label">Version:</span>
            <el-input v-model="schemas_form.version" style="width:100px;"> </el-input>
          <p>Attributes:</p>
          <ul>
            <li v-for='attribute in schemas_form.attributes'>
              {{ attribute }}
            </li>
          </ul>
          <span slot="label">Attribute:</span>
            <el-input @keyup.enter.native="schema_add_attribute" v-model="schemas_form.attribute" style="width:100px;"> </el-input>
            <el-button type="primary" @click="schema_add_attribute" >add attribute</el-button>
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="storeSchema()">create new schema</el-button>
        </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Credential Issuance">
        <!--
          /**
          * credential
          * states
          * - proposals - <stretch goal>
          *     requested credential, recieved from a "send-proposal" API call.
          *         <Button> send offer
          * - STATE_OFFER_SENT -
          *     pending credential offer made to a holder, result of "send-offer" API call.
          * - STATE_REQUEST_RECEIVED -
          *     request from holder containing credential attribute data and blinded secret. result of "send-request"
          *         <Button> issue
          * - STATE_ISSUED
          *     issued with data from request. result of "issue" API call.
          * - STATE_STORED
          *     ack received
           */
        -->
        <p>Credential Definitions:</p>
        <el-collapse v-model="exspanded_cred_def_items">
            <div v-for="(cred_def, key, index) in cred_defs">
                <el-collapse-item v-bind:title="cred_def.cred_def_id" :name="key">
                    <el-row>
                        <div>
                          <vue-json-pretty
                            :deep=2
                            :data="cred_def">
                          </vue-json-pretty>
                          <el-collapse v-model="exspanded_credential_issuer_items">
                          <el-collapse-item title='Issue a credential offer' :name="key">
                            <el-row>
                              <div v-for="(attribute, key, index) in cred_def.primary.r" v-if="key!='master_secret'" prop="cred_def">
                                <span slot="label">{{key}}:</span>
                                  <el-input v-model="cred_def_form[cred_def.cred_def_id].attributes[index]" style="width:100px;"> </el-input>
                              </div>
                              <el-form :model=cred_def_form>
                                <el-form-item label="select connection:" >
                                  <el-select v-model="cred_def_form.connection" filterable placeholder="select connection to issue to:" >
                                    <el-option
                                      v-for="connection in activeConnections"
                                      :key="connection.connection_id"
                                      :label="connection.their_label +' ('+connection.connection_id+')'"
                                      :value="connection.connection_id">
                                    </el-option>
                                  </el-select>
                                </el-form-item>
                              </el-form>
                              <el-button @click="issueCredentialOffer(key,'global_pool')">Issue a credential offer</el-button>
                            </el-row>
                          </el-collapse-item>
                          </el-collapse>

                        <el-button v-on:click="collapse_expanded_cred_def(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Create Credential Definition:</p>
        <el-form :model=cred_def_form>
        <el-form-item label="select ledger:" >
            <el-select v-model="cred_def_form.ledger" filterable placeholder="sov" >
              <el-option
                v-for="ledger in ledgers"
                :key="ledger.id"
                :label="ledger.name"
                :value="ledger.id">
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="select schema:" prop="cred_def_form">
            <el-select v-model="cred_def_form.schema" filterable placeholder="schema">
              <el-option
                v-for="schema in schemas"
                :key="schema.id"
                :label="schema.name +' '+ schema.version"
                :value="schema">
              </el-option>
            </el-select>
        </el-form-item>
<!--         <el-form-item label="select ledger:" >
            <el-select v-model="cred_def_form.ledger" filterable placeholder="sov" >
              <el-option
                v-for="ledger in ledgers"
                :key="ledger.id"
                :label="ledger.name"
                :value="ledger.id">
              </el-option>
            </el-select>
        </el-form-item>
        <el-form-item v-if="cred_def_form.ledger in ledgers" label="select schema:" prop="cred_def_form">
            <el-select v-model="cred_def_form" filterable placeholder="schema">
              <el-option
                v-for="schema in ledgerSchemas(ledgers[cred_def_form.ledger].name)"
                :key="schema.id"
                :label="schema.name +' '+ schema.version"
                :value="schema.id">
              </el-option>
            </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="createCredentialDefinition()">create new credential definition</el-button>
        </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Trusted Issuers">
      <p>Issuers:</p>
      <el-collapse v-model="expanded_issuers_items">
            <div v-for="(did, key, index) in trusted_issuers">
                <el-collapse-item v-bind:title="did.label +', '+ did.id" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="did">
                              </vue-json-pretty>
                            <el-button type="primary" @click="removeTrustedIssuer(key)">delete</el-button>
                            <el-button type="primary" @click="resolveTrustedIssuer(key)">resolve issuer did</el-button>
                            <el-button v-on:click="collapse_expanded_trusted_issuer(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Add Trusted Issuer:</p>
        <el-form :model=trusted_issuers_form>
        <el-form-group >
          <span slot="label">Did:</span>
            <el-input v-model="trusted_issuers_form.did" style="width:100px;"> </el-input>
          <span slot="label">Label:</span>
            <el-input v-model="trusted_issuers_form.label" style="width:100px;"> </el-input>
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="storeTrustedIssuer()">add trusted issuer</el-button>
        </el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="My Credentials">
        <!--
          /**
          * credential
          * states
          * - proposals -<stretch goal>
          *     request credential,
          *         <Button> select connection , select cred_def and send request,
          * - STATE_OFFER_RECEIVED -
          *         <Button> send request
          * - STATE_REQUEST_SENT -
          * - STATE_CREDENTIAL_RECEIVED
          *     issued with data from request. result of "issue" API call.
          *       <Button> Accept , send ack or problem report
          * - STATE_STORED
          *
           */
        -->
      </el-tab-pane>
      <el-tab-pane label="Presentation">
      <p>Presentation Definitions:</p>
        <el-collapse v-model="exspanded_pres_def_items">
            <div v-for="(pres_def, key, index) in presentation_definitions">
                <el-collapse-item v-bind:title="pres_def.name" :name="key">
                    <el-row>
                        <div>
                          <vue-json-pretty
                            :deep=3
                            :data="pres_def">
                          </vue-json-pretty>
                          <el-collapse v-model="exspanded_presentation_request_items">
                          <el-collapse-item title='Issue a credential presentation request' :name="key">
                            <el-row>
                              <el-form :model=pres_def_form>
                                <el-form-item label="select connection:" >
                                  <el-select v-model="pres_def_form.connection" filterable placeholder="to issue to" >
                                    <el-option
                                      v-for="connection in activeConnections"
                                      :key="connection.connection_id"
                                      :label="connection.their_label +' ('+connection.connection_id+')'"
                                      :value="connection.connection_id">
                                    </el-option>
                                  </el-select>
                                </el-form-item>
                              </el-form>
                              <el-button @click="issuePresentationRequest(pres_def.pres_def_id,pres_def_form.connection)">issue a credential presentation request</el-button>
                            </el-row>
                          </el-collapse-item>
                          </el-collapse>
                        <el-button v-on:click="collapse_expanded_pres_def(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
        </el-collapse>
        <p>Create Presentation Definition:</p>
        <el-form :model=pres_def_form>
        <el-form-group >
          <span slot="label">Name:</span>
            <el-input v-model="pres_def_form.name" style="width:100px;"> </el-input>
          <span slot="label">Version:</span>
            <el-input v-model="pres_def_form.version" style="width:100px;"> </el-input>
          <p>Request Attributes:</p>
          <ul>
            <li v-for='(attribute,index) in pres_def_form.requested_attributes'>
              <vue-json-pretty
                :deep=3
                :data="attribute">
              </vue-json-pretty>
              <ul>
                <li v-for='restriction in pres_def_form.requested_attributes[index].restrictions'>
                  {{restriction.issuer_did}}
                </li>
              </ul>
              <el-row>
                <el-form :model=pres_def_form>
                  <el-form-item label="Trusted Issuer:" >
                    <el-select v-model="pres_def_form.temp_attrs[index].restriction" filterable placeholder="Trusted Issuer" >
                      <el-option
                        v-for="issuer in trusted_issuers"
                        :key="issuer.did"
                        :label="issuer.label +' ('+issuer.did+')'"
                        :value="issuer.did">
                      </el-option>
                    </el-select>
                    <span slot="label">Restriction:</span>
                      <el-button type="primary" @click="add_pres_def_restriction(index)" >add restriction</el-button>
                  </el-form-item>
                </el-form>
                  <span slot="label">Restriction:</span>
                    <el-button type="primary" @click="add_pres_def_restriction(index)" >add restriction</el-button>
              </el-row>
            </li>
          </ul>
          <span slot="label">Attribute:</span>
            <el-input @keyup.enter.native="add_pres_def_attribute" v-model="pres_def_form.requested_attribute" style="width:100px;"> </el-input>
            <el-button type="primary" @click="add_pres_def_attribute" >add request attribute</el-button>
        </el-form-group>
        <el-form-item>
            <el-button type="primary" @click="storePresentationDefinition()">create new presentation definition</el-button>
        </el-form-item>
          <p>Presentation Requests Sent:</p>
          <el-collapse v-model="expanded_pres_req_sent_items">
            <div v-for="(pres_req, key, index) in sentPresentationRequests">
                <el-collapse-item v-bind:title="labelFromConnection(pres_req.connection_id)" :name="key">
                    <el-row>
                        <div>
                          <vue-json-pretty
                            :deep=1
                            :data="pres_req">
                          </vue-json-pretty>
                            <el-button v-on:click="collapse_expanded_pres_req_sent(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
          </el-collapse>
          <p>Presentation Requests Received:</p>
          <el-collapse v-model="expanded_pres_req_rec_items">
            <div v-for="(pres_req, key, index) in receivedPresentationRequests">
                <el-collapse-item v-bind:title="labelFromConnection(pres_req.connection_id)" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="pres_req">
                              </vue-json-pretty>
                            <el-button v-on:click="collapse_expanded_pres_req_rec(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
          </el-collapse>
          <p>Presentations Sent:</p>
          <el-collapse v-model="expanded_pres_sent_items">
            <div v-for="(pres_req, key, index) in sentPresentations">
                <el-collapse-item v-bind:title="labelFromConnection(pres_req.connection_id)" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="pres_req">
                              </vue-json-pretty>
                            <el-button v-on:click="collapse_expanded_pres_sent(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
          </el-collapse>
          <p>Presentations Received:</p>
          <el-collapse v-model="expanded_pres_rec_items">
            <div v-for="(pres_req, key, index) in receivedPresentations">
                <el-collapse-item v-bind:title="labelFromConnection(pres_req.connection_id)" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="pres_req">
                              </vue-json-pretty>
                            <el-button v-on:click="collapse_expanded_pres_rec(key)">^</el-button>
                        </div>
                    </el-row>
                </el-collapse-item>
            </div>
          </el-collapse>
          <p>Presentations :</p>
          <el-collapse v-model="expanded_pres_ver_items">
            <div v-for="(pres_req, key, index) in verifiedPresentations">
                <!-- <el-collapse-item v-bind:title="labelFromConnection(pres_req.connection_id)" :name="key">
                    <el-row>
                        <div>
                              <vue-json-pretty
                                :deep=1
                                :data="pres_req">
                              </vue-json-pretty>
                            <el-button v-on:click="collapse_expanded_ver(key)">^</el-button>
                        <el-collapse-item title='Send a Presentation' :name="key">
                            <el-row>
                              <div v-for="(attribute, key, index) in cred_def.primary.r" v-if="key!='master_secret'" prop="cred_def">
                                <span slot="label">{{key}}:</span>
                                  <el-input v-model="cred_def_form[cred_def.cred_def_id].attributes[index]" style="width:100px;"> </el-input>
                              </div>
                              <el-form :model=cred_def_form>
                                <el-form-item label="select connection:" >
                                  <el-select v-model="cred_def_form.connection" filterable placeholder="select connection to issue to:" >
                                    <el-option
                                      v-for="connection in activeConnections"
                                      :key="connection.connection_id"
                                      :label="connection.their_label +' ('+connection.connection_id+')'"
                                      :value="connection.connection_id">
                                    </el-option>
                                  </el-select>
                                </el-form-item>
                              </el-form>
                              <el-button @click="issueCredentialOffer(key,'global_pool')">Issue a credential offer</el-button>
                            </el-row>
                          </el-collapse-item>
                        </div>
                    </el-row>
                </el-collapse-item> -->
            </div>
          </el-collapse>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="Verifications">
      </el-tab-pane>
      </el-tab-pane>
      <el-tab-pane label="Protocol Discovery">

        <input type="button" class="btn btn-secondary" v-on:click="run_protocol_discovery()" value="Query"/>
        <table class="table table-sm">
          <tr>
            <th>Protocol</th>
            <th>Roles</th>
          </tr>
          <tr v-for="p in supported_protocols">
            <td>{{p.pid}}</td>
            <td>{{p.roles}}</td>
          </tr>
        </table>

      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style>
  .message-display {
    margin-bottom: 1em;
    border-bottom: 1px solid lightgrey;
    padding-bottom: 1em;
  }
  .basicmessage-Sent {
    background-color: white;
    margin-right: 4em;
    margin-bottom: 1em;
    padding: 1em;
    border: 1px solid lightgrey;
    border-radius: 4px;
  }
  .basicmessage-Received {
    background-color: lightblue;
    margin-left: 4em;
    margin-bottom: 1em;
    padding: 1em;
    text-align: right;
    border: 1px solid lightgrey;
    border-radius: 4px;
  }
</style>

<script>
  const bs58 = require('bs58');
  const rp = require('request-promise');

  import { mapState, mapActions } from "vuex";
  import { from_store } from '../connection_detail.js';

  import VueJsonPretty from 'vue-json-pretty';
  import VJsoneditor from 'v-jsoneditor';
  import AgentConnectionList from './AgentConnectionList.vue'
  export default {
    name: 'agent-base',
    components: {
      VueJsonPretty,
      VJsoneditor,
      AgentConnectionList
    },
    methods: {
      ...mapActions("Connections", ["get_connection"]),
      //=========================================================================================================================
      //-------------------------Outbound Messages-------------------------------------------------------------------
      //=========================================================================================================================
      /**
       *  Agent admin messages sent to change state of wallet and did connections.
       */
      //=========================================================================================================================
      async fetchAgentData(){
        //load from vue store
        this.connection = from_store(await this.get_connection(this.id), this.processInbound);

        this.message_history = this.connection.message_history;

        this.connection_loaded = true;
      },
      async fetchAgentConnections(){
        let query_msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection-get-list",
          "~transport": {
            "return_route": "all"
          }
        }
        this.connection.send_message(query_msg);
      },
      async run_protocol_discovery(){
        //send query
        let query_msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/query",
          "query": "*"
        };
        this.connection.send_message(query_msg);
      },
      async getAgentDids(){
        this.connection.send_message( {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/get-list-dids",
          "~transport": {
            "return_route": "all"
          }
        })
      },
      async createDid(){
        let msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/create-did",
          "~transport": {
            "return_route": "all"
          }
        }
        msg = this.did_form.did ? {...msg,"did":this.did_form.did} : msg
        msg = this.did_form.seed ? {...msg,"seed":this.did_form.seed} : msg
        msg = this.did_form.label ? {...msg, "metadata": {"label":this.did_form.label}} : msg
        this.connection.send_message(msg)
      },
      async updateAgentConnection(editForm){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/update",
            "connection_id": editForm.connection_id,
            "label": editForm.label,
            "role": editForm.role,
        }
        this.connection.send_message(query_msg);
      },
      async deleteAgentConnection(connection){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/delete",
            "connection_id": connection.connection_id,
            "~transport": {
              "return_route": "all"
            }
        }
        this.connection.send_message(query_msg);
      },
      async removeSchema(id,ledger_id){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/remove-schema",
            "schema_id": id,
            "ledger_id": ledger_id,
            "~transport": {
              "return_route": "all"
            }
        }
        this.connection.send_message(query_msg);
        delete this.schemas[id]// TODO:remove this after aca-py support is added.
      },
      async fetchNewInvite(){
        let query_msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/create-invitation",
          "label": this.invite_label_form,
          "role": this.invite_role_form,
          "accept": this.invite_accept_form,
          "public": this.invite_public_form,
          "multi_use": this.invite_multi_use_form,
          "~transport": {
            "return_route": "all"
          }
        }
        this.invite_label_form = "master"
        this.invite_role_form = "normal"
        this.invite_accept_form = "auto"
        this.invite_public_form = false
        this.invite_multi_use_form = true
        this.connection.send_message(query_msg);
      },
      async addAgent() {
        let receive_invite_msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/receive-invitation",
          "invitation": this.agent_invitation_form.invitation,
          "accept": "auto"
        };
        this.connection.send_message(receive_invite_msg);
      },
      async addStaticAgent(){
        let query_msg ={
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-static-connections/1.0/create-static-connection",
          "label": this.static_agent_form.label,
          "role": this.static_agent_form.role,
          "static_did": this.static_agent_form.static_did,
          "static_key": this.static_agent_form.static_key,
          "static_endpoint": this.static_agent_form.static_endpoint,
          "~transport": {
            "return_route": "all"
          }
        }
        this.connection.send_message(query_msg);
      },
      async compose_send(){
        this.connection.send_message(this.compose_json, true);
      },
      async basicmessage_send(){
        let msg = {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message",
          "content": this.basicmessage_compose
        };
        this.connection.send_message(msg);
        this.basicmessage_compose = "";
      },
      async storeSchema(){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/store-schema",
            "name": this.schemas_form.name,
            "version": this.schemas_form.version,
            "attributes": this.schemas_form.attributes,
            "~transport": {
              "return_route": "all"
            }
        }
        this.connection.send_message(query_msg);
        this.schemas['123412341234'] = { // TODO:remove this after aca-py support is added.
            "id":'123412341234',
            "name": this.schemas_form.name,
            "version": this.schemas_form.version,
            "attributes": this.schemas_form.attributes,}
        this.schemas_form.attributes = []
        this.schemas_form.name =""
        this.schemas_form.version =""
      },
      async publishSchema(schema_id,pool_id){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/publish-schema",
            "schema_id": schema_id,
            "pool_id": pool_id,//optional
            "~transport": {
              "return_route": "all"
            }
        }
        this.connection.send_message(query_msg);
      },
      async createCredentialDefinition(){
          let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/publish-credential-definition",
            "schema_id": this.cred_def_form.schema.ledgers[this.cred_def_form.ledger].seq_number,
            "~transport": {
              "return_route": "all"
          }
        }
        this.connection.send_message(query_msg);
      },
      async removeTrustedIssuer(id){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/remove-trusted-issuer",
            "issuer_did": id,
            "~transport": {
              "return_route": "all"
            }
        }
        this.connection.send_message(query_msg);
        delete this.trusted_issuers[id]// TODO:remove this after aca-py support is added.
      },
      async resolveTrustedIssuer(did){
        let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/resolve-did",
            "issuer_did": did,
            "~transport": {
              "return_route": "all"
            }
        }
        this.connection.send_message(query_msg);
        delete this.trusted_issuers[did]// TODO:remove this after aca-py support is added.
      },
      async storeTrustedIssuer(){
          let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/store-trusted-issuer",
            "did": this.trusted_issuers_form.did,
            "label": this.trusted_issuers_form.label,
            "~transport": {
              "return_route": "all"
            }
        }
        this.connection.send_message(query_msg);
        this.trusted_issuers[this.trusted_issuers_form.did] = { // TODO:remove this after aca-py support is added.
            "id":this.trusted_issuers_form.did,
            "label": this.trusted_issuers_form.label,
            }
        this.trusted_issuers_form.did = ""
        this.trusted_issuers_form.label = ""
      },
      async issuePresentationRequest(pres_def_id,connection_id){
          let query_msg = {
            "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/create-presentation-definition",
            "requested_attributes":this.presentation_definitions[pres_def_id].requested_attributes,
            "name":this.presentation_definitions[pres_def_id].name,
            "connection_id":connection_id,
            "version":this.presentation_definitions[pres_def_id].version,
            "requested_predicates":this.presentation_definitions[pres_def_id].requested_predicates,
            "~transport": {
              "return_route": "all"
          }
        }
        this.connection.send_message(query_msg)
        this.pres_def_form.temp_attrs= []
        this.pres_def_form.requested_attributes= []
        this.pres_def_form.requested_attribute= ''
        this.pres_def_form.restriction= ''
        this.pres_def_form.name= ''
        this.pres_def_form.version= ''
      },
      //=========================================================================================================================
      //-------------------------Inbound Messages---------------------------------------------------------------------------
      //=========================================================================================================================
      /**
       *  Received Agent admin messages with directives containing state of wallet and did connections to be displayed.
       */
      //=========================================================================================================================
      async receivedAgentDids(msg){
        const dids = msg.result.reduce(function(acc, cur, i) {
          acc[cur.did] = cur;
          return acc;
        }, {});
        this.dids = dids
        this.didsUpdateForm = dids
      },
      async updatedDid(msg){
        if ('result' in msg &&
            'did' in msg.result) {
          this.dids[msg.result.did] = msg.result
          this.did_form.did = ""
          this.did_form.seed = ""
          this.did_form.label = ""
          this.didsUpdateForm = this.dids
        }
      },
      async fetchedConnectionList(msg){
        const connections = msg.results.reduce(function(acc, cur, i) {
          acc[cur.connection_id] = cur;
          return acc;
        }, {});
        this.connections = connections
        this.connectionUpdateForm = connections
      },
      async updatedConnection(msg){
          this.connections[msg.connection.connection_id] = msg.connection
          this.connectionUpdateForm = this.connections;
      },
      async newInvitation(msg){
        console.log(msg.invitation)
        const newInvite = this.invitations[ msg.connection_id] = {
          //... msg.invitation, // invitations is not a json yet...
          "invitation": msg.invitation,
          "connection_id" : msg.connection_id,
          "invitation_url": msg.invitation_url}
      },
      async ProtocolDisclose(msg){
        //console.log(msg.protocols);
        this.supported_protocols = msg.protocols;
      },
      async processInbound(msg){
        this.connection.message_history_add(msg, "Received");
        var handlers = {
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/discover-features/1.0/disclose": this.ProtocolDisclose,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection-list": this.fetchedConnectionList,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/connection": this.updatedConnection,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/ack": this.fetchAgentConnections,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-connections/1.0/invitation": this.newInvitation,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-static-connections/1.0/static-connection-info":this.updatedConnection,// handle added statuc agent
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/list-dids":this.receivedAgentDids,
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/admin-dids/1.0/did":this.updatedDid,
        };
        var handler = handlers[msg['@type']];
        if(handler){
          handler(msg);
        } else {
          console.log("Message without handler", msg);
        }
      },
      connectionsInvitationModeFilterForMulti(connections){
        return Object.keys(connections).reduce((acc, val) =>
          ("invitation_mode" in connections[val] && connections[val].invitation_mode === "multi" ?  {
              ...acc,
              [val]: connections[val]
          } : acc
        ), {})
      },
      connectionsInvitationModeFilterForOnce(connections){
        return Object.keys(connections).reduce((acc, val) =>
          ("invitation_mode" in connections[val] && connections[val].invitation_mode === "once" ?  {
              ...acc,
              [val]: connections[val]
          } : acc
        ), {})
      },
      connectionsInitiatorFilterForSelf(connections){
        return Object.keys(connections).reduce((acc, val) =>
          ("initiator" in connections[val] && connections[val].initiator === "self" ?  {
              ...acc,
              [val]: connections[val]
          } : acc
        ), {})
      },
      connectionsInitiatorFilterForExternal(connections){
        return Object.keys(connections).reduce((acc, val) =>
          ("initiator" in connections[val] && connections[val].initiator === "external" ?  {
              ...acc,
              [val]: connections[val]
          } : acc
        ), {})
      },
      connectionsInitiatorFilterForMultiuse(connections){
        return Object.keys(connections).reduce((acc, val) =>
          ("initiator" in connections[val] && connections[val].initiator === "multiuse" ?  {
              ...acc,
              [val]: connections[val]
          } : acc
        ), {})
      },
      labelFromConnection(id){
        if (id in this.connections &&'their_label' in this.connections[id]) {
          return this.connections[id].their_label
        }
        return id
      },
      //=========================================================================================================================
      //------------------------- View methods ----------------------------------------------------------------------------------
      //=========================================================================================================================
      /**
       *
       */
      //=========================================================================================================================
      async add_pres_def_attribute(){
        this.pres_def_form.requested_attribute= {
          "name":this.pres_def_form.requested_attribute,
          "restrictions" : []
          }
        this.pres_def_form.requested_attributes = [...this.pres_def_form.requested_attributes,this.pres_def_form.requested_attribute];
        this.pres_def_form.temp_attrs=[...this.pres_def_form.temp_attrs,{"restriction":""}]
        this.pres_def_form.requested_attribute = '';
      },
      async add_pres_def_restriction(index){
        this.pres_def_form.temp_attrs[index].restriction =
          {"issuer_did": this.pres_def_form.temp_attrs[index].restriction}
        this.pres_def_form.requested_attributes[index].restrictions =
          [...this.pres_def_form.requested_attributes[index].restrictions,
          this.pres_def_form.temp_attrs[index].restriction]
        this.pres_def_form.temp_attrs[index].restriction = '';
      },
      async schema_attributes_clear(){
        this.schemas_form.attributes = [];
      },
      async schema_add_attribute(){
        this.schemas_form.attributes = [...this.schemas_form.attributes,this.schemas_form.attribute];
        this.schemas_form.attribute = '';
      },
      async collapse_expanded_connections(connection_id){
        let index = this.exspanded_connection_items.indexOf(connection_id)
        this.exspanded_connection_items.splice(index, 1);
      },
      async collapse_expanded_invititions(id){
        let index = this.exspanded_invites_items.indexOf(id)
        this.exspanded_invites_items.splice(index, 1);
      },
      async collapse_expanded_schemas(id){
        let index = this.exspanded_schemas_items.indexOf(id)
        this.exspanded_schemas_items.splice(index, 1);
      },
      async collapse_expanded_cred_def(id){
        let index = this.exspanded_cred_def_items.indexOf(id)
        this.exspanded_cred_def_items.splice(index, 1);
      },
      async collapse_expanded_pres_def(id){
        let index = this.exspanded_pres_def_items.indexOf(id)
        this.exspanded_pres_def_items.splice(index, 1);
      },
      async collapse_expanded_trusted_issuer(id){
        let index = this.expanded_issuers_items.indexOf(id)
        this.expanded_issuers_items.splice(index, 1);
      },
      async collapse_expanded_pres_req_sent(id){
        let index = this.expanded_pres_req_sent_items.indexOf(id)
        this.expanded_pres_req_sent_items.splice(index, 1);
      },
      async collapse_expanded_pres_req_rec(id){
        let index = this.expanded_pres_req_rec_items.indexOf(id)
        this.expanded_pres_req_rec_items.splice(index, 1);
      },
      async collapse_expanded_pres_sent(id){
        let index = this.expanded_pres_sent_items.indexOf(id)
        this.expanded_pres_sent_items.splice(index, 1);
      },
      async collapse_expanded_pres_rec(id){
        let index = this.expanded_pres_rec_items.indexOf(id)
        this.expanded_pres_rec_items.splice(index, 1);
      },
      async collapse_expanded_ver(id){
        let index = this.expanded_pres_ver_items.indexOf(id)
        this.expanded_pres_ver_items.splice(index, 1);
      },
      async collapse_expanded_did_item(id){
        let index = this.expanded_dids_items.indexOf(id)
        this.expanded_dids_items.splice(index, 1);
      },
      async collapse_expanded_ledger_item(id){
        let index = this.expanded_ledger_items.indexOf(id)
        this.expanded_ledger_items.splice(index, 1);
      },
    },
    data() {
      return {
        'id': this.$route.params.agentid,
        'connection': {'label':'loading...'},
        'connection_loaded': false,
        'message_history':[],
        'last_sent_msg_id':'',
        'ledgers':{
          '12345234':{
            'id':'12345234',
            'name':'sov',
          },
          '22345234':{
            'id':'22345234',
            'name':'von',
          },
            '32345234':{
            'id':'32345234',
            'name':'bank',
          },
            '42345234':{
            'id':'42345234',
            'name':'adams',
          },
        },
        'dids':{},
        'trusted_issuers':{
          'mgtqGEF8EBQHBLREdRoJ4':{
            'did':'mgtqGEF8EBQHBLREdRoJ4',
            'label':'Sovrin Foundation',
            'ledgers':{
              'sov':{
                'name':'sov',
                'role':'2',
                'doc':'{"endpoint":"https://sovrin.org/"}',
                'verkey':'~7neGXtV1n3S5j1xzzZBz62',
              },
            },
          },
        },
        'schemas':{
          '3552d86c-fc14-480a-bd22-e0be147aadc6':{
            'id':'3552d86c-fc14-480a-bd22-e0be147aadc6',
            'name':'digital_id',
            'version':'1.9',
            'attributes':[
              'first_name',
              'last_name',
              'address',
              'age',
            ],
          },
          '2452d86c-fc14-480a-bd12-e0be147aade4':{
            'id':'2452d86c-fc14-480a-bd12-e0be147aade4',
            'name':'registration',
            'version':'1.0.0',
            'attributes':[
              'address_line_1',
              'entity_status_effective',
              'entity_name_effective',
              'registration_date',
              'entity_status',
              'entity_type',
              'address_line_2',
              'addressee',
              'country',
              'corp_num',
              'postal_code',
              'province',
              'city',
              'legal_name',
            ],
            'ledgers':{'sov':{
              'name':'sov',
              'txn_id':'SAF2vMgCJd2PsqUpa5U2DX:2:registration:1.0.0',
              'seq_number':'9',
              'cred_defs':[
                'SAF2vMgCJd2PsqUpa5U2DX:3:CL:9:tag',
                'JTUsfPMn1GGZLScyfqf9LU:3:CL:9:tag'
              ],
            }}
          }
        },
        'schemas_form':{
          'attributes':[],
          'name':'',
          'version':'',
          'attribute':'',
        },
        'cred_defs':{
          '3462d86c-fc14-480a-bd12-e0be147aadv7':{ //TODO: build this from the results of a single credential_definition_id
            'cred_def_id':'3462d86c-fc14-480a-bd12-e0be147aadv7',
            'schema_id':'2452d86c-fc14-480a-bd12-e0be147aade4',
            'schema_name':'registration',
            'schema_version':'name',
            'schema':[
              'address_line_1',
              'entity_status_effective',
              'entity_name_effective',
              'registration_date',
              'entity_status',
              'entity_type',
              'address_line_2',
              'addressee',
              'country',
              'corp_num',
              'postal_code',
              'province',
              'city',
              'legal_name',
            ],
            'cred_def_txnId':'SAF2vMgCJd2PsqUpa5U2DX:3:CL:9:Test',
            'primary':{
              'r':{
                'entity_type':'4276818453997252235377809066552492903559006624154502170264010343561770...',
                'address_line_2':'5835005062870123542337957832281874621008837246206493273019909805920578...',
                'country':'1879513305160086851616079950364687554755887149912307898056492171417669...',
                'master_secret':'5680719163826958582523499906964107839414241499724912816054845682277627...',
                'city':'5070038307979790521329819136698583890861707690369236453378984162125954...',
                'postal_code':'3112351950987780712431706032057718465524884751214233553363879722705800...',
                'address_line_1':'7306529829675381076177399279526662495198464609142708900879759969343811...',
                'legal_name':'4802617220397946068690549708166702621003071126577937165396665038376228...',
                'registration_date':'2878132445424190585639532906296244810676938826012262151226024338975400...',
                'addressee':'1001391556670028112842868976612783831982121929639458722631916162375175...',
                'entity_status_effective':'6788510089214435350045257149388833744569568756412683331576858511590760...',
                'corp_num':'6785661010439948560109655157528808585675707924690100517693559960557987...',
                'entity_status':'1321064407231181370798210517190814593144851682644978311734511298020384...',
                'entity_name_effective':'7571297275652047907551972817989506568944796137349719074126081162087488...',
                'province':'9476317241642994808753854337446098807999115489895643485448317420223689...',
              },
            },
          },
        },
        'cred_def_form':{
          'schema':'',
          '3462d86c-fc14-480a-bd12-e0be147aadv7': {'attributes':[]},// TODO: create this structure dynamically at start.
          'ledger':'',
        },
        'pres_def_form':{
          'temp_attrs':[],
          'requested_attributes':[],
          'requested_attribute':'',
          'restriction':'',
          'name':'',
          'version':'',
        },
        'trusted_issuers_form':{
          'did':'',
          'label':'',
        },
        'did_form':{
          'did':'',
          'seed':'',
          'label':'',
          'metadata':'',
        },
        'ledger_form':{
          'name':'',
          'gen_url':'',
        },
        'presentation_definitions':{
          '8472d86c-fc14-480a-bd12-e0be147aadb9':{
            'pres_def_id':'8472d86c-fc14-480a-bd12-e0be147aadb9',
            'name': 'registration',
            'version': '1.0.0',
            'requested_attributes':[
              {'name':'address_line_1', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'entity_status_effective', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'entity_name_effective', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'registration_date', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'entity_status', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'entity_type', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'address_line_2', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'addressee', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'country', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'corp_num', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'postal_code', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'province', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'city', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'legal_name', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},]},
              {'name':'age', 'restrictions': [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},{'issuer_did':'JTUsfPMn1GGZLScyfqf9LU'},]},
              {'name':'favorite_ice_cream'}//no restrictions, this is self attested
              ],
            'requested_predicates':[
              {"name": "age","p_type": ">=","p_value": 18,"restrictions": [{'issuer_did':'SAF2vMgCJd2PsqUpa5U2DX'},{'issuer_did':'JTUsfPMn1GGZLScyfqf9LU'}],}
            ]
          }
        },
        'presentation_exchanges': {
          '0012d86c-fc14-480a-bd12-e0be147lbew9':
          {
            'presentation_exchange_id':'0012d86c-fc14-480a-bd12-e0be147lbew9',// "string",
            'connection_id':'fd507eb3-8acf-40c2-9bbd-78cbcc52a3e4',// "string",
            'thread_id':'0170119952737',// "string",
            'initiator':'self' , // "string",
            'state':'request_sent',// "string",
            'presentation_request':{},// {},
            'presentation':{},// {},
            'auto_present': false,
            'verified':'',// 'verified', // "string"
            'error_msg':'',// "string",
            'updated_at':'2019-10-03 16:25:52.934302Z',// "string",
            'created_at':'2019-10-03 16:25:05.875156Z',// "string",
          },
          '0022d86c-fc14-480a-bd12-e0be147lbew9':
          {
            'presentation_exchange_id':'0022d86c-fc14-480a-bd12-e0be147lbew9',// "string",
            'connection_id':'00207eb3-8acf-40c2-9bbd-78cbcc52a3e4',// "string",
            'thread_id':'0270119952737',// "string",
            'initiator':'external' , // "string",
            'state':'request_received',// "string",
            'presentation_request':{},// {},
            'presentation':{},// {},
            'auto_present': false,
            'verified':'',// 'verified', // "string"
            'error_msg':'',// "string",
            'updated_at':'2019-10-03 16:25:52.934302Z',// "string",
            'created_at':'2019-10-03 16:25:05.875156Z',// "string",
          },
          '0032d86c-fc14-480a-bd12-e0be147lbew9':
          {
            'presentation_exchange_id':'0032d86c-fc14-480a-bd12-e0be147lbew9',// "string",
            'connection_id':'00307eb3-8acf-40c2-9bbd-78cbcc52a3e4',// "string",
            'thread_id':'0370119952737',// "string",
            'initiator':'self' , // "string",
            'state':'presentation_sent',// "string",
            'presentation_request':{},// {},
            'presentation':{},// {},
            'auto_present': false,
            'verified':'',// 'verified', // "string"
            'error_msg':'',// "string",
            'updated_at':'2019-10-03 16:25:52.934302Z',// "string",
            'created_at':'2019-10-03 16:25:05.875156Z',// "string",
          },
          '0042d86c-fc14-480a-bd12-e0be147lbew9':
          {
            'presentation_exchange_id':'0042d86c-fc14-480a-bd12-e0be147lbew9',// "string",
            'connection_id':'00407eb3-8acf-40c2-9bbd-78cbcc52a3e4',// "string",
            'thread_id':'0470119952737',// "string",
            'initiator':'external' , // "string",
            'state':'presentation_received',// "string",
            'presentation_request':{},// {},
            'presentation':{},// {},
            'auto_present': false,
            'verified':'',// 'verified', // "string"
            'error_msg':'',// "string",
            'updated_at':'2019-10-03 16:25:52.934302Z',// "string",
            'created_at':'2019-10-03 16:25:05.875156Z',// "string",
          },
          '0062d86c-fc14-480a-bd12-e0be147lbew9':
          {
            'presentation_exchange_id':'0062d86c-fc14-480a-bd12-e0be147lbew9',// "string",
            'connection_id':'00607eb3-8acf-40c2-9bbd-78cbcc52a3e4',// "string",
            'thread_id':'0670119952737',// "string",
            'initiator':'self' , // "string",
            'state':'verified',// "string",
            'presentation_request':{},// {},
            'presentation':{},// {},
            'auto_present': false,
            'verified':'verified', // "string"
            'error_msg':'',// "string",
            'updated_at':'2019-10-03 16:25:52.934302Z',// "string",
            'created_at':'2019-10-03 16:25:05.875156Z',// "string",
          },
          '0052d86c-fc14-480a-bd12-e0be147lbew9':
          {
            'presentation_exchange_id':'0052d86c-fc14-480a-bd12-e0be147lbew9',// "string",
            'connection_id':'00507eb3-8acf-40c2-9bbd-78cbcc52a3e4',// "string",
            'thread_id':'0570119952737',// "string",
            'initiator':'external' , // "string",
            'state':'verified',// "string",
            'presentation_request':{},// {},
            'presentation':{},// {},
            'auto_present': false,
            'verified':'verified', // "string"
            'error_msg':'',// "string",
            'updated_at':'2019-10-03 16:25:52.934302Z',// "string",
            'created_at':'2019-10-03 16:25:05.875156Z',// "string",
          },
        },
        'supported_protocols': [],
        'compose_json': {
          "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/ping",
          "response_requested": true
        },
        'basicmessage_compose': "",
        'active_ledger_selector':{
          'leger':'',
        },
        'connections':{},
        'connectionUpdateForm':{},
        'exspanded_connection_items':[],
        'exspanded_active_connection_items':[],
        'exspanded_pending_connection_items':[],
        'exspanded_open_invitation_connection_items':[],
        'exspanded_multi_use_invitations_connection_items':[],
        'invitations':{},
        'expanded_dids_items':[],
        'expanded_ledger_items':[],
        'exspanded_invites_items':[],
        'exspanded_schemas_items':[],
        'exspanded_cred_def_items':[],
        'exspanded_credential_issuer_items':[],
        'expanded_issuers_items':[],
        'exspanded_pres_def_items':[],
        'exspanded_presentation_request_items':[],
        'expanded_pres_req_sent_items':[],
        'expanded_pres_req_rec_items':[],
        'expanded_pres_rec_items':[],
        'expanded_pres_sent_items':[],
        'expanded_pres_ver_items':[],
        'invite_label_form':"master",
        'invite_role_form':"normal",
        'invite_accept_form':"auto",
        'invite_public_form':false,
        'invite_multi_use_form':true,
        'agent_invitation_form':{
          'invitation':'',
        },
        'static_agent_form':{
          'label':"",
          'role':"",
          'static_did':"",
          'static_key':"",
          'static_endpoint':"",
        },
      }
    },
    computed: {
      ...mapState(['Connections']),
      //=========================================================================================================================
      //------------------------------------------------ Filter methods ---------------------------------------------------
      //=========================================================================================================================
      /**
       *
       */
      //=========================================================================================================================
      activeConnections(){
        return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "active")
      },
      requestStateConnections(){
       return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "request")
      },
      responseStateConnections(){
        return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "response")
      },
      pendingConnections(){
        return Object.values(this.connections).filter(
          conn => "state" in conn &&
          conn.state != "active" &&
          conn.state != "invitation" &&
          conn.state != "error"
          )
      },
      openInvitations(){
        return Object.values(this.connections).filter(
          conn =>
            "state"             in conn &&
            conn.state          === "invitation" &&
          //==========================================
            "invitation_mode"   in conn &&
            conn.invitation_mode === "once"
          )
      },
      multiUseInvitations(){
        return Object.values(this.connections).filter(
          conn =>
            "state"             in conn &&
            conn.state          === "invitation" &&
          //==========================================
            "invitation_mode"   in conn &&
            conn.invitation_mode === "multi"
          )
      },
      inactiveConnections(){
        return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "inactive")
      },
      staticConnections(){
        return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "static")
      },
      initedStateConnections(){
        return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "init")
      },
      errorStateConnections(){
        return Object.values(this.connections).filter(conn => "state" in conn && conn.state === "error")
      },
      basicmessage_history: function () {
        if (this.connection_loaded) {
          return this.connection.message_history.filter(function(h){
            return h.msg['@type'] == "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/basicmessage/1.0/message";
          });
        }
        return [];
      },
      msgHistoryGroupedByThid(){
        if (this.connection_loaded) {
          return this.connection.message_history.reduce(function(acc, cur, i) {
            var id = ('~thread'in cur.msg && 'thid' in cur.msg['~thread']) ? cur.msg['~thread'].thid : cur.msg['@id']
            acc[id] = acc[id] || []
            acc[id].push(cur)
            return acc },
            {})
        }
        return [];
      },
      most_recent_sent_msgs(){
        return this.msgHistoryGroupedByThid[this.last_sent_msg_id]
      },
      sentPresentationRequests(){
        return Object.keys(this.presentation_exchanges).reduce((acc, val) =>
          ("request_sent" === this.presentation_exchanges[val].state ?  {
              ...acc,
              [val]: this.presentation_exchanges[val]
          } : acc
        ), {})
      },
      receivedPresentationRequests(){
        return Object.keys(this.presentation_exchanges).reduce((acc, val) =>
          ("request_received" === this.presentation_exchanges[val].state ?  {
              ...acc,
              [val]: this.presentation_exchanges[val]
          } : acc
        ), {})
      },
      sentPresentations(){
        return Object.keys(this.presentation_exchanges).reduce((acc, val) =>
          ("presentation_sent" === this.presentation_exchanges[val].state ?  {
              ...acc,
              [val]: this.presentation_exchanges[val]
          } : acc
        ), {})
      },
      receivedPresentations(){
        return Object.keys(this.presentation_exchanges).reduce((acc, val) =>
          ("presentation_received" === this.presentation_exchanges[val].state ?  {
              ...acc,
              [val]: this.presentation_exchanges[val]
          } : acc
        ), {})
      },
      verifiedPresentations(){
        return Object.keys(this.presentation_exchanges).reduce((acc, val) =>
          ("verified" === this.presentation_exchanges[val].state ?  {
              ...acc,
              [val]: this.presentation_exchanges[val]
          } : acc
        ), {})
      },
      ledgerSchemas(ledger_name){
        console.log("ledger name:",ledger_name)
        let schemas = Object.keys(this.schemas).reduce((acc,key)=>
          ("ledgers" in this.schemas[key] && ledger_name in this.schemas[key].ledgers ?{
              ...acc,
              [key]: this.schemas[key]
          } : acc
        ), {})
        console.log("schemas",schemas)
        return schemas
      },
    },
    async created () {
      // fetch the data when the view is created and the data is
      // already being observed
      await this.fetchAgentData();
      await this.getAgentDids();
      await this.run_protocol_discovery();
      await this.fetchAgentConnections();
      // await this.fetchNewInvite(); // do not automatically create invite
    },
    watch:{}
  }
</script>
