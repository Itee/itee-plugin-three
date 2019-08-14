const { Object3D } = require( '../core/Object3D' )
const { Fog }      = require( './Fog' )

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

    const FogSchema = Fog.getSchemaFrom( Mongoose )
    const Schema    = Mongoose.Schema
    const Types     = Schema.Types
    const Color     = Types.Color

    _schema = new Schema( {
        background:       Color,
        fog:              FogSchema,
        overrideMaterial: String,
        autoUpdate:       Boolean
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

    const Object3DBaseModel = Object3D.getModelFrom( Mongoose )
    _model                  = Object3DBaseModel.discriminator( 'Scene', getSchemaFrom( Mongoose ) )

}

function registerModelTo ( Mongoose ) {
    'use strict'

    if ( !_model ) {
        _createModel( Mongoose )
    }

    return Mongoose

}

module.exports.Scene = {
    getSchemaFrom,
    getModelFrom,
    registerModelTo
}
