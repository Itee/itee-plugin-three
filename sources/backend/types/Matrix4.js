/**
 * @module Types/Matrix4
 * @desc Export the three js Matrix4 type for Mongoose.
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
 * @param Mongoose {Mongoose} - A mongoose instance where register the Matrix4 type
 * @returns {Mongoose}
 */
function Matrix4Type( Mongoose ) {
    'use strict'

    /**
     * The Matrix4 type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Matrix4 extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor( path, options ) {

            super( path, options, 'Matrix4' )

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Matrix4|Array.<Number>|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an array nor an instance of Three.Matrix4.
         * @throws {Mongoose~CastError} Will throw an error if the argument internal array length is different from 16.
         * @throws {Mongoose~CastError} Will throw an error if the argument internal array contains NaN or not number values.
         * @returns {Array.<Number>} The validated array of length 9
         */
        cast( value ) {

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } is null or undefined` ) }
            if ( isNotArray( value ) && !value.isMatrix4 ) { throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } is not an array or Matrix4 instance` ) }

            let result = undefined
            if ( value.isMatrix4 ) {
                result = value.toArray()
            } else {
                result = value
            }

            // Check number of values
            const numberOfValues = result.length
            if ( numberOfValues !== 16 ) {
                throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } does not contain the right number of values. Expect 9 values and found ${ numberOfValues }` )
            }

            // Check values are numbers in the range [0 - 1]
            for ( let index = 0, val = undefined ; index < numberOfValues ; index++ ) {

                val = result[ index ]

                if ( isNotNumber( val ) ) {
                    throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
                }

                if ( isNaN( val ) ) {
                    throw new Mongoose.SchemaType.CastError( `Matrix4: ${ value } does not seem to contain right values. Expect values in range 0 and 1.` )
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
    Matrix4.MATRIX4_BSON_TYPE = BSON_DATA_ARRAY

    // Register type
    Mongoose.Schema.Types.Matrix4 = Matrix4

    return Mongoose

}

export { Matrix4Type }

