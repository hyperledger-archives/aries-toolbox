Routing Admin Protocol
======================

## Overview

**Protocol URI:** `https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-routing/0.1`

The routing admin protocol is used to make mediation requests and view and
update routing tables being serviced by this agent's mediators.

### Protocol Messages
- [mediation-requests-get](#mediation-requests-get)
- [mediation-requests](#mediation-requests)
- [mediation-request-send](#mediation-request-send)
- [mediation-request-sent](#mediation-request-sent)
- [keylist-update-send](#keylist-update-send)
- [keylist-update-sent](#keylist-update-sent)
- [routes-get](#routes-get)
- [routes](#routes)

## Message Definitions

> _**Note:**_ Some attributes are shortened or omitted from the examples in this
> section, such as the `@id` and `@type` attributes. The omission is for brevity
> and clarity of the example and it should be assumed that each example message
> contains all attributes required to be processed by the receiving agent.

### mediation-requests-get
Retrieve mediation requests made by agent.

Example:
```jsonc
{
  "@type": "...admin-routing/0.1/mediation-requests-get",
  "state": "requested",
  "connection_id": "ee3fdc82-4a49-4b31-b84b-44031ca78c1b"
}
```

`state:`: (Optional) One of `requested`, `granted`, or `denied`, corresponding
to the different possible states of mediation requests.

`connection_id`: (Optional) Retrieve Mediation Requests from connection ID.

### mediation-requests
Response to `mediation-requests-get`.

Example:
```jsonc
{
  "@type": "...admin-routing/0.1/mediation-requests",
  "~thread": {"thid": "<send msg id>"},
  "requests": [
    {
      "state": "requested",
      "connection_id": "a1e85f35-eaf6-4e5f-8c9f-a3e97f18bebe",
      "mediation_id": "df7bed06-0a0c-4b1a-b45b-278de432429b",
      "mediator_terms": [],
      "recipient_terms": []
    },
    ...
  ]
}
```

`~thread`: Thread ID will match the message ID of the corresponding
`mediation-requests-get` message.

`requests`: List of retrieved requests

#### Request (list item)

`state`: (Required) See [`mediation-requests-get`](#mediation-requests-get)

`connection_id`: Connection ID associated with this request.

`mediation_id`: ID of Mediation request.

`mediator_terms`: Terms required by mediator.

`recipient_terms`: Terms required by recipient.

### mediation-request-send
Send mediation request to connection.

Example:
```json
{
  "@type": "...admin-routing/0.1/mediation-request-send",
  "connection_id": "fdbcdfe3-43c9-4f7b-8a77-c242dda6c645"
}
```

### mediation-request-sent
Notification of mediation request sent.

Example:
```json
{
  "@type": "...admin-routing/0.1/mediation-request-sent",
  "~thread": {"thid": "<id of send>"},
  "connection_id": "fdbcdfe3-43c9-4f7b-8a77-c242dda6c645"
}
```

### keylist-update-send
Send keylist update.

Example:
```json
{
  "@type": "...admin-routing/0.1/keylist-update-send",
  "connection_id": "19af130b-c4f7-405f-b2a4-38deda144a68",
  "verkey": "FXmyHENFwyuq3QeoaVd4aq...",
  "action": "add"
}
```

### keylist-update-sent
Keylist update sent notification.

Example:
```json
{
  "@type": "...admin-routing/0.1/keylist-update-sent",
  "~thread": {"thid": "<id of send>"},
  "connection_id": "19af130b-c4f7-405f-b2a4-38deda144a68",
  "verkey": "FXmyHENFwyuq3QeoaVd4aq...",
  "action": "add"
}
```

### routes-get
Query agent for its active routes meaning the keys it has requested a mediator
to forward.

Example:
```json
{
  "@type": "...admin-routing/0.1/routes-get",
  "connection_id": "0241ea55-9549-4f67-a257-60bbded93d51"
}
```

### routes
Response to `routes-get`, result of active routes query.

Example:
```jsonc
{
  "@type": "...admin-routing/0.1/routes",
  "~thread": {"thid": "<id of get>"},
  "routes": [
    {
      "connection_id": "0241ea55-9549-4f67-a257-60bbded93d51",
      "recipient_key": "URBr2gG3Zfbh93LMtkLL5D..."
    },
    ...
  ]
}
```
