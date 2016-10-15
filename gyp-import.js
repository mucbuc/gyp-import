#!/usr/bin/env node

if (module.parent) {
  module.exports = require( './definer' );
  return;
}

var define = require( './definer' )
  , program = require( 'commander' )
  , merge = require( 'gyp-merge' )({noSingletons: false}).mergeDictionary;
  
program
.version( '0.0.0' )
.arguments( '<gyp_path>' )
.action( (gyp_path) => {

  define( [ gyp_path ] )
  .then( (product) => {

    var list = [];

    define( list )
    .then( ( list_product ) => {
      product = merge( product, list_product );
      print( product ); 
    })
    .catch( () => {
      print( product );
    });

    function print( product ) {
      console.log( JSON.stringify( product, null, 2 ) );
    }
  })
  .catch( (err) => { 
    console.error( err );
    throw err;
  });
})
.parse(process.argv);