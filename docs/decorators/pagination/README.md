Pagination Decorators
=====================

## Overview

**Decorator Type:** `https://github.com/hyperledger/aries-toolbox/tree/master/docs/decorators/pagination`

**Decorator:** `~paginate`, `~page`

The pagination decorators define elements common to messages querying for and
returning a list of results where paging is desirable. These decorators use a
cursor style paging mechanism for flexibility; for simple collections where
offsets are sufficient, offset based pagination can be implemented using cursor
values such as `offset:10` while more complex collections accessed from a
database or other sources can use cursors representing rows in a table with
unique identifiers.

Using arbitrary cursor strings means that at the protocol level, there is no
prescription of underlying pagination mechanism. For more details into the
reasoning for this style, [read this post from Slack about
pagination][slack-post].

## Decorator Definition

### `~paginate`

The `~paginate` decorator is used in messages expecting a returned list of
results. If more than one element in the response message can be paginated,
`~paginate` can be used as a suffix to indicate to which element it refers, i.e.
`results~paginate`. This usage is outlined by message type definitions as
required.

Example:

```jsonc
{
    "...",
    "~paginate": {
		"cursor": "<cursor string>",
        "limit": 10,
    }
}
```

`cursor` (optional): Cursor representing where the next page of results begins.
If omitted, results are returned from the beginning of the collection. Cursor
corresponds to the returned `next_cursor` of the `~page` decorator denoting page
information from a paginated collection. The exact value of these cursors is
completely opaque to the receiver and have meaning only in specifying the
starting point for the next page. These values should therefore NOT be
manipulated by the querying party.

`limit`: return at most `n` items.

### `~page`

The `~page` pagination decorator is used in messages responding to queries for
lists of results. The elements of the messages paginated by the decorator
should be defined by the message type using the decorator. If multiple elements
are paginated, the decorator may be used as a suffix to specify which element
the pagination object is relevant to. For example, `~page` refers to an element
defined by the message type; `results~page` refers to the `results` element of
the message and in the same message another `other~page` object can refer to the
`other` element.

Example:

```jsonc
{
    "...",
    "~page": {
		"next_cursor": "<cursor string>"
        "remaining": 230
    }
}
```

`next_cursor`: Arbitrary string value representing the start of the next page of
results. As noted above, these values are completely opaque to the querying
party and should not be modified.

`remaining` (optional): The number of items beyond the next cursor. Some
collections may not support calculating remaining items, may be very inefficient
in counting remaining items, or else change so frequently that reporting how
many items remain is meaningless. If possible and useful, messages and protocols
may use this as needed.

[slack-post]: https://slack.engineering/evolving-api-pagination-at-slack/#:~:text=Offsets,to%20return%20results%20for%2C%20page
