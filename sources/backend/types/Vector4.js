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

function Vector4Type ( Mongoose ) {
    'use strict'

    const SchemaType = Mongoose.SchemaType
    const Schema     = Mongoose.Schema
    const Types      = Schema.Types

    // Declare type
    function Vector4 ( key, options ) {
        SchemaType.call( this, key, options, 'Vector4' )
    }

    Vector4.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Error( `Vector4: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isVector4 ) { throw new Error( `Vector4: ${ value } is not a object or Vector4 instance` ) }

            if ( !( 'x' in value ) ) { throw new Error( `Vector4: ${ value } does not contain x property` ) }
            if ( isNotNumber( value.x ) ) { throw new Error( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Error( `Vector4: ${ value } does not contain y property` ) }
            if ( isNotNumber( value.y ) ) { throw new Error( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Error( `Vector4: ${ value } does not contain z property` ) }
            if ( isNotNumber( value.z ) ) { throw new Error( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'w' in value ) ) { throw new Error( `Vector4: ${ value } does not contain w property` ) }
            if ( isNotNumber( value.w ) ) { throw new Error( `Vector4: ${ value } expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z,
                w: value.w
            }

        }

    } )

    // Register type
    Types.Vector4 = Vector4
    return Mongoose

}

export { Vector4Type }

