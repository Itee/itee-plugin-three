/**
 * @module Types/Color
 * @desc Export the three js Color type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [bson]{@link https://github.com/mongodb/js-bson}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { BSON_DATA_OBJECT } from 'bson'
import {
    isNotDefined,
    isNotNumber,
    isNotObject
}                           from 'itee-validators'

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Color type
 * @returns {Mongoose}
 */
function ColorType ( Mongoose ) {
    'use strict'

    /**
     * The Color type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Color extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @constructor
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Color' )

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Color|Object|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an object nor an instance of Three.Color.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains r property.
         * @throws {Mongoose~CastError} Will throw an error if the argument r property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains g property.
         * @throws {Mongoose~CastError} Will throw an error if the argument g property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains b property.
         * @throws {Mongoose~CastError} Will throw an error if the argument b property is not a number.
         * @returns {{r: Number, b: Number, g: Number}}
         */
        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isColor ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } is not a object or Three.Color instance` ) }

            if ( !( 'r' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain r property` ) }
            if ( isNotNumber( value.r ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            if ( !( 'g' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain g property` ) }
            if ( isNotNumber( value.g ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            if ( !( 'b' in value ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } does not contain b property` ) }
            if ( isNotNumber( value.b ) ) { throw new Mongoose.SchemaType.CastError( `Color: ${ value } expected to be a number` ) }

            return {
                r: value.r,
                g: value.g,
                b: value.b
            }

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Color.COLOR_BSON_TYPE = BSON_DATA_OBJECT

    // Register type
    Mongoose.Schema.Types.Color = Color

    return Mongoose

}

export { ColorType }
