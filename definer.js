/*
objective:
  - create product object mapping properties with types 
  - read and parse json

  - recursivly process includes
  - fix relative path for source
*/

'use strict';

var path = require( 'path' )
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
      
      processDependencies( path.relative( process.cwd(), pathJSON ) )
      .then( (product) => {
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

  function processDependencies(fileJSON) {
    
    const pathBase = path.dirname( fileJSON ); 

    return new Promise( (resolve, reject) => {
      
      const dirJSON = path.dirname(fileJSON); 

      objReader( fileJSON, (content) => {
      
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
            product = Object.assign( product, prop );
            next();
          }
        })
        .then( () => {
          resolve(product);
        } );
                
        function handleIncludes(includes, cb) {

          traverse( includes, ( item, next ) => {

            if (included.indexOf(item) == -1) {
              included.push(item);

              processDependencies( path.join( pathBase, item ) )
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

          if (!product.hasOwnProperty('sources'))
            product.sources = [];

          traverse( sources, (source, next) => {
            product.sources.push( path.join( dirJSON, source ) ); 
            next();
          })
          .then( cb )
          .catch( cb ); 
        }

      });
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
