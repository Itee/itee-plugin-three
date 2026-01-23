/**
 * @module Schemas/Core/BufferGeometry
 * @desc Export the ThreeJs BufferGeometry Model and Schema for Mongoose.
 *
 * @requires {@link module:Schemas/Core/BufferAttribute Schemas/Core/BufferAttribute}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { BufferAttribute } from './BufferAttribute.cjs'

let _schema = undefined
let _model  = undefined

function getSchemaFrom( Mongoose ) {
    'use strict'

    if ( !_schema ) {
        _createSchema( Mongoose )
    }

    return _schema

}

function _createSchema( Mongoose ) {
    'use strict'

    const Schema  = Mongoose.Schema
    const Types   = Schema.Types
    const Mixed   = Types.Mixed
    const Vector3 = Types.Vector3

    const BufferAttributeSchema = BufferAttribute.getSchemaFrom( Mongoose )

    _schema = new Schema( {
        uuid:       String,
        name:       String,
        type:       String,
        index:      BufferAttributeSchema,
        attributes: {
            position: BufferAttributeSchema,
            normal:   BufferAttributeSchema,
            color:    BufferAttributeSchema,
            uv:       BufferAttributeSchema
        },
        groups:      Mixed,
        boundingBox: {
            min: Vector3,
            max: Vector3
        },
        boundingSphere: {
            center: Vector3,
            radius: Number
        },
        drawRange: Mixed
    }, {
        collection:       'geometries',
        discriminatorKey: 'type'
    } )

}

function getModelFrom( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return _model

}

function _createModel( Mongoose ) {
    'use strict'

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model = Mongoose.model( 'BufferGeometries', getSchemaFrom( Mongoose ) )
    _model.discriminator( 'BufferGeometry', new Mongoose.Schema( {} ) )

}

function registerModelTo( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

const BufferGeometry = {
    getSchemaFrom:   getSchemaFrom,
    getModelFrom:    getModelFrom,
    registerModelTo: registerModelTo
}

export { BufferGeometry }


//module.exports.BufferGeometry =
