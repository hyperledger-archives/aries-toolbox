TrustPing Admin Protocol
===========================

## Overview

**Protocol URI:** `https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-trustping/0.1`

### Protocol Messages
- [send](#send)
- [sent](#sent)
- [response-received](#response-received)


## Message Definitions


### Send
Protocol to send a trust ping.

Example:
```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-trustping/0.1/send",
    "connection_id": "1252fa54-f135-4ac0-827c-5fa13cef9e67",
    "comment": "Trust ping test",
}
```
`connection_id`: Identifier unique to this agent and used consistently across all admin functions to identify a single connection.

`comment`: Comment to accompany the trust ping.



### Sent

Notification of a trust ping sent as requested by the `send`
message.

Example:
```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-trustping/0.1/sent", 
    "@id": "5ec19497-c8ca-4df1-a4c1-d6a9919affdf",
    "~thread":
        {
            "thid": "83dca80d-fbd7-41fe-aaa1-7264a1ca4f35"
        },
    "connection_id": "1252fa54-f135-4ac0-827c-5fa13cef9e67"
}
```
`connection_id`: The ID of the connection to which the ping was sent.





### Response Received

Confirmation that the ping response was received.

Example:
```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-trustping/0.1/response-received",
    "@id": "4adf3a50-8ff0-4594-8d6c-75111078c1d1",
}
```
