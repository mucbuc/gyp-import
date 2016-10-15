#!/usr/bin/env node

'use strict';

var test = require( 'tape' )
  , define = require( '../definer' )
  , Expector = require( 'expector' ).Expector;

function testDefine( map ) {
  return define( [ 'test.json' ], map ); 
}

test( 'data prep', (t) => {
  
  var controller = new Expector(t)
  controller.expect( "data/content.json" );

  testDefine( (path, cb) => {
    
    cb( { 
      "sources": [
        "src/main-data.cpp"
      ],
      "data": [ 
        "data/content.json" 
      ]
    } );
  } )
  .then( (gyp) => {
    controller.emit( gyp.data ).check(); 
  })
  .catch( (err) => {
    throw err;
  });
});

test.only( 'define recursion', (t) => {
  
  var controller = new Expector(t)
    , expected = [
      'lib/sublib2/src/subsrc.cpp',
      'lib/sublib/src/subsrc.h', 
      'lib/sublib/src/subsrc.cpp'
    ];

  testDefine( mapFile )
  .then( (gyp) => {
    t.assert( gyp.hasOwnProperty( 'sources' ) );
    t.deepEqual( gyp.sources, expected ); 
    t.end();
  })
  .catch( (error) => { 
    console.log( error ); 
  });

  function mapFile(path, cb) {
    
    console.log( path );

    var result = {
      "test.json": 
        { includes: [ '../sublib/def.json' ] },
      "../sublib/def.json": 
        { includes: [ 'lib/sublib2/def.json' ],
          sources: [ 'src/subsrc.h', 'src/subsrc.cpp' ] },
      "lib/sublib2/def.json": 
        { sources: [ 'src/subsrc.cpp' ] }
      };

    t.assert( result.hasOwnProperty( path ) ); 

    cb( result[path] ); 
  }
});

test( 'test definer', (t) => {
  
  var controller = new Expector(t);

  controller.expect( '["src/main.cpp"]' );
  testDefine( (path, cb) => {
    if (path == "lib/crimp/def.json")
      cb( {} );
    else 
      cb( { "sources": [ "src/main.cpp" ] } );
  } )
  .then( (product) => {
    t.assert( product.hasOwnProperty('sources') );
    
    console.log( JSON.stringify(product.sources) ); 
    controller.emit( JSON.stringify(product.sources) ).check();
  });
});

test( 'test pass thru', (t) => {
  var controller = new Expector(t);
  controller.expect( 'rand_val' );
  testDefine( (path, cb) => {
    cb( { "rand_prop": "rand_val" } );
  })
  .then( (product) => {
    t.assert( product.hasOwnProperty('rand_prop') );
    controller.emit( product.rand_prop ).check();
  });
});

test( 'test property merge', (t) => {
  var controller = new Expector(t);
  
  controller.expect( 'c' );

  testDefine( (path, cb) => {
    if (path == 'a.json')
      cb( { a: 'b' } );
    if (path == 'b.json')
      cb( { a: 'c' } );
    if (path == 'test.json')
      cb( { includes: [ 'a.json', 'b.json' ] } );
  })
  .then( (product) => {
    t.assert( product.hasOwnProperty( 'a' ) ); 
    controller.emit( product.a ).check();
  });

});

test( 'test opengl property', (t) => { 

  var controller = new Expector(t); 

  controller.expect( true ); 

  testDefine( (path, cb) => {
    cb( { opengl: true } );
  })
  .then( (product) => {
    t.assert( product.hasOwnProperty( 'opengl' ) );
    controller.emit( product.opengl ).check(); 
  });

});

