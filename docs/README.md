Aries Toolbox Documentation
===========================
- [Aries Toolbox Architecture](architecture.md)
- [How Modules Work](howmoduleswork.md)

Visit subdirectories to see documentation for specific Aries Toolbox protocols.

Generating Documentation
------------------------

```
https://github.com/hyperledger/aries-toolbox/tree/master/docs/admin-basicmessage/0.1/send
```

To make a type string like the one shown above resolve to documentation within
this repository, a `README` file must be found in the
`admin-basicmessage/0.1/send` directory. To avoid writing a `README` for every
single message type (which would be quite annoying for learning about a whole
protocol at once anyways), a Makefile and a few scripts are included here to
generate these `README`s from one main `README`. For the example type above, the
central `README` would be found at the path `admin-basicmessage/0.1/README.md`.

These scripts expect to find a line like the following inside of the central
`README`:

```
### Protocol Messages
```

Followed by any number of lines of the pattern:
```
- [message-name](#link-to-message-definition-section)
```

Followed by a blank line. Here is a complete example:

```
### Protocol Messages
- [invite](#invite-message)
- [request](#request-message)
- [response](#response-message)

```

You can find a full example in the [Admin Basic Message
Protocol README](admin-basicmessage/0.1/README.md).

### Triggering Generation

Run the `docs` target with `make`:
```
$ make docs
```

To overwrite old docs, use:
```
$ make clean docs
```

If testing or for whatever reason you'd like to explicitly trigger generation
for just one `README`, you can directly call the `generate_doc_folders.sh`
script:

```
$ ./scripts/generate_doc_folders.sh path/to/my_readme.md
```
