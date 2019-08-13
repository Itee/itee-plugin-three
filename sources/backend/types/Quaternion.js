/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const { isNotDefined, isNotNumber } = require( 'itee-validators' )

function registerSchemaTypeFor ( Mongoose ) {
    'use strict'

    const SchemaType = Mongoose.SchemaType
    const Schema     = Mongoose.Schema
    const Types      = Schema.Types

    // Declare type
    function Quaternion ( key, options ) {
        SchemaType.call( this, key, options, 'Quaternion' )
    }

    Quaternion.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Error( `Quaternion: ${value} is null or undefined` ) }
            //if ( isNotObject( value ) && !value.isQuaternion ) { throw new Error( `Quaternion: ${value} is not a object or Quaternion instance` ) }

            if ( !( 'x' in value ) ) { throw new Error( 'Quaternion: ' + value + ' does not contain x property' ) }
            if ( isNotNumber( value.x ) ) { throw new Error( `Quaternion: ${value} expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Error( 'Quaternion: ' + value + ' does not contain y property' ) }
            if ( isNotNumber( value.y ) ) { throw new Error( `Quaternion: ${value} expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Error( 'Quaternion: ' + value + ' does not contain z property' ) }
            if ( isNotNumber( value.z ) ) { throw new Error( `Quaternion: ${value} expected to be a number` ) }

            if ( !( 'w' in value ) ) { throw new Error( 'Quaternion: ' + value + ' does not contain w property' ) }
            if ( isNotNumber( value.w ) ) { throw new Error( `Quaternion: ${value} expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z,
                w: value.w
            }

        }

    } )

    // Register type
    Types.Quaternion = Quaternion
    return Mongoose

}

module.exports = registerSchemaTypeFor
