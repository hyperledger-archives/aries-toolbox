Mediator Admin Protocol
=======================

## Overview

**Protocol URI:** `https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-mediator/0.1`

The mediator admin protocol is used to manage mediation requests and view
routing tables of in service mediation clients.

### Protocol Messages
- [mediation-requests-get](#mediation-requests-get)
- [mediation-requests](#mediation-requests)
- [mediation-grant](#mediation-grant)
- [mediation-granted](#mediation-granted)
- [mediation-deny](#mediation-deny)
- [mediation-denied](#mediation-denied)
- [routes-get](#routes-get)
- [routes](#routes)

## Message Definitions

> _**Note:**_ Some attributes are shortened or omitted from the examples in this
> section, such as the `@id` and `@type` attributes. The omission is for brevity
> and clarity of the example and it should be assumed that each example message
> contains all attributes required to be processed by the receiving agent.

### mediation-requests-get
Retrieve mediation requests received by agent.

Example:
```jsonc
{
  "@type": "...admin-mediator/0.1/mediation-requests-get",
  "state": "requested",
  "connection_id": "ee3fdc82-4a49-4b31-b84b-44031ca78c1b"
}
```

`state:`: (Optional) One of `requested`, `granted`, or `denied`, corresponding to the
different possible states of mediation requests.

`connection_id`: (Optional) Retrieve Mediation Requests from connection ID.

### mediation-requests
Response to `mediation-requests-get`

Example:
```jsonc
{
  "@type": "...admin-mediator/0.1/mediation-requests",
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

### mediation-grant
Grant a mediation request.

Example:
```jsonc
{
  "@type": "...admin-mediator/0.1/mediation-grant",
  "mediation_id": "ba4a50a8-b9ab-4333-b48c-fb7663b768d3"
}
```

`mediation_id`: ID of mediation request to grant.

### mediation-granted
Notification of mediation grant send.

Example:
```jsonc
{
  "@type": "...admin-mediator/0.1/mediation-grant",
  "mediation_id": "ba4a50a8-b9ab-4333-b48c-fb7663b768d3"
}
```

`mediation_id`: ID of granted mediation request.

### mediation-deny
Deny a mediation request.

Example:
```jsonc
{
  "@type": "...admin-mediator/0.1/mediation-deny",
  "mediation_id": "ba4a50a8-b9ab-4333-b48c-fb7663b768d3"
}
```

`mediation_id`: ID of mediation request to deny.

### mediation-denied
Notification of mediation deny send.

Example:
```jsonc
{
  "@type": "...admin-mediator/0.1/mediation-deny",
  "mediation_id": "ba4a50a8-b9ab-4333-b48c-fb7663b768d3"
}
```

`mediation_id`: ID of denied mediation request.

### routes-get
Retrieve routes managed by the mediator.

Example:
```jsonc
{
  "@type": "...admin-mediator/0.1/routes-get",
  "connection_id": "2fc59239-7def-4a00-abe5-b01046bc991b"
}
```

`connection_id`: (Optional) Retrieve routing tables for connection ID.

### routes
Response to `routes-get` message.

Example:
```jsonc
{
  "@type": "...admin-mediator/0.1/routes",
  "routes": [
    {
      "connection_id": "2fc59239-7def-4a00-abe5-b01046bc991b",
      "recipient_key": "G5GEUNKYdZjQbjyAZi294U...",
    },
    ...
  ]
}
```

`routes`: List of connection ID to key list mappings.

#### Route (list item)

`connection_id`: Connection ID associated with keys

`recipient_key`: Key routed to this connection.
