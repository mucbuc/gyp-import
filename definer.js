/*
objective:
  - create product object mapping properties with types 
  - read and parse json

  - recursivly process includes
  - fix relative path for source
*/

'use strict';

var assert = require( 'assert' )
  , path = require( 'path' )
  , traverse = require( 'traverjs' )
  , gypReader = require( 'gyp-reader' )
  , fs = require( 'fs' );

function define(pathJSONs, objReader) {
  var product = {}
    , included = []; 

  if (typeof objReader === 'undefined') {
    objReader = defaultObjectReader;
  }

  return new Promise( (resolve, reject) => {
    traverse( pathJSONs, (pathJSON, next) => {
      
      processJSON( path.relative( process.cwd(), pathJSON ) )
      .then( (local) => {
        
        product = Object.assign( product, local);

        next();
      })
      .catch( (error) => {
        console.error( error ); 
        throw error;
      });
    })
    .then( () => {
      resolve( product );
    })
    .catch( reject );
  }); 

  function processJSON(fileJSON) {
    
    return new Promise( (resolve, reject) => {
      
      const dirJSON = path.dirname(fileJSON);

      objReader( fileJSON, (content) => {
        processDependencies(fileJSON, content)
        .then( resolve )
        .catch( reject );
      }); 
      
      function processDependencies(fileJSON, content) {
        
        console.log( 'processDependencies: ', content );

        return new Promise( (resolve, reject) => {
          var product = {}
          if (    content.hasOwnProperty('opengl') 
              &&  content.opengl) {
            product.opengl = true;
          }
          
          traverse( content, (prop, next) => {
            
            if (prop.hasOwnProperty('includes')) {
              handleIncludes( prop.includes, next);
            }
            else if (prop.hasOwnProperty('data')) {
              handleData( prop.data, next);
            }
            else if (prop.hasOwnProperty('sources')) {
              handleSources( prop.sources, next );
            }
            else {
              
              if (typeof prop === 'object') {
                
                // TODO: need local product I can merge with product
                // TODO: get rid of hardcoded piece of shit 
                processDependencies(fileJSON, prop.a)
                .then( function(local) {
                  product.a = local;
                  resolve( product );
                } ) 
                .catch( reject );                 
              }
              else {
                console.log( 'assign:', prop ); 

                product = Object.assign( product, prop );
                next();
              }
            }
          })
          .then( () => {
            resolve(product);
          } )
          .catch( reject );
                  
          function handleIncludes(includes, cb) {

            traverse( includes, ( item, next ) => {

              if (included.indexOf(item) == -1) {
                included.push(item);

                processJSON( path.join( dirJSON, item ) )
                .then( next )
                .catch( reject );
              }
              else {
                next();
              }
            })
            .then( cb )
            .catch( cb );
          }

          function handleData(data, cb) {

            if (!product.hasOwnProperty('data'))
              product.data = [];
            
            traverse( data, (dataPath, next) => {
              product.data.push( path.join( dirJSON, dataPath ) );
              next();
            })
            .then( cb )
            .catch( cb ); 
          }

          function handleSources(sources, cb) {
            
            assert( Array.isArray( sources ) ); 

            if (!product.hasOwnProperty('sources'))
              product.sources = [];
            
            for (var source of sources) {
              product.sources.push( path.join( dirJSON, source ) ); 
            }

            cb(); 
          }
        });
      }
    });
  }

  function defaultObjectReader(filePath, cb) {

    fs.readFile( filePath, (err, data) => {
      
      if (err) 
        onError(err);
      
      try {
        const content = JSON.parse(data.toString());
        cb( content ); 
      }
      catch(err)
      {
        gypReader( filePath, (err, data) => { 
          if (err) 
            onError(err);
          cb( data );
        } );
      }

      function onError(err) {
        console.error( 'error processing file at: ', filePath, ' cwd: ', process.cwd() );
        throw err;
      }
    });
  }
}

module.exports = define;
