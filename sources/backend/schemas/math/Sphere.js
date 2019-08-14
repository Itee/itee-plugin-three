/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Core/Vector3
 *
 * @description The database counterpart of Three.Vector3
 */

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

    const Schema  = Mongoose.Schema
    const Types   = Schema.Types
    const Vector3 = Types.Vector3

    _schema = new Schema( {
        center: Vector3,
        radius: Number
    }, {
        _id: false,
        id:  false
    } )

}

module.exports.Sphere = {
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
}
