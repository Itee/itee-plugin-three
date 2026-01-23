/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Schemas/Object3D
 *
 * @description Todo...
 */

function Object3D() {}

Object3D.getSchemaFrom   = Mongoose => {

    if ( !Object3D._schema ) {
        Object3D._createSchema( Mongoose )
    }

    return Object3D._schema

}
Object3D._createSchema   = Mongoose => {
    'use strict'

    const Schema     = Mongoose.Schema
    const Types      = Schema.Types
    const ObjectId   = Types.ObjectId
    const Mixed      = Types.Mixed
    const Vector3    = Types.Vector3
    const Quaternion = Types.Quaternion
    const Matrix4    = Types.Matrix4
    const Euler      = Types.Euler

    Object3D._schema = new Schema( {
        uuid:       String,
        name:       String,
        type:       String,
        parent:     ObjectId,
        children:   [ ObjectId ],
        up:         Vector3,
        position:   Vector3,
        rotation:   Euler,
        quaternion: Quaternion,
        scale:      {
            type:    Vector3,
            default: {
                x: 1,
                y: 1,
                z: 1
            }
        },
        modelViewMatrix:        Matrix4,
        normalMatrix:           Matrix4,
        matrix:                 Matrix4,
        matrixWorld:            Matrix4,
        matrixAutoUpdate:       Boolean,
        matrixWorldNeedsUpdate: Boolean,
        layers:                 {
            type: Number,
            set:  value => value.mask
        },
        visible:       Boolean,
        castShadow:    Boolean,
        receiveShadow: Boolean,
        frustumCulled: Boolean,
        renderOrder:   Boolean,
        userData:      {
            type: Mixed,
            set:  value => {

                function RemoveRecursivelyDotInKeyOf( properties ) {
                    let result = {}

                    for ( let property in properties ) {

                        if ( !Object.prototype.hasOwnProperty.call( properties, property ) ) { continue }

                        let value = properties[ property ]
                        if ( value.constructor === Object ) {
                            value = RemoveRecursivelyDotInKeyOf( value )
                        }

                        result[ property.replace( /\./g, '' ) ] = value

                    }

                    return result
                }

                return RemoveRecursivelyDotInKeyOf( value )

            }
        }
    }, {
        collection:       'objects',
        discriminatorKey: 'type'
    } )

}
Object3D.getModelFrom    = Mongoose => {

    if ( !Object3D._model ) {
        Object3D._createModel( Mongoose )
    }

    return Object3D._model

}
Object3D._createModel    = Mongoose => {
    'use strict'

    // We need to pre-declare the base model to be able to use correctly
    // the discriminator 'type' correctly with the main type, instead of
    // directly register the model as it
    // Care here, the model contains an S char, not the discriminator !
    Object3D._model = Mongoose.model( 'Objects3D', Object3D.getSchemaFrom( Mongoose ) )
    Object3D._model.discriminator( 'Object3D', new Mongoose.Schema( {} ) )

}
Object3D.registerModelTo = Mongoose => {
    'use strict'

    if ( !Object3D._model ) {
        Object3D._createModel( Mongoose )
    }

    return Mongoose

}
Object3D._schema         = null
Object3D._model          = null

// Using Class
//class Object3D {
//
//    constructor ( Mongoose ){
//
//        if( !(this instanceof Object3D) ) {
//            return new Object3D( Mongoose )
//        }
//
//        return Object3D.registerModelTo( Mongoose )
//
//    }
//
//    static getSchemaFrom ( Mongoose ) {
//
//        if ( !Object3D._schema ) {
//            this._createSchema( Mongoose )
//        }
//
//        return Object3D._schema
//
//    }
//
//    static _createSchema ( Mongoose ) {
//        'use strict'
//
//        const Schema     = Mongoose.Schema
//        const Types      = Schema.Types
//        const ObjectId   = Types.ObjectId
//        const Mixed      = Types.Mixed
//        const Vector3    = Types.Vector3
//        const Quaternion = Types.Quaternion
//        const Matrix4    = Types.Matrix4
//        const Euler      = Types.Euler
//
//        Object3D._schema = new Schema( {
//                uuid:       String,
//                name:       String,
//                type:       String,
//                parent:     ObjectId,
//                children:   [ ObjectId ],
//                up:         Vector3,
//                position:   Vector3,
//                rotation:   Euler,
//                quaternion: Quaternion,
//                scale:      {
//                    type:    Vector3,
//                    default: {
//                        x: 1,
//                        y: 1,
//                        z: 1
//                    }
//                },
//                modelViewMatrix:        Matrix4,
//                normalMatrix:           Matrix4,
//                matrix:                 Matrix4,
//                matrixWorld:            Matrix4,
//                matrixAutoUpdate:       Boolean,
//                matrixWorldNeedsUpdate: Boolean,
//                layers:                 {
//                    type: Number,
//                    set:  value => ( value.mask )
//                },
//                visible:       Boolean,
//                castShadow:    Boolean,
//                receiveShadow: Boolean,
//                frustumCulled: Boolean,
//                renderOrder:   Boolean,
//                userData:      {
//                    type: Mixed,
//                    set:  value => {
//
//                        function RemoveRecursivelyDotInKeyOf ( properties ) {
//                            let result = {}
//
//                            for ( let property in properties ) {
//
//                                if ( !Object.prototype.hasOwnProperty.call( properties, property ) ) { continue }
//
//                                let value = properties[ property ]
//                                if ( value.constructor === Object ) {
//                                    value = RemoveRecursivelyDotInKeyOf( value )
//                                }
//
//                                result[ property.replace( /\./g, '' ) ] = value
//
//                            }
//
//                            return result
//                        }
//
//                        return RemoveRecursivelyDotInKeyOf( value )
//
//                    }
//                }
//            }, {
//                collection:       'objects',
//                discriminatorKey: 'type'
//            } )
//
//    }
//
//    static getModelFrom ( Mongoose ) {
//
//        if ( !Object3D._model ) {
//            Object3D._createModel( Mongoose )
//        }
//
//        return Object3D._model
//
//    }
//
//    static _createModel ( Mongoose ) {
//        'use strict'
//
//        // We need to pre-declare the base model to be able to use correctly
//        // the discriminator 'type' correctly with the main type, instead of
//        // directly register the model as it
//        Object3D._model = Mongoose.model( 'Objects3D', Object3D.getSchemaFrom( Mongoose ) )
//        Object3D._model.discriminator( 'Object3D', new Mongoose.Schema( {} ) )
//
//    }
//
//    static registerModelTo ( Mongoose ) {
//        'use strict'
//
//        if ( !Object3D._model ) {
//            Object3D._createModel( Mongoose )
//        }
//
//        return Mongoose
//
//    }
//
//}
//Object3D._schema = null
//Object3D._model  = null

// Using Object
//const Object3D = {
//    _schema: null,
//    _model:  null,
//    getSchemaFrom ( Mongoose ) {
//
//        if ( !Object3D._schema ) {
//            Object3D._createSchema( Mongoose )
//        }
//
//        return Object3D._schema
//
//    },
//    _createSchema ( Mongoose ) {
//
//        const Schema     = Mongoose.Schema
//        const Types      = Schema.Types
//        const ObjectId   = Types.ObjectId
//        const Mixed      = Types.Mixed
//        const Vector3    = Types.Vector3
//        const Quaternion = Types.Quaternion
//        const Matrix4    = Types.Matrix4
//        const Euler      = Types.Euler
//
//        Object3D._schema = new Schema( {
//            uuid:                   String,
//            name:                   String,
//            type:                   String,
//            parent:                 ObjectId,
//            children:               [ ObjectId ],
//            up:                     Vector3,
//            position:               Vector3,
//            rotation:               Euler,
//            quaternion:             Quaternion,
//            scale:                  {
//                type:    Vector3,
//                default: {
//                    x: 1,
//                    y: 1,
//                    z: 1
//                }
//            },
//            modelViewMatrix:        Matrix4,
//            normalMatrix:           Matrix4,
//            matrix:                 Matrix4,
//            matrixWorld:            Matrix4,
//            matrixAutoUpdate:       Boolean,
//            matrixWorldNeedsUpdate: Boolean,
//            layers:                 {
//                type: Number,
//                set:  value => ( value.mask )
//            },
//            visible:                Boolean,
//            castShadow:             Boolean,
//            receiveShadow:          Boolean,
//            frustumCulled:          Boolean,
//            renderOrder:            Boolean,
//            userData:               {
//                type: Mixed,
//                set:  value => {
//
//                    function RemoveRecursivelyDotInKeyOf ( properties ) {
//                        let result = {}
//
//                        for ( let property in properties ) {
//
//                            if ( !Object.prototype.hasOwnProperty.call( properties, property ) ) { continue }
//
//                            let value = properties[ property ]
//                            if ( value.constructor === Object ) {
//                                value = RemoveRecursivelyDotInKeyOf( value )
//                            }
//
//                            result[ property.replace( /\./g, '' ) ] = value
//
//                        }
//
//                        return result
//                    }
//
//                    return RemoveRecursivelyDotInKeyOf( value )
//
//                }
//            }
//        }, {
//            collection:       'objects',
//            discriminatorKey: 'type'
//        } )
//
//    },
//    getModelFrom ( Mongoose ) {
//
//        if ( !Object3D._model ) {
//            Object3D._createModel( Mongoose )
//        }
//
//        return Object3D._model
//
//    },
//    _createModel ( Mongoose ) {
//
//        // We need to pre-declare the base model to be able to use correctly
//        // the discriminator 'type' correctly with the main type, instead of
//        // directly register the model as it
//        Object3D._model = Mongoose.model( 'Objects3D', Object3D.getSchemaFrom( Mongoose ) )
//        Object3D._model.discriminator( 'Object3D', new Mongoose.Schema( {} ) )
//
//    },
//    registerModelTo ( Mongoose ) {
//
//        if ( !Object3D._model ) {
//            Object3D._createModel( Mongoose )
//        }
//
//        return Mongoose
//
//    }
//}

// Using Node module
//let _schema = undefined
//let _model  = undefined
//
//function getSchemaFrom ( Mongoose ) {
//    'use strict'
//
//    if ( !_schema ) {
//        _createSchema( Mongoose )
//    }
//
//    return _schema
//
//}
//
//function _createSchema ( Mongoose ) {
//    'use strict'
//
//    const Schema     = Mongoose.Schema
//    const Types      = Schema.Types
//    const ObjectId   = Types.ObjectId
//    const Mixed      = Types.Mixed
//    const Vector3    = Types.Vector3
//    const Quaternion = Types.Quaternion
//    const Matrix4    = Types.Matrix4
//    const Euler      = Types.Euler
//
//    _schema = new Schema( {
//            uuid:                   String,
//            name:                   String,
//            type:                   String,
//            parent:                 ObjectId,
//            children:               [ ObjectId ],
//            up:                     Vector3,
//            position:               Vector3,
//            rotation:               Euler,
//            quaternion:             Quaternion,
//            scale:                  {
//                type:    Vector3,
//                default: {
//                    x: 1,
//                    y: 1,
//                    z: 1
//                }
//            },
//            modelViewMatrix:        Matrix4,
//            normalMatrix:           Matrix4,
//            matrix:                 Matrix4,
//            matrixWorld:            Matrix4,
//            matrixAutoUpdate:       Boolean,
//            matrixWorldNeedsUpdate: Boolean,
//            layers:                 {
//                type: Number,
//                set:  value => ( value.mask )
//            },
//            visible:                Boolean,
//            castShadow:             Boolean,
//            receiveShadow:          Boolean,
//            frustumCulled:          Boolean,
//            renderOrder:            Boolean,
//            userData:               {
//                type: Mixed,
//                set:  value => {
//
//                    function RemoveRecursivelyDotInKeyOf ( properties ) {
//                        let result = {}
//
//                        for ( let property in properties ) {
//
//                            if ( !Object.prototype.hasOwnProperty.call( properties, property ) ) { continue }
//
//                            let value = properties[ property ]
//                            if ( value.constructor === Object ) {
//                                value = RemoveRecursivelyDotInKeyOf( value )
//                            }
//
//                            result[ property.replace( /\./g, '' ) ] = value
//
//                        }
//
//                        return result
//                    }
//
//                    return RemoveRecursivelyDotInKeyOf( value )
//
//                }
//            }
//        },
//        {
//            collection:       'objects',
//            discriminatorKey: 'type'
//        } )
//
//}
//
//function getModelFrom ( Mongoose ) {
//    'use strict'
//
//    if ( !_model ) {
//        _createModel( Mongoose )
//    }
//
//    return _model
//
//}
//
//function _createModel ( Mongoose ) {
//    'use strict'
//
//    // We need to pre-declare the base model to be able to use correctly
//    // the discriminator 'type' correctly with the main type, instead of
//    // directly register the model as it
//    _model = Mongoose.model( 'Objects3D', getSchemaFrom( Mongoose ) )
//    _model.discriminator( 'Object3D', new Mongoose.Schema( {} ) )
//
//}
//
//function registerModelTo ( Mongoose ) {
//    'use strict'
//
//    if ( !_model ) {
//        _createModel( Mongoose )
//    }
//
//    return Mongoose
//
//}
//
//module.exports = {
//    getSchemaFrom:   getSchemaFrom,
//    getModelFrom:    getModelFrom,
//    registerModelTo: registerModelTo
//}

export { Object3D }

