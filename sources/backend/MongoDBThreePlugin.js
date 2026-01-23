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
import { TObjects3DController }      from './controllers/TObjects3DController.js'
import { ColladaToThree }            from './converters/ColladaToThree.js'
import { DbfToThree }                from './converters/DbfToThree.js'
import { FbxToThree }                from './converters/FbxToThree.js'
import { JsonToThree }               from './converters/JsonToThree.js'
import { MtlToThree }                from './converters/MtlToThree.js'
import { Obj2ToThree }               from './converters/Obj2ToThree.js'
import { ShpToThree }                from './converters/ShpToThree.js'
import { StlToThree }                from './converters/StlToThree.js'
import { TdsToThree }                from './converters/TdsToThree.js'
import { ThreeToMongoDB }            from './inserters/ThreeToMongoDB.js'
//import { BooleanKeyframeTrack } from './schemas/animation/tracks/BooleanKeyframeTrack.js'
import { Audio }                     from './schemas/audio/Audio.cjs'
import { AudioListener }             from './schemas/audio/AudioListener.cjs'
import { PositionalAudio }           from './schemas/audio/PositionalAudio.cjs'
import { ArrayCamera }               from './schemas/cameras/ArrayCamera.cjs'
import { Camera }                    from './schemas/cameras/Camera.cjs'
import { CubeCamera }                from './schemas/cameras/CubeCamera.cjs'
import { OrthographicCamera }        from './schemas/cameras/OrthographicCamera.cjs'
import { PerspectiveCamera }         from './schemas/cameras/PerspectiveCamera.cjs'
import { BufferAttribute }           from './schemas/core/BufferAttribute.cjs'
import { BufferGeometry }            from './schemas/core/BufferGeometry.js'
import { CurvePath }                 from './schemas/core/CurvePath.cjs'
import { Face3 }                     from './schemas/core/Face3.cjs'
import { Geometry }                  from './schemas/core/Geometry.js'
import { Object3D }                  from './schemas/core/Object3D.js'
import { Path }                      from './schemas/core/Path.cjs'
import { Shape }                     from './schemas/core/Shape.cjs'
import { ArcCurve }                  from './schemas/curves/ArcCurve.cjs'
import { CatmullRomCurve3 }          from './schemas/curves/CatmullRomCurve3.cjs'
import { CubicBezierCurve }          from './schemas/curves/CubicBezierCurve.cjs'
import { CubicBezierCurve3 }         from './schemas/curves/CubicBezierCurve3.cjs'
import { Curve }                     from './schemas/curves/Curve.cjs'
import { CurveExtras }               from './schemas/curves/CurveExtras.cjs'
import { EllipseCurve }              from './schemas/curves/EllipseCurve.cjs'
import { LineCurve }                 from './schemas/curves/LineCurve.cjs'
import { LineCurve3 }                from './schemas/curves/LineCurve3.cjs'
import { NURBSCurve }                from './schemas/curves/NURBSCurve.cjs'
import { NURBSSurface }              from './schemas/curves/NURBSSurface.cjs'
import { QuadraticBezierCurve }      from './schemas/curves/QuadraticBezierCurve.cjs'
import { QuadraticBezierCurve3 }     from './schemas/curves/QuadraticBezierCurve3.cjs'
import { SplineCurve }               from './schemas/curves/SplineCurve.cjs'
import { BoxBufferGeometry }         from './schemas/geometries/BoxBufferGeometry.cjs'
import { BoxGeometry }               from './schemas/geometries/BoxGeometry.cjs'
import { CircleBufferGeometry }      from './schemas/geometries/CircleBufferGeometry.cjs'
import { CircleGeometry }            from './schemas/geometries/CircleGeometry.cjs'
import { ConeBufferGeometry }        from './schemas/geometries/ConeBufferGeometry.cjs'
import { ConeGeometry }              from './schemas/geometries/ConeGeometry.cjs'
import { ConvexGeometry }            from './schemas/geometries/ConvexGeometry.cjs'
import { CylinderBufferGeometry }    from './schemas/geometries/CylinderBufferGeometry.cjs'
import { CylinderGeometry }          from './schemas/geometries/CylinderGeometry.cjs'
import { DecalGeometry }             from './schemas/geometries/DecalGeometry.cjs'
import { DodecahedronGeometry }      from './schemas/geometries/DodecahedronGeometry.cjs'
import { EdgesGeometry }             from './schemas/geometries/EdgesGeometry.cjs'
import { ExtrudeBufferGeometry }     from './schemas/geometries/ExtrudeBufferGeometry.cjs'
import { ExtrudeGeometry }           from './schemas/geometries/ExtrudeGeometry.cjs'
import { IcosahedronBufferGeometry } from './schemas/geometries/IcosahedronBufferGeometry.cjs'
import { IcosahedronGeometry }       from './schemas/geometries/IcosahedronGeometry.cjs'
import { InstancedBufferGeometry }   from './schemas/geometries/InstancedBufferGeometry.cjs'
import { LatheBufferGeometry }       from './schemas/geometries/LatheBufferGeometry.cjs'
import { LatheGeometry }             from './schemas/geometries/LatheGeometry.cjs'
import { OctahedronBufferGeometry }  from './schemas/geometries/OctahedronBufferGeometry.cjs'
import { OctahedronGeometry }        from './schemas/geometries/OctahedronGeometry.cjs'
import { ParametricBufferGeometry }  from './schemas/geometries/ParametricBufferGeometry.cjs'
import { ParametricGeometry }        from './schemas/geometries/ParametricGeometry.cjs'
import { PlaneBufferGeometry }       from './schemas/geometries/PlaneBufferGeometry.cjs'
import { PlaneGeometry }             from './schemas/geometries/PlaneGeometry.cjs'
import { PolyhedronBufferGeometry }  from './schemas/geometries/PolyhedronBufferGeometry.cjs'
import { PolyhedronGeometry }        from './schemas/geometries/PolyhedronGeometry.cjs'
import { RingBufferGeometry }        from './schemas/geometries/RingBufferGeometry.cjs'
import { RingGeometry }              from './schemas/geometries/RingGeometry.cjs'
import { ShapeBufferGeometry }       from './schemas/geometries/ShapeBufferGeometry.cjs'
import { ShapeGeometry }             from './schemas/geometries/ShapeGeometry.cjs'
import { SphereBufferGeometry }      from './schemas/geometries/SphereBufferGeometry.cjs'
import { SphereGeometry }            from './schemas/geometries/SphereGeometry.cjs'
import { TeapotBufferGeometry }      from './schemas/geometries/TeopotBufferGeometry.cjs'
import { TetrahedronBufferGeometry } from './schemas/geometries/TetrahedronBufferGeometry.cjs'
import { TetrahedronGeometry }       from './schemas/geometries/TetrahedronGeometry.cjs'
import { TextBufferGeometry }        from './schemas/geometries/TextBufferGeometry.cjs'
import { TextGeometry }              from './schemas/geometries/TextGeometry.cjs'
import { TorusBufferGeometry }       from './schemas/geometries/TorusBufferGeometry.cjs'
import { TorusGeometry }             from './schemas/geometries/TorusGeometry.cjs'
import { TorusKnotBufferGeometry }   from './schemas/geometries/TorusKnotBufferGeometry.cjs'
import { TorusKnotGeometry }         from './schemas/geometries/TorusKnotGeometry.cjs'
import { TubeBufferGeometry }        from './schemas/geometries/TubeBufferGeometry.cjs'
import { TubeGeometry }              from './schemas/geometries/TubeGeometry.cjs'
import { WireframeGeometry }         from './schemas/geometries/WireframeGeometry.cjs'
import { ArrowHelper }               from './schemas/helpers/ArrowHelper.cjs'
import { AxesHelper }                from './schemas/helpers/AxesHelper.cjs'
import { Box3Helper }                from './schemas/helpers/Box3Helper.cjs'
import { BoxHelper }                 from './schemas/helpers/BoxHelper.cjs'
import { CameraHelper }              from './schemas/helpers/CameraHelper.cjs'
import { DirectionalLightHelper }    from './schemas/helpers/DirectionalLightHelper.cjs'
import { FaceNormalsHelper }         from './schemas/helpers/FaceNormalsHelper.cjs'
import { GridHelper }                from './schemas/helpers/GridHelper.cjs'
import { HemisphereLightHelper }     from './schemas/helpers/HemisphereLightHelper.cjs'
import { PlaneHelper }               from './schemas/helpers/PlaneHelper.cjs'
import { PointLightHelper }          from './schemas/helpers/PointLightHelper.cjs'
import { PolarGridHelper }           from './schemas/helpers/PolarGridHelper.cjs'
import { RectAreaLightHelper }       from './schemas/helpers/RectAreaLightHelper.cjs'
import { SkeletonHelper }            from './schemas/helpers/SkeletonHelper.cjs'
import { SpotLightHelper }           from './schemas/helpers/SpotLightHelper.cjs'
import { VertexNormalsHelper }       from './schemas/helpers/VertexNormalsHelper.cjs'
import { AmbientLight }              from './schemas/lights/AmbientLight.cjs'
import { DirectionalLight }          from './schemas/lights/DirectionalLight.cjs'
//import { DirectionalLightShadow }         from './schemas/lights/DirectionalLightShadow.js'
import { HemisphereLight }           from './schemas/lights/HemisphereLight.cjs'
import { Light }                     from './schemas/lights/Light.cjs'
//import { LightShadow }         from './schemas/lights/LightShadow.js'
import { PointLight }                from './schemas/lights/PointLight.cjs'
import { RectAreaLight }             from './schemas/lights/RectAreaLight.cjs'
import { SpotLight }                 from './schemas/lights/SpotLight.cjs'
import { LineBasicMaterial }         from './schemas/materials/LineBasicMaterial.cjs'
import { LineDashedMaterial }        from './schemas/materials/LineDashedMaterial.cjs'
import { Material }                  from './schemas/materials/Material.cjs'
import { MeshBasicMaterial }         from './schemas/materials/MeshBasicMaterial.cjs'
import { MeshDepthMaterial }         from './schemas/materials/MeshDepthMaterial.cjs'
import { MeshLambertMaterial }       from './schemas/materials/MeshLambertMaterial.cjs'
import { MeshNormalMaterial }        from './schemas/materials/MeshNormalMaterial.cjs'
//import { SpotLightShadow }         from './schemas/lights/SpotLightShadow.js'
import { MeshPhongMaterial }         from './schemas/materials/MeshPhongMaterial.cjs'
import { MeshPhysicalMaterial }      from './schemas/materials/MeshPhysicalMaterial.cjs'
import { MeshStandardMaterial }      from './schemas/materials/MeshStandardMaterial.cjs'
import { MeshToonMaterial }          from './schemas/materials/MeshToonMaterial.cjs'
import { PointsMaterial }            from './schemas/materials/PointsMaterial.cjs'
import { RawShaderMaterial }         from './schemas/materials/RawShaderMaterial.cjs'
import { ShaderMaterial }            from './schemas/materials/ShaderMaterial.cjs'
import { ShadowMaterial }            from './schemas/materials/ShadowMaterial.cjs'
import { SpriteMaterial }            from './schemas/materials/SpriteMaterial.cjs'
import { Box2 }                      from './schemas/math/Box2.cjs'
import { Box3 }                      from './schemas/math/Box3.cjs'
//import { ColorConverter }         from './schemas/math/ColorConverter.js'
//import { Cylindrical }         from './schemas/math/Cylindrical.js'
//import { Frustum }         from './schemas/math/Frustum.js'
//import { Interpolant }         from './schemas/math/Interpolant.js'
import { Line3 }                     from './schemas/math/Line3.cjs'
//import { Lut }         from './schemas/math/Lut.js'
//import { Math }         from './schemas/math/Math.js'
import { Plane }                     from './schemas/math/Plane.cjs'
import { Ray }                       from './schemas/math/Ray.cjs'
import { Sphere }                    from './schemas/math/Sphere.cjs'
import { Spherical }                 from './schemas/math/Spherical.cjs'
import { Triangle }                  from './schemas/math/Triangle.cjs'
import { Bone }                      from './schemas/objects/Bone.cjs'
//import { Car }         from './schemas/objects/Car.js'
//import { GPUParticleSystem }         from './schemas/objects/GPUParticleSystem.js'
import { Group }                     from './schemas/objects/Group.js'
//import { Gyroscope }         from './schemas/objects/Gyroscope.js'
import { ImmediateRenderObject }     from './schemas/objects/ImmediateRenderObject.cjs'
import { LensFlare }                 from './schemas/objects/Lensflare.cjs'
import { Line }                      from './schemas/objects/Line.cjs'
import { LineLoop }                  from './schemas/objects/LineLoop.cjs'
import { LineSegments }              from './schemas/objects/LineSegments.cjs'
import { LOD }                       from './schemas/objects/LOD.cjs'
//import { MarchingCubes }         from './schemas/objects/MarchingCubes.js'
//import { MD2Character }         from './schemas/objects/MD2Character.js'
//import { MD2CharacterComplex }         from './schemas/objects/MD2CharacterComplex.js'
import { Mesh }                      from './schemas/objects/Mesh.cjs'
//import { MorphAnimMesh }         from './schemas/objects/MorphAnimMesh.js'
//import { MorphBlendMesh }         from './schemas/objects/MorphBlendMesh.js'
//import { Ocean }         from './schemas/objects/Ocean.js'
import { Points }                    from './schemas/objects/Points.cjs'
//import { Reflector }         from './schemas/objects/Reflector.js'
//import { ReflectorRTT }         from './schemas/objects/ReflectorRTT.js'
//import { Refractor }         from './schemas/objects/Refractor.js'
//import { RollerCoaster }         from './schemas/objects/RollerCoaster.js'
//import { ShadowMesh }         from './schemas/objects/ShadowMesh.js'
import { Skeleton }                  from './schemas/objects/Skeleton.cjs'
import { SkinnedMesh }               from './schemas/objects/SkinnedMesh.cjs'
//import { Sky }         from './schemas/objects/Sky.js'
import { Sprite }                    from './schemas/objects/Sprite.cjs'
//import { UCSCharacter }         from './schemas/objects/UCSCharacter.js'
//import { Water }         from './schemas/objects/Water.js'
//import { Water2 }         from './schemas/objects/Water2.js'
import { Fog }                       from './schemas/scenes/Fog.cjs'
//import { FogExp2 }         from './schemas/scenes/FogExp2.js'
import { Scene }                     from './schemas/scenes/Scene.cjs'
import { CanvasTexture }             from './schemas/textures/CanvasTexture.cjs'
import { CompressedTexture }         from './schemas/textures/CompressedTexture.cjs'
import { CubeTexture }               from './schemas/textures/CubeTexture.cjs'
import { DataTexture }               from './schemas/textures/DataTexture.cjs'
import { DepthTexture }              from './schemas/textures/DepthTexture.cjs'
import { Texture }                   from './schemas/textures/Texture.cjs'
import { VideoTexture }              from './schemas/textures/VideoTexture.cjs'

import { ColorType }      from './types/Color.js'
import { EulerType }      from './types/Euler.js'
import { Matrix3Type }    from './types/Matrix3.js'
import { Matrix4Type }    from './types/Matrix4.js'
import { QuaternionType } from './types/Quaternion.js'
import { Vector2Type }    from './types/Vector2.js'
import { Vector3Type }    from './types/Vector3.js'
import { Vector4Type }    from './types/Vector4.js'

function registerPlugin( parameters ) {

    return new TMongoDBPlugin( parameters )
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
                can: {
                    create: {
                        on:   'put',
                        over: '/(:id)?'
                    },
                    read: {
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
                can: {
                    create: {
                        on:   'put',
                        over: '/(:id)?'
                    },
                    read: {
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
                can: {
                    create: {
                        on:   'put',
                        over: '/(:id)?'
                    },
                    read: {
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
                can: {
                    create: {
                        on:   'put',
                        over: '/(:id)?'
                    },
                    read: {
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
                can: {
                    create: {
                        on:   'put',
                        over: '/(:id)?'
                    },
                    read: {
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
                    rules: [
                        {
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
                        }
                    ],
                    inserter: ThreeToMongoDB
                },
                can: {
                    processFiles: {
                        on:   'post',
                        over: '/'
                    }
                }
            }
        } )

}

export { registerPlugin }

/*
 export default ( parameters ) => {
 return new TMongoDBPlugin( parameters )
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
 }
 */
