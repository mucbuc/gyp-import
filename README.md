# WIP. DON'T USE

# gyp-def
gyp generation helper 

####objective
- flatten gyp/gypi files 
- include commonly used properties

####how it works
recursively reads ([gyp-reader](https://github.com/isaacs/gyp-reader.js)) and merges ([deepmerge](https://github.com/sasaplus1/deepcopy.js)) [gyp](https://chromium.googlesource.com/external/gyp/+/master/docs/UserDocumentation.md) files and their imported files. The result will be piped to stdout, errors are piped to stderr. Note: included files using the standard gyp syntax `include` will not be merged, only the files denoted by `import` will be merged in. Some default configurations for c++11, gcc and xcodebuild (msbuild not supported yet) are provided. 

####syntax
```
  Usage: gyp-def [options] <gyp_path>

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -g --gcc       use gcc compiler
    -d --default   use default compiler
```

####examples 

minimal.gyp:
```
{
	"sources": [ "src/main.cpp" ]
}
```

import.gyp:
```
{
	"import": [ "lib/test.gypi" ], #will get merged in by gyp-def
	"include": [ "lib/other.gypi" ], #will get processed by gyp
}
```

####Roadmap: 
- nodejs bindings
- msbuild
