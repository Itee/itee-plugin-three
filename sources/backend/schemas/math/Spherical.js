/**
 * @module Schemas/Math/Spherical
 * @desc Export the ThreeJs Spherical Model and Schema for Mongoose.
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
        radius: Number,
        phi:    Number,
        theta:  Number
    }, {
        _id: false,
        id:  false
    } )

}

module.exports.Spherical = {
    name:            'Spherical',
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    () => null,
    registerModelTo: Mongoose => Mongoose
}
