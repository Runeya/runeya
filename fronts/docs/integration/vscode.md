---
outline: deep
---
# Vscode

## Snippet

Add this in your vscode to print variables easily in debug output of service:
``` json
"Print to runeya": {
  "prefix": "log",
  "body": [
    "console.log(JSON.stringify(['runeya', $1]));",
    "$2"
  ],
  "description": "Print to runeya"
}
```

Type ```log``` in vs code, it should produce something like that:

``` javascript 
console.log(JSON.stringify(['runeya', <what you want>, <and others>]));
```
