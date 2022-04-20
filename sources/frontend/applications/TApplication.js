/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    Clock,
    Vector3,
    Scene,
    PerspectiveCamera,
    OrthographicCamera,
    WebGLRenderer,
    LinearEncoding,
    LinearToneMapping
} from 'three-full'

class TApplication {

    set container ( value ) {
        if ( !value ) {
            throw new Error( 'Three Application required a container' )
        }

        this._container = value
    }

    constructor ( {
        camera = {},
        controls = {},
        databases = {},
        dataModel = {},
        environment = {},
        exporters = {},
        globals = {},
        loaders = {},
        raycaster = {},
        effects = {},
        renderer = {},
        scene = {},
        tools = {},
        workers = {},
        audios = {},
    } = {} ) {

        this._initGlobals( globals )
        this._initScenes( scene )
        this._initCameras( camera )
        this._initRenderers( renderer )
        this._initEffects( effects )
        this._initLoaders( loaders )
        this._initExporters( exporters )
        this._initDatabases( databases )
        this._initRaycasters( raycaster )
        this._initWorkers( workers )
        this._initAudios( audios )
        this._initControls( this.scene, controls )
        this._initEnvironments( this.scene, environment )
        this._initDataModels( this.scene, dataModel )
        this._initTools( this.scene, tools )

//        this._resize()
        this.render()

    }
    
    _initGlobals ( {
        isRaycastable                    = false,
        isDecimable= false
    }={ } ) {
        
        this.isRaycastable                    =isRaycastable
        this.isDecimable                    =isDecimable

        this.objectWorldPosition  = new Vector3()
        this.cameraWorldPosition  = new Vector3()
        this.cameraWorldDirection = new Vector3()
        this.targetWorldPosition  = new Vector3()
        
        this.rotAngle = 0.0
        this._clock    = new Clock()
        
        this._isFetching                       = false
        this._cache               = {
            geometry:     {},
            decimables:   [],
            raycastables: []
        }
        this._updateTimeout                   = 500
        this._repopulateTimeoutId = undefined
        this._debounceRealtimeUpdateTimeoutId = null
        this._debounceUpdateTimeoutId         = null
        this._debounceAutoUpdateTimeoutId     = null
        this._debounceRaycastabilityId        = null
    }
    
    _initScenes ( {
        autoUpdate=      true,
        background=      null,
        castShadow = false,
        children = [],
        environment=      null,
        fog=              null,
        frustumCulled = true,
        matrixAutoUpdate= false,
        name=             'Scene',
        overrideMaterial=      null,
        receiveShadow = false,
        renderOrder = 0,
        userData = {},
        visible = true,
    }={ } ) {

        this.scene = new Scene()
        this.scene.autoUpdate = autoUpdate
        this.scene.background = background
        this.scene.castShadow = castShadow
        this.scene.children = children
        this.scene.environment = environment
        this.scene.fog = fog
        this.scene.frustumCulled = frustumCulled
        this.scene.matrixAutoUpdate = matrixAutoUpdate
        this.scene.name = name
        this.scene.overrideMaterial = overrideMaterial
        this.scene.receiveShadow = receiveShadow
        this.scene.renderOrder = renderOrder
        this.scene.userData = userData
        this.scene.visible = visible

        this.scene.onBeforeRender = this.onBeforeRender
        this.scene.onAfterRender = this.onAfterRender
        
    }
    
    _initCameras ( {
        type=       'PerspectiveCamera',
        options={
            aspect:     1,
            far:        100000000,
            filmGauge:  35.0,
            filmOffset: 0.0,
            focus:      10.0,
            fov:        75,
            near:       0.001,
            view:       null,
            zoom:       1,
        }
    }={ } ) {

        // Factory
        if ( type === 'PerspectiveCamera' ) {

            this.camera = new PerspectiveCamera()

        } else if ( type === 'OrthographicCamera' ) {

            this.camera = new OrthographicCamera()

        } else {

            throw new TypeError( `Unknown camera of type: ${ type }` )

        }

        // Assign parameters
        for ( let optionKey in options ) {
            this.camera[ optionKey ] = options[ optionKey ]
        }

        this.camera.updateProjectionMatrix()

    }
    
    _initRenderers ( {
        canvas=                       undefined,
        context=                      undefined,
        alpha=                        undefined,
        depth=                        undefined,
        stencil=                      undefined,
        antialias=                    true,
        premultipliedAlpha=           undefined,
        preserveDrawingBuffer=        undefined,
        powerPreference=              undefined,
        failIfMajorPerformanceCaveat= undefined,
        // capabilities
        precision=              'highp',
        logarithmicDepthBuffer= true,
        // clearing
        autoClear=        true,
        autoClearColor=   true,
        autoClearDepth=   true,
        autoClearStencil= true,
        // scene graph
        sortObjects= true,
        // user-defined clipping
        clippingPlanes=       [],
        localClippingEnabled= true,
        // physically based shading
        outputEncoding= LinearEncoding,
        // physical lights
        physicallyCorrectLights= false,
        // tone mapping
        toneMapping=           LinearToneMapping,
        toneMappingExposure=   1.0,
        toneMappingWhitePoint= 1.0,
        // morphs
        maxMorphTargets= 8,
        maxMorphNormals= 4,
        // shadowmap
        shadowMap= null,    //WebGLShadowMap
        // xr
        xr=    null, // WebXRManager
        //Extra
        clearColor= '#000000',
        clearAlpha= 1
    }={ } ) {

        this.renderer = new WebGLRenderer( { 
            canvas,
            context, 
            alpha,
            depth,
            stencil,
            antialias,
            premultipliedAlpha,
            preserveDrawingBuffer,
            powerPreference,
            failIfMajorPerformanceCaveat
        } )
        this.renderer.precision = precision
        this.renderer.logarithmicDepthBuffer = logarithmicDepthBuffer
        this.renderer.autoClear = autoClear
        this.renderer.autoClearColor = autoClearColor
        this.renderer.autoClearDepth = autoClearDepth
        this.renderer.autoClearStencil = autoClearStencil
        this.renderer.sortObjects = sortObjects
        this.renderer.clippingPlanes = clippingPlanes
        this.renderer.localClippingEnabled = localClippingEnabled
        this.renderer.outputEncoding = outputEncoding
        this.renderer.physicallyCorrectLights = physicallyCorrectLights
        this.renderer.toneMapping = toneMapping
        this.renderer.toneMappingExposure = toneMappingExposure
        this.renderer.toneMappingWhitePoint = toneMappingWhitePoint
        this.renderer.maxMorphTargets = maxMorphTargets
        this.renderer.maxMorphNormals = maxMorphNormals
        this.renderer.shadowMap = shadowMap
        this.renderer.xr = xr
        this.renderer.setClearColor( clearColor, clearAlpha )
//        this.renderer.setPixelRatio( window.devicePixelRatio )

    }
    
    _initEffects ( {

    }={ } ) {
        
    }
    _initLoaders ( {

    }={ } ) {
        
    }
    _initExporters ( {

    }={ } ) {
        
    }
    _initDatabases ( {

    }={ } ) {
        
    }
    _initRaycasters ( {

    }={ } ) {
        
    }
    _initWorkers ( {

    }={ } ) {
        
    }
    _initAudios ( {

    }={ } ) {
        
    }
    _initControls ( scene, {

    }={ } ) {
        
    }
    _initEnvironments ( scene, {

    }={ } ) {
        
    }
    _initDataModels ( scene, {

    }={ } ) {
        
    }
    _initTools ( scene, {

    }={ } ) {
        
    }


    // Rendering
    startRenderLoop () {

        if ( this.frameId ) {
            return
        }

        this.frameId = requestAnimationFrame( this._renderLoop.bind( this ) )
        this._clock.start()

    }
    _renderLoop () {

        this.frameId = requestAnimationFrame( this._renderLoop.bind( this ) )
        this.render()

    }
    stopRenderLoop () {

        cancelAnimationFrame( this.frameId )
        this.frameId = null
        this._clock.stop()

    }
    onBeforeRender( renderer, scene, camera, renderTarget ) {}
    render () {

        this.renderer.render( this.scene, this.camera )

    }
    onAfterRender(renderer, scene, camera){}
}

export { TApplication }
