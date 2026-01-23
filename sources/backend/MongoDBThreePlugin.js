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
import { Audio }                     from './schemas/audio/Audio.js'
import { AudioListener }             from './schemas/audio/AudioListener.js'
import { PositionalAudio }           from './schemas/audio/PositionalAudio.js'
import { ArrayCamera }               from './schemas/cameras/ArrayCamera.js'
import { Camera }                    from './schemas/cameras/Camera.js'
import { CubeCamera }                from './schemas/cameras/CubeCamera.js'
import { OrthographicCamera }        from './schemas/cameras/OrthographicCamera.js'
import { PerspectiveCamera }         from './schemas/cameras/PerspectiveCamera.js'
import { BufferAttribute }           from './schemas/core/BufferAttribute.js'
import { BufferGeometry }            from './schemas/core/BufferGeometry.js'
import { CurvePath }                 from './schemas/core/CurvePath.js'
import { Face3 }                     from './schemas/core/Face3.js'
import { Geometry }                  from './schemas/core/Geometry.js'
import { Object3D }                  from './schemas/core/Object3D.js'
import { Path }                      from './schemas/core/Path.js'
import { Shape }                     from './schemas/core/Shape.js'
import { ArcCurve }                  from './schemas/curves/ArcCurve.js'
import { CatmullRomCurve3 }          from './schemas/curves/CatmullRomCurve3.js'
import { CubicBezierCurve }          from './schemas/curves/CubicBezierCurve.js'
import { CubicBezierCurve3 }         from './schemas/curves/CubicBezierCurve3.js'
import { Curve }                     from './schemas/curves/Curve.js'
import { CurveExtras }               from './schemas/curves/CurveExtras.js'
import { EllipseCurve }              from './schemas/curves/EllipseCurve.js'
import { LineCurve }                 from './schemas/curves/LineCurve.js'
import { LineCurve3 }                from './schemas/curves/LineCurve3.js'
import { NURBSCurve }                from './schemas/curves/NURBSCurve.js'
import { NURBSSurface }              from './schemas/curves/NURBSSurface.js'
import { QuadraticBezierCurve }      from './schemas/curves/QuadraticBezierCurve.js'
import { QuadraticBezierCurve3 }     from './schemas/curves/QuadraticBezierCurve3.js'
import { SplineCurve }               from './schemas/curves/SplineCurve.js'
import { BoxBufferGeometry }         from './schemas/geometries/BoxBufferGeometry.js'
import { BoxGeometry }               from './schemas/geometries/BoxGeometry.js'
import { CircleBufferGeometry }      from './schemas/geometries/CircleBufferGeometry.js'
import { CircleGeometry }            from './schemas/geometries/CircleGeometry.js'
import { ConeBufferGeometry }        from './schemas/geometries/ConeBufferGeometry.js'
import { ConeGeometry }              from './schemas/geometries/ConeGeometry.js'
import { ConvexGeometry }            from './schemas/geometries/ConvexGeometry.js'
import { CylinderBufferGeometry }    from './schemas/geometries/CylinderBufferGeometry.js'
import { CylinderGeometry }          from './schemas/geometries/CylinderGeometry.js'
import { DecalGeometry }             from './schemas/geometries/DecalGeometry.js'
import { DodecahedronGeometry }      from './schemas/geometries/DodecahedronGeometry.js'
import { EdgesGeometry }             from './schemas/geometries/EdgesGeometry.js'
import { ExtrudeBufferGeometry }     from './schemas/geometries/ExtrudeBufferGeometry.js'
import { ExtrudeGeometry }           from './schemas/geometries/ExtrudeGeometry.js'
import { IcosahedronBufferGeometry } from './schemas/geometries/IcosahedronBufferGeometry.js'
import { IcosahedronGeometry }       from './schemas/geometries/IcosahedronGeometry.js'
import { InstancedBufferGeometry }   from './schemas/geometries/InstancedBufferGeometry.js'
import { LatheBufferGeometry }       from './schemas/geometries/LatheBufferGeometry.js'
import { LatheGeometry }             from './schemas/geometries/LatheGeometry.js'
import { OctahedronBufferGeometry }  from './schemas/geometries/OctahedronBufferGeometry.js'
import { OctahedronGeometry }        from './schemas/geometries/OctahedronGeometry.js'
import { ParametricBufferGeometry }  from './schemas/geometries/ParametricBufferGeometry.js'
import { ParametricGeometry }        from './schemas/geometries/ParametricGeometry.js'
import { PlaneBufferGeometry }       from './schemas/geometries/PlaneBufferGeometry.js'
import { PlaneGeometry }             from './schemas/geometries/PlaneGeometry.js'
import { PolyhedronBufferGeometry }  from './schemas/geometries/PolyhedronBufferGeometry.js'
import { PolyhedronGeometry }        from './schemas/geometries/PolyhedronGeometry.js'
import { RingBufferGeometry }        from './schemas/geometries/RingBufferGeometry.js'
import { RingGeometry }              from './schemas/geometries/RingGeometry.js'
import { ShapeBufferGeometry }       from './schemas/geometries/ShapeBufferGeometry.js'
import { ShapeGeometry }             from './schemas/geometries/ShapeGeometry.js'
import { SphereBufferGeometry }      from './schemas/geometries/SphereBufferGeometry.js'
import { SphereGeometry }            from './schemas/geometries/SphereGeometry.js'
import { TeapotBufferGeometry }      from './schemas/geometries/TeopotBufferGeometry.js'
import { TetrahedronBufferGeometry } from './schemas/geometries/TetrahedronBufferGeometry.js'
import { TetrahedronGeometry }       from './schemas/geometries/TetrahedronGeometry.js'
import { TextBufferGeometry }        from './schemas/geometries/TextBufferGeometry.js'
import { TextGeometry }              from './schemas/geometries/TextGeometry.js'
import { TorusBufferGeometry }       from './schemas/geometries/TorusBufferGeometry.js'
import { TorusGeometry }             from './schemas/geometries/TorusGeometry.js'
import { TorusKnotBufferGeometry }   from './schemas/geometries/TorusKnotBufferGeometry.js'
import { TorusKnotGeometry }         from './schemas/geometries/TorusKnotGeometry.js'
import { TubeBufferGeometry }        from './schemas/geometries/TubeBufferGeometry.js'
import { TubeGeometry }              from './schemas/geometries/TubeGeometry.js'
import { WireframeGeometry }         from './schemas/geometries/WireframeGeometry.js'
import { ArrowHelper }               from './schemas/helpers/ArrowHelper.js'
import { AxesHelper }                from './schemas/helpers/AxesHelper.js'
import { Box3Helper }                from './schemas/helpers/Box3Helper.js'
import { BoxHelper }                 from './schemas/helpers/BoxHelper.js'
import { CameraHelper }              from './schemas/helpers/CameraHelper.js'
import { DirectionalLightHelper }    from './schemas/helpers/DirectionalLightHelper.js'
import { FaceNormalsHelper }         from './schemas/helpers/FaceNormalsHelper.js'
import { GridHelper }                from './schemas/helpers/GridHelper.js'
import { HemisphereLightHelper }     from './schemas/helpers/HemisphereLightHelper.js'
import { PlaneHelper }               from './schemas/helpers/PlaneHelper.js'
import { PointLightHelper }          from './schemas/helpers/PointLightHelper.js'
import { PolarGridHelper }           from './schemas/helpers/PolarGridHelper.js'
import { RectAreaLightHelper }       from './schemas/helpers/RectAreaLightHelper.js'
import { SkeletonHelper }            from './schemas/helpers/SkeletonHelper.js'
import { SpotLightHelper }           from './schemas/helpers/SpotLightHelper.js'
import { VertexNormalsHelper }       from './schemas/helpers/VertexNormalsHelper.js'
import { AmbientLight }              from './schemas/lights/AmbientLight.js'
import { DirectionalLight }          from './schemas/lights/DirectionalLight.js'
//import { DirectionalLightShadow }         from './schemas/lights/DirectionalLightShadow.js'
import { HemisphereLight }           from './schemas/lights/HemisphereLight.js'
import { Light }                     from './schemas/lights/Light.js'
//import { LightShadow }         from './schemas/lights/LightShadow.js'
import { PointLight }                from './schemas/lights/PointLight.js'
import { RectAreaLight }             from './schemas/lights/RectAreaLight.js'
import { SpotLight }                 from './schemas/lights/SpotLight.js'
import { LineBasicMaterial }         from './schemas/materials/LineBasicMaterial.js'
import { LineDashedMaterial }        from './schemas/materials/LineDashedMaterial.js'
import { Material }                  from './schemas/materials/Material.js'
import { MeshBasicMaterial }         from './schemas/materials/MeshBasicMaterial.js'
import { MeshDepthMaterial }         from './schemas/materials/MeshDepthMaterial.js'
import { MeshLambertMaterial }       from './schemas/materials/MeshLambertMaterial.js'
import { MeshNormalMaterial }        from './schemas/materials/MeshNormalMaterial.js'
//import { SpotLightShadow }         from './schemas/lights/SpotLightShadow.js'
import { MeshPhongMaterial }         from './schemas/materials/MeshPhongMaterial.js'
import { MeshPhysicalMaterial }      from './schemas/materials/MeshPhysicalMaterial.js'
import { MeshStandardMaterial }      from './schemas/materials/MeshStandardMaterial.js'
import { MeshToonMaterial }          from './schemas/materials/MeshToonMaterial.js'
import { PointsMaterial }            from './schemas/materials/PointsMaterial.js'
import { RawShaderMaterial }         from './schemas/materials/RawShaderMaterial.js'
import { ShaderMaterial }            from './schemas/materials/ShaderMaterial.js'
import { ShadowMaterial }            from './schemas/materials/ShadowMaterial.js'
import { SpriteMaterial }            from './schemas/materials/SpriteMaterial.js'
import { Box2 }                      from './schemas/math/Box2.js'
import { Box3 }                      from './schemas/math/Box3.js'
//import { ColorConverter }         from './schemas/math/ColorConverter.js'
//import { Cylindrical }         from './schemas/math/Cylindrical.js'
//import { Frustum }         from './schemas/math/Frustum.js'
//import { Interpolant }         from './schemas/math/Interpolant.js'
import { Line3 }                     from './schemas/math/Line3.js'
//import { Lut }         from './schemas/math/Lut.js'
//import { Math }         from './schemas/math/Math.js'
import { Plane }                     from './schemas/math/Plane.js'
import { Ray }                       from './schemas/math/Ray.js'
import { Sphere }                    from './schemas/math/Sphere.js'
import { Spherical }                 from './schemas/math/Spherical.js'
import { Triangle }                  from './schemas/math/Triangle.js'
import { Bone }                      from './schemas/objects/Bone.js'
//import { Car }         from './schemas/objects/Car.js'
//import { GPUParticleSystem }         from './schemas/objects/GPUParticleSystem.js'
import { Group }                     from './schemas/objects/Group.js'
//import { Gyroscope }         from './schemas/objects/Gyroscope.js'
import { ImmediateRenderObject }     from './schemas/objects/ImmediateRenderObject.js'
import { LensFlare }                 from './schemas/objects/Lensflare.js'
import { Line }                      from './schemas/objects/Line.js'
import { LineLoop }                  from './schemas/objects/LineLoop.js'
import { LineSegments }              from './schemas/objects/LineSegments.js'
import { LOD }                       from './schemas/objects/LOD.js'
//import { MarchingCubes }         from './schemas/objects/MarchingCubes.js'
//import { MD2Character }         from './schemas/objects/MD2Character.js'
//import { MD2CharacterComplex }         from './schemas/objects/MD2CharacterComplex.js'
import { Mesh }                      from './schemas/objects/Mesh.js'
//import { MorphAnimMesh }         from './schemas/objects/MorphAnimMesh.js'
//import { MorphBlendMesh }         from './schemas/objects/MorphBlendMesh.js'
//import { Ocean }         from './schemas/objects/Ocean.js'
import { Points }                    from './schemas/objects/Points.js'
//import { Reflector }         from './schemas/objects/Reflector.js'
//import { ReflectorRTT }         from './schemas/objects/ReflectorRTT.js'
//import { Refractor }         from './schemas/objects/Refractor.js'
//import { RollerCoaster }         from './schemas/objects/RollerCoaster.js'
//import { ShadowMesh }         from './schemas/objects/ShadowMesh.js'
import { Skeleton }                  from './schemas/objects/Skeleton.js'
import { SkinnedMesh }               from './schemas/objects/SkinnedMesh.js'
//import { Sky }         from './schemas/objects/Sky.js'
import { Sprite }                    from './schemas/objects/Sprite.js'
//import { UCSCharacter }         from './schemas/objects/UCSCharacter.js'
//import { Water }         from './schemas/objects/Water.js'
//import { Water2 }         from './schemas/objects/Water2.js'
import { Fog }                       from './schemas/scenes/Fog.js'
//import { FogExp2 }         from './schemas/scenes/FogExp2.js'
import { Scene }                     from './schemas/scenes/Scene.js'
import { CanvasTexture }             from './schemas/textures/CanvasTexture.js'
import { CompressedTexture }         from './schemas/textures/CompressedTexture.js'
import { CubeTexture }               from './schemas/textures/CubeTexture.js'
import { DataTexture }               from './schemas/textures/DataTexture.js'
import { DepthTexture }              from './schemas/textures/DepthTexture.js'
import { Texture }                   from './schemas/textures/Texture.js'
import { VideoTexture }              from './schemas/textures/VideoTexture.js'

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
