# fix-broken-utf8-encodings

Sometimes, encoding issues happen and you end up with sequences of improperly escaped unicode code units in your JSON. For example, the string

```json
"Don\\u00e2\\u0080\\u0099t forget to drink your Ovaltine."
```

which will decode as

```json
"Donât forget to drink your Ovaltine."
```

This occurs because the original string was encoded as UTF-8, but the JSON was encoded incorrectly (usually Latin-1 or ASCII).

The string should be encoded in JSON as

```json
"Don\\u2019t forget to drink your Ovaltine."
```

or simply

```json
"Don’t forget to drink your Ovaltine."
```

(note the fancy apostrophe).

This small library provides a function which will make a best-effort attempt to reinterpret these broken sequences into their original unicode control points.

## Usage

```js
const {reinterpret} = require("fix-broken-utf8-encodings");

// simply call reinterpret on your broken string
reinterpret("Don\\u00e2\\u0080\\u0099t forget to drink your Ovaltine.");
// returns "Don\\u2019t forget to drink your Ovaltine."
```

Additionally, there is a convenience method `unescape` which will both reinterpret and convert the escaped unicode code points into their actual unicode characters.

```js
const {unescape} = require("fix-broken-utf8-encodings");
unescape("Don\\u00e2\\u0080\\u0099t forget to drink your Ovaltine.");
// returns "Don’t forget to drink your Ovaltine."
```

but usually you'll want to use `reinterpret` and then `JSON.parse` the result, if you are interpreting a JSON string.

### Caveats

Since it's difficult to know when a series of code units is intentional or a manifestation of this encoding issue, this library only attempts to fix sequences of at least three one-byte code units. This means that it will fix sequences like

```js
"\\u00e2\\u0080\\u0099"; // fancy apostrophe
"\\u00f0\\u009f\\u008e\\u00bb"; // violin emoji
```

but not sequences like

```js
"\\u0020"; // space
"\\uD834\\uDF06"; // violin utf-16 surrogate pair
"\\uD834\\uDF06\\uD834\\uDF06"; // two violin utf-16 surrogate pairs (won't be modified since these are not one-byte code units)
```

Additionally, this library does not make an effort to find and fix unicode sequences which are not escaped, since it's difficult to know in general when sequences of characters are intentional.

## License

MIT
