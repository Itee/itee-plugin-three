/**
 * @module Schemas/Core/BufferAttribute
 * @desc Export the ThreeJs BufferAttribute Model and Schema for Mongoose.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

const { isInt8Array, isInt16Array, isInt32Array, isFloat32Array, isFloat64Array, isUint8Array, isUint8ClampedArray, isUint16Array, isUint32Array, isBigInt64Array, isBigUint64Array } = require( 'itee-validators' )

let _schema = undefined

function getSchemaFrom ( Mongoose ) {
    'use strict'

    if ( !_schema ) {
        _createSchema( Mongoose )
    }

    return _schema

}

function _createSchema ( Mongoose ) {
    'use strict'

    const Schema = Mongoose.Schema
    const Types  = Schema.Types
    const Mixed  = Types.Mixed

    const ONE_BYTE    = 1
    const TWO_BYTE    = 2
    const FOUR_BYTE   = 4
    const HEIGHT_BYTE = 8

    const ArrayType = {
        Int8Array:         0,
        Uint8Array:        1,
        Uint8ClampedArray: 2,
        Int16Array:        3,
        Uint16Array:       4,
        Int32Array:        5,
        Uint32Array:       6,
        Float32Array:      7,
        Float64Array:      8,
        BigInt64Array:     9,
        BigUint64Array:    10
    }

    _schema = new Schema( {
        array: {
            type: Buffer,
            set:  ( array ) => {

                //                if ( !isTypedArray( array ) ) { throw new TypeError( 'Invalid array, expect a typed array.' )}

                const arrayLength = array.length
                let buffer        = null
                let offset        = 0

                if ( isInt8Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * ONE_BYTE )
                    offset = buffer.writeUInt8( ArrayType.Int8Array, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeInt8( array[ index ], offset )
                    }

                } else if ( isUint8Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * ONE_BYTE )
                    offset = buffer.writeUInt8( ArrayType.Uint8Array, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeUInt8( array[ index ], offset )
                    }

                } else if ( isUint8ClampedArray( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * ONE_BYTE )
                    offset = buffer.writeUInt8( ArrayType.Uint8ClampedArray, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeUInt8( array[ index ], offset )
                    }

                } else if ( isInt16Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * TWO_BYTE )
                    offset = buffer.writeUInt8( ArrayType.Int16Array, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeInt16BE( array[ index ], offset )
                    }

                } else if ( isUint16Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * TWO_BYTE )
                    offset = buffer.writeUInt8( ArrayType.Uint16Array, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeUInt16BE( array[ index ], offset )
                    }

                } else if ( isInt32Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * FOUR_BYTE )
                    offset = buffer.writeUInt8( ArrayType.Int32Array, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeInt32BE( array[ index ], offset )
                    }

                } else if ( isUint32Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * FOUR_BYTE )
                    offset = buffer.writeUInt8( ArrayType.Uint32Array, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeUInt32BE( array[ index ], offset )
                    }

                } else if ( isFloat32Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * FOUR_BYTE )
                    offset = buffer.writeUInt8( ArrayType.Float32Array, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeFloatBE( array[ index ], offset )
                    }

                } else if ( isFloat64Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * HEIGHT_BYTE )
                    offset = buffer.writeUInt8( ArrayType.Float64Array, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeDoubleBE( array[ index ], offset )
                    }

                } else if ( isBigInt64Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * HEIGHT_BYTE )
                    offset = buffer.writeUInt8( ArrayType.BigInt64Array, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeDoubleBE( array[ index ], offset )
                    }

                } else if ( isBigUint64Array( array ) ) {

                    buffer = Buffer.allocUnsafe( ONE_BYTE + arrayLength * HEIGHT_BYTE )
                    offset = buffer.writeUInt8( ArrayType.BigUint64Array, offset )

                    for ( let index = 0 ; index < arrayLength ; index++ ) {
                        offset = buffer.writeDoubleBE( array[ index ], offset )
                    }

                } else {

                    throw new Error( 'Unable to determine the array type to bufferize.' )

                }

                return buffer

            }
        },
        count:       Number,
        dynamic:     Boolean,
        itemSize:    Number,
        name:        String,
        needsUpdate: Boolean,
        normalized:  Boolean,
        updateRange: Mixed,
        uuid:        String,
        version:     Number
    }, {
        _id: false,
        id:  false
    } )

}

module.exports.BufferAttribute = {
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
}
