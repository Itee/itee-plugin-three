/**
 * @module Schemas/Core/Face3
 * @desc Export the ThreeJs Face3 Model and Schema for Mongoose.
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
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
    const Color   = Types.Color
    const Vector3 = Types.Vector3

    _schema = new Schema( {
        a:             Number,
        b:             Number,
        c:             Number,
        normal:        Vector3,
        vertexNormals: [ Number ],
        color:         Color,
        vertexColors:  [ Number ],
        materialIndex: Number
    }, {
        _id: false,
        id:  false
    } )

}

module.exports.Face3 = {
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
}
