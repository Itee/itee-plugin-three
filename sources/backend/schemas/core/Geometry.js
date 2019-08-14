/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Geometry
 *
 * @description Todo...
 */

import { Face3 } from './Face3'

let _schema = undefined
let _model  = undefined

function getSchemaFrom ( Mongoose ) {
    'use strict'

    if ( !_schema ) {
        _createSchema( Mongoose )
    }

    return _schema

}

function _createSchema ( Mongoose ) {
    'use strict'

    const Face3Schema = Face3.getSchemaFrom( Mongoose )
    const Schema      = Mongoose.Schema
    const Types       = Schema.Types
    const Vector3     = Types.Vector3

    _schema = new Schema( {
        uuid:                    String,
        name:                    String,
        type:                    String,
        vertices:                [ Vector3 ],
        colors:                  [ Number ],
        faces:                   [ Face3Schema ],
        faceVertexUvs:           [ [ Number ] ],
        morphTargets:            [ Number ],
        morphNormals:            [ Number ],
        skinWeights:             [ Number ],
        skinIndices:             [ Number ],
        lineDistances:           [ Number ],
        boundingBox:             {
            min: Vector3,
            max: Vector3
        },
        boundingSphere:          {
            center: Vector3,
            radius: Number
        },
        elementsNeedUpdate:      Boolean,
        verticesNeedUpdate:      Boolean,
        uvsNeedUpdate:           Boolean,
        normalsNeedUpdate:       Boolean,
        colorsNeedUpdate:        Boolean,
        lineDistancesNeedUpdate: Boolean,
        groupsNeedUpdate:        Boolean
    }, {
        collection:       'geometries',
        discriminatorKey: 'type'
    } )

}

function getModelFrom ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return _model

}

function _createModel ( Mongoose ) {
    'use strict'

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    _model = Mongoose.model( 'Geometries', getSchemaFrom( Mongoose ) )
    _model.discriminator( 'Geometry', new Mongoose.Schema( {} ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

export const Geometry = {
    getSchemaFrom,
    getModelFrom,
    registerModelTo
}
