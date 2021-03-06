/**
 * @module Types/Vector3
 * @desc Export the three js Vector3 type for Mongoose.
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
 * @param Mongoose {Mongoose} - A mongoose instance where register the Vector3 type
 * @returns {Mongoose}
 */
function Vector3Type ( Mongoose ) {
    'use strict'

    /**
     * The Vector3 type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Vector3 extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Vector3' )

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Vector3|Object|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an object nor an instance of Three.Vector3.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains x property.
         * @throws {Mongoose~CastError} Will throw an error if the argument x property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains y property.
         * @throws {Mongoose~CastError} Will throw an error if the argument y property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains z property.
         * @throws {Mongoose~CastError} Will throw an error if the argument z property is not a number.
         * @returns {{x: Number, y: Number, z: Number}}
         */
        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isVector3 ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } is not a object or Vector3 instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } does not contain x property` ) }
            if ( isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } expected to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } does not contain y property` ) }
            if ( isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } expected to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } does not contain z property` ) }
            if ( isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Vector3: ${ value } expected to be a number` ) }

            return {
                x: value.x,
                y: value.y,
                z: value.z
            }

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Vector3.VECTOR3_BSON_TYPE = BSON_DATA_OBJECT

    // Register type
    Mongoose.Schema.Types.Vector3 = Vector3

    return Mongoose

}

export { Vector3Type }

