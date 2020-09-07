/**
 * @module Types/Euler
 * @desc Export the three js Euler type for Mongoose.
 *
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { BSON_DATA_OBJECT } from 'bson'
import {
    isNotDefined,
    isNotNumber,
    isNotObject,
    isNotString
}                           from 'itee-validators'

/**
 * The type registering function.
 *
 * @param Mongoose {Mongoose} - A mongoose instance where register the Euler type
 * @returns {Mongoose}
 */
function EulerType ( Mongoose ) {
    'use strict'

    /**
     * The Euler type definition class
     *
     * @class
     * @augments Mongoose.SchemaType
     */
    class Euler extends Mongoose.SchemaType {

        /**
         * Do **not** instantiate `SchemaType` directly.
         * Mongoose converts your schema paths into SchemaTypes automatically.
         *
         * @param {String} path
         * @param {Mongoose~SchemaTypeOptions} [options] See {@link https://mongoosejs.com/docs/api/schematypeoptions.html|SchemaTypeOptions docs }
         */
        constructor ( path, options ) {

            super( path, options, 'Euler' )

        }

        /**
         * The function used to cast arbitrary values to this type.
         *
         * @param {THREE~Euler|Object|*} value The value to cast
         * @throws {Mongoose~CastError} Will throw an error if the argument is null or undefined.
         * @throws {Mongoose~CastError} Will throw an error if the argument is not an object nor an instance of Three.Euler.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains x property.
         * @throws {Mongoose~CastError} Will throw an error if the argument x property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains y property.
         * @throws {Mongoose~CastError} Will throw an error if the argument y property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains z property.
         * @throws {Mongoose~CastError} Will throw an error if the argument z property is not a number.
         * @throws {Mongoose~CastError} Will throw an error if the argument not contains order property.
         * @throws {Mongoose~CastError} Will throw an error if the argument order property is not a string in ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'].
         * @returns {{x: Number, y: Number, z: Number, order: String}}
         */
        cast ( value ) {

            if ( isNotDefined( value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } is null or undefined` ) }
            if ( isNotObject( value ) && !value.isEuler ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } is not a object or Euler instance` ) }

            if ( !( 'x' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain x property` ) }
            if ( isNotNumber( value.x ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected x to be a number` ) }

            if ( !( 'y' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain y property` ) }
            if ( isNotNumber( value.y ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected y to be a number` ) }

            if ( !( 'z' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain z property` ) }
            if ( isNotNumber( value.z ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected z to be a number` ) }

            if ( !( 'order' in value ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } does not contain order property` ) }
            if ( isNotString( value.order ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected order to be a string` ) }
            if ( ![ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ].includes( value.order.toUpperCase() ) ) { throw new Mongoose.SchemaType.CastError( `Euler: ${ value } expected order to be a string in ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX']` ) }

            return {
                x:     value.x,
                y:     value.y,
                z:     value.z,
                order: value.order.toUpperCase()
            }

        }

    }

    /**
     * Define the underlying bson type.
     *
     * @static
     * @type {bson.BSON_DATA_OBJECT}
     */
    Euler.EULER_BSON_TYPE = BSON_DATA_OBJECT

    // Register type
    Mongoose.Schema.Types.Euler = Euler

    return Mongoose

}

export { EulerType }
