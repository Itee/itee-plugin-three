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

function Matrix3Type ( Mongoose ) {
    'use strict'

    const SchemaType = Mongoose.SchemaType
    const Schema     = Mongoose.Schema
    const Types      = Schema.Types

    // Declare type
    function Matrix3 ( key, options ) {
        SchemaType.call( this, key, options, 'Matrix3' )
    }

    Matrix3.prototype = Object.assign( Object.create( SchemaType.prototype ), {

        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Error( `Matrix3: ${value} is null or undefined` ) }
            if ( isNotArray( value ) && !value.isMatrix3 ) { throw new Error( `Matrix3: ${value} is not a object or Matrix3 instance` ) }

            let result = undefined
            if ( value.isMatrix3 ) {
                result = value.toArray()
            } else {
                result = value
            }

            // Check number of values
            const numberOfValues = result.length
            if ( numberOfValues !== 9 ) {
                throw new Error( `Matrix3: ${value} does not contain the right number of values. Expect 9 values and found ${numberOfValues}` )
            }

            // Check values are numbers in the range [0 - 1]
            for ( let index = 0, val = undefined ; index < numberOfValues ; index++ ) {

                val = result[ index ]

                if ( isNotNumber( val ) ) {
                    throw new Error( `Matrix3: ${value} does not seem to contain right values. Expect values in range 0 and 1.` )
                }

                if ( isNaN( val ) ) {
                    throw new Error( `Matrix3: ${value} does not seem to contain right values. Expect values in range 0 and 1.` )
                }

            }

            return result

        }

    } )

    // Register type
    Types.Matrix3 = Matrix3
    return Mongoose

}

export { Matrix3Type }

