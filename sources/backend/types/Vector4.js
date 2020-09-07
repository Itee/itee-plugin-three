/**
 * @module Types/Vector4
 * @desc Export the three js Vector4 type for Mongoose.
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
 * @param Mongoose {Mongoose} - A mongoose instance where register the Vector4 type
 * @returns {Mongoose}
 */
function Vector4Type ( Mongoose ) {
    'use strict'

    /**
     * The Vector4 type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Vector4 extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Vector4' )

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Vector4|Object|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an object nor an instance of Three.Vector4.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains x property.
         * @throws {Mongoose~CastError} Will throw an error if the argument x property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains y property.
         * @throws {Mongoose~CastError} Will throw an error if the argument y property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains z property.
         * @throws {Mongoose~CastError} Will throw an error if the argument z property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains w property.
         * @throws {Mongoose~CastError} Will throw an error if the argument w property is not a number.
         * @returns {{x: Number, y: Number, z: Number, w: Number}}
         */
        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isVector4 ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } is not a object or Vector4 instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain x property` ) }
            if ( isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain y property` ) }
            if ( isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain z property` ) }
            if ( isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            if ( !( 'w' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } does not contain w property` ) }
            if ( isNotNumber( value.w ) ) { throw new Mongoose.SchemaType.CastError( `Vector4: ${ value } expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z,
                w: value.w
            }

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Vector4.VECTOR4_BSON_TYPE = BSON_DATA_OBJECT

    // Register type
    Mongoose.Schema.Types.Vector4 = Vector4

    return Mongoose

}

export { Vector4Type }

