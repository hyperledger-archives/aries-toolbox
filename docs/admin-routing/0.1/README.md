Routing Admin Protocol
======================

## Overview

**Protocol URI:** `https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-routing/0.1`

The routing admin protocol is used to make mediation requests and view and
update routing tables being serviced by this agent's mediators.

### Protocol Messages
- [mediation-request-send](#mediation-request-send)
- [mediation-request-sent](#mediation-request-sent)
- [keylist-update-send](#keylist-update-send)
- [keylist-update-sent](#keylist-update-sent)
- [keylists-get](#keylists-get)
- [keylists](#keylists)

## Message Definitions

> _**Note:**_ Some attributes are shortened or omitted from the examples in this
> section, such as the `@id` and `@type` attributes. The omission is for brevity
> and clarity of the example and it should be assumed that each example message
> contains all attributes required to be processed by the receiving agent.

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
  "connection_id": "19af130b-c4f7-405f-b2a4-38deda144a68",
  "verkey": "FXmyHENFwyuq3QeoaVd4aq...",
  "action": "add"
}
```

### keylists-get
Query agent for its active routes meaning the keys it has requested a mediator
to forward.

Example:
```json
{
  "@type": "...admin-routing/0.1/keylists-get",
  "connection_id": "0241ea55-9549-4f67-a257-60bbded93d51"
}
```

### keylists
Response to `keylists-get`, result of active routes query.

Example:
```json
{
  "@type": "...admin-routing/0.1/keylists",
  "keylists": [
    {
      "connection_id": "0241ea55-9549-4f67-a257-60bbded93d51",
      "keys": [
        "TL1WEBPGcN8Die6V1ck82...",
        "..."
      ]
    },
    "..."
  ]
}
```
