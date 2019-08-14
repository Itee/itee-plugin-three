/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import {
    isNotDefined,
    isNotNumber,
    isNotObject
} from 'itee-validators'

function Vector3Type ( Mongoose ) {
    'use strict'

    const SchemaType = Mongoose.SchemaType
    const Schema     = Mongoose.Schema
    const Types      = Schema.Types

    // Declare type
    function Vector3 ( key, options ) {
        SchemaType.call( this, key, options, 'Vector3' )
    }

    Vector3.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Error( `Vector3: ${value} is null or undefined` ) }
            if ( isNotObject( value ) && !value.isVector3 ) { throw new Error( `Vector3: ${value} is not a object or Vector3 instance` ) }

            if ( !( 'x' in value ) ) { throw new Error( 'Vector3: ' + value + ' does not contain x property' ) }
            if ( isNotNumber( value.x ) ) { throw new Error( `Vector3: ${value} expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Error( 'Vector3: ' + value + ' does not contain y property' ) }
            if ( isNotNumber( value.y ) ) { throw new Error( `Vector3: ${value} expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Error( 'Vector3: ' + value + ' does not contain z property' ) }
            if ( isNotNumber( value.z ) ) { throw new Error( `Vector3: ${value} expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z
            }

        }

    } )

    // Register type
    Types.Vector3 = Vector3
    return Mongoose

}

export { Vector3Type }

