#!/usr/bin/env node

if (module.parent) {
  module.exports = require( './definer' );
  return;
}

var define = require( './definer' )
  , program = require( 'commander' )
  , deepmerge = require( 'deepmerge' )
  , path = require( 'path' );
  
program
.version( '0.0.0' )
.option( '-g --gcc', 'use gcc compiler' )
.option( '-d --default', 'use default compiler')
.arguments( '<gyp_path>' )
.action( (gyp_path) => {

  define( [ gyp_path ] )
  .then( (product) => {

    var list = [];

    if (program.gcc) {
      list.push( getLocalGYPI('cpp11-gcc.gypi') );
    }
    else if (program.default) {
      list.push( getLocalGYPI('cpp11-os.gypi' ) );
    }

    if (product.opengl) {
      list.push( getLocalGYPI( './opengl.gypi' ) );
    }

    define( list )
    .then( ( list_product ) => {
      product = deepmerge( product, list_product );
      print( product ); 
    })
    .catch( () => {
      print( product );
    });

    function print( product ) {
      console.log( JSON.stringify( product, null, 2 ) );
    }

    function getLocalGYPI(name) {
      return path.join( __dirname, name );
    }

  });
})
.parse(process.argv);