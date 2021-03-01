Holder Admin Protocol
=====================

## Overview

**Protocol URI:** `https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-holder/0.1`

The holder admin protocol is used to manage credentials received by the
connected agent.

### Protocol Messages
- [credentials-get-list](#credentials-get-list)
- [credentials-list](#credentials-list)
- [credentials-send-proposal](#credentials-send-proposal)
- [credentials-proposal-sent](#credentials-proposal-sent)
- [credentials-offer-received](#credentials-offer-received)
- [credentials-accept-offer](#credentials-accept)
- [presentations-get-list](#presentations-get-list)
- [presentations-list](#presentations-list)
- [presentations-send-proposal](#presentations-send-proposal)
- [presentations-proposal-sent](#presentations-proposal-sent)
- [presentations-request-received](#presentations-request-received)
- [presentations-accept-request](#presentations-accept-request)


## Common Elements

### Credential Representation

Example:

```jsonc
{
	"issuer_did": "<issuer did>",
	"issuer_connection_id": "<connection id>",
	"name": "<credential name>",
	"comment": "comment about the credential"
	"received_at": "<datetime>",
	"attributes": [
		{
			"name": "attribute_name",
			"value": "value"
		},
		...
	],
	"metadata": {
		"schema_id": "<schema id>",
		"cred_def_id": "<cred def id>"
	},
	"raw_repr": { ... }
}
```


## Message Definitions

> _**Note:**_ Some attributes are shortened or omitted from the examples in this
> section, such as the `@id` and `@type` attributes. The omission is for brevity
> and clarity of the example and it should be assumed that each example message
> contains all attributes required to be processed by the receiving agent.

### credentials-get-list
Retrieve a list of credentials held by the connected agent.

### credentials-list
Response to `credentials-get-list` containing list of credentials held by the
connected agent.
