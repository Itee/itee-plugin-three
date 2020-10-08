/**
 * @module Types/Matrix3
 * @desc Export the three js Matrix3 type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [bson]{@link https://github.com/mongodb/js-bson}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { BSON_DATA_ARRAY } from 'bson'
import {
    isNaN,
    isNotArray,
    isNotDefined,
    isNotNumber
}                          from 'itee-validators'

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Matrix3 type
 * @returns {Mongoose}
 */
function Matrix3Type ( Mongoose ) {
    'use strict'

    /**
     * The Matrix3 type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Matrix3 extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Matrix3' )

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Matrix3|Array.<Number>|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an array nor an instance of Three.Matrix3.
         * @throws {Mongoose~CastError} Will throw an error if the argument internal array length is different from 9.
         * @throws {Mongoose~CastError} Will throw an error if the argument internal array contains NaN or not number values.
         * @returns {Array.<Number>} The validated array of length 9
         */
        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } is null or undefined` ) }
            if ( isNotArray( value ) && !value.isMatrix3 ) { throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } is not an array or Matrix3 instance` ) }

            let result = undefined
            if ( value.isMatrix3 ) {
                result = value.toArray()
            } else {
                result = value
            }

            // Check number of values
            const numberOfValues = result.length
            if ( numberOfValues !== 9 ) {
                throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } does not contain the right number of values. Expect 9 values and found ${ numberOfValues }` )
            }

            // Check values are numbers in the range [0 - 1]
            for ( let index = 0, val = undefined ; index < numberOfValues ; index++ ) {

                val = result[ index ]

                if ( isNotNumber( val ) ) {
                    throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

                if ( isNaN( val ) ) {
                    throw new Mongoose.SchemaType.CastError( `Matrix3: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

            }

            return result

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Matrix3.MATRIX3_BSON_TYPE = BSON_DATA_ARRAY

    // Register type
    Mongoose.Schema.Types.Matrix3 = Matrix3

    return Mongoose

}

export { Matrix3Type }

