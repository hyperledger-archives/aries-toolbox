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
- [create-invitation](#create-invitation)
- [invitation](#invitation)
- [invitation-get-list](#invitation-get-list)
- [invitation-list](#invitation-list)

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

--------------------------------------------------------------------------------

### create-invitation
Instruct the agent to create a new invitation.

Example:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/create-invitation",
	"alias": "Invitation I sent to Alice",
	"label": "Bob"
	"group": "admin",
	"auto_accept": true,
	"multi_use": true,
	"mediation_id": "42a1f1c9-b463-4f59-8385-2e2f7b70466a"
}
```

`mediation_id`: Identifier for mediator to use in accepting the invitation.

See [Common Attributes](#common-attributes)

### invitation

Details of a new invitation created as requested by a `create_invitation` message.

Example:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/invitation",
	"~thread": {"thid": "<send msg id>"},
	"alias": "Invitation I sent to Alice",
	"label": "Bob"
	"group": "my_group",
	"auto_accept": true,
	"multi_use": true
}
```

`~thread`: Thread ID will match the message ID of the corresponding `create_invitation`
message.

See [Common Attributes](#common-attributes)


### invitation-get-list
The `invitation-get-list` message is sent to ask for a list of existing
invitations.

Example:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/invitation-get-list"
}
```


### invitation-list

List of invitations as requested by a `invitation-get-list` message.

```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/invitation-list"
    "results": [
        {
            "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-invitations/0.1/invitation",
            "@id": "5a5901c2-b912-4007-8b0c-0eb65c5c3b4b",
            "id": "00ed9110-444b-455d-aab4-8575b299565c",
            "alias": "Invitation I sent to Alice",
            "label": "Bob",
            "group": "my_group",
            "auto_accept": true,
            "multi_use": true
            "invitation_url": "http://cc086c23.ngrok.io?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNzVmNjZmYmQtZDdiNS00Zjg0LWI4YjMtMjBmYzUxZTc1Njc0IiwgInJlY2lwaWVudEtleXMiOiBbIjdZVm0zQks3NHBROHhKU2h5QVJSZ29COTMxZFVtUmN5U2JTUGZIZFpqREsyIl0sICJzZXJ2aWNlRW5kcG9pbnQiOiAiaHR0cDovL2NjMDg2YzIzLm5ncm9rLmlvIiwgImxhYmVsIjogImxsbGxsIn0=",
            "created_date": "2020-02-21 04:09:37.878504Z",
        }
    ]
}
```

`results`: A list of invitations.

`id`: The ID of the invitation

`invitation_url`: The invitation in encoded URL form

`created_date`: The date of invitation creation, in ISO8601 form

See [Common Attributes](#common-attributes)
