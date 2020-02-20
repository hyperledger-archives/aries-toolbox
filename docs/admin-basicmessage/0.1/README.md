BasicMessage Admin Protocol
===========================

## Overview

**Protocol URI:** `https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1`

### Protocol Messages
- [new](#new)
- [send](#send)
- [sent](#sent)
- [get](#get)
- [messages](#messages)
- [delete](#delete)
- [deleted](#deleted)

## Message Definitions

> _**Note:**_ Some attributes are omitted from the examples in this section,
> such as the `@id` attribute. The omission is for brevity and clarity of the
> example and it should be assumed that each example message contains all
> attributes required to be processed by the receiving agent.

### Simplified BasicMessage Object
The following structure is used in many of the messages in this protocol and is
a simplified view of BasicMessages.

```jsonc
{
	"connection_id": "f111dd9c-9a24-4341-9c00-df46b3a7c4aa",
	"message_id": "038cae8b-844c-42a8-823d-e6379d2b848a",
	"sent_time": "2020-01-28T02:02:00Z",
	"locale": "en",
	"content": "Your hovercraft is full of eels.",
	"state": "recv",
}
```

`connection_id`: Identifier unique to this agent and used consistently across
all admin functions to identify a single connection.

`message_id`: A unique identifier for this message; usually this is the ID of
the agent message that delivered it.

`sent_time`: An ISO 8601 formatted date and time. See the [BasicMessage
RFC][1].

`locale`: The locale of the message contents. This is a simplification of the
[localization decorator][2].

`content`: The contents of the basic message.

`state`: One of `sent` or `recv`.

[1]: https://github.com/hyperledger/aries-rfcs/tree/master/features/0095-basic-message
[2]: https://github.com/hyperledger/aries-rfcs/tree/master/features/0043-l10n

--------------------------------------------------------------------------------

### Send
Instruct the agent to send a new BasicMessage to a specified connection.

Example:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/send",
	"connection_id": "65dfdda3-2a64-4d9b-b8f1-106834f70a95",
	"content": "Your hovercraft is full of eels."
}
```

`connection_id`: The ID of the connection to which the BasicMessage will be
sent.

`content`: The contents of the BasicMessage to be sent.

### Sent

Notification that a BasicMessage has been sent as requested by the `send`
message.

Example:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/sent",
	"~thread": {"thid": "<send msg id>"},
	"connection_id": "64dc865f-3e69-4970-9fb1-5276f9ab63d0",
	"message": { ... }
}
```

`~thread`: Thread ID will match the message ID of the corresponding `send`
message.

`connection_id`: The ID of the connection to which the BasicMessage was sent.

`message`: The sent message; see [Simplified BasicMessage
Object](#simplified-basicmessage-object).


### New
The `new` message is sent to notify of a newly received message and is sent to
each admin connection with a live session (i.e. currently connected over
websocket).

Example:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/new",
	"connection_id": "64dc865f-3e69-4970-9fb1-5276f9ab63d0",
	"message": { ... }
}
```

`connection_id`: The ID of the connection from which this message originated.

`message`: The new received message; see [Simplified BasicMessage
Object](#simplified-basicmessage-object).

--------------------------------------------------------------------------------

### Get

Retrieve received messages from the agent. This protocol supports rudimentary
pagination using limits and offsets. Messages are ordered by most recent first.

The following example will retrieve all received BasicMessages without filtering
or pagination:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/get",
}
```

To limit by connection:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/get",
	"connection_id": "a07422d3-32e9-4ab6-9473-3b37459e1be7"
}
```

To return only the first 10 messages (the same can also be applied with
`connection_id`):
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/get",
	"limit": 10
}
```

To return 10 messages, offset by 10 (i.e. retrieve "page 2" of messages):
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/get",
	"limit": 10,
	"offset": 10
}
```

`connection_id` (optional): return messages only from this connection.

`limit` (optional): return at most `n` messages.

`offset` (optional): offset the returned results by `m`.

### Messages

Return the matched messages as requested by the `get` message.

Example:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/messages",
	"~thread": {"thid": "<get msg id>"}
	"connectin_id": "b994182e-1457-4eaf-8014-88cc7eb12bed",
	"count": 10,
	"offset": 10,
	"remaining": 230,
	"messages": [ { ... }, { ... }, ... ]
}
```

`~thread`: Thread ID will match the message ID of the corresponding `get`
message.

`connection_id` (optional): The connection ID of the requested messages. Not
sent if none specified by `get`.

`count`: The number of messages returned.

`offset`: The offset of the returned messages.

`remaining`: The number of messages beyond the offset and returned messages.

`messages`: A list of [simplified BasicMessage
objects](#simplified-basicmessage-object).

--------------------------------------------------------------------------------

### Delete
Delete a message or messages with filtering criteria.

To delete all messages:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/delete",
}
```

To delete all messages from a connection:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/delete",
	"connection_id": "ccbea120-4976-4408-a633-94ab118efb2f",
}
```

To delete a message by message ID:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/delete",
	"message_id": "90afbad7-aa4c-4238-9b25-e6cebef32b3d"
}
```

To delete all messages before a date and time:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/delete",
	"before_date": "2020-01-28T15:10:38Z"
}
```

The selection criteria can be mixed to, for instance, delete all messages from
a connection sent before a certain date and time:
```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/delete",
	"connection_id": "49935525-20a9-4631-af0d-b1def4fa0157",
	"before_date": "2020-01-28T15:10:38Z"
}
```

`connection_id` (optional): Specify the connection from which messages will be
deleted.

`message_id` (optional): Specify a message to be deleted by ID.

`before_date` (optional): Specify a date and time before which messages will be
deleted.

`return_deleted` (optional): Specify whether a deleted messages should be
returned.  Defaults to `True`.

### Deleted

Acknowledge deletion of messages and optionally return the deleted messages.

```jsonc
{
	"@type": "https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/delete",
	"connection_id": "d0b301be-b825-4fbe-bc35-67b49c7a5e38",
	"deleted": [ { ... }, { ... }, ... ]
}
```

`connection_id` (optional): The connection ID specified by the `delete` message.

`deleted` (optional): The list of deleted messages, formatted as [simplified
BasicMessage objects](#simplified-basicmessage-object).
