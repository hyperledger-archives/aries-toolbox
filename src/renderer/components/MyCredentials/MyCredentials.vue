<template>
  <el-row>
    <cred-def-list
      title="Retrieved Credential Definitions"
      v-bind:retrievable="true"
      v-bind:can_create="false"
      v-bind:list="proposal_cred_defs"></cred-def-list>
    <my-credentials-list
      title="Credentials"
      editable="false"
      v-bind:credentials="holder_credentials"
      v-bind:cred_defs="proposal_cred_defs"
      v-bind:connections="active_connections"
      @cred-refresh="getHoldersCredentials"
      @propose="sendCredentialProposal"></my-credentials-list>
  </el-row>
</template>

<script>
</script>
