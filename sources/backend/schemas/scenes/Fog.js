/**
 * @module Schemas/Scenes/Fog
 * @desc Export the ThreeJs Fog Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Scenes/Scene Schemas/Scenes/Scene}
 *
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

    const Schema = Mongoose.Schema

    _schema = new Schema( {
        coordinates: {
            x: Number,
            y: Number,
            z: Number
        },
        orientation: {
            x: Number,
            y: Number,
            z: Number
        },
        thumbnail: Buffer,
        path:      String
    }, {
        _id: false,
        id:  false
    } )

}

module.exports.Fog = {
    name:            'Fog',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
}
