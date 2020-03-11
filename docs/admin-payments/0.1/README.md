Payments Admin Protocol
===========================

## Overview

**Protocol URI:** `https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1`

### Protocol Messages
- [create-address](#create-address)
- [address](#address)
- [get-address-list](#get-address-list)
- [address-list](#address-list)
- [get-fees](#get-fees)
- [fees](#fees)
- [transfer](#transfer)
- [transfer-complete](#transfer-complete)

## Message Definitions

> _**Note:**_ Some attributes are omitted from the examples in this section,
> such as the `@id` attribute. The omission is for brevity and clarity of the
> example and it should be assumed that each example message contains all
> attributes required to be processed by the receiving agent.

### Base Address Object
The following structure is used in many of the messages in this protocol.

```jsonc
{
    "address": "pay:sov:...",
    "method": "sov",
    "balance": 20.0000
    "raw_repr": { ... }
}
```

`address`: A payment address represented in whichever format needed for use by
the connected full agent.

`method`: The payment method; for example, Sovrin tokens use method `sov` and
Bitcoin might use method `btc`. This helps the connected full agent handling the
actual payments interpret and use the `address`.

`balance`: A float representation of the units of currency available on this
address.

`raw_repr` (Optional): An optional field for additional information specific to
the connected full agent.

--------------------------------------------------------------------------------

### Create Address
Instruct the agent to create a payment address. An [Address Message](#address)
will come in reply to this message.

Example:
```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/create-address"
    "method": "sov",
    "seed": "12345..."
}
```

`method`: The payment method for which an address should be created.

`seed` (Optional): Specify a seed for the created payment address.

### Address

The response to [Create Address](#create-address). This message SHOULD have a
`thid` matching the message ID of the corresponding `create-address` message.

Example:
```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/address"
    "method": "sov",
    "balance": 0.0000
}
```

See [Base Address Object](#base-address-object) for field details.

--------------------------------------------------------------------------------

### Get Address List

Retrieve a list of payment addresses available on the connected agent. An
[Address List](#address-list) message will be sent in response to this message.

```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/get-address-list"
    "method": "sov"
}
```

`method` (Optional): Filter addresses, returning only those matching `method`.


### Address List

The response to [Get Address List](#get-address-list). This message SHOULD have
a `thid` matching the message ID of the corresponding `get-address-list`
message.

```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/address-list"
    "addresses": [ {...}, {...}, ... ]
}
```

`addresses`: A list of [address objects](#base-address-object).

--------------------------------------------------------------------------------

### Get Fees

Retrieve any potential fees associated with a transfer. A response of
[Fees](#fees) will be sent.

```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/get-fees"
    "method": "sov",
    "amount": 10.0000
}
```

`method`: The method for which fees are retrieved.

`amount` (Optional): Specify the amount to be transferred for methods with
variable fee rates.


### Fees

The response to [Get Fees](#get-fees). This message SHOULD have a `thid`
matching the message ID of the corresponding `get-fees` message.


```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/fees"
    "total": 1.0000
}
```

`total`: The total fees for transferring payment.

--------------------------------------------------------------------------------

### Transfer

Instruct the connected agent to transfer funds from one payment address to
another.


```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/transfer"
    "from_address": "pay:sov:...",
    "to_address": "pay:sov:...",
    "amount": 10.0000,
}
```

`from_address`: The address from which the connected agent will transfer
payment.

`to_address`: The address to which payment will be sent.

`amount`: The amount to send.


### Transfer Complete

Notification that the requested transfer has completed. This message SHOULD have
a `thid` matching the message ID of the corresponding `transfer` message.

```jsonc
{
    "@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-payments/0.1/transfer-complete"
    "from_address": "pay:sov:...",
    "to_address": "pay:sov:...",
    "amount": 10.0000,
    "fees": 1.0000,
    "raw_repr": { ... }
}
```

`from_address`: The address from which the connected agent transferred payment.

`to_address`: The address to which payment was sent.

`amount`: The amount sent.

`fees` (Optional): The total fees taken in addition to the amount sent from the source
 or "from" address. This SHOULD be included if fees are deducted.

`raw_repr` (Optional): An optional field for additional information specific to
the connected full agent.
