/**
 * @module MongoDBThreePlugin
 * @desc Three way to register Types and Schema
 * using cjs module under types and schemas folder.
 * using FunctionRegistrator for type and add to plugin using .addType( myFunctionRegistrator ), extending class AbstractMongooseRegistrator for Schema and add to plugin using .addSchema(
 * MySchemaRegistrator ) using direct registration importing mongoose in the file (care to the loading order ! An no output about what is registered.)
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [MIT]{@link https://opensource.org/licenses/MIT}
 */

import { TAbstractConverterManager } from 'itee-database'
import {
    TMongoDBPlugin,
    TMongooseController
}                                    from 'itee-mongodb'
import { TObjects3DController }      from './controllers/TObjects3DController'
import { ColladaToThree }            from './converters/ColladaToThree'
import { DbfToThree }                from './converters/DbfToThree'
import { FbxToThree }                from './converters/FbxToThree'
import { JsonToThree }               from './converters/JsonToThree'
import { MtlToThree }                from './converters/MtlToThree'
import { Obj2ToThree }               from './converters/Obj2ToThree'
import { ShpToThree }                from './converters/ShpToThree'
import { StlToThree }                from './converters/StlToThree'
import { TdsToThree }                from './converters/TdsToThree'
import { ThreeToMongoDB }            from './inserters/ThreeToMongoDB'
//import { BooleanKeyframeTrack } from './schemas/animation/tracks/BooleanKeyframeTrack'
import { Audio }                     from './schemas/audio/Audio'
import { AudioListener }             from './schemas/audio/AudioListener'
import { PositionalAudio }           from './schemas/audio/PositionalAudio'
import { ArrayCamera }               from './schemas/cameras/ArrayCamera'
import { Camera }                    from './schemas/cameras/Camera'
import { CubeCamera }                from './schemas/cameras/CubeCamera'
import { OrthographicCamera }        from './schemas/cameras/OrthographicCamera'
import { PerspectiveCamera }         from './schemas/cameras/PerspectiveCamera'
import { BufferAttribute }           from './schemas/core/BufferAttribute'
import { BufferGeometry }            from './schemas/core/BufferGeometry'
import { CurvePath }                 from './schemas/core/CurvePath'
import { Face3 }                     from './schemas/core/Face3'
import { Geometry }                  from './schemas/core/Geometry'
import { Object3D }                  from './schemas/core/Object3D'
import { Path }                      from './schemas/core/Path'
import { Shape }                     from './schemas/core/Shape'
import { ArcCurve }                  from './schemas/curves/ArcCurve'
import { CatmullRomCurve3 }          from './schemas/curves/CatmullRomCurve3'
import { CubicBezierCurve }          from './schemas/curves/CubicBezierCurve'
import { CubicBezierCurve3 }         from './schemas/curves/CubicBezierCurve3'
import { Curve }                     from './schemas/curves/Curve'
import { CurveExtras }               from './schemas/curves/CurveExtras'
import { EllipseCurve }              from './schemas/curves/EllipseCurve'
import { LineCurve }                 from './schemas/curves/LineCurve'
import { LineCurve3 }                from './schemas/curves/LineCurve3'
import { NURBSCurve }                from './schemas/curves/NURBSCurve'
import { NURBSSurface }              from './schemas/curves/NURBSSurface'
import { QuadraticBezierCurve }      from './schemas/curves/QuadraticBezierCurve'
import { QuadraticBezierCurve3 }     from './schemas/curves/QuadraticBezierCurve3'
import { SplineCurve }               from './schemas/curves/SplineCurve'
import { BoxBufferGeometry }         from './schemas/geometries/BoxBufferGeometry'
import { BoxGeometry }               from './schemas/geometries/BoxGeometry'
import { CircleBufferGeometry }      from './schemas/geometries/CircleBufferGeometry'
import { CircleGeometry }            from './schemas/geometries/CircleGeometry'
import { ConeBufferGeometry }        from './schemas/geometries/ConeBufferGeometry'
import { ConeGeometry }              from './schemas/geometries/ConeGeometry'
import { ConvexGeometry }            from './schemas/geometries/ConvexGeometry'
import { CylinderBufferGeometry }    from './schemas/geometries/CylinderBufferGeometry'
import { CylinderGeometry }          from './schemas/geometries/CylinderGeometry'
import { DecalGeometry }             from './schemas/geometries/DecalGeometry'
import { DodecahedronGeometry }      from './schemas/geometries/DodecahedronGeometry'
import { EdgesGeometry }             from './schemas/geometries/EdgesGeometry'
import { ExtrudeBufferGeometry }     from './schemas/geometries/ExtrudeBufferGeometry'
import { ExtrudeGeometry }           from './schemas/geometries/ExtrudeGeometry'
import { IcosahedronBufferGeometry } from './schemas/geometries/IcosahedronBufferGeometry'
import { IcosahedronGeometry }       from './schemas/geometries/IcosahedronGeometry'
import { InstancedBufferGeometry }   from './schemas/geometries/InstancedBufferGeometry'
import { LatheBufferGeometry }       from './schemas/geometries/LatheBufferGeometry'
import { LatheGeometry }             from './schemas/geometries/LatheGeometry'
import { OctahedronBufferGeometry }  from './schemas/geometries/OctahedronBufferGeometry'
import { OctahedronGeometry }        from './schemas/geometries/OctahedronGeometry'
import { ParametricBufferGeometry }  from './schemas/geometries/ParametricBufferGeometry'
import { ParametricGeometry }        from './schemas/geometries/ParametricGeometry'
import { PlaneBufferGeometry }       from './schemas/geometries/PlaneBufferGeometry'
import { PlaneGeometry }             from './schemas/geometries/PlaneGeometry'
import { PolyhedronBufferGeometry }  from './schemas/geometries/PolyhedronBufferGeometry'
import { PolyhedronGeometry }        from './schemas/geometries/PolyhedronGeometry'
import { RingBufferGeometry }        from './schemas/geometries/RingBufferGeometry'
import { RingGeometry }              from './schemas/geometries/RingGeometry'
import { ShapeBufferGeometry }       from './schemas/geometries/ShapeBufferGeometry'
import { ShapeGeometry }             from './schemas/geometries/ShapeGeometry'
import { SphereBufferGeometry }      from './schemas/geometries/SphereBufferGeometry'
import { SphereGeometry }            from './schemas/geometries/SphereGeometry'
import { TeapotBufferGeometry }      from './schemas/geometries/TeopotBufferGeometry'
import { TetrahedronBufferGeometry } from './schemas/geometries/TetrahedronBufferGeometry'
import { TetrahedronGeometry }       from './schemas/geometries/TetrahedronGeometry'
import { TextBufferGeometry }        from './schemas/geometries/TextBufferGeometry'
import { TextGeometry }              from './schemas/geometries/TextGeometry'
import { TorusBufferGeometry }       from './schemas/geometries/TorusBufferGeometry'
import { TorusGeometry }             from './schemas/geometries/TorusGeometry'
import { TorusKnotBufferGeometry }   from './schemas/geometries/TorusKnotBufferGeometry'
import { TorusKnotGeometry }         from './schemas/geometries/TorusKnotGeometry'
import { TubeBufferGeometry }        from './schemas/geometries/TubeBufferGeometry'
import { TubeGeometry }              from './schemas/geometries/TubeGeometry'
import { WireframeGeometry }         from './schemas/geometries/WireframeGeometry'
import { ArrowHelper }               from './schemas/helpers/ArrowHelper'
import { AxesHelper }                from './schemas/helpers/AxesHelper'
import { Box3Helper }                from './schemas/helpers/Box3Helper'
import { BoxHelper }                 from './schemas/helpers/BoxHelper'
import { CameraHelper }              from './schemas/helpers/CameraHelper'
import { DirectionalLightHelper }    from './schemas/helpers/DirectionalLightHelper'
import { FaceNormalsHelper }         from './schemas/helpers/FaceNormalsHelper'
import { GridHelper }                from './schemas/helpers/GridHelper'
import { HemisphereLightHelper }     from './schemas/helpers/HemisphereLightHelper'
import { PlaneHelper }               from './schemas/helpers/PlaneHelper'
import { PointLightHelper }          from './schemas/helpers/PointLightHelper'
import { PolarGridHelper }           from './schemas/helpers/PolarGridHelper'
import { RectAreaLightHelper }       from './schemas/helpers/RectAreaLightHelper'
import { SkeletonHelper }            from './schemas/helpers/SkeletonHelper'
import { SpotLightHelper }           from './schemas/helpers/SpotLightHelper'
import { VertexNormalsHelper }       from './schemas/helpers/VertexNormalsHelper'
import { AmbientLight }              from './schemas/lights/AmbientLight'
import { DirectionalLight }          from './schemas/lights/DirectionalLight'
//import { DirectionalLightShadow }         from './schemas/lights/DirectionalLightShadow'
import { HemisphereLight }           from './schemas/lights/HemisphereLight'
import { Light }                     from './schemas/lights/Light'
//import { LightShadow }         from './schemas/lights/LightShadow'
import { PointLight }                from './schemas/lights/PointLight'
import { RectAreaLight }             from './schemas/lights/RectAreaLight'
import { SpotLight }                 from './schemas/lights/SpotLight'
import { LineBasicMaterial }         from './schemas/materials/LineBasicMaterial'
import { LineDashedMaterial }        from './schemas/materials/LineDashedMaterial'
import { Material }                  from './schemas/materials/Material'
import { MeshBasicMaterial }         from './schemas/materials/MeshBasicMaterial'
import { MeshDepthMaterial }         from './schemas/materials/MeshDepthMaterial'
import { MeshLambertMaterial }       from './schemas/materials/MeshLambertMaterial'
import { MeshNormalMaterial }        from './schemas/materials/MeshNormalMaterial'
//import { SpotLightShadow }         from './schemas/lights/SpotLightShadow'
import { MeshPhongMaterial }         from './schemas/materials/MeshPhongMaterial'
import { MeshPhysicalMaterial }      from './schemas/materials/MeshPhysicalMaterial'
import { MeshStandardMaterial }      from './schemas/materials/MeshStandardMaterial'
import { MeshToonMaterial }          from './schemas/materials/MeshToonMaterial'
import { PointsMaterial }            from './schemas/materials/PointsMaterial'
import { RawShaderMaterial }         from './schemas/materials/RawShaderMaterial'
import { ShaderMaterial }            from './schemas/materials/ShaderMaterial'
import { ShadowMaterial }            from './schemas/materials/ShadowMaterial'
import { SpriteMaterial }            from './schemas/materials/SpriteMaterial'
import { Box2 }                      from './schemas/math/Box2'
import { Box3 }                      from './schemas/math/Box3'
//import { ColorConverter }         from './schemas/math/ColorConverter'
//import { Cylindrical }         from './schemas/math/Cylindrical'
//import { Frustum }         from './schemas/math/Frustum'
//import { Interpolant }         from './schemas/math/Interpolant'
import { Line3 }                     from './schemas/math/Line3'
//import { Lut }         from './schemas/math/Lut'
//import { Math }         from './schemas/math/Math'
import { Plane }                     from './schemas/math/Plane'
import { Ray }                       from './schemas/math/Ray'
import { Sphere }                    from './schemas/math/Sphere'
import { Spherical }                 from './schemas/math/Spherical'
import { Triangle }                  from './schemas/math/Triangle'
import { Bone }                      from './schemas/objects/Bone'
//import { Car }         from './schemas/objects/Car'
//import { GPUParticleSystem }         from './schemas/objects/GPUParticleSystem'
import { Group }                     from './schemas/objects/Group'
//import { Gyroscope }         from './schemas/objects/Gyroscope'
import { ImmediateRenderObject }     from './schemas/objects/ImmediateRenderObject'
import { LensFlare }                 from './schemas/objects/Lensflare'
import { Line }                      from './schemas/objects/Line'
import { LineLoop }                  from './schemas/objects/LineLoop'
import { LineSegments }              from './schemas/objects/LineSegments'
import { LOD }                       from './schemas/objects/LOD'
//import { MarchingCubes }         from './schemas/objects/MarchingCubes'
//import { MD2Character }         from './schemas/objects/MD2Character'
//import { MD2CharacterComplex }         from './schemas/objects/MD2CharacterComplex'
import { Mesh }                      from './schemas/objects/Mesh'
//import { MorphAnimMesh }         from './schemas/objects/MorphAnimMesh'
//import { MorphBlendMesh }         from './schemas/objects/MorphBlendMesh'
//import { Ocean }         from './schemas/objects/Ocean'
import { Points }                    from './schemas/objects/Points'
//import { Reflector }         from './schemas/objects/Reflector'
//import { ReflectorRTT }         from './schemas/objects/ReflectorRTT'
//import { Refractor }         from './schemas/objects/Refractor'
//import { RollerCoaster }         from './schemas/objects/RollerCoaster'
//import { ShadowMesh }         from './schemas/objects/ShadowMesh'
import { Skeleton }                  from './schemas/objects/Skeleton'
import { SkinnedMesh }               from './schemas/objects/SkinnedMesh'
//import { Sky }         from './schemas/objects/Sky'
import { Sprite }                    from './schemas/objects/Sprite'
//import { UCSCharacter }         from './schemas/objects/UCSCharacter'
//import { Water }         from './schemas/objects/Water'
//import { Water2 }         from './schemas/objects/Water2'
import { Fog }                       from './schemas/scenes/Fog'
//import { FogExp2 }         from './schemas/scenes/FogExp2'
import { Scene }                     from './schemas/scenes/Scene'
import { CanvasTexture }             from './schemas/textures/CanvasTexture'
import { CompressedTexture }         from './schemas/textures/CompressedTexture'
import { CubeTexture }               from './schemas/textures/CubeTexture'
import { DataTexture }               from './schemas/textures/DataTexture'
import { DepthTexture }              from './schemas/textures/DepthTexture'
import { Texture }                   from './schemas/textures/Texture'
import { VideoTexture }              from './schemas/textures/VideoTexture'

import { ColorType }      from './types/Color'
import { EulerType }      from './types/Euler'
import { Matrix3Type }    from './types/Matrix3'
import { Matrix4Type }    from './types/Matrix4'
import { QuaternionType } from './types/Quaternion'
import { Vector2Type }    from './types/Vector2'
import { Vector3Type }    from './types/Vector3'
import { Vector4Type }    from './types/Vector4'

export default new TMongoDBPlugin()
    .addType( ColorType )
    .addType( EulerType )
    .addType( Matrix3Type )
    .addType( Matrix4Type )
    .addType( QuaternionType )
    .addType( Vector2Type )
    .addType( Vector3Type )
    .addType( Vector4Type )
    //    .addSchema( KeyframeTrack )
    //    .addSchema( BooleanKeyframeTrack )
    //    .addSchema( ColorKeyframeTrack )
    .addSchema( Audio )
    .addSchema( AudioListener )
    .addSchema( PositionalAudio )
    .addSchema( ArrayCamera )
    .addSchema( Camera )
    .addSchema( CubeCamera )
    .addSchema( OrthographicCamera )
    .addSchema( PerspectiveCamera )
    .addSchema( BufferAttribute )
    .addSchema( BufferGeometry )
    .addSchema( CurvePath )
    .addSchema( Face3 )
    .addSchema( Geometry )
    .addSchema( Object3D )
    .addSchema( Path )
    .addSchema( Shape )
    .addSchema( ArcCurve )
    .addSchema( CatmullRomCurve3 )
    .addSchema( CubicBezierCurve )
    .addSchema( CubicBezierCurve3 )
    .addSchema( Curve )
    .addSchema( CurveExtras )
    .addSchema( EllipseCurve )
    .addSchema( LineCurve )
    .addSchema( LineCurve3 )
    .addSchema( NURBSCurve )
    .addSchema( NURBSSurface )
    .addSchema( QuadraticBezierCurve )
    .addSchema( QuadraticBezierCurve3 )
    .addSchema( SplineCurve )
    .addSchema( BoxBufferGeometry )
    .addSchema( BoxGeometry )
    .addSchema( CircleBufferGeometry )
    .addSchema( CircleGeometry )
    .addSchema( ConeBufferGeometry )
    .addSchema( ConeGeometry )
    .addSchema( ConvexGeometry )
    .addSchema( CylinderBufferGeometry )
    .addSchema( CylinderGeometry )
    .addSchema( DecalGeometry )
    .addSchema( DodecahedronGeometry )
    .addSchema( EdgesGeometry )
    .addSchema( ExtrudeBufferGeometry )
    .addSchema( ExtrudeGeometry )
    .addSchema( IcosahedronBufferGeometry )
    .addSchema( IcosahedronGeometry )
    .addSchema( InstancedBufferGeometry )
    .addSchema( LatheBufferGeometry )
    .addSchema( LatheGeometry )
    .addSchema( OctahedronBufferGeometry )
    .addSchema( OctahedronGeometry )
    .addSchema( ParametricBufferGeometry )
    .addSchema( ParametricGeometry )
    .addSchema( PlaneBufferGeometry )
    .addSchema( PlaneGeometry )
    .addSchema( PolyhedronBufferGeometry )
    .addSchema( PolyhedronGeometry )
    .addSchema( RingBufferGeometry )
    .addSchema( RingGeometry )
    .addSchema( ShapeBufferGeometry )
    .addSchema( ShapeGeometry )
    .addSchema( SphereBufferGeometry )
    .addSchema( SphereGeometry )
    .addSchema( TeapotBufferGeometry )
    .addSchema( TetrahedronBufferGeometry )
    .addSchema( TetrahedronGeometry )
    .addSchema( TextBufferGeometry )
    .addSchema( TextGeometry )
    .addSchema( TorusBufferGeometry )
    .addSchema( TorusGeometry )
    .addSchema( TorusKnotBufferGeometry )
    .addSchema( TorusKnotGeometry )
    .addSchema( TubeBufferGeometry )
    .addSchema( TubeGeometry )
    .addSchema( WireframeGeometry )
    .addSchema( ArrowHelper )
    .addSchema( AxesHelper )
    .addSchema( Box3Helper )
    .addSchema( BoxHelper )
    .addSchema( CameraHelper )
    .addSchema( DirectionalLightHelper )
    .addSchema( FaceNormalsHelper )
    .addSchema( GridHelper )
    .addSchema( HemisphereLightHelper )
    .addSchema( PlaneHelper )
    .addSchema( PointLightHelper )
    .addSchema( PolarGridHelper )
    .addSchema( RectAreaLightHelper )
    .addSchema( SkeletonHelper )
    .addSchema( SpotLightHelper )
    .addSchema( VertexNormalsHelper )
    .addSchema( AmbientLight )
    .addSchema( DirectionalLight )
    //    .addSchema( DirectionalLightShadow )
    .addSchema( HemisphereLight )
    .addSchema( Light )
    //    .addSchema( LightShadow )
    .addSchema( PointLight )
    .addSchema( RectAreaLight )
    .addSchema( SpotLight )
    //    .addSchema( SpotLightShadow )
    .addSchema( MeshPhongMaterial )
    .addSchema( LineBasicMaterial )
    .addSchema( LineDashedMaterial )
    .addSchema( Material )
    .addSchema( MeshBasicMaterial )
    .addSchema( MeshDepthMaterial )
    .addSchema( MeshLambertMaterial )
    .addSchema( MeshNormalMaterial )
    .addSchema( MeshPhysicalMaterial )
    .addSchema( MeshStandardMaterial )
    .addSchema( MeshToonMaterial )
    .addSchema( PointsMaterial )
    .addSchema( RawShaderMaterial )
    .addSchema( ShaderMaterial )
    .addSchema( ShadowMaterial )
    .addSchema( SpriteMaterial )
    .addSchema( Box2 )
    .addSchema( Box3 )
    //    .addSchema( ColorConverter )
    //    .addSchema( Cylindrical )
    //    .addSchema( Frustum )
    //    .addSchema( Interpolant )
    .addSchema( Line3 )
    //    .addSchema( Lut )
    //    .addSchema( Math )
    .addSchema( Plane )
    .addSchema( Ray )
    .addSchema( Sphere )
    .addSchema( Spherical )
    .addSchema( Triangle )
    .addSchema( Bone )
    //    .addSchema( Car )
    //    .addSchema( GPUParticleSystem )
    .addSchema( Group )
    //    .addSchema( Gyroscope )
    .addSchema( ImmediateRenderObject )
    .addSchema( LensFlare )
    .addSchema( Line )
    .addSchema( LineLoop )
    .addSchema( LineSegments )
    .addSchema( LOD )
    //    .addSchema( MarchingCubes )
    //    .addSchema( MD2Character )
    //    .addSchema( MD2CharacterComplex )
    .addSchema( Mesh )
    //    .addSchema( MorphAnimMesh )
    //    .addSchema( MorphBlendMesh )
    //    .addSchema( Ocean )
    .addSchema( Points )
    //    .addSchema( Reflector )
    //    .addSchema( ReflectorRTT )
    //    .addSchema( Refractor )
    //    .addSchema( RollerCoaster )
    //    .addSchema( ShadowMesh )
    .addSchema( Skeleton )
    .addSchema( SkinnedMesh )
    //    .addSchema( Sky )
    .addSchema( Sprite )
    //    .addSchema( UCSCharacter )
    //    .addSchema( Water )
    //    .addSchema( Water2 )
    .addSchema( Fog )
    //    .addSchema( FogExp2 )
    .addSchema( Scene )
    .addSchema( CanvasTexture )
    .addSchema( CompressedTexture )
    .addSchema( CubeTexture )
    .addSchema( DataTexture )
    .addSchema( DepthTexture )
    .addSchema( Texture )
    .addSchema( VideoTexture )
    .addController( TObjects3DController )
    .addDescriptor( {
        route:      '/objects',
        controller: {
            name:    'TObjects3DController',
            options: {
                schemaName: 'Objects3D'
            },
            can:     {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read:   {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addController( TMongooseController )
    .addDescriptor( {
        route:      '/curves',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Curves'
            },
            can:     {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read:   {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/geometries',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Geometries'
            },
            can:     {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read:   {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/materials',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Materials'
            },
            can:     {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read:   {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/textures',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Textures'
            },
            can:     {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read:   {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addController( TAbstractConverterManager )
    .addDescriptor( {
        route:      '/uploads',
        controller: {
            name:    'TAbstractConverterManager',
            options: {
                useNext:    true,
                converters: {
                    JsonToThree:    new JsonToThree(),
                    ShpToThree:     new ShpToThree(),
                    DbfToThree:     new DbfToThree(),
                    FbxToThree:     new FbxToThree(),
                    ColladaToThree: new ColladaToThree(),
                    StlToThree:     new StlToThree(),
                    TdsToThree:     new TdsToThree(),
                    MtlToThree:     new MtlToThree(),
                    ObjToThree:     new Obj2ToThree()
                },
                rules:      [ {
                    on:  '.json',
                    use: 'JsonToThree'
                }, {
                    on:  '.dae',
                    use: 'ColladaToThree'
                }, {
                    on:  '.fbx',
                    use: 'FbxToThree'
                }, {
                    on:  '.stl',
                    use: 'StlToThree'
                }, {
                    on:  '.3ds',
                    use: 'TdsToThree'
                }, {
                    on:  '.shp',
                    use: 'ShpToThree'
                }, {
                    on:  '.dbf',
                    use: 'DbfToThree'
                }, {
                    on:  [ '.shp', '.dbf' ],
                    use: [ 'ShpToThree', 'DbfToThree' ]
                }, {
                    on:  '.mtl',
                    use: 'MtlToThree'
                }, {
                    on:  '.obj',
                    use: 'ObjToThree'
                }, {
                    on:  [ '.mtl', '.obj' ],
                    use: [ 'MtlToThree', 'ObjToThree' ]
                } ],
                inserter:   ThreeToMongoDB
            },
            can:     {
                processFiles: {
                    on:   'post',
                    over: '/'
                }
            }
        }
    } )
