Invitations Admin Protocol
==========================

## Overview

**Protocol URI:** `https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1`

### Notes
- Missing is the concept of creating an invitation from a public did. We anticipate
adding a `public_did` attribute to indicate which DID should be used. Currently, we expect
a new DID to be provisioned for the invitation.
- This version lacks a way to remove or deactivate a DID.
- This version lacks paging of invitation lists.
- This version lacks a way to filter invitations when listing.

### Protocol Messages
- [create](#create)
- [oob-create](#oob-create)
- [invitation](#invitation)
- [get-list](#get-list)
- [list](#list)


## Message Definitions

> _**Note:**_ Some attributes are omitted from the examples in this section,
> such as the `@id` attribute. The omission is for brevity and clarity of the
> example and it should be assumed that each example message contains all
> attributes required to be processed by the receiving agent.

### Common Attributes
The following attributes are common across all messages in this protocol. Each time an attribute
 appears, it means the same thing.

`alias`: The name of the invitation as viewed by the inviter.

`label`: The label presented inside the invitation as a suggestion of what to name the connection.

`group`: The name of the group that resulting connection(s) should receive.

`auto_accept`: True if connections from this invitaiton should be automatically accepted.

`multi_use`: True of this invitation is expected to be used multiple times.

`invitation_type`: Specifies protocol of the invitation (Out-Of-Band or Connections).

`raw_repr`: Optional raw representation of associated objects in the connected agent.
This is used for debug/inspection purposes only and should not be expected to be
present.

--------------------------------------------------------------------------------

### create
Instruct the agent to create a new invitation.

Example #1:
```jsonc
{
  "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/create",
  "alias": "Invitation I sent to Alice",
  "label": "Bob",
  "group": "admin",
  "auto_accept": true,
  "multi_use": true,
  "mediation_id": "42a1f1c9-b463-4f59-8385-2e2f7b70466a"
}
```

`mediation_id`: Identifier for mediator to use in accepting the invitation.

Example #2 (ACA-Py Plugin Toolbox, Connections Protocol):
```jsonc
{
  "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/create",
  "alias": "Invitation I sent to Alice",
  "label": "Bob",
  "group": "admin",
  "auto_accept": true,
  "multi_use": true
}
```

### oob-create
Example #3 (ACA-Py Plugin Toolbox, Out-Of-Band Protocol):
```jsonc
{
  "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/oob-create",
  "alias": "Invitation I sent to Alice",
  "label": "Bob",
  "group": "admin",
  "auto_accept": true,
  "multi_use": true
}
```

See [Common Attributes](#common-attributes)

### invitation

Details of a new invitation created as requested by a `create` or `oob-create` message.

Example #1:
```jsonc
{
  "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/invitation",
  "~thread": {"thid": "<send msg id>"},
  "alias": "Invitation I sent to Alice",
  "label": "Bob",
  "group": "my_group",
  "auto_accept": true,
  "multi_use": true,
  "invitation_url": "http://my-agent.com?c_i=..."
}
```



Example #2 (ACA-Py Plugin Toolbox, Connections Protocol):
```jsonc
{
  "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/invitation",
  "@id": "90e3edaa-cb69-4f75-876a-8d6782429891",
  "~thread": {"thid": "<send msg id>"},
  "raw_repr": {
    "connection": {
      "invitation_mode": "multi",
      "state": "invitation",
      "rfc23_state": "invitation-sent",
      "routing_state": "none",
      "accept": "auto",
      "created_at": "<created timestamp>",
      "updated_at": "<updated timestamp>",
      "their_role": "invitee",
      "connection_id": "07897620-fd2e-430f-8ec1-ebd1f426b973",
      "alias": "Invitation I sent to Alice",
      "invitation_key": "AAd14qqe8JS4nCtVR3v7ogHmZG2FXtMUBDa8X3hy8QZX"},
    "invitation": {
      "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation",
      "@id": "5da062e6-2102-4566-a01e-b0d2dc9663cc",
      "serviceEndpoint": "http://acapy_plugin_agent:3000",
      "recipientKeys": ["AAd14qqe8JS4nCtVR3v7ogHmZG2FXtMUBDa8X3hy8QZX"],
      "label": "Bob"}
      },
  "group": "admin",
  "invitation_url": "http://my-agent.com:3000?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNWRhMDYyZTYtMjEwMi00NTY2LWEwMWUtYjBkMmRjOTY2M2NjIiwgInNlcnZpY2VFbmRwb2ludCI6ICJodHRwOi8vYWNhcHlfcGx1Z2luX2FnZW50OjMwMDAiLCAicmVjaXBpZW50S2V5cyI6IFsiQUFkMTRxcWU4SlM0bkN0VlIzdjdvZ0htWkcyRlh0TVVCRGE4WDNoeThRWlgiXSwgImxhYmVsIjogIkJvYiJ9",
  "invitation_type": "https://didcomm.org/connections/1.0/invitation",
  "multi_use": true,
  "auto_accept": true,
  "id": "07897620-fd2e-430f-8ec1-ebd1f426b973",
  "alias": "Invitation I sent to Alice",
  "label": "Bob",
  "created_date": "<created timestamp>"
}
```

Example #3 (ACA-Py Plugin Toolbox, OOB Protocol):
```jsonc
{
  "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/invitation",
  "@id": "6d8c2f16-a7ed-4180-b1e7-5b99612f27b8",
  "~thread": {
    "thid": "59aacdde-e648-4fc4-8a0e-7027531d9592"
  },
  "label": "Sam",
  "invitation_type": "https://didcomm.org/out-of-band/1.0/invitation",
  "alias": "Invitation I sent to Alice",
  "auto_accept": true,
  "id": "d998b744-ee93-43e1-b33d-35270c5b0f55",
  "invitation_url": "http://my-agent.com?oob=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9vdXQtb2YtYmFuZC8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNDlkZGYxOGQtMWE3YS00YmExLTlkOWUtNmM3YmIyODlkM2EwIiwgImxhYmVsIjogIlNhbSIsICJzZXJ2aWNlcyI6IFt7ImlkIjogIiNpbmxpbmUiLCAidHlwZSI6ICJkaWQtY29tbXVuaWNhdGlvbiIsICJyZWNpcGllbnRLZXlzIjogWyJkaWQ6a2V5Ono2TWtxYVU0dzF1cVJCS1FzVnpSUGl4UzJzUVdIVTcybXA2U3JxbzFWbWRtZE5WVyJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly9jdWRkbHktZG9nLTEwLnR1bjEuaW5kaWNpb3RlY2guaW8ifV0sICJoYW5kc2hha2VfcHJvdG9jb2xzIjogWyJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9kaWRleGNoYW5nZS8xLjAiLCAiZGlkOnNvdjpCekNic05ZaE1yakhpcVpEVFVBU0hnO3NwZWMvY29ubmVjdGlvbnMvMS4wIl19",
  "multi_use": true,
  "group": "admin",
  "created_date": "2022-02-28T18:07:47.671132Z",
  "raw_repr": {
    "connection": {
      "rfc23_state": "invitation-sent",
      "state": "invitation",
      "updated_at": "2022-02-28T18:07:47.671132Z",
      "alias": "Invitation I sent to Alice",
      "invitation_key": "C8D2LmfQ5dpwm19ii9zbBmrWTtqBMvr6Apt5fVfki9i8",
      "accept": "auto",
      "connection_protocol": "didexchange/1.0",
      "their_role": "invitee",
      "invitation_msg_id": "49ddf18d-1a7a-4ba1-9d9e-6c7bb289d3a0",
      "invitation_mode": "multi",
      "routing_state": "none",
      "connection_id": "d998b744-ee93-43e1-b33d-35270c5b0f55",
      "created_at": "2022-02-28T18:07:47.671132Z"
    },
    "invitation": {
      "invitation": {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/out-of-band/1.0/invitation",
        "@id": "49ddf18d-1a7a-4ba1-9d9e-6c7bb289d3a0",
        "label": "Sam",
        "services": [
          {
            "id": "#inline",
            "type": "did-communication",
            "recipientKeys": [
              "did:key:z6MkqaU4w1uqRBKQsVzRPixS2sQWHU72mp6Srqo1VmdmdNVW"
            ],
            "serviceEndpoint": "http://cuddly-dog-10.tun1.indiciotech.io"
          }
        ],
        "handshake_protocols": [
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/didexchange/1.0",
          "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0"
        ]
      },
      "state": "initial",
      "invitation_url": "http://cuddly-dog-10.tun1.indiciotech.io?oob=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9vdXQtb2YtYmFuZC8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNDlkZGYxOGQtMWE3YS00YmExLTlkOWUtNmM3YmIyODlkM2EwIiwgImxhYmVsIjogIlNhbSIsICJzZXJ2aWNlcyI6IFt7ImlkIjogIiNpbmxpbmUiLCAidHlwZSI6ICJkaWQtY29tbXVuaWNhdGlvbiIsICJyZWNpcGllbnRLZXlzIjogWyJkaWQ6a2V5Ono2TWtxYVU0dzF1cVJCS1FzVnpSUGl4UzJzUVdIVTcybXA2U3JxbzFWbWRtZE5WVyJdLCAic2VydmljZUVuZHBvaW50IjogImh0dHA6Ly9jdWRkbHktZG9nLTEwLnR1bjEuaW5kaWNpb3RlY2guaW8ifV0sICJoYW5kc2hha2VfcHJvdG9jb2xzIjogWyJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9kaWRleGNoYW5nZS8xLjAiLCAiZGlkOnNvdjpCekNic05ZaE1yakhpcVpEVFVBU0hnO3NwZWMvY29ubmVjdGlvbnMvMS4wIl19",
      "invi_msg_id": "49ddf18d-1a7a-4ba1-9d9e-6c7bb289d3a0",
      "trace": false
    }
  }
}
```

`~thread`: Thread ID will match the message ID of the corresponding `create`
message.

See [Common Attributes](#common-attributes)

### get-list
The `get-list` message is sent to ask for a list of existing
invitations.

```jsonc
{
  "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/get-list"
}
```


### list

List of invitations as requested by a `get-list` message.

Example #1:


```jsonc
{
  "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/list",
  "results": [
    {
      "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/invitation",
      "@id": "5a5901c2-b912-4007-8b0c-0eb65c5c3b4b",
      "id": "00ed9110-444b-455d-aab4-8575b299565c",
      "alias": "Invitation I sent to Alice",
      "label": "Bob",
      "group": "my_group",
      "auto_accept": true,
      "multi_use": true,
      "invitation_url": "http://cc086c23.ngrok.io?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNzVmNjZmYmQtZDdiNS00Zjg0LWI4YjMtMjBmYzUxZTc1Njc0IiwgInJlY2lwaWVudEtleXMiOiBbIjdZVm0zQks3NHBROHhKU2h5QVJSZ29COTMxZFVtUmN5U2JTUGZIZFpqREsyIl0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cDovL2NjMDg2YzIzLm5ncm9rLmlvIiwgImxhYmVsIjogImxsbGxsIn0=",
      "created_date": "2020-02-21 04:09:37.878504Z",
      "invitation_type": "https://didcomm.org/connections/1.0/invitation"
    }
  ]
}
```

Example #2 (ACA-Py Plugin Toolbox):
```jsonc
{
  "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/list",
  "@id": "31874a5b-8e38-4eb4-93a6-000433537aff",
  "~thread": {"thid": "56e81139-8382-4dc9-8922-7fa87e03c803"},
  "results": [
    {
      "auto_accept": true,
      "raw_repr": {
        "connection": {
          "state": "invitation",
          "routing_state": "none",
          "invitation_mode": "multi",
          "invitation_key": "DgRxL5egD95vSN4ucKwK5oHTRc5x8cAQTsunnJ69BhBQ",
          "updated_at": "2021-06-15 16:13:10.558682Z",
          "their_role": "invitee",
          "connection_id": "62f147c3-7695-432b-aaf9-87d5df7a0dcc",
          "rfc23_state": "invitation-sent",
          "created_at": "2021-06-15 16:13:10.558682Z",
          "accept": "auto",
          "alias": "Invitation I sent to Alice"},
      "invitation": {
        "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/invitation",
        "@id": "5886772e-e3e4-4990-98f1-6939a23e304d",
        "recipientKeys": ["DgRxL5egD95vSN4ucKwK5oHTRc5x8cAQTsunnJ69BhBQ"],
        "serviceEndpoint": "http://acapy_plugin_agent:3000",
        "label": "Bob"}
      },
      "invitation_url": "http://acapy_plugin_agent:3000?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNTg4Njc3MmUtZTNlNC00OTkwLTk4ZjEtNjkzOWEyM2UzMDRkIiwgInJlY2lwaWVudEtleXMiOiBbIkRnUnhMNWVnRDk1dlNONHVjS3dLNW9IVFJjNXg4Y0FRVHN1bm5KNjlCaEJRIl0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cDovL2FjYXB5X3BsdWdpbl9hZ2VudDozMDAwIiwgImxhYmVsIjogIkJvYiJ9",
      "invitation_type": "https://didcomm.org/connections/1.0/invitation",
      "multi_use": true,
      "alias": "Invitation I sent to Alice",
      "id": "62f147c3-7695-432b-aaf9-87d5df7a0dcc",
      "created_date": "2021-06-15 16:13:10.558682Z",
      "label": "Bob",
      "group": "admin"
    }
  ]
}
```
`results`: A list of invitations.

`id`: The ID of the invitation

`invitation_url`: The invitation in encoded URL form

`created_date`: The date of invitation creation, in ISO8601 form

See [Common Attributes](#common-attributes)
