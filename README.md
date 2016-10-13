# gyp-import

####objective
flatten gyp/gypi files 

####description
recursively reads ([gyp-reader](https://github.com/isaacs/gyp-reader.js)) and merges ([deepmerge](https://github.com/sasaplus1/deepcopy.js)) [gyp](https://chromium.googlesource.com/external/gyp/+/master/docs/UserDocumentation.md) files. The result will be piped to stdout, errors are piped to stderr.

####syntax
```
  Usage: gyp-import [options] <gyp_path>

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

