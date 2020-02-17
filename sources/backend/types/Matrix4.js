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
    isNaN,
    isNotArray,
    isNotDefined,
    isNotNumber
} from 'itee-validators'

function Matrix4Type ( Mongoose ) {
    'use strict'

    const SchemaType = Mongoose.SchemaType
    const Schema     = Mongoose.Schema
    const Types      = Schema.Types

    // Declare type
    function Matrix4 ( key, options ) {
        SchemaType.call( this, key, options, 'Matrix4' )
    }

    Matrix4.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Error( `Matrix4: ${ value } is null or undefined` ) }
            if ( isNotArray( value ) && !value.isMatrix4 ) { throw new Error( `Matrix4: ${ value } is not a object or Matrix4 instance` ) }

            let result = undefined
            if ( value.isMatrix4 ) {
                result = value.toArray()
            } else {
                result = value
            }

            // Check number of values
            const numberOfValues = result.length
            if ( numberOfValues !== 16 ) {
                throw new Error( `Matrix4: ${ value } does not contain the right number of values. Expect 9 values and found ${ numberOfValues }` )
            }

            // Check values are numbers in the range [0 - 1]
            for ( let index = 0, val = undefined ; index < numberOfValues ; index++ ) {

                val = result[ index ]

                if ( isNotNumber( val ) ) {
                    throw new Error( `Matrix4: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

                if ( isNaN( val ) ) {
                    throw new Error( `Matrix4: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

            }

            return result

        }

    } )

    // Register type
    Types.Matrix4 = Matrix4
    return Mongoose

}

export { Matrix4Type }

