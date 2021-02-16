Pagination Decorators
=====================

## Overview

**Decorator Type:** `https://github.com/hyperledger/aries-toolbox/tree/master/docs/decorators/pagination`

**Decorator:** `~paginate`, `~page`

The pagination decorators defines elements common to messages querying for and
returning a list of results where paging is desirable.

## Decorator Definition

### `~paginate`

The `~paginate` decorator is used in messages querying for a list of results. If
more than one element in the response message can be paginated, `~paginate` can
be used as a suffix to indicate to which element it refers, i.e.
`results~paginate`. This usage is outlined by message type definitions as
required.

Example:

```jsonc
{
    "...",
    "~paginate": {
        "@type": ".../decorators/pagination/paginate",
        "limit": 10,
        "offset": 10
    }
}
```

`limit`: return at most `n` messages.

`offset` (optional; default `0`): offset the returned results by `m`.

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
        "@type": ".../decorators/pagination/page",
        "count": 10,
        "offset": 10
        "remaining": 230
    }
}
```

`count`: The number of items returned.

`offset`: The offset of the returned items.

`remaining` (required as dictated by utilizing message type, may be absent): The
number of items beyond the offset and returned items.
