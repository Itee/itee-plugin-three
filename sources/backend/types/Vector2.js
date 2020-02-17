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

function Vector2Type ( Mongoose ) {
    'use strict'

    const SchemaType = Mongoose.SchemaType
    const Schema     = Mongoose.Schema
    const Types      = Schema.Types

    // Declare type
    function Vector2 ( key, options ) {
        SchemaType.call( this, key, options, 'Vector2' )
    }

    Vector2.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Error( `Vector2: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isVector2 ) { throw new Error( `Vector2: ${ value } is not a object or Vector2 instance` ) }

            if ( !( 'x' in value ) ) { throw new Error( `Vector2: ${ value } does not contain x property` ) }
            if ( isNotNumber( value.x ) ) { throw new Error( `Vector2: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Error( `Vector2: ${ value } does not contain y property` ) }
            if ( isNotNumber( value.y ) ) { throw new Error( `Vector2: ${ value } expected to be a number` ) }

            return {
                x: value.x,
                y: value.y
            }

        }

    } )

    // Register type
    Types.Vector2 = Vector2
    return Mongoose

}

export { Vector2Type }

