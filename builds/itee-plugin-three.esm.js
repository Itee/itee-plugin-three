/**
 * ┳      ┏┓┓    •   ┏┳┓┓           ┓ ┏┓ ┓      ┏┓ ┳┳┓   ┓  ┓  
 * ┃╋┏┓┏┓ ┃┃┃┓┏┏┓┓┏┓  ┃ ┣┓┏┓┏┓┏┓  ┓┏┃ ┣┓ ┃  ━━  ┣ ┏┃┃┃┏┓┏┫┓┏┃┏┓
 * ┻┗┗ ┗ •┣┛┗┗┻┗┫┗┛┗• ┻ ┛┗┛ ┗ ┗   ┗┛┻•┗┛•┻      ┗┛┛┛ ┗┗┛┗┻┗┻┗┗ 
 *              ┛                                              
 * @desc    This itee plugin allow to use three js content from end to end in an itee client-server-database architecture
 * @author  [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * 
 */
import { DefaultLogger } from 'itee-core';
import { Box3, DefaultLoadingManager, FileLoader, Group, BufferGeometry, BufferAttribute, PointsMaterial, Points, Vector3, Shape, EventDispatcher, Object3D, Vector2, Spherical, LineBasicMaterial, MeshBasicMaterial, DoubleSide, Mesh, OctahedronBufferGeometry, Quaternion, EdgesGeometry, LineSegments, Float32BufferAttribute, Line, ArrowHelper, CylinderBufferGeometry, BoxBufferGeometry, PlaneBufferGeometry, ConeBufferGeometry, Plane, Raycaster, Euler, SplineCurve, QuadraticBezierCurve3, QuadraticBezierCurve, Path, LineCurve3, LineCurve, EllipseCurve, CurvePath, Curve, CubicBezierCurve3, CubicBezierCurve, CatmullRomCurve3, ArcCurve, WireframeGeometry, SphereGeometry, TubeGeometry, TorusKnotGeometry, TorusGeometry, TextGeometry, TetrahedronGeometry, ShapeGeometry, RingGeometry, PolyhedronGeometry, PlaneGeometry, ParametricGeometry, OctahedronGeometry, LatheGeometry, IcosahedronGeometry, Geometry, ExtrudeGeometry, DodecahedronGeometry, ConeGeometry, CylinderGeometry, CircleGeometry, BoxGeometry, Face3, InstancedBufferGeometry, SphereBufferGeometry, TubeBufferGeometry, TorusKnotBufferGeometry, TorusBufferGeometry, TextBufferGeometry, TetrahedronBufferGeometry, RingBufferGeometry, PolyhedronBufferGeometry, ParametricBufferGeometry, LatheBufferGeometry, IcosahedronBufferGeometry, ExtrudeBufferGeometry, DodecahedronBufferGeometry, CircleBufferGeometry, TextureLoader, MeshLambertMaterial, MeshPhongMaterial, Color, LinearFilter, ImageLoader, Sprite, LineLoop, LOD, SkinnedMesh, HemisphereLight, SpotLight, RectAreaLight, PointLight, DirectionalLight, AmbientLight, OrthographicCamera, PerspectiveCamera, Scene, Fog, FogExp2, VertexColors } from 'three-full';
import { TBinaryReader, Endianness, Byte, Keys, Mouse, TDataBaseManager } from 'itee-client';
import { toEnum, ringClockwise, ringContainsSome, degreesToRadians } from 'itee-utils';
import { isDefined, isNull, isUndefined, isNotBoolean, isEmptyArray, isNotDefined, isNotArray, isArray, isObject, isNotString, isEmptyString, isBlankString, isString, isNotEmptyString, isNotEmptyArray } from 'itee-validators';

/**
 * @module Loader/ASCLoader
 * @desc A loader for ASC cloud point files.
 *
 * @requires {@link https://github.com/Itee/itee-client itee-client}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @example
 *
 * import { ASCLoader } from 'itee-plugin-three'
 *
 * const loader = new ASCLoader();
 *
 * // If the ASC file need to be offseted, it can be set before loading file.
 * loader.setOffset( {
 *      x: 1.0,
 *      y: 52.0,
 *      z: -5.0
 * } );
 *
 * // Then load the file and get the threejs Point Geometry
 * loader.load('/path/to/file.asc', function (geometry) {
 *
 *      scene.add( new Mesh( geometry ) );
 *
 * } );
 *
 */

/**
 * The ASCLoader class definition.
 * It allow to load and parse an .asc file
 *
 * @class
 */
class ASCLoader {

    /**
     * @constructor
     * @param {LoadingManager} [manager=Itee.Client.DefaultLoadingManager] - A loading manager
     * @param {TLogger} [logger=Itee.Client.DefaultLogger] - A logger for any log/errors output
     */
    constructor ( manager = DefaultLoadingManager, logger = DefaultLogger ) {

        this.manager = manager;
        this.logger  = logger;

        this._boundingBox    = new Box3();
        this._points         = [];
        this._numberOfPoints = 0;
        this._coloredPoints  = false;
        this._autoOffset     = false; // Only for tiny files !!!!!!!
        this._offset         = {
            x: 0,
            y: 0,
            z: 0
        };

        this._positions   = null;
        this._bufferIndex = 0;

        this._positionsC   = null;
        this._bufferIndexC = 0;

        this.wrongPoints = 0;

    }

    /**
     * Will load the file at the given URL then parse it. It will return a Three.Group as onLoad argument.
     *
     * @param {DOMString|URL} url - Path to the file to load
     * @param {callback} onLoad - A success callback
     * @param {callback} onProgress - A progress callback
     * @param {callback} onError - A error callback
     * @param {Number} [sampling=100] - A sampling in percent to apply over file
     */
    load ( url, onLoad, onProgress, onError, sampling ) {

        //        //this.logger.time("ASCLoader")

        const loader = new FileLoader( this.manager );
        loader.setResponseType( 'blob' );
        loader.load( url, function ( blob ) {

            const groupToFeed = new Group();
            this._parse( blob, groupToFeed, onLoad, onProgress, onError, sampling );
            onLoad( groupToFeed );

        }.bind( this ), onProgress, onError );

    }

    /**
     * An alternative setter to offset property
     *
     * @param {Three.Vector3|Object} offset - An global position offset to apply on the point cloud.
     */
    setOffset ( offset ) {

        //TODO: check is correct

        this._offset     = offset;
        this._autoOffset = false;

        //TODO: that allow chaining.

    }

    /**
     *
     * @param blob
     * @param groupToFeed
     * @param onLoad
     * @param onProgress
     * @param onError
     * @param sampling
     * @private
     */
    _parse ( blob, groupToFeed, onLoad, onProgress, onError, sampling ) {

        const self = this;

        const _sampling = ( sampling ) ? sampling : 100;

        const reader     = new FileReader();
        const CHUNK_SIZE = 134217728;
        let offset       = 0;

        reader.onabort = ( abortEvent ) => {

            this.logger.log( 'abortEvent:' );
            this.logger.log( abortEvent );

        };

        reader.onerror = ( errorEvent ) => {

            this.logger.log( 'errorEvent:' );
            this.logger.log( errorEvent );

            if ( onError ) {
                onError( errorEvent );
            }

        };

        reader.onloadstart = ( loadStartEvent ) => {

            this.logger.log( 'loadStartEvent:' );
            this.logger.log( loadStartEvent );

        };

        reader.onprogress = ( progressEvent ) => {

            this.logger.log( 'progressEvent:' );
            this.logger.log( progressEvent );

            // // By lines
            // var lines = this.result.split('\n');
            // for(var lineIndex = 0, numberOfLine = lines.length; lineIndex < numberOfLine; ++lineIndex){
            //     self._parseLine(lines[lineIndex])
            // }

            if ( onProgress ) {
                onProgress( progressEvent );
            }

        };

        reader.onload = ( loadEvent ) => {

            this.logger.log( 'loadEvent:' );
            this.logger.log( loadEvent );

            // By lines
            const lines         = loadEvent.target.result.split( '\n' );
            const numberOfLines = lines.length;

            // /!\ Rollback offset for last line that is uncompleted in most time
            offset -= lines[ numberOfLines - 1 ].length;

            // //this.logger.time("Parse Lines A");
            const modSampling = Math.round( 100 / _sampling );
            for ( let lineIndex = 0 ; lineIndex < numberOfLines - 1 ; lineIndex++ ) {
                if ( lineIndex % modSampling === 0 ) // Just to make cloud lighter under debug !!!!
                {
                    self._parseLine( lines[ lineIndex ] );
                }
            }
            // //this.logger.timeEnd("Parse Lines A");

            // //this.logger.time("Parse Lines B");
            // self._parseLines(lines);
            // //this.logger.timeEnd("Parse Lines B");

            ////Todo: use ArrayBuffer instead !!!
            // //this.logger.time("Parse Lines B");
            // self._bufferIndex = 0;
            // self._positions = new Float32Array( numberOfLines * 3 );
            // for (var lineIndex = 0; lineIndex < numberOfLines - 1; lineIndex++) {
            //     self._parseLineB(lines[ lineIndex ])
            // }
            // //this.logger.timeEnd("Parse Lines B");
            //
            // //this.logger.time("Parse Lines C");
            // self._bufferIndexC = 0;
            // self._positionsC = new Float32Array( numberOfLines * 3 );
            // for (var lineIndex = 0; lineIndex < numberOfLines - 1; lineIndex++) {
            //     self._parseLineB(lines[ lineIndex ])
            // }
            // //this.logger.timeEnd("Parse Lines C");

        };

        reader.onloadend = ( loadEndEvent ) => {

            this.logger.log( 'loadEndEvent' );
            this.logger.log( loadEndEvent );

            if ( this._points.length > 1000000 || offset + CHUNK_SIZE >= blob.size ) {

                // //this.logger.time("Offset Points");
                this._offsetPoints();
                // //this.logger.timeEnd("Offset Points");

                // //this.logger.time("Create WorldCell");
                this._createSubCloudPoint( groupToFeed );
                // //this.logger.timeEnd("Create WorldCell");

            }

            offset += CHUNK_SIZE;
            seek();

        };

        // reader.readAsText(blob);
        seek();

        function seek () {

            if ( offset >= blob.size ) { return }

            const slice = blob.slice( offset, offset + CHUNK_SIZE, 'text/plain' );
            reader.readAsText( slice );

        }

    }

    /**
     *
     * @param line
     * @private
     */
    _parseLine ( line ) {

        const values        = line.split( /\s/g ).filter( Boolean );
        const numberOfWords = values.length;

        if ( numberOfWords === 3 ) { // XYZ

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] )
            } );

        } else if ( numberOfWords === 4 ) { // XYZI

            this._pointsHaveIntensity = true;

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                i: parseFloat( values[ 3 ] )
            } );

        } else if ( numberOfWords === 6 ) { // XYZRGB

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !

            this._pointsHaveColor = true;

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                r: parseFloat( values[ 3 ] ),
                g: parseFloat( values[ 4 ] ),
                b: parseFloat( values[ 5 ] )
            } );

        } else if ( numberOfWords === 7 ) { // XYZIRGB

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !

            this._pointsHaveIntensity = true;
            this._pointsHaveColor     = true;

            this._points.push( {
                x: parseFloat( values[ 0 ] ),
                y: parseFloat( values[ 1 ] ),
                z: parseFloat( values[ 2 ] ),
                i: parseFloat( values[ 3 ] ),
                r: parseFloat( values[ 4 ] ),
                g: parseFloat( values[ 5 ] ),
                b: parseFloat( values[ 6 ] )
            } );

        } else if ( numberOfWords === 9 ) {

            this._pointsHaveColor   = true;
            this._pointsHaveNormals = true;

            this._points.push( {
                x:  parseFloat( values[ 0 ] ),
                y:  parseFloat( values[ 1 ] ),
                z:  parseFloat( values[ 2 ] ),
                r:  parseFloat( values[ 3 ] ),
                g:  parseFloat( values[ 4 ] ),
                b:  parseFloat( values[ 5 ] ),
                nx: parseFloat( values[ 6 ] ),
                ny: parseFloat( values[ 7 ] ),
                nz: parseFloat( values[ 8 ] )
            } );

        } else if ( numberOfWords === 10 ) {

            this._pointsHaveIntensity = true;
            this._pointsHaveColor     = true;
            this._pointsHaveNormals   = true;

            this._points.push( {
                x:  parseFloat( values[ 0 ] ),
                y:  parseFloat( values[ 1 ] ),
                z:  parseFloat( values[ 2 ] ),
                i:  parseFloat( values[ 3 ] ),
                r:  parseFloat( values[ 4 ] ),
                g:  parseFloat( values[ 5 ] ),
                b:  parseFloat( values[ 6 ] ),
                nx: parseFloat( values[ 7 ] ),
                ny: parseFloat( values[ 8 ] ),
                nz: parseFloat( values[ 9 ] )
            } );

        } else {
            this.logger.error( `Invalid data line: ${ line }` );
        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLines ( lines ) {

        const firstLine = lines[ 0 ].split( /\s/g ).filter( Boolean );
        const pointType = firstLine.length;

        if ( pointType === 3 ) {

            this._parseLinesAsXYZ( lines );

        } else if ( pointType === 4 ) {

            this._parseLinesAsXYZI( lines );

        } else if ( pointType === 6 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals
            //Todo: for the moment consider it is color !
            this._parseLinesAsXYZRGB( lines );

        } else if ( pointType === 7 ) {

            //Todo: allow to ask user if 4, 5 and 6 index are normals see _parseLinesAsXYZInXnYnZ
            //Todo: for the moment consider it is color !
            this._parseLinesAsXYZIRGB( lines );

        } else if ( pointType === 9 ) {

            this._parseLinesAsXYZRGBnXnYnZ( lines );

        } else if ( pointType === 10 ) {

            this._parseLinesAsXYZIRGBnXnYnZ( lines );

        } else {
            this.logger.error( `Invalid data line: ${ lines }` );
        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZ ( lines ) {

        let words = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] )
            } );
        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZI ( lines ) {

        this._pointsHaveIntensity = true;
        let words                 = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                i: parseFloat( words[ 3 ] )
            } );

        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZRGB ( lines ) {

        this._pointsHaveColor = true;
        let words             = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                r: parseFloat( words[ 3 ] ),
                g: parseFloat( words[ 4 ] ),
                b: parseFloat( words[ 5 ] )
            } );

        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZnXnYnZ ( lines ) {

        let words = [];
        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                nx: parseFloat( words[ 7 ] ),
                ny: parseFloat( words[ 8 ] ),
                nz: parseFloat( words[ 9 ] )
            } );

        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZIRGB ( lines ) {

        this._pointsHaveIntensity = true;
        this._pointsHaveColor     = true;
        let words                 = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x: parseFloat( words[ 0 ] ),
                y: parseFloat( words[ 1 ] ),
                z: parseFloat( words[ 2 ] ),
                i: parseFloat( words[ 3 ] ),
                r: parseFloat( words[ 4 ] ),
                g: parseFloat( words[ 5 ] ),
                b: parseFloat( words[ 6 ] )
            } );
        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZInXnYnZ ( lines ) {

        let words = [];
        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                i:  parseFloat( words[ 3 ] ),
                nx: parseFloat( words[ 7 ] ),
                ny: parseFloat( words[ 8 ] ),
                nz: parseFloat( words[ 9 ] )
            } );

        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZRGBnXnYnZ ( lines ) {

        this._pointsHaveColor   = true;
        this._pointsHaveNormals = true;
        let words               = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                r:  parseFloat( words[ 3 ] ),
                g:  parseFloat( words[ 4 ] ),
                b:  parseFloat( words[ 5 ] ),
                nx: parseFloat( words[ 6 ] ),
                ny: parseFloat( words[ 7 ] ),
                nz: parseFloat( words[ 8 ] )
            } );

        }

    }

    /**
     *
     * @param lines
     * @private
     */
    _parseLinesAsXYZIRGBnXnYnZ ( lines ) {

        this._pointsHaveIntensity = true;
        this._pointsHaveColor     = true;
        this._pointsHaveNormals   = true;
        let words                 = [];

        for ( let lineIndex = 0, numberOfLines = lines.length ; lineIndex < numberOfLines ; lineIndex++ ) {

            words = lines[ lineIndex ].split( /\s/g ).filter( Boolean );

            this._points.push( {
                x:  parseFloat( words[ 0 ] ),
                y:  parseFloat( words[ 1 ] ),
                z:  parseFloat( words[ 2 ] ),
                i:  parseFloat( words[ 3 ] ),
                r:  parseFloat( words[ 4 ] ),
                g:  parseFloat( words[ 5 ] ),
                b:  parseFloat( words[ 6 ] ),
                nx: parseFloat( words[ 7 ] ),
                ny: parseFloat( words[ 8 ] ),
                nz: parseFloat( words[ 9 ] )
            } );

        }
    }

    /**
     *
     * @param line
     * @private
     */
    _parseLineB ( line ) {

        const values        = line.split( /\s/g ).filter( Boolean );
        const numberOfWords = values.length;
        const bufferIndex   = this._bufferIndex;

        if ( numberOfWords === 3 ) {

            // positions
            this._positions[ bufferIndex ]     = parseFloat( values[ 0 ] );
            this._positions[ bufferIndex + 1 ] = parseFloat( values[ 1 ] );
            this._positions[ bufferIndex + 2 ] = parseFloat( values[ 2 ] );

            this._bufferIndex += 3;

        }

    }

    /**
     *
     * @param line
     * @private
     */
    _parseLineC ( line ) {

        const values        = line.split( /\s/g ).filter( Boolean );
        const numberOfWords = values.length;
        const bufferIndex   = this._bufferIndexC;

        if ( numberOfWords === 3 ) {

            // positions
            this._positionsC[ bufferIndex ]     = Number.parseFloat( values[ 0 ] );
            this._positionsC[ bufferIndex + 1 ] = Number.parseFloat( values[ 1 ] );
            this._positionsC[ bufferIndex + 2 ] = Number.parseFloat( values[ 2 ] );

            this._bufferIndexC += 3;

        }

    }

    /**
     *
     * @private
     */
    _offsetPoints () {

        // Compute bounding box in view to get his center for auto offseting the cloud point.
        if ( this._autoOffset ) {
            //this.logger.time("Compute Points");
            this._boundingBox.setFromPoints( this._points );
            this.setOffset( this._boundingBox.getCenter() );
            //this.logger.timeEnd("Compute Points");
        }

        const offsetX = this._offset.x;
        const offsetY = this._offset.y;
        const offsetZ = this._offset.z;
        let point     = null;
        for ( let i = 0, numberOfPoints = this._points.length ; i < numberOfPoints ; ++i ) {

            point = this._points[ i ];
            point.x -= offsetX;
            point.y -= offsetY;
            point.z -= offsetZ;

        }

    }

    /**
     *
     * @param groupToFeed
     * @private
     */
    _createCloudPoint ( groupToFeed ) {

        const SPLIT_LIMIT        = 1000000;
        // var group = new Group();
        const numberOfPoints     = this._points.length;
        const numberOfSplit      = Math.ceil( numberOfPoints / SPLIT_LIMIT );
        let splice               = null;
        let numberOfPointInSplit = 0;
        let cloud                = null;

        for ( let splitIndex = 0 ; splitIndex < numberOfSplit ; ++splitIndex ) {

            splice               = this._points.splice( 0, SPLIT_LIMIT );
            numberOfPointInSplit = splice.length;

            const geometry  = new BufferGeometry();
            const positions = new Float32Array( numberOfPointInSplit * 3 );
            const colors    = new Float32Array( numberOfPointInSplit * 3 );
            let bufferIndex = 0;
            let point       = null;

            for ( let i = 0 ; i < numberOfPointInSplit ; ++i ) {

                // current point
                point = splice[ i ];

                // positions
                positions[ bufferIndex ]     = point.x;
                positions[ bufferIndex + 1 ] = point.y;
                positions[ bufferIndex + 2 ] = point.z;

                // colors
                if ( this._pointsHaveColor ) {
                    colors[ bufferIndex ]     = point.r / 255;
                    colors[ bufferIndex + 1 ] = point.g / 255;
                    colors[ bufferIndex + 2 ] = point.b / 255;
                } else {
                    colors[ bufferIndex ]     = 0.1;
                    colors[ bufferIndex + 1 ] = 0.2;
                    colors[ bufferIndex + 2 ] = 0.5;
                }

                bufferIndex += 3;

            }

            geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) );

            const material = new PointsMaterial( {
                size:         0.01,
                vertexColors: true
            } );

            cloud = new Points( geometry, material );
            groupToFeed.children.push( cloud );
            // group.children.push(cloud);
        }

        // return group;

    }

    /**
     *
     * @param group
     * @private
     */
    _createSubCloudPoint ( group ) {

        const numberOfPoints = this._points.length;
        const geometry       = new BufferGeometry();
        const positions      = new Float32Array( numberOfPoints * 3 );
        const colors         = new Float32Array( numberOfPoints * 3 );
        let bufferIndex      = 0;
        let point            = null;

        for ( let i = 0 ; i < numberOfPoints ; ++i ) {

            // current point
            point = this._points[ i ];

            // positions
            positions[ bufferIndex ]     = point.x;
            positions[ bufferIndex + 1 ] = point.y;
            positions[ bufferIndex + 2 ] = point.z;

            // colors
            if ( this._pointsHaveColor ) {
                colors[ bufferIndex ]     = point.r / 255;
                colors[ bufferIndex + 1 ] = point.g / 255;
                colors[ bufferIndex + 2 ] = point.b / 255;
            } else {
                colors[ bufferIndex ]     = 0.1;
                colors[ bufferIndex + 1 ] = 0.2;
                colors[ bufferIndex + 2 ] = 0.5;
            }

            bufferIndex += 3;

        }

        geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
        geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) );

        const material = new PointsMaterial( {
            size:         0.005,
            vertexColors: true
        } );

        const cloud = new Points( geometry, material );

        //Todo: Apply import coordinates syteme here !
        cloud.rotation.x -= Math.PI / 2;

        group.children.push( cloud );

        // Clear current processed points
        this._points = [];

    }

}

/**
 * @module Loader/DBFLoader
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * From:
 * https://www.clicketyclick.dk/databases/xbase/format/db2_dbf.html#DBII_DBF_STRUCT
 * http://web.archive.org/web/20150323061445/http://ulisse.elettra.trieste.it/services/doc/dbase/DBFstruct.htm
 * http://www.dbase.com/Knowledgebase/INT/db7_file_fmt.htm
 *
 *
 */

/**
 *
 * @type {Object}
 */
const DBFVersion = /*#__PURE__*/toEnum( {
    FoxPro:               0x30,
    FoxPro_Autoincrement: 0x31,

    dBASE_II:   0x02,
    FoxPro_Var: 0x32,

    dBASE_III_plus:          0x03,
    dBASE_III_plus_memo:     0x83,
    dBASE_IV_SQL_table:      0x43,
    dBASE_IV_SQL_system:     0x63,
    dBASE_IV_memo:           0x8B,
    dBASE_IV_memo_SQL_table: 0xCB,
    FoxBase:                 0xFB,

    dBase_v_7: 4,

    FoxPro_2_x:    0xF5,
    HiPerSix_memo: 0xE5
} );

/**
 *
 * @type {Object}
 */
const DataType = /*#__PURE__*/toEnum( {
    Binary:        'B',
    Character:     'C',
    Date:          'D',
    Numeric:       'N',
    Logical:       'L',
    Memo:          'M',
    Timestamp:     '@',
    Long:          'I',
    Autoincrement: '+',
    Float:         'F',
    Double:        'O',
    OLE:           'G'
} );

/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class DBFLoader {

    //    static Terminator    = 0x0D
    //    static DeletedRecord = 0x1A
    //    static YearOffset    = 1900

    /**
     *
     * @param manager
     * @param logger
     * @constructor
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                manager: DefaultLoadingManager,
                logger:  DefaultLogger,
                reader:  new TBinaryReader()
            }, ...parameters
        };

        this.manager = _parameters.manager;
        this.logger  = _parameters.logger;
        this.reader  = _parameters.reader;

    }

    get manager () {
        return this._manager
    }

    set manager ( value ) {
        this._manager = value;
    }

    get logger () {
        return this._logger
    }

    set logger ( value ) {
        this._logger = value;
    }

    get reader () {
        return this._reader
    }

    set reader ( value ) {
        this._reader = value;
    }

    setManager ( value ) {
        this.manager = value;
        return this
    }

    setLogger ( value ) {
        this.logger = value;
        return this
    }

    setReader ( value ) {
        this.reader = value;
        return this
    }

    /**
     *
     * @param url
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    load ( url, onLoad, onProgress, onError ) {

        const scope = this;

        const loader = new FileLoader( scope.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, arrayBuffer => {

            onLoad( scope.parse( arrayBuffer ) );

        }, onProgress, onError );

    }

    /**
     *
     * @param arrayBuffer
     * @return {*}
     */
    parse ( arrayBuffer ) {

        this.reader
            .setEndianess( Endianness.Big )
            .setBuffer( arrayBuffer );

        const version = this.reader.getInt8();
        if ( !this._isValidVersion( version ) ) {
            this.logger.error( `DBFLoader: Invalid version number: ${ version }` );
            return null
        }

        const header = this._parseHeader( version );
        const datas  = this._parseDatas( version, header );

        return {
            header,
            datas
        }

    }

    /**
     *
     * @param version
     * @return {boolean}
     * @private
     */
    _isValidVersion ( version ) {

        return DBFVersion.includes( version )

    }

    /**
     *
     * @param version
     * @return {{}}
     * @private
     */
    _parseHeader ( version ) {

        let header = {};

        switch ( version ) {

            case DBFVersion.FoxPro:
            case DBFVersion.FoxPro_Autoincrement:
            case DBFVersion.FoxPro_Var:
            case DBFVersion.dBASE_II:
                header = this._parseHeaderV2();
                break

            case DBFVersion.dBASE_III_plus:
            case DBFVersion.dBASE_III_plus_memo:
                header = this._parseHeaderV2_5();
                break

            case DBFVersion.dBASE_IV_memo:
            case DBFVersion.dBASE_IV_memo_SQL_table:
            case DBFVersion.dBASE_IV_SQL_system:
            case DBFVersion.dBASE_IV_SQL_table:
                header = this._parseHeaderV3();
                break

            case DBFVersion.dBase_v_7:
            case DBFVersion.FoxPro_2_x:
            case DBFVersion.HiPerSix_memo:
                header = this._parseHeaderV4();
                break

            default:
                throw new RangeError( `Invalid version parameter: ${ version }` )

        }

        // Check terminator
        if ( this.reader.getUint8() !== DBFLoader.Terminator ) {
            this.logger.error( 'DBFLoader: Invalid terminator after field descriptors !!!' );
        }

        return header

    }

    /**
     *
     * @return {{numberOfRecords, year: *, month: (*|number), day: (*|number), lengthOfEachRecords, fields: Array}}
     * @private
     */
    _parseHeaderV2 () {

        const numberOfRecords     = this.reader.getInt16();
        const year                = this.reader.getInt8() + DBFLoader.YearOffset;
        const month               = this.reader.getInt8();
        const day                 = this.reader.getInt8();
        const lengthOfEachRecords = this.reader.getInt16();

        // Field descriptor array
        let fields        = [];
        let name          = undefined;
        let type          = undefined;
        let length        = undefined;
        let memoryAddress = undefined;
        let decimalCount  = undefined;
        for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name          = this.reader.getString( 11 );
            type          = this.reader.getChar();
            length        = this.reader.getUint8();
            memoryAddress = this.reader.getInt16();
            decimalCount  = this.reader.getInt8();

            fields.push( {
                name,
                type,
                length,
                memoryAddress,
                decimalCount
            } );

        }

        return {
            numberOfRecords,
            year,
            month,
            day,
            lengthOfEachRecords,
            fields
        }

    }

    /**
     *
     * @return {{year: *, month: (*|number), day: (*|number), numberOfRecords, numberOfByteInHeader, numberOfByteInRecord, fields: Array}}
     * @private
     */
    _parseHeaderV2_5 () {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();

        this.reader.setEndianess( Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( Endianness.Big );
        this.reader.skipOffsetOf( 3 + 13 + 4 ); // Reserved

        // Field descriptor array
        let fields        = [];
        let name          = undefined;
        let type          = undefined;
        let length        = undefined;
        let memoryAddress = undefined;
        let decimalCount  = undefined;
        let workAreaId    = undefined;
        let MDXFlag       = undefined;
        for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name          = this.reader.getString( 11 );
            type          = this.reader.getChar();
            memoryAddress = this.reader.getInt32();
            length        = this.reader.getUint8();
            decimalCount  = this.reader.getUint8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            workAreaId = this.reader.getInt8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            MDXFlag = this.reader.getInt8();
            this.reader.skipOffsetOf( 1 ); // Reserved

            fields.push( {
                name,
                type,
                length,
                memoryAddress,
                decimalCount,
                workAreaId,
                MDXFlag
            } );

        }

        return {
            year,
            month,
            day,
            numberOfRecords,
            numberOfByteInHeader,
            numberOfByteInRecord,
            fields
        }

    }

    /**
     *
     * @return {{year: *, month: (*|number), day: (*|number), numberOfRecords, numberOfByteInHeader, numberOfByteInRecord, incompleteTransactionFlag: (*|number), encryptionFlag: (*|number), MDXFlag:
     *     (*|number), languageDriverId: (*|number), fields: Array}}
     * @private
     */
    _parseHeaderV3 () {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();
        this.reader.setEndianess( Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( Endianness.Big );
        this.reader.skipOffsetOf( 2 ); // Reserved
        const incompleteTransactionFlag = this.reader.getInt8();
        const encryptionFlag            = this.reader.getInt8();
        this.reader.skipOffsetOf( 12 ); // Reserved multi-users
        const MDXFlag          = this.reader.getInt8();
        const languageDriverId = this.reader.getInt8();
        this.reader.skipOffsetOf( 2 ); // Reserved

        // Field descriptor array
        let fields       = [];
        let name         = undefined;
        let type         = undefined;
        let length       = undefined;
        let decimalCount = undefined;
        let workAreaId   = undefined;
        let MDXFieldFlag = undefined;
        while ( this.reader.getOffset() < numberOfByteInHeader - 1 ) {
            //                for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name = this.reader.getString( 11 );
            type = this.reader.getChar();
            this.reader.skipOffsetOf( 4 ); // Reserved
            length       = this.reader.getUint8();
            decimalCount = this.reader.getUint8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            workAreaId = this.reader.getInt8();
            this.reader.skipOffsetOf( 10 ); // Reserved
            MDXFieldFlag = this.reader.getInt8();

            fields.push( {
                name,
                type,
                length,
                decimalCount,
                workAreaId,
                MDXFieldFlag
            } );

        }

        return {
            year,
            month,
            day,
            numberOfRecords,
            numberOfByteInHeader,
            numberOfByteInRecord,
            incompleteTransactionFlag,
            encryptionFlag,
            MDXFlag,
            languageDriverId,
            fields
        }

    }

    /**
     *
     * @return {{year: *, month: (*|number), day: (*|number), numberOfRecords, numberOfByteInHeader, numberOfByteInRecord, incompleteTransactionFlag: (*|number), encryptionFlag: (*|number), MDXFlag:
     *     (*|number), languageDriverId: (*|number), languageDriverName, fields: Array}}
     * @private
     */
    _parseHeaderV4 () {

        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
        const month = this.reader.getInt8();
        const day   = this.reader.getInt8();
        this.reader.setEndianess( Endianness.Little );
        const numberOfRecords      = this.reader.getInt32();
        const numberOfByteInHeader = this.reader.getInt16();
        const numberOfByteInRecord = this.reader.getInt16();
        this.reader.setEndianess( Endianness.Big );
        this.reader.skipOffsetOf( 2 ); // Reserved
        const incompleteTransactionFlag = this.reader.getInt8();
        const encryptionFlag            = this.reader.getInt8();
        this.reader.skipOffsetOf( 12 ); // Reserved multi-users
        const MDXFlag          = this.reader.getInt8();
        const languageDriverId = this.reader.getInt8();
        this.reader.skipOffsetOf( 2 ); // Reserved
        const languageDriverName = this.reader.getString( 32 );
        this.reader.skipOffsetOf( 4 ); // Reserved

        // Field descriptor array
        let fields                 = [];
        let name                   = undefined;
        let type                   = undefined;
        let length                 = undefined;
        let decimalCount           = undefined;
        let MDXFieldFlag           = undefined;
        let nextAutoincrementValue = undefined;
        for ( let fieldIndex = 0 ; fieldIndex < numberOfRecords ; fieldIndex++ ) {

            name         = this.reader.getString( 32 );
            type         = this.reader.getChar();
            length       = this.reader.getUint8();
            decimalCount = this.reader.getUint8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            MDXFieldFlag = this.reader.getInt8();
            this.reader.skipOffsetOf( 2 ); // Reserved
            nextAutoincrementValue = this.reader.getInt32();
            this.reader.skipOffsetOf( 4 ); // Reserved

            fields.push( {
                name,
                type,
                length,
                decimalCount,
                MDXFieldFlag,
                nextAutoincrementValue
            } );

        }

        return {
            year,
            month,
            day,
            numberOfRecords,
            numberOfByteInHeader,
            numberOfByteInRecord,
            incompleteTransactionFlag,
            encryptionFlag,
            MDXFlag,
            languageDriverId,
            languageDriverName,
            fields
        }

    }

    /**
     *
     * @param version
     * @param header
     * @return {Array}
     * @private
     */
    _parseDatas ( version, header ) {

        const numberOfRecords = header.numberOfRecords;
        const fields          = header.fields;

        // Todo: use it
        //        let properties = null
        //        if ( version === DBFVersion.dBase_v_7 ) {
        //            properties = this._parseFieldProperties()
        //        }

        let records = [];
        let record  = null;
        let field   = null;
        for ( let recordIndex = 0 ; recordIndex < numberOfRecords ; recordIndex++ ) {

            record              = {};
            record[ 'deleted' ] = ( this.reader.getUint8() === DBFLoader.DeletedRecord );

            for ( let fieldIndex = 0, numberOfFields = fields.length ; fieldIndex < numberOfFields ; fieldIndex++ ) {

                field = fields[ fieldIndex ];

                switch ( field.type ) {

                    case DataType.Binary: {
                        const binaryString   = this.reader.getString( field.length );
                        record[ field.name ] = parseInt( binaryString );
                    }
                        break

                    case DataType.Numeric: {
                        const numericString  = this.reader.getString( field.length );
                        record[ field.name ] = parseInt( numericString );
                    }
                        break

                    case DataType.Character: {
                        record[ field.name ] = this.reader.getString( field.length );
                    }
                        break

                    case DataType.Date: {
                        // YYYYMMDD
                        record[ field.name ] = this.reader.getString( field.length );
                    }
                        break

                    case DataType.Logical: {
                        const logical = this.reader.getChar().toLowerCase();
                        if ( logical === 't' || logical === 'y' ) {
                            record[ field.name ] = true;
                        } else if ( logical === 'f' || logical === 'n' ) {
                            record[ field.name ] = false;
                        } else {
                            record[ field.name ] = null;
                        }
                    }
                        break

                    case DataType.Memo: {
                        record[ field.name ] = this.reader.getString( field.length );
                    }
                        break

                    // 8 bytes - two longs, first for date, second for time.
                    // The date is the number of days since  01/01/4713 BC.
                    // Time is hours * 3600000L + minutes * 60000L + Seconds * 1000L
                    case DataType.Timestamp:
                        break

                    // 4 bytes. Leftmost bit used to indicate sign, 0 negative.
                    case DataType.Long: {
                        record[ field.name ] = this.reader.getInt32();
                    }
                        break

                    // Same as a Long
                    case DataType.Autoincrement: {
                        record[ field.name ] = this.reader.getInt32();
                    }
                        break

                    case DataType.Float: {
                        const floatString    = this.reader.getString( field.length );
                        record[ field.name ] = parseInt( floatString );
                    }
                        break

                    case DataType.Double: {
                        record[ field.name ] = this.reader.getFloat64();
                    }
                        break

                    case DataType.OLE: {
                        record[ field.name ] = this.reader.getString( field.length );
                    }
                        break

                    default:
                        throw new RangeError( `Invalid data type parameter: ${ field.type }` )

                }

            }

            records.push( record );

        }

        return records

    }

    /**
     *
     * @return {{numberOfStandardProperties, startOfStandardPropertiesDescriptor, numberOfCustomProperties, startOfCustomPropertiesDescriptor, numberOfReferentialIntegrityProperties,
     *     startOfReferentialIntegrityDescriptor, startOfData, sizeOfPropertiesStructure, standardProperties: Array, customProperties: Array, referentialIntegrityProperties: Array}}
     * @private
     */
    _parseFieldProperties () {

        const numberOfStandardProperties             = this.reader.getInt16();
        const startOfStandardPropertiesDescriptor    = this.reader.getInt16();
        const numberOfCustomProperties               = this.reader.getInt16();
        const startOfCustomPropertiesDescriptor      = this.reader.getInt16();
        const numberOfReferentialIntegrityProperties = this.reader.getInt16();
        const startOfReferentialIntegrityDescriptor  = this.reader.getInt16();
        const startOfData                            = this.reader.getInt16();
        const sizeOfPropertiesStructure              = this.reader.getInt16();

        let standardProperties = [];
        for ( let standardIndex = 0 ; standardIndex < numberOfStandardProperties ; standardIndex++ ) {
            standardProperties.push( this._getStandardProperties() );
        }

        let customProperties = [];
        for ( let customIndex = 0 ; customIndex < numberOfCustomProperties ; customIndex++ ) {
            customProperties.push( this._getCustomProperties() );
        }

        let referentialIntegrityProperties = [];
        for ( let referentialIntegrityIndex = 0 ; referentialIntegrityIndex < numberOfReferentialIntegrityProperties ; referentialIntegrityIndex++ ) {
            referentialIntegrityProperties.push( this._getReferentialIntegrityProperties() );
        }

        return {
            numberOfStandardProperties,
            startOfStandardPropertiesDescriptor,
            numberOfCustomProperties,
            startOfCustomPropertiesDescriptor,
            numberOfReferentialIntegrityProperties,
            startOfReferentialIntegrityDescriptor,
            startOfData,
            sizeOfPropertiesStructure,
            standardProperties,
            customProperties,
            referentialIntegrityProperties
        }

    }

    /**
     *
     * @return {{generationalNumber, tableFieldOffset, propertyDescribed: (*|number), type: (*|number), isConstraint: (*|number), offsetFromStart, widthOfDatabaseField}}
     * @private
     */
    _getStandardProperties () {

        const generationalNumber = this.reader.getInt16();
        const tableFieldOffset   = this.reader.getInt16();
        const propertyDescribed  = this.reader.getInt8();
        const type               = this.reader.getInt8();
        const isConstraint       = this.reader.getInt8();
        this.reader.skipOffsetOf( 4 ); // Reserved
        const offsetFromStart      = this.reader.getInt16();
        const widthOfDatabaseField = this.reader.getInt16();

        return {
            generationalNumber,
            tableFieldOffset,
            propertyDescribed,
            type,
            isConstraint,
            offsetFromStart,
            widthOfDatabaseField
        }

    }

    /**
     *
     * @return {{generationalNumber, tableFieldOffset, type: (*|number), offsetFromStartOfName, lengthOfName, offsetFromStartOfData, lengthOfData}}
     * @private
     */
    _getCustomProperties () {

        const generationalNumber = this.reader.getInt16();
        const tableFieldOffset   = this.reader.getInt16();
        const type               = this.reader.getInt8();
        this.reader.skipOffsetOf( 1 ); // Reserved
        const offsetFromStartOfName = this.reader.getInt16();
        const lengthOfName          = this.reader.getInt16();
        const offsetFromStartOfData = this.reader.getInt16();
        const lengthOfData          = this.reader.getInt16();

        return {
            generationalNumber,
            tableFieldOffset,
            type,
            offsetFromStartOfName,
            lengthOfName,
            offsetFromStartOfData,
            lengthOfData
        }

    }

    /**
     *
     * @return {{databaseState: (*|number), sequentialNumberRule, offsetOfTheRIRuleName, sizeOfTheRIRuleName, offsetOfNameOfForeignTable, sizeOfNameOfForeignTable, stateBehaviour: (*|number),
     *     numberOfFieldsInLinkingKey, offsetOfLocalTableTagName, sizeOfTheLocalTableTagName, offsetOfForeignTableTagName, sizeOfTheForeignTableTagName}}
     * @private
     */
    _getReferentialIntegrityProperties () {

        const databaseState                = this.reader.getInt8();
        const sequentialNumberRule         = this.reader.getInt16();
        const offsetOfTheRIRuleName        = this.reader.getInt16();
        const sizeOfTheRIRuleName          = this.reader.getInt16();
        const offsetOfNameOfForeignTable   = this.reader.getInt16();
        const sizeOfNameOfForeignTable     = this.reader.getInt16();
        const stateBehaviour               = this.reader.getInt8();
        const numberOfFieldsInLinkingKey   = this.reader.getInt16();
        const offsetOfLocalTableTagName    = this.reader.getInt16();
        const sizeOfTheLocalTableTagName   = this.reader.getInt16();
        const offsetOfForeignTableTagName  = this.reader.getInt16();
        const sizeOfTheForeignTableTagName = this.reader.getInt16();

        return {
            databaseState,
            sequentialNumberRule,
            offsetOfTheRIRuleName,
            sizeOfTheRIRuleName,
            offsetOfNameOfForeignTable,
            sizeOfNameOfForeignTable,
            stateBehaviour,
            numberOfFieldsInLinkingKey,
            offsetOfLocalTableTagName,
            sizeOfTheLocalTableTagName,
            offsetOfForeignTableTagName,
            sizeOfTheForeignTableTagName
        }

    }

}

DBFLoader.Terminator    = 0x0D;
DBFLoader.DeletedRecord = 0x1A;
DBFLoader.YearOffset    = 1900;

/**
 * @module Loader/LASLoader
 * @desc A loader for ASC cloud point files.
 *
 * @requires {@link https://github.com/Itee/itee-client itee-client}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @example
 *
 * import { LASLoader } from 'itee-plugin-three'
 *
 * const loader = new LASLoader();
 *
 * // If the ASC file need to be offseted, it can be set before loading file.
 * loader.setOffset( {
 *      x: 1.0,
 *      y: 52.0,
 *      z: -5.0
 * } );
 *
 * // Then load the file and get the threejs Point Geometry
 * loader.load('/path/to/file.asc', function (geometry) {
 *
 *      scene.add( new Mesh( geometry ) );
 *
 * } );
 *
 */
//import { BufferAttribute }       from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }        from 'three-full/sources/core/BufferGeometry'
//import { FileLoader }            from 'three-full/sources/loaders/FileLoader'
//import { Box3 }                  from 'three-full/sources/math/Box3'
//import { DefaultLoadingManager } from 'three-full/sources/loaders/LoadingManager'
//import { PointsMaterial }        from 'three-full/sources/materials/PointsMaterial'
//import { Group }                 from 'three-full/sources/objects/Group'
//import { Points }                from 'three-full/sources/objects/Points'

/////////////

const NullCharRegex = /*#__PURE__*/new RegExp( '\0', 'g' ); // eslint-disable-line no-control-regex

const PointClasses = /*#__PURE__*/toEnum( {
    Created:          0,
    Unclassified:     1,
    Ground:           2,
    LowVegetation:    3,
    MediumVegetation: 4,
    HighVegetation:   5,
    Building:         6,
    LowPoint:         7,
    ModelKeyPoint:    8,
    Water:            9,
    OverlapPoints:    12
} );

/**
 * The LASLoader class definition.
 * It allow to load and parse an .asc file
 *
 * @class
 */
class LASLoader {

    /**
     * @constructor
     * @param {LoadingManager} [manager=Itee.Client.DefaultLoadingManager] - A loading manager
     * @param {TLogger} [logger=Itee.Client.DefaultLogger] - A logger for any log/errors output
     */
    constructor ( manager = DefaultLoadingManager, logger = DefaultLogger ) {

        this.manager = manager;
        this.logger  = logger;

        this._reader         = new TBinaryReader();
        this._fullVersion    = '';
        this._boundingBox    = new Box3();
        this._points         = [];
        this._numberOfPoints = 0;
        this._coloredPoints  = false;
        this._autoOffset     = false; // Only for tiny files !!!!!!!
        this._offset         = {
            x: 0,
            y: 0,
            z: 0
        };

        // Converter
        this.colorForPointClass = {
            Created: {
                r: 255,
                g: 255,
                b: 255
            },
            Unclassified: {
                r: 60,
                g: 60,
                b: 60
            },
            Ground: {
                r: 125,
                g: 95,
                b: 5
            },
            LowVegetation: {
                r: 153,
                g: 212,
                b: 36
            },
            MediumVegetation: {
                r: 52,
                g: 148,
                b: 25
            },
            HighVegetation: {
                r: 27,
                g: 77,
                b: 13
            },
            Building: {
                r: 153,
                g: 138,
                b: 95
            },
            LowPoint: {
                r: 200,
                g: 200,
                b: 200
            },
            ModelKeyPoint: {
                r: 237,
                g: 31,
                b: 31
            },
            Water: {
                r: 31,
                g: 186,
                b: 237
            },
            OverlapPoints: {
                r: 0,
                g: 0,
                b: 0
            }
        };
    }

    /**
     * Will load the file at the given URL then parse it. It will return a Three.Group as onLoad argument.
     *
     * @param {DOMString|URL} url - Path to the file to load
     * @param {callback} onLoad - A success callback
     * @param {callback} onProgress - A progress callback
     * @param {callback} onError - A error callback
     * @param {Number} [sampling=100] - A sampling in percent to apply over file
     */
    load ( url, onLoad, onProgress, onError, sampling ) {

        //this.logger.time("LASLoader")

        const loader = new FileLoader( this.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, ( arraybuffer ) => {

            this.parse( arraybuffer, onLoad, onProgress, onError, sampling );

        }, onProgress, onError );

    }

    /**
     * An alternative setter to offset property
     *
     * @param {Three.Vector3|Object} offset - An global position offset to apply on the point cloud.
     */
    setOffset ( offset ) {

        //TODO: check is correct

        this._offset     = offset;
        this._autoOffset = false;

        //TODO: that allow chaining.

    }

    /**
     *
     * @param arraybuffer
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    parse ( arraybuffer, onLoad, onProgress, onError ) {

        try {

            this._reader.buffer = arraybuffer;

            const fileSignature = this._reader.getString( 4, false );
            if ( fileSignature !== 'LASF' ) { throw new Error( 'Invalid las file signature. Abort parsing !' ) }

            // Extract version then reset reader cursor position to start
            this._reader.skipOffsetOf( 24 );
            const majorVersion = this._reader.getUint8();
            const minorVersion = this._reader.getUint8();
            this._reader.skipOffsetTo( 0 );

            const lasVersion = `${ majorVersion }.${ minorVersion }`;

            const header                = this._parseHeader( lasVersion );
            const variableLengthRecords = this._parseVariableLengthRecords( header );
            const pointDataRecords      = this._parsePointDataRecords( header, onProgress );

            this.convert( {
                Header:                header,
                VariableLengthRecords: variableLengthRecords,
                PointDataRecords:      pointDataRecords
            }, onLoad, onProgress, onError );

        } catch ( error ) {

            onError( error );

        }

    }

    // Header

    _parseHeader ( lasVersion ) {

        switch ( lasVersion ) {
            case '1.0':
                return this._parseHeader_1_0()
            case '1.1':
                return this._parseHeader_1_1()
            case '1.2':
                return this._parseHeader_1_2()
            case '1.3':
                return this._parseHeader_1_3()
            case '1.4':
                return this._parseHeader_1_4()

            default:
                throw new Error( `Insupported LAS file version: ${ lasVersion }. Abort parsing !` )
        }

    }

    _parseHeader_1_0 () {

        return {
            FileSignature:                 this._reader.getString( 4 ),
            Reserved:                      this._reader.skipOffsetOf( Byte.Four ),
            GUID_1:                        this._reader.getUint32(),
            GUID_2:                        this._reader.getUint16(),
            GUID_3:                        this._reader.getUint16(),
            GUID_4:                        this._reader.getUint8Array( 8 ),
            VersionMajor:                  this._reader.getUint8(),
            VersionMinor:                  this._reader.getUint8(),
            SystemIdentifier:              this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            GeneratingSoftware:            this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            FlightDateJulian:              this._reader.getUint16(),
            Year:                          this._reader.getUint16(),
            HeaderSize:                    this._reader.getUint16(),
            OffsetToPointData:             this._reader.getUint32(),
            NumberOfVariableLengthRecords: this._reader.getUint32(),
            PointDataFormatID:             this._reader.getUint8(),
            PointDataRecordLength:         this._reader.getUint16(),
            NumberOfPointRecords:          this._reader.getUint32(),
            NumberOfPointsByReturn:        this._reader.getUint32Array( 5 ),
            XScaleFactor:                  this._reader.getFloat64(),
            YScaleFactor:                  this._reader.getFloat64(),
            ZScaleFactor:                  this._reader.getFloat64(),
            XOffset:                       this._reader.getFloat64(),
            YOffset:                       this._reader.getFloat64(),
            ZOffset:                       this._reader.getFloat64(),
            MaxX:                          this._reader.getFloat64(),
            MinX:                          this._reader.getFloat64(),
            MaxY:                          this._reader.getFloat64(),
            MinY:                          this._reader.getFloat64(),
            MaxZ:                          this._reader.getFloat64(),
            MinZ:                          this._reader.getFloat64()
        }

    }

    _parseHeader_1_1 () {

        return {
            FileSignature:                 this._reader.getString( 4 ),
            FileSourceId:                  this._reader.getUint16(),
            Reserved:                      this._reader.skipOffsetOf( Byte.Two ) && null,
            GUID_1:                        this._reader.getUint32(),
            GUID_2:                        this._reader.getUint16(),
            GUID_3:                        this._reader.getUint16(),
            GUID_4:                        this._reader.getUint8Array( 8 ),
            VersionMajor:                  this._reader.getUint8(),
            VersionMinor:                  this._reader.getUint8(),
            SystemIdentifier:              this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            GeneratingSoftware:            this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            FileCreationDayOfYear:         this._reader.getUint16(),
            FileCreationYear:              this._reader.getUint16(),
            HeaderSize:                    this._reader.getUint16(),
            OffsetToPointData:             this._reader.getUint32(),
            NumberOfVariableLengthRecords: this._reader.getUint32(),
            PointDataFormatID:             this._reader.getUint8(),
            PointDataRecordLength:         this._reader.getUint16(),
            NumberOfPointRecords:          this._reader.getUint32(),
            NumberOfPointsByReturn:        this._reader.getUint32Array( 5 ),
            XScaleFactor:                  this._reader.getFloat64(),
            YScaleFactor:                  this._reader.getFloat64(),
            ZScaleFactor:                  this._reader.getFloat64(),
            XOffset:                       this._reader.getFloat64(),
            YOffset:                       this._reader.getFloat64(),
            ZOffset:                       this._reader.getFloat64(),
            MaxX:                          this._reader.getFloat64(),
            MinX:                          this._reader.getFloat64(),
            MaxY:                          this._reader.getFloat64(),
            MinY:                          this._reader.getFloat64(),
            MaxZ:                          this._reader.getFloat64(),
            MinZ:                          this._reader.getFloat64()
        }

    }

    _parseHeader_1_2 () {

        return {
            FileSignature:  this._reader.getString( 4 ),
            FileSourceId:   this._reader.getUint16(),
            GlobalEncoding: {
                GPSTimeType: this._reader.getBit16() ? 'AdjustedStandardGPSTime' : 'GPSWeekTime',
                Reserved:    this._reader.skipBitOffsetOf( 15 )
            },
            GUID_1:                        this._reader.getUint32(),
            GUID_2:                        this._reader.getUint16(),
            GUID_3:                        this._reader.getUint16(),
            GUID_4:                        this._reader.getUint8Array( 8 ),
            VersionMajor:                  this._reader.getUint8(),
            VersionMinor:                  this._reader.getUint8(),
            SystemIdentifier:              this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            GeneratingSoftware:            this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            FileCreationDayOfYear:         this._reader.getUint16(),
            FileCreationYear:              this._reader.getUint16(),
            HeaderSize:                    this._reader.getUint16(),
            OffsetToPointData:             this._reader.getUint32(),
            NumberOfVariableLengthRecords: this._reader.getUint32(),
            PointDataFormatID:             this._reader.getUint8(),
            PointDataRecordLength:         this._reader.getUint16(),
            NumberOfPointRecords:          this._reader.getUint32(),
            NumberOfPointsByReturn:        this._reader.getUint32Array( 5 ),
            XScaleFactor:                  this._reader.getFloat64(),
            YScaleFactor:                  this._reader.getFloat64(),
            ZScaleFactor:                  this._reader.getFloat64(),
            XOffset:                       this._reader.getFloat64(),
            YOffset:                       this._reader.getFloat64(),
            ZOffset:                       this._reader.getFloat64(),
            MaxX:                          this._reader.getFloat64(),
            MinX:                          this._reader.getFloat64(),
            MaxY:                          this._reader.getFloat64(),
            MinY:                          this._reader.getFloat64(),
            MaxZ:                          this._reader.getFloat64(),
            MinZ:                          this._reader.getFloat64()
        }

    }

    _parseHeader_1_3 () {

        return {
            FileSignature:  this._reader.getString( 4 ),
            FileSourceId:   this._reader.getUint16(),
            GlobalEncoding: {
                GPSTimeType:                                 this._reader.getBit16() ? 'AdjustedStandardGPSTime' : 'GPSWeekTime',
                WaveformDataPacketsInternal:                 this._reader.getBit16(),
                WaveformDataPacketsExternal:                 this._reader.getBit16(),
                ReturnNumbersHaveBeenSyntheticallyGenerated: this._reader.getBit16(),
                Reserved:                                    this._reader.skipBitOffsetOf( 12 )
            },
            GUID_1:                          this._reader.getUint32(),
            GUID_2:                          this._reader.getUint16(),
            GUID_3:                          this._reader.getUint16(),
            GUID_4:                          this._reader.getUint8Array( 8 ),
            VersionMajor:                    this._reader.getUint8(),
            VersionMinor:                    this._reader.getUint8(),
            SystemIdentifier:                this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            GeneratingSoftware:              this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            FileCreationDayOfYear:           this._reader.getUint16(),
            FileCreationYear:                this._reader.getUint16(),
            HeaderSize:                      this._reader.getUint16(),
            OffsetToPointData:               this._reader.getUint32(),
            NumberOfVariableLengthRecords:   this._reader.getUint32(),
            PointDataFormatID:               this._reader.getUint8(),
            PointDataRecordLength:           this._reader.getUint16(),
            NumberOfPointRecords:            this._reader.getUint32(),
            NumberOfPointsByReturn:          this._reader.getUint32Array( 5 ),
            XScaleFactor:                    this._reader.getFloat64(),
            YScaleFactor:                    this._reader.getFloat64(),
            ZScaleFactor:                    this._reader.getFloat64(),
            XOffset:                         this._reader.getFloat64(),
            YOffset:                         this._reader.getFloat64(),
            ZOffset:                         this._reader.getFloat64(),
            MaxX:                            this._reader.getFloat64(),
            MinX:                            this._reader.getFloat64(),
            MaxY:                            this._reader.getFloat64(),
            MinY:                            this._reader.getFloat64(),
            MaxZ:                            this._reader.getFloat64(),
            MinZ:                            this._reader.getFloat64(),
            StartOfWaveformDataPacketRecord: this._reader.getUint64()
        }

    }

    _parseHeader_1_4 () {

        return {
            FileSignature:  this._reader.getString( 4 ),
            FileSourceId:   this._reader.getUint16(),
            GlobalEncoding: {
                GPSTimeType:                                 this._reader.getBit16() ? 'AdjustedStandardGPSTime' : 'GPSWeekTime',
                WaveformDataPacketsInternal:                 this._reader.getBit16(),
                WaveformDataPacketsExternal:                 this._reader.getBit16(),
                ReturnNumbersHaveBeenSyntheticallyGenerated: this._reader.getBit16(),
                WKT:                                         this._reader.getBit16() ? 'WKT' : 'GeoTIFF',
                Reserved:                                    this._reader.skipBitOffsetOf( 11 )
            },
            GUID_1:                                   this._reader.getUint32(),
            GUID_2:                                   this._reader.getUint16(),
            GUID_3:                                   this._reader.getUint16(),
            GUID_4:                                   this._reader.getUint8Array( 8 ),
            VersionMajor:                             this._reader.getUint8(),
            VersionMinor:                             this._reader.getUint8(),
            SystemIdentifier:                         this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            GeneratingSoftware:                       this._reader.getString( 32 ).replace( NullCharRegex, '' ),
            FileCreationDayOfYear:                    this._reader.getUint16(),
            FileCreationYear:                         this._reader.getUint16(),
            HeaderSize:                               this._reader.getUint16(),
            OffsetToPointData:                        this._reader.getUint32(),
            NumberOfVariableLengthRecords:            this._reader.getUint32(),
            PointDataRecordFormat:                    this._reader.getUint8(),
            PointDataRecordLength:                    this._reader.getUint16(),
            LegacyNumberOfPointRecords:               this._reader.getUint32(),
            LegacyNumberOfPointsByReturn:             this._reader.getUint32Array( 5 ),
            XScaleFactor:                             this._reader.getFloat64(),
            YScaleFactor:                             this._reader.getFloat64(),
            ZScaleFactor:                             this._reader.getFloat64(),
            XOffset:                                  this._reader.getFloat64(),
            YOffset:                                  this._reader.getFloat64(),
            ZOffset:                                  this._reader.getFloat64(),
            MaxX:                                     this._reader.getFloat64(),
            MinX:                                     this._reader.getFloat64(),
            MaxY:                                     this._reader.getFloat64(),
            MinY:                                     this._reader.getFloat64(),
            MaxZ:                                     this._reader.getFloat64(),
            MinZ:                                     this._reader.getFloat64(),
            StartOfWaveformDataPacketRecord:          this._reader.getUint64(),
            StartOfFirstExtendedVariableLengthRecord: this._reader.getUint64(),
            NumberOfExtendedVariableLengthRecords:    this._reader.getUint32(),
            NumberOfPointRecords:                     this._reader.getUint64(),
            NumberOfPointsByReturn:                   this._reader.getUint64Array( 15 )
        }

    }

    // VariableLengthRecord

    _parseVariableLengthRecords ( header ) {

        const fullVersion            = `${ header.VersionMajor }.${ header.VersionMinor }`;
        const variablesLengthRecords = [];

        for ( let i = 0 ; i < header.NumberOfVariableLengthRecords ; i++ ) {

            const header = this._parseVariableLengthRecordHeader();

            //!\ Legacy => RecordSignature = Reserved since las v1.1
            if ( fullVersion === '1.0' && header.Reserved !== 0xAABB ) {
                throw new Error( 'Invalid variable length record header signature... Abort parsing !' )
            }

            const userId       = header.UserID;
            const recordId     = header.RecordID;
            const recordLength = header.RecordLengthAfterHeader;
            const content      = this._parseVariableLengthRecordContent( userId, recordId, recordLength );

            variablesLengthRecords.push( {
                Header:  header,
                Content: content
            } );

        }

        return variablesLengthRecords

    }

    _parseVariableLengthRecordHeader () {

        return {
            Reserved:                this._reader.getUint16(),
            UserID:                  this._reader.getString( 16 ).replace( NullCharRegex, '' ),
            RecordID:                this._reader.getUint16(),
            RecordLengthAfterHeader: this._reader.getUint16(),
            Description:             this._reader.getString( 32 ).replace( NullCharRegex, '' )
        }

    }
    _parseVariableLengthRecordContent ( userId, recordId, recordLength ) {

        switch ( userId ) {
            case 'LASF_Projection':
                return this._parseProjectionRecord( recordId, recordLength )
            case 'LASF_Spec':
                return this._parseSpecRecord()

            default:
                return this._parseCustomRecord( recordLength )
        }

    }

    _parseProjectionRecord ( recordId, recordLength ) {

        switch ( recordId ) {
            case 2111:
                return this._parseOGCMathTransformWKT()
            case 2112:
                return this._parseOGCCoordinateTransformWKT()
            case 34735:
                return this._parseGeoKeyDirectoryTag()
            case 34736:
                return this._parseGeoDoubleParamsTag( recordLength )
            case 34737:
                return this._parseGeoASCIIParamsTag( recordLength )

            default:
                console.error( 'Unable to determine LASF_Projection underlying type ! Skip current record.' );
                this._reader.skipOffsetOf( recordLength );
        }

    }

    // Todo
    _parseOGCMathTransformWKT () {

        return undefined

    }

    // Todo
    _parseOGCCoordinateTransformWKT () {

        return undefined

    }

    _parseGeoKeyDirectoryTag () {

        const geoKey = {
            wKeyDirectoryVersion: this._reader.getUint16(),
            wKeyRevision:         this._reader.getUint16(),
            wMinorRevision:       this._reader.getUint16(),
            wNumberOfKeys:        this._reader.getUint16(),
            sKeyEntry:            []
        };

        for ( let j = 0 ; j < geoKey.wNumberOfKeys ; j++ ) {
            geoKey.sKeyEntry.push( {
                wKeyID:           this._reader.getUint16(),
                wTIFFTagLocation: this._reader.getUint16(),
                wCount:           this._reader.getUint16(),
                wValue_Offset:    this._reader.getUint16()
            } );
        }

        return geoKey

    }

    _parseGeoDoubleParamsTag ( recordLength ) {

        const numberOfEntries = recordLength / Byte.Height;
        const params          = [];

        for ( let i = 0 ; i < numberOfEntries ; i++ ) {
            params[ i ] = this._reader.getFloat64();
        }

        return params

    }

    _parseGeoASCIIParamsTag ( recordLength ) {

        return this._reader.getString( recordLength ).replace( NullCharRegex, '' )

    }

    _parseSpecRecord ( recordId ) {

        if ( recordId < 100 ) {

            switch ( recordId ) {
                case 0:
                    return this._parseClassificationLookupRecord()
                case 1:
                    return this._parseHeaderLookupForFlightLinesRecord()
                case 2:
                    return this._parseHistogramRecord()
                case 3:
                    return this._parseTextAreaDescriptionRecord()
                case 4:
                    return this._parseExtraBytesRecord()
                case 7:
                    return this._parseSupersededRecord()

                default:
                    throw new RangeError( `Invalid spec record id: ${ recordId }` )
            }

        } else if ( recordId >= 100 && recordId < 355 ) {

            return this._parseWaveformPacketDesciptor()

        } else if ( recordId === 65535 ) {

            return this._parseWaveformDataPacket()

        } else {

            throw new RangeError( `Invalid spec record id: ${ recordId }` )

        }

    }

    _parseClassificationLookupRecord () {

        const records = [];

        for ( let i = 0 ; i < 256 ; i++ ) {
            records.push( {
                ClassNumber: this._reader.getUint8(),
                Description: this._reader.getString( 15 ).replace( NullCharRegex, '' )
            } );
        }

        return records

    }

    _parseHeaderLookupForFlightLinesRecord () {

        return {
            FileMarkerNumber: this._reader.getUint8(),
            Filename:         this._reader.getString( 256 ).replace( NullCharRegex, '' )
        }

    }

    _parseHistogramRecord () {

        return undefined

    }

    _parseTextAreaDescriptionRecord () {

        return undefined

    }

    // Todo
    _parseExtraBytesRecord () {

        return undefined

    }

    // Todo
    _parseSupersededRecord () {

        return undefined

    }

    // Todo
    _parseWaveformPacketDesciptor () {

        return undefined

    }

    // Todo
    _parseWaveformDataPacket () {

        return undefined

    }

    _parseCustomRecord ( recordLength ) {

        const record = new Uint8Array( recordLength );

        for ( let i = 0 ; i < recordLength ; i++ ) {
            record[ i ] = this._reader.getUint8();
        }

        return record

    }

    // PointDataRecords

    _parsePointDataRecords ( header, onProgress ) {

        const offsetToPointData = header.OffsetToPointData;
        if ( this._reader.offset !== offsetToPointData ) {
            console.error( 'The current reader offset does not match the header offset to point data ! Defaulting to header value.' );
            this._reader.skipOffsetTo( offsetToPointData );
        }

        const pointDataRecordFormat              = ( header.VersionMinor < 4 ) ? header.PointDataFormatID : header.PointDataRecordFormat;
        const parsePointDataRecordFormatFunction = this._getPointDataRecordFormat( pointDataRecordFormat );

        const numberOfPointRecords = ( header.VersionMinor < 4 ) ? header.NumberOfPointRecords : header.LegacyNumberOfPointRecords;
        const points               = new Array( numberOfPointRecords );

        for ( let i = 0 ; i < numberOfPointRecords ; i++ ) {
            points[ i ] = parsePointDataRecordFormatFunction();

            if ( i % 100000 === 0 ) {
                onProgress( new ProgressEvent( 'ParsePointDataRecords', {
                    lengthComputable: true,
                    loaded:           i,
                    total:            numberOfPointRecords
                } ) );
            }
        }

        return points

    }

    _getPointDataRecordFormat ( format ) {

        switch ( format ) {
            case 0:
                return this._parsePointDataRecordFormat_0.bind( this )
            case 1:
                return this._parsePointDataRecordFormat_1.bind( this )
            case 2:
                return this._parsePointDataRecordFormat_2.bind( this )
            case 3:
                return this._parsePointDataRecordFormat_3.bind( this )
            case 4:
                return this._parsePointDataRecordFormat_4.bind( this )
            case 5:
                return this._parsePointDataRecordFormat_5.bind( this )
            case 6:
                return this._parsePointDataRecordFormat_6.bind( this )
            case 7:
                return this._parsePointDataRecordFormat_7.bind( this )
            case 8:
                return this._parsePointDataRecordFormat_8.bind( this )
            case 9:
                return this._parsePointDataRecordFormat_9.bind( this )
            case 10:
                return this._parsePointDataRecordFormat_10.bind( this )

            default:
                throw new RangeError( `Invalid PointDataRecordFormat parameter: ${ format }` )
        }

    }

    _parsePointDataRecordFormat_0 () {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            ScanAngleRank: this._reader.getInt8(),
            UserData:      this._reader.getUint8(),
            PointSourceId: this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat_1 () {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            ScanAngleRank: this._reader.getInt8(),
            UserData:      this._reader.getUint8(),
            PointSourceId: this._reader.getUint16(),
            GPSTime:       this._reader.getFloat64()
        }

    }

    _parsePointDataRecordFormat_2 () {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            ScanAngleRank: this._reader.getInt8(),
            UserData:      this._reader.getUint8(),
            PointSourceId: this._reader.getUint16(),
            R:             this._reader.getUint16(),
            G:             this._reader.getUint16(),
            B:             this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat_3 () {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            ScanAngleRank: this._reader.getInt8(),
            UserData:      this._reader.getUint8(),
            PointSourceId: this._reader.getUint16(),
            GPSTime:       this._reader.getFloat64(),
            R:             this._reader.getUint16(),
            G:             this._reader.getUint16(),
            B:             this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat_4 () {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            ScanAngleRank:               this._reader.getInt8(),
            UserData:                    this._reader.getUint8(),
            PointSourceId:               this._reader.getUint16(),
            GPSTime:                     this._reader.getFloat64(),
            WavePacketDescriptorIndex:   this._reader.getUint8(),
            ByteOffsetToWaveformData:    this._reader.getUint64(),
            WaveformPacketSizeInBytes:   this._reader.getUint32(),
            ReturnPointWaveformLocation: this._reader.getFloat32(),
            Xt:                          this._reader.getFloat32(),
            Yt:                          this._reader.getFloat32(),
            Zt:                          this._reader.getFloat32()
        }

    }

    _parsePointDataRecordFormat_5 () {

        return {
            X:                 this._reader.getInt32(),
            Y:                 this._reader.getInt32(),
            Z:                 this._reader.getInt32(),
            Intensity:         this._reader.getUint16(),
            ReturnNumber:      this._reader.getBits8( 3 ),
            NumberOfReturns:   this._reader.getBits8( 3 ),
            ScanDirectionFlag: this._reader.getBit8(),
            EdgeOfFlightLine:  this._reader.getBit8(),
            Classification:    {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            ScanAngleRank:               this._reader.getInt8(),
            UserData:                    this._reader.getUint8(),
            PointSourceId:               this._reader.getUint16(),
            GPSTime:                     this._reader.getFloat64(),
            R:                           this._reader.getUint16(),
            G:                           this._reader.getUint16(),
            B:                           this._reader.getUint16(),
            WavePacketDescriptorIndex:   this._reader.getUint8(),
            ByteOffsetToWaveformData:    this._reader.getUint64(),
            WaveformPacketSizeInBytes:   this._reader.getUint32(),
            ReturnPointWaveformLocation: this._reader.getFloat32(),
            Xt:                          this._reader.getFloat32(),
            Yt:                          this._reader.getFloat32(),
            Zt:                          this._reader.getFloat32()
        }

    }

    _parsePointDataRecordFormat_6 () {

        return {
            X:                   this._reader.getInt32(),
            Y:                   this._reader.getInt32(),
            Z:                   this._reader.getInt32(),
            Intensity:           this._reader.getUint16(),
            ReturnNumber:        this._reader.getBits16( 4 ),
            NumberOfReturns:     this._reader.getBits16( 4 ),
            ClassificationFlags: this._reader.getBits16( 4 ),
            ScannerChannel:      this._reader.getBits16( 2 ),
            ScanDirectionFlag:   this._reader.getBit16(),
            EdgeOfFlightLine:    this._reader.getBit16(),
            Classification:      {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            UserData:      this._reader.getUint8(),
            ScanAngle:     this._reader.getInt16(),
            PointSourceId: this._reader.getUint16(),
            GPSTime:       this._reader.getFloat64()
        }

    }

    _parsePointDataRecordFormat_7 () {

        return {
            X:                   this._reader.getInt32(),
            Y:                   this._reader.getInt32(),
            Z:                   this._reader.getInt32(),
            Intensity:           this._reader.getUint16(),
            ReturnNumber:        this._reader.getBits16( 4 ),
            NumberOfReturns:     this._reader.getBits16( 4 ),
            ClassificationFlags: this._reader.getBits16( 4 ),
            ScannerChannel:      this._reader.getBits16( 2 ),
            ScanDirectionFlag:   this._reader.getBit16(),
            EdgeOfFlightLine:    this._reader.getBit16(),
            Classification:      {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            UserData:      this._reader.getUint8(),
            ScanAngle:     this._reader.getInt16(),
            PointSourceId: this._reader.getUint16(),
            GPSTime:       this._reader.getFloat64(),
            R:             this._reader.getUint16(),
            G:             this._reader.getUint16(),
            B:             this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat_8 () {

        return {
            X:                   this._reader.getInt32(),
            Y:                   this._reader.getInt32(),
            Z:                   this._reader.getInt32(),
            Intensity:           this._reader.getUint16(),
            ReturnNumber:        this._reader.getBits16( 4 ),
            NumberOfReturns:     this._reader.getBits16( 4 ),
            ClassificationFlags: this._reader.getBits16( 4 ),
            ScannerChannel:      this._reader.getBits16( 2 ),
            ScanDirectionFlag:   this._reader.getBit16(),
            EdgeOfFlightLine:    this._reader.getBit16(),
            Classification:      {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            UserData:      this._reader.getUint8(),
            ScanAngle:     this._reader.getInt16(),
            PointSourceId: this._reader.getUint16(),
            GPSTime:       this._reader.getFloat64(),
            R:             this._reader.getUint16(),
            G:             this._reader.getUint16(),
            B:             this._reader.getUint16(),
            NIR:           this._reader.getUint16()
        }

    }

    _parsePointDataRecordFormat_9 () {

        return {
            X:                   this._reader.getInt32(),
            Y:                   this._reader.getInt32(),
            Z:                   this._reader.getInt32(),
            Intensity:           this._reader.getUint16(),
            ReturnNumber:        this._reader.getBits16( 4 ),
            NumberOfReturns:     this._reader.getBits16( 4 ),
            ClassificationFlags: this._reader.getBits16( 4 ),
            ScannerChannel:      this._reader.getBits16( 2 ),
            ScanDirectionFlag:   this._reader.getBit16(),
            EdgeOfFlightLine:    this._reader.getBit16(),
            Classification:      {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            UserData:                    this._reader.getUint8(),
            ScanAngle:                   this._reader.getInt16(),
            PointSourceId:               this._reader.getUint16(),
            GPSTime:                     this._reader.getFloat64(),
            WavePacketDescriptorIndex:   this._reader.getUint8(),
            ByteOffsetToWaveformData:    this._reader.getUint64(),
            WaveformPacketSizeInBytes:   this._reader.getUint32(),
            ReturnPointWaveformLocation: this._reader.getFloat32(),
            Xt:                          this._reader.getFloat32(),
            Yt:                          this._reader.getFloat32(),
            Zt:                          this._reader.getFloat32()
        }

    }

    _parsePointDataRecordFormat_10 () {

        return {
            X:                   this._reader.getInt32(),
            Y:                   this._reader.getInt32(),
            Z:                   this._reader.getInt32(),
            Intensity:           this._reader.getUint16(),
            ReturnNumber:        this._reader.getBits16( 4 ),
            NumberOfReturns:     this._reader.getBits16( 4 ),
            ClassificationFlags: this._reader.getBits16( 4 ),
            ScannerChannel:      this._reader.getBits16( 2 ),
            ScanDirectionFlag:   this._reader.getBit16(),
            EdgeOfFlightLine:    this._reader.getBit16(),
            Classification:      {
                Class:     this._reader.getBits8( 5 ),
                Synthetic: this._reader.getBit8(),
                KeyPoint:  this._reader.getBit8(),
                Withheld:  this._reader.getBit8()
            },
            UserData:                    this._reader.getUint8(),
            ScanAngle:                   this._reader.getInt16(),
            PointSourceId:               this._reader.getUint16(),
            GPSTime:                     this._reader.getFloat64(),
            R:                           this._reader.getUint16(),
            G:                           this._reader.getUint16(),
            B:                           this._reader.getUint16(),
            NIR:                         this._reader.getUint16(),
            WavePacketDescriptorIndex:   this._reader.getUint8(),
            ByteOffsetToWaveformData:    this._reader.getUint64(),
            WaveformPacketSizeInBytes:   this._reader.getUint32(),
            ReturnPointWaveformLocation: this._reader.getFloat32(),
            Xt:                          this._reader.getFloat32(),
            Yt:                          this._reader.getFloat32(),
            Zt:                          this._reader.getFloat32()
        }

    }

    convert ( lasDatas, onLoad, onProgress, onError ) {

        try {

            const pointsGroup            = new Group();
            pointsGroup.name             = 'Cloud';
            pointsGroup.matrixAutoUpdate = false;
            pointsGroup.position.x       = lasDatas.Header.XOffset;
            pointsGroup.position.y       = lasDatas.Header.YOffset;
            pointsGroup.position.z       = lasDatas.Header.ZOffset;
            //            pointsGroup.scale.x          = lasDatas.Header.XScaleFactor
            //            pointsGroup.scale.y          = lasDatas.Header.YScaleFactor
            //            pointsGroup.scale.z          = lasDatas.Header.ZScaleFactor
            //        pointsGroup.rotation.x -= PiOnTwo
            pointsGroup.userData = {
                header:  lasDatas.Header,
                records: lasDatas.VariableLengthRecords
            };

            this._createCloudPoints( pointsGroup, lasDatas, onProgress );

            onLoad( pointsGroup );

        } catch ( error ) {

            onError( error );

        }

    }

    /**
     *
     * @private
     */
    _offsetPoints () {

        // Compute bounding box in view to get his center for auto offseting the cloud point.
        if ( this._autoOffset ) {
            //this.logger.time("Compute Points");
            this._boundingBox.setFromPoints( this._points );
            this.setOffset( this._boundingBox.getCenter() );
            //this.logger.timeEnd("Compute Points");
        }

        const offsetX = this._offset.x;
        const offsetY = this._offset.y;
        const offsetZ = this._offset.z;
        let point     = null;
        for ( let i = 0, numberOfPoints = this._points.length ; i < numberOfPoints ; ++i ) {

            point = this._points[ i ];
            point.x -= offsetX;
            point.y -= offsetY;
            point.z -= offsetZ;

        }

    }

    /**
     *
     * @param groupToFeed
     * @private
     */
    _createCloudPoints ( groupToFeed, lasDatas, onProgress ) {

        const classPointReverseMap = {
            0:  'Created',
            1:  'Unclassified',
            2:  'Ground',
            3:  'LowVegetation',
            4:  'MediumVegetation',
            5:  'HighVegetation',
            6:  'Building',
            7:  'LowPoint',
            8:  'ModelKeyPoint',
            9:  'Water',
            12: 'OverlapPoints'
        };

        // Precompute max intensity for all splits
        let maxIntensity = -Infinity;
        for ( let pointDataRecord of lasDatas.PointDataRecords ) {
            const i = pointDataRecord.Intensity;
            if ( i > maxIntensity ) {
                maxIntensity = i;
            }
        }


        const scaleX                = lasDatas.Header.XScaleFactor;
        const scaleY                = lasDatas.Header.YScaleFactor;
        const scaleZ                = lasDatas.Header.ZScaleFactor;
        const SPLIT_LIMIT           = 1000000;
        const numberOfPoints        = lasDatas.PointDataRecords.length;
        const numberOfSplit         = Math.ceil( numberOfPoints / SPLIT_LIMIT );
        const pointDataRecordFormat = ( lasDatas.Header.VersionMinor < 4 ) ? lasDatas.Header.PointDataFormatID : lasDatas.Header.PointDataRecordFormat;
        const pointHaveColor        = ![ 0, 1, 4, 6, 9 ].includes( pointDataRecordFormat );
        const material              = new PointsMaterial( {
            size:         0.01,
            vertexColors: true
        } );
        let numberOfPointInSplit    = 0;
        let splice                  = null;
        let cloudPoint              = null;

        for ( let splitIndex = 0 ; splitIndex < numberOfSplit ; ++splitIndex ) {

            splice               = lasDatas.PointDataRecords.splice( 0, SPLIT_LIMIT );
            numberOfPointInSplit = splice.length;
            const geometry       = new BufferGeometry();
            const positions      = new Float32Array( numberOfPointInSplit * 3 );
            const colors         = new Float32Array( numberOfPointInSplit * 3 );
            let bufferIndex      = 0;
            let point            = null;

            for ( let i = 0 ; i < numberOfPointInSplit ; ++i ) {

                const currentPointIndex = i + ( splitIndex * SPLIT_LIMIT );
                if ( currentPointIndex % 100000 === 0 ) {
                    onProgress( new ProgressEvent( 'ConvertPointDataRecords', {
                        lengthComputable: true,
                        loaded:           currentPointIndex,
                        total:            numberOfPoints
                    } ) );
                }

                // current point
                point = splice[ i ];

                // positions
                //                positions[ bufferIndex ]     = point.X
                //                positions[ bufferIndex + 1 ] = point.Y
                //                positions[ bufferIndex + 2 ] = point.Z
                positions[ bufferIndex ]     = point.X * scaleX;
                positions[ bufferIndex + 1 ] = point.Y * scaleY;
                positions[ bufferIndex + 2 ] = point.Z * scaleZ;
                //                                    const x      = ( record.X * scaleX ) + offsetX
                //                                    const y      = ( record.Y * scaleY ) + offsetY
                //                                    const z      = ( record.Z * scaleZ ) + offsetZ


                // colors
                if ( pointHaveColor ) {

                    colors[ bufferIndex ]     = point.R / 65535;
                    colors[ bufferIndex + 1 ] = point.G / 65535;
                    colors[ bufferIndex + 2 ] = point.B / 65535;

                } else {

                    const colorPointClass = this.colorForPointClass[ classPointReverseMap[ point.Classification.Class ] ];
                    if ( isDefined( colorPointClass ) ) {

                        colors[ bufferIndex ]     = colorPointClass.r / 255;
                        colors[ bufferIndex + 1 ] = colorPointClass.g / 255;
                        colors[ bufferIndex + 2 ] = colorPointClass.b / 255;

                    } else {

                        const intensity           = point.Intensity;
                        colors[ bufferIndex ]     = intensity / maxIntensity; //255
                        colors[ bufferIndex + 1 ] = intensity / maxIntensity; //255
                        colors[ bufferIndex + 2 ] = intensity / maxIntensity; //255

                    }

                }

                bufferIndex += 3;

            }

            geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
            geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) );

            cloudPoint = new Points( geometry, material );
            groupToFeed.add( cloudPoint );

        }

    }

    /**
     *
     * @param group
     * @private
     */
    _createSubCloudPoint ( group ) {

        const numberOfPoints = this._points.length;
        const geometry       = new BufferGeometry();
        const positions      = new Float32Array( numberOfPoints * 3 );
        const colors         = new Float32Array( numberOfPoints * 3 );
        let bufferIndex      = 0;
        let point            = null;

        for ( let i = 0 ; i < numberOfPoints ; ++i ) {

            // current point
            point = this._points[ i ];

            // positions
            positions[ bufferIndex ]     = point.x;
            positions[ bufferIndex + 1 ] = point.y;
            positions[ bufferIndex + 2 ] = point.z;

            // colors
            if ( this._pointsHaveColor ) {
                colors[ bufferIndex ]     = point.r / 255;
                colors[ bufferIndex + 1 ] = point.g / 255;
                colors[ bufferIndex + 2 ] = point.b / 255;
            } else {
                colors[ bufferIndex ]     = 0.1;
                colors[ bufferIndex + 1 ] = 0.2;
                colors[ bufferIndex + 2 ] = 0.5;
            }

            bufferIndex += 3;

        }

        geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
        geometry.setAttribute( 'color', new BufferAttribute( colors, 3 ) );

        const material = new PointsMaterial( {
            size:         0.005,
            vertexColors: true
        } );

        const cloud = new Points( geometry, material );

        //Todo: Apply import coordinates syteme here !
        cloud.rotation.x -= Math.PI / 2;

        group.children.push( cloud );

        // Clear current processed points
        this._points = [];

    }

}

/**
 * @module Loader/SHPLoader
 * @desc Export SHPLoader to load .shp files
 *
 * @requires {@link https://github.com/Itee/itee-client itee-client}
 * @requires {@link https://github.com/Itee/itee-utils itee-utils}
 * @requires {@link https://github.com/Itee/three-full three-full}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * @example Todo...
 *
 */

/**
 *
 * @type {Object}
 */
const ShapeType = /*#__PURE__*/toEnum( {
    NullShape:   0,
    Point:       1,
    Polyline:    3,
    Polygon:     5,
    MultiPoint:  8,
    PointZ:      11,
    PolyLineZ:   13,
    PolygonZ:    15,
    MultiPointZ: 18,
    PointM:      21,
    PolylineM:   23,
    PolygonM:    25,
    MultiPointM: 28,
    MultiPatch:  31
} );

/**
 * @class
 * @classdesc This class allow to split any geometries type during runtime.
 * Keeping normals and Uvs. It is really usefull to see inside mesh like building.
 * @export
 */
class SHPLoader {

    //    static FileCode      = 9994
    //    static MinFileLength = 100
    //    static MinVersion    = 1000

    /**
     *
     * Because ctor is blablabla
     *
     * @param manager
     * @param logger
     * @constructor
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                manager:      DefaultLoadingManager,
                logger:       DefaultLogger,
                reader:       new TBinaryReader(),
                globalOffset: new Vector3( 0, 0, 0 ),
                worldAxis:    {
                    from: 'zUp',
                    to:   'zForward'
                }
            }, ...parameters
        };

        this.manager      = _parameters.manager;
        this.logger       = _parameters.logger;
        this.reader       = _parameters.reader;
        this.globalOffset = _parameters.globalOffset;
        this.worldAxis    = _parameters.worldAxis;

    }

    get globalOffset () {
        return this._globalOffset
    }

    set globalOffset ( value ) {
        this._globalOffset = value;
    }

    get worldAxis () {
        return this._worldAxis
    }

    set worldAxis ( value ) {
        this._worldAxis = value;
    }

    get manager () {
        return this._manager
    }

    set manager ( value ) {
        this._manager = value;
    }

    get logger () {
        return this._logger
    }

    set logger ( value ) {
        this._logger = value;
    }

    get reader () {
        return this._reader
    }

    set reader ( value ) {
        this._reader = value;
    }

    setGlobalOffset ( value ) {
        this.globalOffset = value;
        return this
    }

    setWorldAxis ( value ) {
        this.worldAxis = value;
        return this
    }

    setManager ( value ) {
        this.manager = value;
        return this
    }

    setLogger ( value ) {
        this.logger = value;
        return this
    }

    setReader ( value ) {
        this.reader = value;
        return this
    }

    /**
     *
     * @param url
     * @param onLoad
     * @param onProgress
     * @param onError
     */
    load ( url, onLoad, onProgress, onError ) {

        const scope = this;

        const loader = new FileLoader( scope.manager );
        loader.setResponseType( 'arraybuffer' );
        loader.load( url, arrayBuffer => {

            onLoad( scope.parse( arrayBuffer ) );

        }, onProgress, onError );

    }

    /**
     *
     * @param arrayBuffer
     * @return {*}
     */
    parse ( arrayBuffer ) {

        this._reader
            .setEndianess( Endianness.Big )
            .setBuffer( arrayBuffer );

        const header = this._parseHeader();

        if ( header.fileCode !== SHPLoader.FileCode ) {
            this.logger.error( 'SHPLoader: Invalide Shape file code !' );
            return null
        }

        if ( header.fileLength < SHPLoader.MinFileLength ) {
            this.logger.error( 'SHPLoader: Shape file have an incorrect length !' );
            return null
        }

        if ( !Object.values( ShapeType ).includes( header.shapeType ) ) {
            this.logger.error( 'SHPLoader: Shape file have an incorrect shape type !' );
            return null
        }

        if ( header.version < SHPLoader.MinVersion ) {
            this.logger.warn( 'SHPLoader: Version of shape file below than 1000 could be incorrectly parsed !' );
        }

        const datas  = this._parseDatas( header );
        const shapes = this._convertToObjects( datas );

        return shapes

    }

    /**
     *
     * @return {{fileCode, fileLength, version, shapeType, boundingBox: {xMin, xMax, yMin, yMax, zMin, zMax, mMin, mMax}}}
     * @private
     */
    _parseHeader () {

        const fileCode = this._reader.getInt32();
        this._reader.skipOffsetOf( 20 );
        const fileLength = this._reader.getInt32();

        this._reader.setEndianess( Endianness.Little );

        const version         = this._reader.getInt32();
        const shapeType       = this._reader.getInt32();
        const xMinBoundingBox = this._reader.getInt32();
        const yMinBoundingBox = this._reader.getInt32();
        const xMaxBoundingBox = this._reader.getInt32();
        const yMaxBoundingBox = this._reader.getInt32();
        const zMinBoundingBox = this._reader.getInt32();
        const zMaxBoundingBox = this._reader.getInt32();
        const mMinBoundingBox = this._reader.getInt32();
        const mMaxBoundingBox = this._reader.getInt32();

        return {
            fileCode:    fileCode,
            fileLength:  fileLength,
            version:     version,
            shapeType:   shapeType,
            boundingBox: {
                xMin: xMinBoundingBox,
                xMax: xMaxBoundingBox,
                yMin: yMinBoundingBox,
                yMax: yMaxBoundingBox,
                zMin: zMinBoundingBox,
                zMax: zMaxBoundingBox,
                mMin: mMinBoundingBox,
                mMax: mMaxBoundingBox
            }
        }

    }

    /**
     *
     * @param header
     * @return {Array}
     * @private
     */
    _parseDatas ( header ) {

        this._reader.skipOffsetTo( 100 );

        let datas         = [];
        let recordHeader  = undefined;
        let endOfRecord   = undefined;
        let recordContent = undefined;

        while ( !this._reader.isEndOfFile() ) {

            recordHeader = this._parseRecordHeader();
            endOfRecord  = this._reader.getOffset() + ( recordHeader.contentLength * 2 );

            // All parsing methods use little below
            this._reader.setEndianess( Endianness.Little );

            switch ( header.shapeType ) {

                case ShapeType.NullShape:

                    this._reader.skipOffsetTo( endOfRecord );

                    //                    // Todo: just skip 1 byte - or - to endRecord
                    //                    while ( this._reader.getOffset() < endOfRecord ) {
                    //
                    //                        recordContent = this._parseNull();
                    //                        if ( recordContent ) {
                    //                            datas.push( recordContent );
                    //                        }
                    //
                    //                    }
                    break

                case ShapeType.Point:
                case ShapeType.PointZ:
                case ShapeType.PointM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePoint();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break

                case ShapeType.Polyline:
                case ShapeType.PolyLineZ:
                case ShapeType.PolylineM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePolyLine();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break

                case ShapeType.Polygon:
                case ShapeType.PolygonZ:
                case ShapeType.PolygonM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parsePolyLine();
                        //                        recordContent = this._parsePolygon();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break

                case ShapeType.MultiPoint:
                case ShapeType.MultiPointZ:
                case ShapeType.MultiPointM:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parseMultiPoint();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break

                case ShapeType.MultiPatch:
                    while ( this._reader.getOffset() < endOfRecord ) {

                        recordContent = this._parseMultiPatch();
                        if ( recordContent ) {
                            datas.push( recordContent );
                        }

                    }
                    break

                default:
                    this.logger.error( `SHPLoader: Invalid switch parameter: ${ header.shapeType }` );
                    break

            }

        }

        return datas

    }

    /**
     *
     * @return {{recordNumber, contentLength}}
     * @private
     */
    _parseRecordHeader () {

        this._reader.setEndianess( Endianness.Big );

        const recordNumber  = this._reader.getInt32();
        const contentLength = this._reader.getInt32();

        return {
            recordNumber,
            contentLength
        }

    }

    _parseNull () {

        this._reader.getInt32();
        return null

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parsePoint () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const x = this._reader.getFloat64();
        const y = this._reader.getFloat64();

        return {
            shapeType,
            x,
            y
        }

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parsePolyLine () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getFloat64(),
            yMin: this._reader.getFloat64(),
            xMax: this._reader.getFloat64(),
            yMax: this._reader.getFloat64()
        };

        const numberOfParts  = this._reader.getInt32();
        const numberOfPoints = this._reader.getInt32();

        const parts = new Array( numberOfParts );
        for ( let indexParts = 0 ; indexParts < numberOfParts ; indexParts++ ) {
            parts[ indexParts ] = this._reader.getInt32();
        }

        const points = new Array( numberOfPoints );
        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points[ indexPoint ] = {
                x: this._reader.getFloat64(),
                y: this._reader.getFloat64()
            };
        }

        return {
            shapeType,
            boundingBox,
            numberOfParts,
            numberOfPoints,
            parts,
            points
        }

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parsePolygon () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getFloat64(),
            yMin: this._reader.getFloat64(),
            xMax: this._reader.getFloat64(),
            yMax: this._reader.getFloat64()
        };

        const numberOfParts  = this._reader.getInt32();
        const numberOfPoints = this._reader.getInt32();

        let parts = new Array( numberOfParts );
        for ( let indexParts = 0 ; indexParts < numberOfParts ; indexParts++ ) {
            parts[ indexParts ] = this._reader.getInt32();
        }

        let points = new Array( numberOfPoints );
        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points[ indexPoint ] = {
                x: this._reader.getFloat64(),
                y: this._reader.getFloat64()
            };
        }

        const polygons = [];
        const holes    = [];

        parts.forEach( ( value, index ) => {

            const ring = points.slice( value, parts[ index + 1 ] );

            if ( ringClockwise( ring ) ) {

                polygons.push( ring );
                //					polygons.push( [ ring ] );

            } else {

                holes.push( ring );

            }

        } );

        holes.forEach( hole => {

            polygons.some( polygon => {

                if ( ringContainsSome( polygon[ 0 ], hole ) ) {
                    polygon.push( hole );
                    return true
                }

            } ) || polygons.push( [ hole ] );

        } );

        return {
            shapeType,
            boundingBox,
            numberOfParts,
            numberOfPoints,
            parts,
            polygons
        }

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parseMultiPoint () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        const boundingBox = {
            xMin: this._reader.getFloat64(),
            xMax: this._reader.getFloat64(),
            yMin: this._reader.getFloat64(),
            yMax: this._reader.getFloat64()
        };

        const numberOfPoints = this._reader.getInt32();

        const points = new Array( numberOfPoints );

        for ( let indexPoint = 0 ; indexPoint < numberOfPoints ; indexPoint++ ) {
            points.push( [ this._reader.getFloat64(), this._reader.getFloat64() ] );
        }

        return {
            shapeType,
            boundingBox,
            numberOfPoints,
            points
        }

    }

    /**
     *
     * @return {*}
     * @private
     */
    _parseMultiPatch () {

        const shapeType = this._reader.getInt32();
        if ( shapeType === ShapeType.NullShape ) {
            return null
        }

        return {
            shapeType
        }

    }

    /**
     *
     * @param datas
     * @return {Array}
     * @private
     */
    _convertToObjects ( datas ) {

        let shapes = [];

        for ( let index = 0, numberOfShapes = datas.length ; index < numberOfShapes ; index++ ) {
            let data = datas[ index ];

            if ( data.shapeType === ShapeType.Polygon || data.shapeType === ShapeType.PolygonZ || data.shapeType === ShapeType.PolygonM ) {

                if ( data.points && Array.isArray( data.points[ 0 ] ) ) {

                    __createObjectsFromArrays( data.points );

                } else {

                    __createObjectFromPoints( data.points );

                }

            }

        }

        function __createObjectsFromArrays ( arrays ) {

            //Todo: need to fix parsePolygon to avoid too much array imbrication

            for ( let arrayIndex = 0, numberOfArray = arrays.length ; arrayIndex < numberOfArray ; arrayIndex++ ) {

                let array = arrays[ arrayIndex ];

                if ( !array ) {
                    this.logger.log( 'no array, oups !' );
                    continue
                }

                if ( Array.isArray( array[ 0 ] ) ) {

                    __createObjectsFromArrays( array );

                } else {

                    __createObjectFromPoints( array );

                }

            }

        }

        function __createObjectFromPoints ( points ) {

            shapes.push( new Shape( points ) );

        }

        return shapes

    }

}

SHPLoader.FileCode      = 9994;
SHPLoader.MinFileLength = 100;
SHPLoader.MinVersion    = 1000;

/* BitArray DataType */

class BitArray {

    /* PRIVATE STATIC METHODS */

    // Calculate the intersection of two bits
    static _intersect ( bit1, bit2 ) {
        return bit1 === BitArray._ON && bit2 === BitArray._ON ? BitArray._ON : BitArray._OFF
    }

    // Calculate the union of two bits
    static _union ( bit1, bit2 ) {
        return bit1 === BitArray._ON || bit2 === BitArray._ON ? BitArray._ON : BitArray._OFF
    }

    // Calculate the difference of two bits
    static _difference ( bit1, bit2 ) {
        return bit1 === BitArray._ON && bit2 !== BitArray._ON ? BitArray._ON : BitArray._OFF
    }

    // Get the longest or shortest (smallest) length of the two bit arrays
    static _getLen ( bitArray1, bitArray2, smallest ) {
        var l1 = bitArray1.getLength();
        var l2 = bitArray2.getLength();

        return l1 > l2 ? smallest ? l2 : l1 : smallest ? l2 : l1
    }

    /* PUBLIC STATIC METHODS */
    static getUnion ( bitArray1, bitArray2 ) {
        var len    = BitArray._getLen( bitArray1, bitArray2, true );
        var result = new BitArray( len );
        for ( var i = 0 ; i < len ; i++ ) {
            result.setAt( i, BitArray._union( bitArray1.getAt( i ), bitArray2.getAt( i ) ) );
        }
        return result
    }

    static getIntersection ( bitArray1, bitArray2 ) {
        var len    = BitArray._getLen( bitArray1, bitArray2, true );
        var result = new BitArray( len );
        for ( var i = 0 ; i < len ; i++ ) {
            result.setAt( i, BitArray._intersect( bitArray1.getAt( i ), bitArray2.getAt( i ) ) );
        }
        return result
    }

    static getDifference ( bitArray1, bitArray2 ) {
        var len    = BitArray._getLen( bitArray1, bitArray2, true );
        var result = new BitArray( len );
        for ( var i = 0 ; i < len ; i++ ) {
            result.setAt( i, BitArray._difference( bitArray1.getAt( i ), bitArray2.getAt( i ) ) );
        }
        return result
    }

    static shred ( number ) {
        var bits = new Array();
        var q    = number;
        do {
            bits.push( q % 2 );
            q = Math.floor( q / 2 );
        } while ( q > 0 )
        return new BitArray( bits.length, bits.reverse() )
    }

    constructor ( size, bits ) {
        // Private field - array for our bits
        this.m_bits = new Array();

        //.ctor - initialize as a copy of an array of true/false or from a numeric value
        if ( bits && bits.length ) {
            for ( let i = 0 ; i < bits.length ; i++ ) {
                this.m_bits.push( bits[ i ] ? BitArray._ON : BitArray._OFF );
            }
        } else if ( !isNaN( bits ) ) {
            this.m_bits = BitArray.shred( bits ).m_bits;
        }
        if ( size && this.m_bits.length !== size ) {
            if ( this.m_bits.length < size ) {
                for ( let i = this.m_bits.length ; i < size ; i++ ) {
                    this.m_bits.push( BitArray._OFF );
                }
            } else {
                for ( let i = size ; i > this.m_bits.length ; i-- ) {
                    this.m_bits.pop();
                }
            }
        }
    }

    getLength () {
        return this.m_bits.length
    }

    getAt ( index ) {
        if ( index < this.m_bits.length ) {
            return this.m_bits[ index ]
        }
        return null
    }

    setAt ( index, value ) {
        if ( index < this.m_bits.length ) {
            this.m_bits[ index ] = value ? BitArray._ON : BitArray._OFF;
        }
    }

    resize ( newSize ) {
        var tmp = new Array();
        for ( var i = 0 ; i < newSize ; i++ ) {
            if ( i < this.m_bits.length ) {
                tmp.push( this.m_bits[ i ] );
            } else {
                tmp.push( BitArray._OFF );
            }
        }
        this.m_bits = tmp;
    }

    getCompliment () {
        var result = new BitArray( this.m_bits.length );
        for ( var i = 0 ; i < this.m_bits.length ; i++ ) {
            result.setAt( i, this.m_bits[ i ] ? BitArray._OFF : BitArray._ON );
        }
        return result
    }

    toString () {
        var s = new String();
        for ( var i = 0 ; i < this.m_bits.length ; i++ ) {
            s = s.concat( this.m_bits[ i ] === BitArray._ON ? '1' : '0' );
        }
        return s
    }

    toNumber () {
        var pow = 0;
        var n   = 0;
        for ( var i = this.m_bits.length - 1 ; i >= 0 ; i-- ) {
            if ( this.m_bits[ i ] === BitArray._ON ) {
                n += Math.pow( 2, pow );
            }
            pow++;
        }
        return n
    }
}

/* BitArray PRIVATE STATIC CONSTANTS */
BitArray._ON  = 1;
BitArray._OFF = 0;

/**
 *
 */

class BitManager {

    static getBit ( bitField, bitPosition ) {
        return ( bitField & ( 1 << bitPosition ) ) === 0 ? 0 : 1
    }

    static setBit ( bitField, bitPosition ) {
        return bitField | ( 1 << bitPosition )
    }

    static clearBit ( bitField, bitPosition ) {
        const mask = ~( 1 << bitPosition );
        return bitField & mask
    }

    static updateBit ( bitField, bitPosition, bitValue ) {
        const bitValueNormalized = bitValue ? 1 : 0;
        const clearMask          = ~( 1 << bitPosition );
        return ( bitField & clearMask ) | ( bitValueNormalized << bitPosition )
    }

    static getBits ( bitField, bitPositions ) {
        let bits = 0;
        for ( let bitPosition of bitPositions ) {
            if ( BitManager.getBit( bitField, bitPosition ) ) {
                bits = BitManager.setBit( bits, bitPosition );
            }
        }
        return bits
    }

}

/**
 * @module Controllers/CameraControls
 * @desc This module export CameraControls class and CameraControlMode enum values.
 *
 * @requires {@link module: [itee-client]{@link https://github.com/Itee/itee-client}}
 * @requires {@link module: [itee-utils]{@link https://github.com/Itee/itee-utils}}
 * @requires {@link module: [itee-validators]{@link https://github.com/Itee/itee-validators}}
 * @requires {@link module: [three-full]{@link https://github.com/Itee/three-full}}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @example
 *
 * import { CameraControls, CameraControlMode } from 'itee-plugin-three'
 *
 */

const FRONT = /*#__PURE__*/new Vector3( 0, 0, -1 );
const BACK  = /*#__PURE__*/new Vector3( 0, 0, 1 );
const UP    = /*#__PURE__*/new Vector3( 0, 1, 0 );
const DOWN  = /*#__PURE__*/new Vector3( 0, -1, 0 );
const RIGHT = /*#__PURE__*/new Vector3( 1, 0, 0 );
const LEFT  = /*#__PURE__*/new Vector3( -1, 0, 0 );

/**
 * Enum values to define the internal state of CameraControl
 *
 * @type {Enum}
 * @name State
 * @property {number} [None=0] - The default state when nothing happen.
 * @property {number} [Rotating=1] - The state when current action is interpreted as Rotating.
 * @property {number} [Panning=2] - The state when current action is interpreted as Panning.
 * @property {number} [Rolling=3] - The state when current action is interpreted as Rolling.
 * @property {number} [Zooming=4] - The state when current action is interpreted as Zooming.
 * @property {number} [Moving=5] - The state when current action is interpreted as Moving.
 * @constant
 * @private
 */
const State = /*#__PURE__*/toEnum( {
    None:     0,
    Rotating: 1,
    Panning:  2,
    Rolling:  3,
    Zooming:  4,
    Moving:   5
} );

/**
 * Enum values to set the current mode of displacement for Camera.
 *
 * @typedef {Enum} module:Controllers/CameraControls.CameraControlMode
 * @property {number} [FirstPerson=1] - The state when current action is interpreted as Rotating.
 * @property {number} [Orbit=2] - The state when current action is interpreted as Panning.
 * @property {number} [Fly=3] - The state when current action is interpreted as Rolling.
 * @property {number} [Path=4] - The state when current action is interpreted as Zooming.
 * @constant
 * @public
 */
const CameraControlMode = /*#__PURE__*/toEnum( {
    FirstPerson: 1,
    Orbit:       2,
    Fly:         3,
    Path:        4
} );

function isInWorker () {
    return typeof importScripts === 'function'
}

/**
 * @class
 * @classdesc The CameraControls allow to manage all camera type, in all displacement mode.
 * It manage keyboard and mouse binding to different camera actions.
 * @augments EventDispatcher
 */
class CameraControls extends EventDispatcher {

    // Internal events
    /**
     * Move event.
     *
     * @event module:Controllers/CameraControls~CameraControls#move
     * @type {object}
     * @property {String} [type=move] - Indicates the type of fired event
     */

    /**
     * Scale event.
     *
     * @event module:Controllers/CameraControls~CameraControls#scale
     * @type {object}
     * @property {String} [type=scale] - Indicates the type of fired event
     */

    /**
     * Rotate event.
     *
     * @event module:Controllers/CameraControls~CameraControls#rotate
     * @type {object}
     * @property {String} [type=rotate] - Indicates the type of fired event
     */

    /**
     * Change event.
     *
     * @event module:Controllers/CameraControls~CameraControls#change
     * @type {object}
     * @property {String} [type=change] - Indicates the type of fired event
     */

    /**
     * @constructor
     * @param {Object} parameters - A parameters object containing properties initialization
     * @param {THREE~Camera} parameters.camera - The camera to use
     * @param {Object} [parameters.logger=DefaultLogger] - A logger for output
     * @param {THREE~Object3D} [parameters.target=THREE~Object3D] - A target to look, or used as pivot point
     * @param {module:Controllers/CameraControls.CameraControlMode} [parameters.mode=CameraControlMode.Orbit] - The current controller mode
     * @param {Window|HTMLDocument|HTMLDivElement|HTMLCanvasElement} [parameters.domElement=window] - The DOMElement to listen for mouse and keyboard inputs
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                logger:     DefaultLogger,
                camera:     null,
                target:     new Object3D(),
                mode:       CameraControlMode.Orbit,
                domElement: ( isInWorker() ) ? null : window
            }, ...parameters
        };

        super();

        // Need to be defined before domElement to make correct binding events
        this._handlers = {
            onMouseEnter:  this._onMouseEnter.bind( this ),
            onMouseLeave:  this._onMouseLeave.bind( this ),
            onMouseDown:   this._onMouseDown.bind( this ),
            onMouseMove:   this._onMouseMove.bind( this ),
            onMouseWheel:  this._onMouseWheel.bind( this ),
            onMouseUp:     this._onMouseUp.bind( this ),
            onDblClick:    this._onDblClick.bind( this ),
            onTouchStart:  this._onTouchStart.bind( this ),
            onTouchEnd:    this._onTouchEnd.bind( this ),
            onTouchCancel: this._onTouchCancel.bind( this ),
            onTouchLeave:  this._onTouchLeave.bind( this ),
            onTouchMove:   this._onTouchMove.bind( this ),
            onKeyDown:     this._onKeyDown.bind( this ),
            onKeyUp:       this._onKeyUp.bind( this )
        };

        this.logger     = _parameters.logger;
        this.camera     = _parameters.camera;
        this.target     = _parameters.target;
        this.mode       = _parameters.mode;
        this.domElement = _parameters.domElement;

        // Set to false to disable controls
        this.enabled = true;

        this._paths               = [];
        this._trackPath           = false;
        this._cameraJump          = 0.1; // = 1 / path.getLength()
        this._currentPathPosition = null;
        this._currentPathOffset   = 0;
        this._currentPathIndex    = 0;
        this._currentPath         = null;
        this._maxJump             = 1.0;

        this._lockedTarget = true;

        // Touches events specific
        this.previousTouches = [];

        // Set to false to disable all/specific displacement
        this.canMove   = true;
        this.moveSpeed = 1.0;

        this.canFront          = true;
        this.frontMinimum      = -Infinity;
        this.frontMaximum      = -Infinity;
        this.frontMinSpeed     = 0.0;
        this.frontSpeed        = 1.0;
        this.frontMaxSpeed     = Infinity;
        this.frontAcceleration = 1.0;

        this.canBack          = true;
        this.backMinimum      = -Infinity;
        this.backMaximum      = -Infinity;
        this.backMinSpeed     = 0.0;
        this.backSpeed        = 1.0;
        this.backMaxSpeed     = Infinity;
        this.backAcceleration = 1.0;

        this.canUp          = true;
        this.upMinimum      = -Infinity;
        this.upMaximum      = -Infinity;
        this.upMinSpeed     = 0.0;
        this.upSpeed        = 1.0;
        this.upMaxSpeed     = Infinity;
        this.upAcceleration = 1.0;

        this.canDown          = true;
        this.downMinimum      = -Infinity;
        this.downMaximum      = -Infinity;
        this.downMinSpeed     = 0.0;
        this.downSpeed        = 1.0;
        this.downMaxSpeed     = Infinity;
        this.downAcceleration = 1.0;

        this.canLeft          = true;
        this.leftMinimum      = -Infinity;
        this.leftMaximum      = -Infinity;
        this.leftMinSpeed     = 0.0;
        this.leftSpeed        = 1.0;
        this.leftMaxSpeed     = Infinity;
        this.leftAcceleration = 1.0;

        this.canRight          = true;
        this.rightMinimum      = -Infinity;
        this.rightMaximum      = -Infinity;
        this.rightMinSpeed     = 0.0;
        this.rightSpeed        = 1.0;
        this.rightMaxSpeed     = Infinity;
        this.rightAcceleration = 1.0;

        this.canRotate = true;

        /**
         * How far you can orbit vertically, upper and lower limits.
         * Range is 0 to Math.PI radians.
         * @type {number}
         */
        this.minPolarAngle = 0.001;

        /**
         * How far you can orbit horizontally, upper and lower limits.
         * If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
         * @type {number}
         */
        this.maxPolarAngle = ( Math.PI - 0.001 );
        this.minAzimuthAngle    = -Infinity;
        this.maxAzimuthAngle    = Infinity;
        this.rotateMinSpeed     = 0.0;
        this.rotateSpeed        = 1.0;
        this.rotateMaxSpeed     = Infinity;
        this.rotateAcceleration = 1.0;

        this.canPan          = true;
        this.panMinimum      = -Infinity;
        this.panMaximum      = -Infinity;
        this.panMinSpeed     = 0.0;
        this.panSpeed        = 0.001;
        this.panMaxSpeed     = Infinity;
        this.panAcceleration = 1.0;

        this.canRoll          = true;
        this.rollMinimum      = -Infinity;
        this.rollMaximum      = -Infinity;
        this.rollMinSpeed     = 0.0;
        this.rollSpeed        = 0.1;
        this.rollMaxSpeed     = Infinity;
        this.rollAcceleration = 1.0;

        this.canZoom          = true;
        this.zoomMinimum      = 0;
        this.zoomMaximum      = Infinity;
        this.zoomMinSpeed     = 0.0;
        this.zoomSpeed        = 0.001;
        this.zoomMaxSpeed     = Infinity;
        this.zoomAcceleration = 1.0;

        this.canLookAt = true;

        // The actions map about input events
        this.actionsMap = {
            front:  [ Keys.Z.value, Keys.UP_ARROW.value ],
            back:   [ Keys.S.value, Keys.DOWN_ARROW.value ],
            up:     [ Keys.A.value, Keys.PAGE_UP.value ],
            down:   [ Keys.E.value, Keys.PAGE_DOWN.value ],
            left:   [ Keys.Q.value, Keys.LEFT_ARROW.value ],
            right:  [ Keys.D.value, Keys.RIGHT_ARROW.value ],
            rotate: [ Mouse.Left.value ],
            pan:    [ Mouse.Middle.value ],
            roll:   {
                left:  [ Keys.R.value ],
                right: [ Keys.T.value ]
            },
            zoom:             [ Mouse.Wheel.value ],
            lookAtFront:      [ Keys.NUMPAD_2.value ],
            lookAtFrontLeft:  [ Keys.NUMPAD_3.value ],
            lookAtFrontRight: [ Keys.NUMPAD_1.value ],
            lookAtBack:       [ Keys.NUMPAD_8.value ],
            lookAtBackLeft:   [ Keys.NUMPAD_9.value ],
            lookAtBackRight:  [ Keys.NUMPAD_7.value ],
            lookAtUp:         [ Keys.NUMPAD_5.value ],
            lookAtDown:       [ Keys.NUMPAD_0.value ],
            lookAtLeft:       [ Keys.NUMPAD_6.value ],
            lookAtRight:      [ Keys.NUMPAD_4.value ]
        };

        // The current internal state of controller
        this._state = State.None;

    }

    /**
     * The camera getter
     * @function module:Controllers/CameraControls~CameraControls#get camera
     * @returns {THREE~Camera}
     */
    get camera () {

        return this._camera

    }

    /**
     * The camera setter
     * @function module:Controllers/CameraControls~CameraControls#set camera
     * @param {THREE~Camera} value
     * @throws Will throw an error if the argument is null.
     */
    set camera ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
        if ( !value.isCamera ) { throw new Error( `Camera cannot be an instance of ${ value.constructor.name }. Expect an instance of Camera.` ) }

        this._camera = value;

    }

    /**
     * The target getter
     * @type {THREE~Object3D}
     * @throws {Error} if the argument is null.
     */
    get target () {

        return this._target

    }

    set target ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Target cannot be null ! Expect an instance of Object3D.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Target cannot be undefined ! Expect an instance of Object3D.' ) }
        if ( !value.isObject3D ) { throw new Error( `Target cannot be an instance of ${ value.constructor.name }. Expect an instance of Object3D.` ) }

        this._target = value;

    }

    /**
     * @property {module:Controllers/CameraControls#CameraControlMode} mode - The current displacement mode
     * @throws {Error} if the argument is null.
     */
    get mode () {
        return this._mode
    }

    set mode ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Mode cannot be null ! Expect a value from CameraControlMode enum.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Mode cannot be undefined ! Expect a value from CameraControlMode enum.' ) }
        if ( !CameraControlMode.includes( value ) ) { throw new Error( `Mode cannot be an instance of ${ value.constructor.name }. Expect a value from TCameraControlMode enum.` ) }

        this._mode = value;

        if ( this._trackPath ) {
            this._initPathDisplacement();
        }

    }

    get paths () {
        return this._paths
    }

    set paths ( value ) {

        this._paths = value;

    }

    get trackPath () {
        return this._trackPath
    }

    set trackPath ( value ) {

        if ( isNotBoolean( value ) ) { throw new Error( `Track path cannot be an instance of ${ value.constructor.name }. Expect a boolean.` ) }

        this._trackPath = value;

        if ( this._trackPath ) {
            this._initPathDisplacement();
        }

    }

    get domElement () {

        return this._domElement

    }

    set domElement ( value ) {

        if ( isNull( value ) ) { throw new Error( 'DomElement cannot be null ! Expect an instance of HTMLDocument.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'DomElement cannot be undefined ! Expect an instance of HTMLDocument.' ) }
        if ( ![ 'Window',
                'HTMLDocument',
                'HTMLDivElement',
                'HTMLCanvasElement',
                'OffscreenCanvas' ].includes( value.constructor.name ) ) { throw new Error( `DomElement cannot be an instance of ${ value.constructor.name }. Expect an instance of Window, HTMLDocument or HTMLDivElement.` ) }

        // Check focusability of given dom element because in case the element is not focusable
        // the keydown event won't work !

        // Clear previous element
        if ( this._domElement ) {
            this._domElement.removeEventListener( 'mouseenter', this._handlers.onMouseEnter, false );
            this._domElement.removeEventListener( 'mouseleave', this._handlers.onMouseLeave, false );
            this.dispose();
        }

        this._domElement = value;
        this._domElement.addEventListener( 'mouseenter', this._handlers.onMouseEnter, false );
        this._domElement.addEventListener( 'mouseleave', this._handlers.onMouseLeave, false );
        this.impose();

    }

    get handlers () {
        return this._handlers
    }

    /**
     * Chainable setter for camera property
     *
     * @param {THREE~Camera} value - The camera to manage
     * @return {module:Controllers/CameraControls~CameraControls} The current instance (this, chainable)
     */
    setCamera ( value ) {

        this.camera = value;
        return this

    }

    /**
     * Chainable setter for target property
     *
     * @param {THREE~Object3D} value - The target to use
     * @return {CameraControls} The current instance (this, chainable)
     */
    setTarget ( value ) {

        this.target = value;
        return this

    }

    /**
     * Chainable setter for mode property
     *
     * @param {Enum.State} value - The target to use
     * @return {CameraControls} The current instance (this, chainable)
     */
    setMode ( value ) {

        this.mode = value;
        return this

    }

    /**
     * Chainable setter for mode
     *
     * @param {State} value - The target to use
     * @throws {BadERROR} a bad error
     * @return {CameraControls} The current instance (this, chainable)
     */
    setPaths ( value ) {

        this.paths = value;
        return this

    }

    addPath ( value ) {

        this._paths.push( value );
        return this

    }

    setTrackPath ( value ) {

        this.trackPath = value;
        return this

    }

    setDomElement ( value ) {

        this.domElement = value;
        return this

    }

    ///////////////

    impose () {

        this._domElement.addEventListener( 'keydown', this._handlers.onKeyDown, false );
        this._domElement.addEventListener( 'keyup', this._handlers.onKeyUp, false );

        this._domElement.addEventListener( 'dblclick', this._handlers.onDblClick, false );
        this._domElement.addEventListener( 'mousedown', this._handlers.onMouseDown, false );
        this._domElement.addEventListener( 'mousemove', this._handlers.onMouseMove, false );
        this._domElement.addEventListener( 'mouseup', this._handlers.onMouseUp, false );
        this._domElement.addEventListener( 'wheel', this._handlers.onMouseWheel, {
            capture: true,
            once:    false,
            passive: false
        } );

        this._domElement.addEventListener( 'touchcancel', this._handlers.onTouchCancel, false );
        this._domElement.addEventListener( 'touchend', this._handlers.onTouchEnd, false );
        this._domElement.addEventListener( 'touchleave', this._handlers.onTouchLeave, false );
        this._domElement.addEventListener( 'touchmove', this._handlers.onTouchMove, {
            capture: true,
            once:    false,
            passive: false
        } );
        this._domElement.addEventListener( 'touchstart', this._handlers.onTouchStart, {
            capture: true,
            once:    false,
            passive: false
        } );

        this.dispatchEvent( { type: 'impose' } );

    }

    dispose () {

        this._domElement.removeEventListener( 'keydown', this._handlers.onKeyDown, false );
        this._domElement.removeEventListener( 'keyup', this._handlers.onKeyUp, false );

        this._domElement.removeEventListener( 'dblclick', this._handlers.onDblClick, false );
        this._domElement.removeEventListener( 'mousedown', this._handlers.onMouseDown, false );
        this._domElement.removeEventListener( 'mousemove', this._handlers.onMouseMove, false );
        this._domElement.removeEventListener( 'mouseup', this._handlers.onMouseUp, false );
        this._domElement.removeEventListener( 'wheel', this._handlers.onMouseWheel, {
            capture: true,
            once:    false,
            passive: false
        } );

        this._domElement.removeEventListener( 'touchcancel', this._handlers.onTouchCancel, false );
        this._domElement.removeEventListener( 'touchend', this._handlers.onTouchEnd, false );
        this._domElement.removeEventListener( 'touchleave', this._handlers.onTouchLeave, false );
        this._domElement.removeEventListener( 'touchmove', this._handlers.onTouchMove, {
            capture: true,
            once:    false,
            passive: false
        } );
        this._domElement.removeEventListener( 'touchstart', this._handlers.onTouchStart, {
            capture: true,
            once:    false,
            passive: false
        } );

        this.dispatchEvent( { type: 'dispose' } );

    }

    update () {

    }

    setCameraPosition ( newCameraPosition ) {

        this._camera.position.copy( newCameraPosition );
        this._camera.lookAt( this._target.position );

        return this

    }

    /**
     * Mon blablabla...
     * @param {external:THREE~Vector3} newTargetPosition - The new target position
     * @return {CameraControls} The current instance (this, chainable)
     */
    setTargetPosition ( newTargetPosition ) {

        this._target.position.copy( newTargetPosition );
        this._camera.lookAt( this._target.position );

        return this

    }

    // Handlers
    _preventEvent ( event ) {
        if ( !event.preventDefault ) { return }

        event.preventDefault();
    }

    _consumeEvent ( event ) {
        if ( !event.cancelable ) { return }
        if ( !event.stopImmediatePropagation ) { return }

        event.stopImmediatePropagation();
    }

    // Keys
    _onKeyDown ( keyEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( keyEvent );

        const actionMap = this.actionsMap;
        const key       = keyEvent.keyCode;

        //todo
        //        const altActive   = keyEvent.altKey
        //        const ctrlActive  = keyEvent.ctrlKey
        //        const metaActive  = keyEvent.metaKey
        //        const shiftActive = keyEvent.shiftKey

        if ( actionMap.front.includes( key ) ) {

            this._front();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.back.includes( key ) ) {

            this._back();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.up.includes( key ) ) {

            this._up();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.down.includes( key ) ) {

            this._down();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.left.includes( key ) ) {

            this._left();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.right.includes( key ) ) {

            this._right();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.rotate.includes( key ) ) {

            this._rotate( 1.0 );
        } else if ( actionMap.pan.includes( key ) ) {

            this._pan( 1.0 );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.roll.left.includes( key ) ) {

            this._roll( 1.0 );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.roll.right.includes( key ) ) {

            this._roll( -1.0 );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.zoom.includes( key ) ) {

            this._zoom( 1.0 );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtFront.includes( key ) ) {

            this._lookAt( FRONT );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtFrontLeft.includes( key ) ) {

            this._lookAt( new Vector3( -1, 0, -1 ).normalize() );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtFrontRight.includes( key ) ) {

            this._lookAt( new Vector3( 1, 0, -1 ).normalize() );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtBack.includes( key ) ) {

            this._lookAt( BACK );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtBackLeft.includes( key ) ) {

            this._lookAt( new Vector3( -1, 0, 1 ).normalize() );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtBackRight.includes( key ) ) {

            this._lookAt( new Vector3( 1, 0, 1 ).normalize() );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtUp.includes( key ) ) {

            this._lookAt( UP );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtDown.includes( key ) ) {

            this._lookAt( DOWN );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtLeft.includes( key ) ) {

            this._lookAt( LEFT );
            this._consumeEvent( keyEvent );

        } else if ( actionMap.lookAtRight.includes( key ) ) {

            this._lookAt( RIGHT );
            this._consumeEvent( keyEvent );

        } else ;

    }

    _onKeyUp ( keyEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( keyEvent );

    }

    // Touches
    _onTouchStart ( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent );

        this.previousTouches = touchEvent.touches;

    }

    _onTouchEnd ( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent );

        this.previousTouches = [];
        this._state          = State.None;

    }

    _onTouchCancel ( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent );

        this.previousTouches = [];
        this._state          = State.None;

    }

    _onTouchLeave ( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent );

        this.previousTouches = [];
        this._state          = State.None;

    }

    _onTouchMove ( touchEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( touchEvent );

        const previousTouches         = this.previousTouches;
        const currentTouches          = touchEvent.changedTouches;
        const numberOfPreviousTouches = previousTouches.length;
        const numberOfCurrentTouches  = currentTouches.length;

        if ( numberOfPreviousTouches === 2 && numberOfCurrentTouches === 2 ) {

            const previousTouchA    = new Vector2( previousTouches[ 0 ].clientX, previousTouches[ 0 ].clientY );
            const previousTouchB    = new Vector2( previousTouches[ 1 ].clientX, previousTouches[ 1 ].clientY );
            const previousGap       = previousTouchA.distanceTo( previousTouchB );
            const previousCenter    = new Vector2().addVectors( previousTouchA, previousTouchB ).divideScalar( 2 );
            const previousDirection = new Vector2().subVectors( previousTouchA, previousTouchB ).normalize();

            const currentTouchA    = new Vector2( currentTouches[ 0 ].clientX, currentTouches[ 0 ].clientY );
            const currentTouchB    = new Vector2( currentTouches[ 1 ].clientX, currentTouches[ 1 ].clientY );
            const currentGap       = currentTouchA.distanceTo( currentTouchB );
            const currentCenter    = new Vector2().addVectors( currentTouchA, currentTouchB ).divideScalar( 2 );
            const currentDirection = new Vector2().subVectors( previousTouchA, previousTouchB ).normalize();

            const deltaPan  = new Vector2().subVectors( currentCenter, previousCenter );
            const deltaZoom = currentGap - previousGap;
            const deltaRoll = currentDirection.dot( previousDirection );

            this._pan( deltaPan );
            this._zoom( deltaZoom );
            this._roll( deltaRoll );
            this._consumeEvent( touchEvent );

        } else if ( numberOfPreviousTouches === 1 && numberOfCurrentTouches === 1 ) {

            const deltaRotate = new Vector2(
                currentTouches[ 0 ].clientX - previousTouches[ 0 ].clientX,
                currentTouches[ 0 ].clientY - previousTouches[ 0 ].clientY
            ).divideScalar( 10 ); //todo: to high sensibility else !!!

            this._rotate( deltaRotate );
            this._consumeEvent( touchEvent );

        } else {

            this.logger.warn( 'Ignoring inconsistent touches event.' );

        }

        this.previousTouches = currentTouches;

    }

    // Mouse
    _onMouseEnter ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        this.impose();
        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.focus();
        }

    }

    _onMouseLeave ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.blur();
        }
        this.dispose();
        this._state = State.None;

    }

    _onMouseDown ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        const actionMap = this.actionsMap;
        const button    = mouseEvent.button;

        if ( actionMap.front.includes( button ) ) {

            this._state = State.Moving;
            this._front();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.back.includes( button ) ) {

            this._state = State.Moving;
            this._back();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.up.includes( button ) ) {

            this._state = State.Moving;
            this._up();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.down.includes( button ) ) {

            this._state = State.Moving;
            this._down();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.left.includes( button ) ) {

            this._state = State.Moving;
            this._left();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.right.includes( button ) ) {

            this._state = State.Moving;
            this._right();
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.rotate.includes( button ) ) {

            this._state = State.Rotating;
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.pan.includes( button ) ) {

            this._state = State.Panning;
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.roll.left.includes( button ) ) {

            this._state = State.Rolling;
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.roll.right.includes( button ) ) {

            this._state = State.Rolling;
            this._consumeEvent( mouseEvent );

        } else if ( actionMap.zoom.includes( button ) ) {

            this._state = State.Zooming;
            this._consumeEvent( mouseEvent );

        } else {

            this._state = State.None;

        }

    }

    _onMouseMove ( mouseEvent ) {

        if ( !this.enabled || this._state === State.None ) { return }
        this._preventEvent( mouseEvent );

        const state = this._state;
        const delta = {
            x: mouseEvent.movementX || mouseEvent.mozMovementX || mouseEvent.webkitMovementX || 0,
            y: mouseEvent.movementY || mouseEvent.mozMovementY || mouseEvent.webkitMovementY || 0
        };

        switch ( state ) {

            case State.Moving:
                break

            case State.Rotating:
                this._rotate( delta );
                this._consumeEvent( mouseEvent );
                break

            case State.Panning:
                this._pan( delta );
                this._consumeEvent( mouseEvent );
                break

            case State.Rolling:
                this._roll( delta );
                this._consumeEvent( mouseEvent );
                break

            case State.Zooming:
                this._zoom( delta );
                this._consumeEvent( mouseEvent );
                break

            default:
                throw new RangeError( `Unknown state: ${ state }` )

        }

    }

    //todo allow other displacement from wheel
    _onMouseWheel ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        const delta = mouseEvent.wheelDelta || mouseEvent.deltaY;
        this._zoom( delta );
        this._consumeEvent( mouseEvent );

    }

    _onMouseUp ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        this._state = State.None;
        this._consumeEvent( mouseEvent );

    }

    _onDblClick ( mouseEvent ) {

        if ( !this.enabled ) { return }
        this._preventEvent( mouseEvent );

        this.logger.warn( 'CameraControls: Double click events is not implemented yet, sorry for the disagreement.' );

    }

    // Positional methods
    _front () {

        if ( !this.canMove || !this.canFront ) { return }

        if ( this._camera.isPerspectiveCamera ) {

            const cameraDirection = FRONT.clone().applyQuaternion( this._camera.quaternion );
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.frontSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        } else if ( this._camera.isOrthographicCamera ) {

            const cameraDirection = FRONT.clone().applyQuaternion( this._camera.quaternion );
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.frontSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

            //            const halfOffsetWidth = this.domElement.offsetWidth / 2
            //            const halfOffsetHeight = this.domElement.offsetHeight / 2
            //            this._camera.top -= halfOffsetHeight * this.frontSpeed
            //            this._camera.bottom += halfOffsetHeight * this.frontSpeed
            //            this._camera.right -= halfOffsetWidth * this.frontSpeed
            //            this._camera.left += halfOffsetWidth * this.frontSpeed

            const zoomDisplacement = this.frontSpeed * this.zoomSpeed;
            this._camera.zoom += zoomDisplacement;

            this._camera.updateProjectionMatrix();

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    /**
     * @method
     * @private
     * @return {void}
     */
    _back () {

        if ( !this.canMove || !this.canBack ) { return }

        if ( this._camera.isPerspectiveCamera ) {

            const cameraDirection = BACK.clone().applyQuaternion( this._camera.quaternion );
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.backSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        } else if ( this._camera.isOrthographicCamera ) {

            const cameraDirection = BACK.clone().applyQuaternion( this._camera.quaternion );
            const displacement    = ( this._trackPath ) ? this._getPathDisplacement( cameraDirection ) : cameraDirection.multiplyScalar( this.backSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

            //            const halfOffsetWidth = this.domElement.offsetWidth / 2
            //            const halfOffsetHeight = this.domElement.offsetHeight / 2
            //            this._camera.top += halfOffsetHeight * this.frontSpeed
            //            this._camera.bottom -= halfOffsetHeight * this.frontSpeed
            //            this._camera.right += halfOffsetWidth * this.frontSpeed
            //            this._camera.left -= halfOffsetWidth * this.frontSpeed

            const zoomDisplacement = this.backSpeed * this.zoomSpeed;
            if ( this._camera.zoom - zoomDisplacement <= 0.0 ) {
                this._camera.zoom = 0.01;
            } else {
                this._camera.zoom -= zoomDisplacement;
            }

            this._camera.updateProjectionMatrix();

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    /**
     * @method
     * @private
     * @return {void}
     * @fires module:Controllers/CameraControls~CameraControls#move
     * @fires module:Controllers/CameraControls~CameraControls#change
     */
    _up () {

        if ( !this.canMove || !this.canUp ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = UP.clone()
                                   .applyQuaternion( this._camera.quaternion )
                                   .multiplyScalar( this.upSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    /**
     * @method
     * @private
     * @return {void}
     */
    _down () {

        if ( !this.canMove || !this.canDown ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = DOWN.clone()
                                     .applyQuaternion( this._camera.quaternion )
                                     .multiplyScalar( this.downSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    /**
     *
     * @private
     * @return {void}
     */
    _left () {

        if ( !this.canMove || !this.canLeft ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = LEFT.clone()
                                     .applyQuaternion( this._camera.quaternion )
                                     .multiplyScalar( this.leftSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        } else {

            this.logger.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _right () {

        if ( !this.canMove || !this.canRight ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const displacement = RIGHT.clone()
                                      .applyQuaternion( this._camera.quaternion )
                                      .multiplyScalar( this.rightSpeed );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        }

        this.dispatchEvent( { type: 'move' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _rotate ( delta ) {

        if ( !this.canRotate ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const cameraPosition = this._camera.position;
            const targetPosition = this._target.position;
            const distanceTo     = cameraPosition.distanceTo( targetPosition );
            const targetToCamera = new Vector3().subVectors( cameraPosition, targetPosition ).normalize();
            const rotateSpeed    = this.rotateSpeed;

            switch ( this._mode ) {

                case CameraControlMode.FirstPerson: {

                    //        const normalizedX = (delta.x / this._domElement.clientWidth) - 1.0
                    //        const normalizedY = (delta.y / this._domElement.clientHeight) - 1.0
                    const normalizedX = delta.x;
                    const normalizedY = delta.y;

                    const newTargetPosition = new Vector3( -normalizedX, normalizedY, 0 )
                        .applyQuaternion( this._camera.quaternion )
                        .multiplyScalar( rotateSpeed )
                        .add( targetPosition );

                    // Protect against owl head
                    const cameraToTargetDirection = new Vector3().subVectors( newTargetPosition, cameraPosition ).normalize();
                    const dotProductUp            = UP.clone().dot( cameraToTargetDirection );
                    const dotProductRight         = RIGHT.clone().dot( cameraToTargetDirection );

                    const max = 0.97;
                    if ( dotProductUp < -max || dotProductUp > max || dotProductRight < -2 || dotProductRight > 2 ) {
                        return
                    }

                    // Care the target distance will change the sensitivity of mouse move
                    // and
                    // We need to set target at pre-defined distance of camera
                    // because if we use newTargetPosition the distance between
                    // camera and target will increase silently over the time
                    const lockedTargetPostion = cameraToTargetDirection.multiplyScalar( 1.0 ) // Todo: option
                                                                       .add( cameraPosition );
                    this.setTargetPosition( lockedTargetPostion );
                }
                    break

                case CameraControlMode.Orbit: {

                    // restrict theta and phi between desired limits
                    const spherical = new Spherical().setFromVector3( targetToCamera );

                    const newTheta  = spherical.theta + ( degreesToRadians( -delta.x ) * rotateSpeed );
                    const newPhi    = spherical.phi + ( degreesToRadians( -delta.y ) * rotateSpeed );
                    spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, newTheta ) );
                    spherical.phi   = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, newPhi ) );

                    const newPosition = new Vector3().setFromSpherical( spherical )
                                                     .multiplyScalar( distanceTo )
                                                     .add( targetPosition );

                    this.setCameraPosition( newPosition );
                }
                    break

                default:
                    throw new RangeError( `Unamanaged rotation for camera mode ${ this._mode }` )

            }

        } /*else {

         // Todo: ...

         }*/

        this.dispatchEvent( { type: 'rotate' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _pan ( delta ) {

        if ( !this.canPan ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            // Take into account the distance between the camera and his target
            const cameraPosition = this._camera.position;
            const targetPosition = this._target.position;
            const distanceTo     = cameraPosition.distanceTo( targetPosition );
            const displacement   = new Vector3( -delta.x, delta.y, 0 ).applyQuaternion( this._camera.quaternion )
                                                                      .multiplyScalar( this.panSpeed * distanceTo );

            this._camera.position.add( displacement );
            this._target.position.add( displacement );

        }

        this.dispatchEvent( { type: 'pan' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _roll ( delta ) {

        if ( !this.canRoll ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const cameraPosition = this._camera.position;
            const targetPosition = this._target.position;
            const targetToCamera = new Vector3().subVectors( cameraPosition, targetPosition ).normalize();
            const angle          = delta * this.rollSpeed;

            this._camera.up.applyAxisAngle( targetToCamera, angle );
            this._camera.lookAt( targetPosition );
            //or
            //        this._camera.rotateOnAxis( targetToCamera, angle )

        }

        this.dispatchEvent( { type: 'roll' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _zoom ( delta ) {

        if ( !this.canZoom ) { return }

        if ( this._camera.isPerspectiveCamera ) {

            switch ( this._mode ) {

                case CameraControlMode.FirstPerson: {

                    if ( delta > 0 ) {
                        this._camera.fov--;
                    } else {
                        this._camera.fov++;
                    }

                    this._camera.updateProjectionMatrix();
                }
                    break

                case CameraControlMode.Orbit: {

                    const cameraPosition                 = this._camera.position;
                    const targetPosition                 = this._target.position;
                    const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition );
                    const displacement                   = FRONT.clone()
                                                                .applyQuaternion( this._camera.quaternion )
                                                                .multiplyScalar( delta * this.zoomSpeed * distanceBetweenCameraAndTarget );

                    let cameraNextPosition                   = cameraPosition.clone().add( displacement );
                    const currentCameraToNextCameraDirection = new Vector3().subVectors( cameraNextPosition, cameraPosition ).normalize();
                    const targetToCurrentCameraDirection     = new Vector3().subVectors( cameraPosition, targetPosition ).normalize();
                    const targetToNextCameraDirection        = new Vector3().subVectors( cameraNextPosition, targetPosition ).normalize();
                    const dotCurrentDirection                = currentCameraToNextCameraDirection.dot( targetToCurrentCameraDirection );
                    const dotNextDirection                   = currentCameraToNextCameraDirection.dot( targetToNextCameraDirection );
                    const nextCameraToTargetSquaredDistance  = cameraNextPosition.distanceToSquared( targetPosition );

                    if ( dotCurrentDirection < 0 && ( ( nextCameraToTargetSquaredDistance < ( this.zoomMinimum * this.zoomMinimum ) ) || dotNextDirection > 0 ) ) {

                        cameraNextPosition = targetToCurrentCameraDirection.clone()
                                                                           .multiplyScalar( this.zoomMinimum )
                                                                           .add( targetPosition );

                    }

                    this._camera.position.copy( cameraNextPosition );
                }
                    break

                default:
                    throw new RangeError( `Invalid camera control mode parameter: ${ this._mode }` )

            }

        } else if ( this._camera.isOrthographicCamera ) {

            const containerWidth                 = this.domElement.offsetWidth;
            const containerHeight                = this.domElement.offsetHeight;
            const aspect                         = containerWidth / containerHeight;
            const cameraPosition                 = this._camera.position;
            const targetPosition                 = this._target.position;
            const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition );
            const direction                      = ( delta > 0 ) ? FRONT.clone() : BACK.clone();
            const cameraDirection                = direction.applyQuaternion( this._camera.quaternion ).normalize();
            const displacement                   = cameraDirection.multiplyScalar( this.zoomSpeed * distanceBetweenCameraAndTarget );

            cameraPosition.add( displacement );

            const newDistance = cameraPosition.distanceTo( targetPosition );
            const zoomHeight  = ( newDistance / 2 );
            const zoomWidth   = ( ( newDistance * aspect ) / 2 );

            this._camera.top    = zoomHeight;
            this._camera.bottom = -zoomHeight;
            this._camera.right  = zoomWidth;
            this._camera.left   = -zoomWidth;

            this._camera.updateProjectionMatrix();

            // OR

            //            const deltaZoom = this.zoomSpeed * 100
            //            if ( delta > 0 ) {
            //
            //                if ( this._camera.zoom + deltaZoom >= 100.0 ) {
            //                    this._camera.zoom = 100.0
            //                } else {
            //                    this._camera.zoom += deltaZoom
            //                }
            //
            //            } else {
            //
            //                if ( this._camera.zoom - deltaZoom <= 0.0 ) {
            //                    this._camera.zoom = 0.01
            //                } else {
            //                    this._camera.zoom -= deltaZoom
            //                }
            //
            //            }
            //
            //            this._camera.updateProjectionMatrix()

            // OR

            //            const zoomFactor = this.zoomSpeed * 1000
            //            const width      = this._camera.right * 2
            //            const height     = this._camera.top * 2
            //            const aspect     = width / height
            //
            //            const distance                      = this._camera.position.distanceTo( this._target.position )
            //
            //            const zoomHeight = ( delta < 0 ) ? height + zoomFactor : height - zoomFactor
            //            const zoomWidth  = ( delta < 0 ) ? width + ( zoomFactor * aspect ) : width - ( zoomFactor * aspect )
            //
            //            this._camera.top    = ( zoomHeight / 2 )
            //            this._camera.bottom = -( zoomHeight / 2 )
            //            this._camera.right  = ( zoomWidth / 2 )
            //            this._camera.left   = -( zoomWidth / 2 )
            //
            //            this._camera.updateProjectionMatrix()

        }

        this.dispatchEvent( { type: 'zoom' } );
        this.dispatchEvent( { type: 'change' } );

    }

    _lookAt ( direction ) {

        if ( !this.canLookAt ) { return }

        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

            const _direction     = direction.clone();
            const cameraPosition = this._camera.position;
            const targetPosition = this._target.position;
            const distanceTo     = cameraPosition.distanceTo( targetPosition );

            switch ( this.mode ) {

                // The result is inverted in front of Orbit type but is correct in FP mode except up and down so invert y axis
                case CameraControlMode.FirstPerson: {
                    _direction.y            = -( _direction.y );
                    const newTargetPosition = _direction.multiplyScalar( distanceTo ).add( cameraPosition );
                    this.setTargetPosition( newTargetPosition );
                }
                    break

                case CameraControlMode.Orbit: {
                    const newCameraPosition = _direction.multiplyScalar( distanceTo ).add( targetPosition );
                    this.setCameraPosition( newCameraPosition );
                }
                    break

                default:
                    throw new RangeError( `Invalid camera control mode parameter: ${ this._mode }` )

            }

        }/* else {

         // Todo: ...

         }*/

        this.dispatchEvent( { type: 'lookAt' } );
        this.dispatchEvent( { type: 'change' } );

    }

    // Helpers
    _initPathDisplacement () {

        //todo: project on closest path position
        //todo: move on path in the FRONT camera direction

        if ( isEmptyArray( this._paths ) ) {
            this.logger.warn( 'Try to init path displacement without any paths' );
            return
        }

        if ( isNotDefined( this._currentPath ) ) {

            this._currentPathIndex  = 0;
            this._currentPathOffset = 0;
            this._currentPath       = this._paths[ 0 ];

        }

        this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset );

        switch ( this._mode ) {

            case CameraControlMode.FirstPerson: {

                if ( this._lockedTarget ) {

                    const displacement = new Vector3().subVectors( this._currentPathPosition, this.camera.position );
                    this._camera.position.add( displacement );
                    this._target.position.add( displacement );

                } else {

                    this.setCameraPosition( this._currentPathPosition );

                }
            }
                break

            case CameraControlMode.Orbit: {

                if ( this._lockedTarget ) {

                    const displacement = new Vector3().subVectors( this._currentPathPosition, this.target.position );
                    this._camera.position.add( displacement );
                    this._target.position.add( displacement );

                } else {

                    this.setTargetPosition( this._currentPathPosition );

                }
            }
                break

            default:
                throw new RangeError( `Invalid camera control _mode parameter: ${ this._mode }` )

        }

    }

    _getPathDisplacement ( cameraDirection ) {

        let displacement = null;

        //Todo: add options to move in camera direction or not
        // try a default positive progress on path
        const currentPathPosition = this._currentPathPosition;

        const nextPositiveOffset   = this._currentPathOffset + this._cameraJump;
        const positiveOffset       = ( nextPositiveOffset < 1 ) ? nextPositiveOffset : 1;
        const positivePathPosition = this._currentPath.getPointAt( positiveOffset );
        const positiveDisplacement = new Vector3().subVectors( positivePathPosition, currentPathPosition );
        const positiveDirection    = positiveDisplacement.clone().normalize();
        const positiveDot          = cameraDirection.dot( positiveDirection );

        const nextNegativeOffset   = this._currentPathOffset - this._cameraJump;
        const negativeOffset       = ( nextNegativeOffset > 0 ) ? nextNegativeOffset : 0;
        const negativePathPosition = this._currentPath.getPointAt( negativeOffset );
        const negativeDisplacement = new Vector3().subVectors( negativePathPosition, currentPathPosition );
        const negativeDirection    = negativeDisplacement.clone().normalize();
        const negativeDot          = cameraDirection.dot( negativeDirection );

        if ( positiveDot === 0 && negativeDot < 0 ) {

            // Search closest path
            const pathExtremityMap = this._getDirectionsMap();

            let indexOfBestPath  = undefined;
            let bestDisplacement = undefined;
            let bestDotProduct   = -1;
            let isFromStart      = undefined;
            pathExtremityMap.forEach( ( pathExtremity ) => {

                const pathIndex = pathExtremity.index;

                const startDisplacement = pathExtremity.startDisplacement;
                if ( startDisplacement ) {

                    const startDirection = startDisplacement.clone().normalize();
                    const startDot       = cameraDirection.dot( startDirection );

                    if ( startDot > bestDotProduct ) {

                        indexOfBestPath  = pathIndex;
                        bestDisplacement = startDisplacement;
                        bestDotProduct   = startDot;
                        isFromStart      = true;

                    }

                }

                const endDisplacement = pathExtremity.endDisplacement;
                if ( endDisplacement ) {

                    const endDirection = endDisplacement.clone().normalize();
                    const endDot       = cameraDirection.dot( endDirection );

                    if ( endDot > bestDotProduct ) {
                        indexOfBestPath  = pathIndex;
                        bestDisplacement = endDisplacement;
                        bestDotProduct   = endDot;
                        isFromStart      = false;
                    }

                }

            } );

            if ( indexOfBestPath !== undefined ) {

                this._currentPathIndex    = indexOfBestPath;
                this._currentPath         = this._paths[ this._currentPathIndex ];
                this._currentPathOffset   = ( isFromStart ) ? this._cameraJump : 1 - this._cameraJump;
                this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset );
                displacement              = bestDisplacement;

            } else {

                this.logger.warn( 'Reach path end.' );
                displacement = new Vector3();

            }

        } else if ( positiveDot > 0 && negativeDot <= 0 ) {

            displacement              = positiveDisplacement;
            this._currentPathOffset   = positiveOffset;
            this._currentPathPosition = positivePathPosition;

        } else if ( positiveDot <= 0 && negativeDot > 0 ) {

            displacement              = negativeDisplacement;
            this._currentPathOffset   = negativeOffset;
            this._currentPathPosition = negativePathPosition;

        } else if ( positiveDot < 0 && negativeDot === 0 ) {

            // Search closest path
            const pathExtremityMap = this._getDirectionsMap();

            let indexOfBestPath  = undefined;
            let bestDisplacement = undefined;
            let bestDotProduct   = -1;
            let isFromStart      = undefined;
            pathExtremityMap.forEach( ( pathExtremity ) => {

                const pathIndex = pathExtremity.index;

                const startDisplacement = pathExtremity.startDisplacement;
                if ( startDisplacement ) {

                    const startDirection = startDisplacement.clone().normalize();
                    const startDot       = cameraDirection.dot( startDirection );

                    if ( startDot > bestDotProduct ) {

                        indexOfBestPath  = pathIndex;
                        bestDisplacement = startDisplacement;
                        bestDotProduct   = startDot;
                        isFromStart      = true;

                    }

                }

                const endDisplacement = pathExtremity.endDisplacement;
                if ( endDisplacement ) {

                    const endDirection = endDisplacement.clone().normalize();
                    const endDot       = cameraDirection.dot( endDirection );

                    if ( endDot > bestDotProduct ) {
                        indexOfBestPath  = pathIndex;
                        bestDisplacement = endDisplacement;
                        bestDotProduct   = endDot;
                        isFromStart      = false;
                    }

                }

            } );

            if ( indexOfBestPath !== undefined ) {

                this._currentPathIndex    = indexOfBestPath;
                this._currentPath         = this._paths[ this._currentPathIndex ];
                this._currentPathOffset   = ( isFromStart ) ? this._cameraJump : 1 - this._cameraJump;
                this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset );
                displacement              = bestDisplacement;

            } else {

                this.logger.warn( 'Reach path start.' );
                displacement = new Vector3();

            }

        } else if ( ( positiveDot < 0 && negativeDot < 0 ) || ( positiveDot > 0 && negativeDot > 0 ) ) { // Could occurs in high sharp curve with big move step

            if ( positiveDot > negativeDot ) {

                displacement              = positiveDisplacement;
                this._currentPathOffset   = positiveOffset;
                this._currentPathPosition = positivePathPosition;

            } else {

                displacement              = negativeDisplacement;
                this._currentPathOffset   = negativeOffset;
                this._currentPathPosition = negativePathPosition;

            }

        } else {

            this.logger.warn( 'Unable to find correct next path position.' );
            displacement = new Vector3();

        }

        return displacement

    }

    _getDirectionsMap () {

        //todo: use cache !!! Could become a complet map with nodes on path network

        const currentPathPosition = this._currentPathPosition;
        const currentIndex        = this._currentPathIndex;
        const jump                = this._cameraJump;
        const maxDistance         = this._maxJump;

        return this._paths.reduce( ( array, path, index ) => {

            if ( index === currentIndex ) { return array }

            const start           = path.getPointAt( 0 );
            const distanceToStart = currentPathPosition.distanceToSquared( start );
            let startDisplacement = undefined;
            if ( distanceToStart < maxDistance ) {
                startDisplacement = new Vector3().subVectors( path.getPointAt( jump ), start );
            }

            const end           = path.getPointAt( 1 );
            const distanceToEnd = currentPathPosition.distanceToSquared( end );
            let endDisplacement = undefined;
            if ( distanceToEnd < maxDistance ) {
                endDisplacement = new Vector3().subVectors( path.getPointAt( 1 - jump ), end );
            }

            if ( startDisplacement || endDisplacement ) {
                array.push( {
                    index,
                    startDisplacement,
                    endDisplacement
                } );
            }

            return array

        }, [] )

    }

}

//// Extra work

//
//// t: current time, b: begInnIng value, c: change In value, d: duration
//const ease = {
//    def:              'easeOutQuad',
//    easeInQuad:       function ( x, t, b, c, d ) {
//        return c * (t /= d) * t + b;
//    },
//    easeOutQuad:      function ( x, t, b, c, d ) {
//        return -c * (t /= d) * (t - 2) + b;
//    },
//    easeInOutQuad:    function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t + b;
//        }
//        return -c / 2 * ((--t) * (t - 2) - 1) + b;
//    },
//    easeInCubic:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t + b;
//    },
//    easeOutCubic:     function ( x, t, b, c, d ) {
//        return c * ((t = t / d - 1) * t * t + 1) + b;
//    },
//    easeInOutCubic:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t + b;
//        }
//        return c / 2 * ((t -= 2) * t * t + 2) + b;
//    },
//    easeInQuart:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t * t + b;
//    },
//    easeOutQuart:     function ( x, t, b, c, d ) {
//        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
//    },
//    easeInOutQuart:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t * t + b;
//        }
//        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
//    },
//    easeInQuint:      function ( x, t, b, c, d ) {
//        return c * (t /= d) * t * t * t * t + b;
//    },
//    easeOutQuint:     function ( x, t, b, c, d ) {
//        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
//    },
//    easeInOutQuint:   function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * t * t * t * t * t + b;
//        }
//        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
//    },
//    easeInSine:       function ( x, t, b, c, d ) {
//        return -c * Math.cos( t / d * (Math.PI / 2) ) + c + b;
//    },
//    easeOutSine:      function ( x, t, b, c, d ) {
//        return c * Math.sin( t / d * (Math.PI / 2) ) + b;
//    },
//    easeInOutSine:    function ( x, t, b, c, d ) {
//        return -c / 2 * (Math.cos( Math.PI * t / d ) - 1) + b;
//    },
//    easeInExpo:       function ( x, t, b, c, d ) {
//        return (t == 0) ? b : c * Math.pow( 2, 10 * (t / d - 1) ) + b;
//    },
//    easeOutExpo:      function ( x, t, b, c, d ) {
//        return (t == d) ? b + c : c * (-Math.pow( 2, -10 * t / d ) + 1) + b;
//    },
//    easeInOutExpo:    function ( x, t, b, c, d ) {
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( t == d ) {
//            return b + c;
//        }
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * Math.pow( 2, 10 * (t - 1) ) + b;
//        }
//        return c / 2 * (-Math.pow( 2, -10 * --t ) + 2) + b;
//    },
//    easeInCirc:       function ( x, t, b, c, d ) {
//        return -c * (Math.sqrt( 1 - (t /= d) * t ) - 1) + b;
//    },
//    easeOutCirc:      function ( x, t, b, c, d ) {
//        return c * Math.sqrt( 1 - (t = t / d - 1) * t ) + b;
//    },
//    easeInOutCirc:    function ( x, t, b, c, d ) {
//        if ( (t /= d / 2) < 1 ) {
//            return -c / 2 * (Math.sqrt( 1 - t * t ) - 1) + b;
//        }
//        return c / 2 * (Math.sqrt( 1 - (t -= 2) * t ) + 1) + b;
//    },
//    easeInElastic:    function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d) == 1 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * .3;
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        return -(a * Math.pow( 2, 10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p )) + b;
//    },
//    easeOutElastic:   function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d) == 1 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * .3;
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        return a * Math.pow( 2, -10 * t ) * Math.sin( (t * d - s) * (2 * Math.PI) / p ) + c + b;
//    },
//    easeInOutElastic: function ( x, t, b, c, d ) {
//        var s = 1.70158;
//        var p = 0;
//        var a = c;
//        if ( t == 0 ) {
//            return b;
//        }
//        if ( (t /= d / 2) == 2 ) {
//            return b + c;
//        }
//        if ( !p ) {
//            p = d * (.3 * 1.5);
//        }
//        if ( a < Math.abs( c ) ) {
//            a     = c;
//            var s = p / 4;
//        }
//        else {
//            var s = p / (2 * Math.PI) * Math.asin( c / a );
//        }
//        if ( t < 1 ) {
//            return -.5 * (a * Math.pow( 2, 10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p )) + b;
//        }
//        return a * Math.pow( 2, -10 * (t -= 1) ) * Math.sin( (t * d - s) * (2 * Math.PI) / p ) * .5 + c + b;
//    },
//    easeInBack:       function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        return c * (t /= d) * t * ((s + 1) * t - s) + b;
//    },
//    easeOutBack:      function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
//    },
//    easeInOutBack:    function ( x, t, b, c, d, s ) {
//        if ( s == undefined ) {
//            s = 1.70158;
//        }
//        if ( (t /= d / 2) < 1 ) {
//            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
//        }
//        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
//    },
//    easeInBounce:     function ( x, t, b, c, d ) {
//        return c - jQuery.easing.easeOutBounce( x, d - t, 0, c, d ) + b;
//    },
//    easeOutBounce:    function ( x, t, b, c, d ) {
//        if ( (t /= d) < (1 / 2.75) ) {
//            return c * (7.5625 * t * t) + b;
//        } else if ( t < (2 / 2.75) ) {
//            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
//        } else if ( t < (2.5 / 2.75) ) {
//            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
//        } else {
//            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
//        }
//    },
//    easeInOutBounce:  function ( x, t, b, c, d ) {
//        if ( t < d / 2 ) {
//            return jQuery.easing.easeInBounce( x, t * 2, 0, c, d ) * .5 + b;
//        }
//        return jQuery.easing.easeOutBounce( x, t * 2 - d, 0, c, d ) * .5 + c * .5 + b;
//    }
//}
//
////const accelerations = {
////    Linear: function( speed ) {
////        return speed + acceleration
////    }
////}
//
//class Movement {
//
//    constructor ( min, max, minSpeed, currentSpeed, maxSpeed, acceleration ) {
//
//        this.bounds   = {
//            min: -Infinity,
//            max: Infinity
//        }
//        this.speed    = {
//            min:     0,
//            current: 1.0,
//            max:     Infinity
//        }
//        this.minSpeed = 0.0
//        this.speed    = 1.0
//        this.maxSpeed = Infinity
//
//        this.acceleration = function ( timer ) {
//            return speed += 0.1
//        }
//
//        this.deceleration = function ( timer, speed ) {
//            return speed -= 0.1
//        }
//    }
//
//}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { LineBasicMaterial }        from 'three-full/sources/materials/LineBasicMaterial'

class HighlightableLineMaterial extends LineBasicMaterial {

    constructor ( parameters ) {
        super( parameters );
        this.isHighlightableMaterial = true;
        //        this.type                    = 'HighlightableLineMaterial'

        this.depthTest   = false;
        this.depthWrite  = false;
        this.fog         = false;
        this.transparent = true;
        this.linewidth   = 1;
        this.oldColor    = this.color.clone();

    }

    highlight ( highlighted ) {

        if ( highlighted ) {

            const lum = 0.35;
            const _r  = this.color.r;
            const _g  = this.color.g;
            const _b  = this.color.b;
            const r   = Math.min( Math.max( 0, _r + ( _r * lum ) ), 1.0 );
            const g   = Math.min( Math.max( 0, _g + ( _g * lum ) ), 1.0 );
            const b   = Math.min( Math.max( 0, _b + ( _b * lum ) ), 1.0 );
            this.color.setRGB( r, g, b );

        } else {

            this.color.copy( this.oldColor );

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { DoubleSide }        from 'three-full/sources/constants'
//import { MeshBasicMaterial } from 'three-full/sources/materials/MeshBasicMaterial'

class HighlightableMaterial extends MeshBasicMaterial {

    constructor ( parameters ) {
        super( parameters );
        this.isHighlightableMaterial = true;
        //        this.type                    = 'HighlightableMaterial'

        this.depthTest   = false;
        this.depthWrite  = false;
        this.fog         = false;
        this.side        = DoubleSide;
        this.transparent = true;
        this.oldColor    = this.color.clone();

    }

    highlight ( highlighted ) {

        if ( highlighted ) {

            const lum = 0.35;
            const _r  = this.color.r;
            const _g  = this.color.g;
            const _b  = this.color.b;
            const r   = Math.min( Math.max( 0, _r + ( _r * lum ) ), 1.0 );
            const g   = Math.min( Math.max( 0, _g + ( _g * lum ) ), 1.0 );
            const b   = Math.min( Math.max( 0, _b + ( _b * lum ) ), 1.0 );
            this.color.setRGB( r, g, b );

        } else {

            this.color.copy( this.oldColor );

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { DoubleSide }        from 'three-full/sources/constants'
//import { BufferGeometry }    from 'three-full/sources/core/BufferGeometry'
//import { MeshBasicMaterial } from 'three-full/sources/materials/MeshBasicMaterial'
//import { Mesh }              from 'three-full/sources/objects/Mesh'

class AbstractHitbox extends Mesh {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new BufferGeometry(),
                material: new MeshBasicMaterial( {
                    visible:    false,
                    depthTest:  false,
                    depthWrite: false,
                    fog:        false,
                    side:       DoubleSide,
                    color:      0x654321
                    //                    opacity:     0.0,
                    //                    transparent: true
                } )
            }, ...parameters
        };

        super( _parameters.geometry, _parameters.material );
        this.isHitbox         = true;
        this.type             = 'Hitbox';
        this.matrixAutoUpdate = false;

    }
}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { OctahedronBufferGeometry } from 'three-full/sources/geometries/OctahedronGeometry'

class OctahedricalHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new OctahedronBufferGeometry( 1.2, 0 )
            }, ...parameters
        };

        super( _parameters );
        this.isOctahedricalHitbox = true;
        this.type                 = 'OctahedricalHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { Object3D }   from 'three-full/sources/core/Object3D'
//import { Quaternion } from 'three-full/sources/math/Quaternion'

class AbstractHandle extends Object3D {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                debug:  false,
                color:  0xffffff,
                hitbox: null
            }, ...parameters
        };

        super( _parameters );
        this.isHandle         = true;
        this.type             = 'Handle';
        this.matrixAutoUpdate = true;

        this.debug  = _parameters.debug;
        this.color  = _parameters.color;
        this.hitbox = _parameters.hitbox;

        this.baseQuaternion = new Quaternion();

    }

    get color () {

        return this.line.material.color.clone()

    }

    set color ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Color cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Color cannot be undefined ! Expect an instance of Color.' ) }
        //        if ( !( value instanceof Color ) ) { throw new Error( `Color cannot be an instance of ${value.constructor.name}. Expect an instance of Color.` ) }

        this.traverse( ( child ) => {

            let materials = child.material;
            if ( !materials ) { return }

            materials.color.setHex( value );

        } );

    }

    get hitbox () {
        return this._hitbox
    }

    set hitbox ( value ) {
        this._hitbox = value;
        this.add( value );
    }

    setColor ( value ) {

        this.color = value;
        return this

    }

    setHitbox ( value ) {
        this.hitbox = value;
        return this
    }

    setScale ( x, y, z ) {

        this.scale.set( x, y, z );
        return this

    }

    setPosition ( x, y, z ) {
        this.position.set( x, y, z );
        return this
    }

    highlight ( value ) {

        for ( let childIndex = 0, numberOfChildren = this.children.length ; childIndex < numberOfChildren ; childIndex++ ) {
            const child = this.children[ childIndex ];
            if ( child.isHitbox ) { continue }

            const childMaterial = child.material;
            if ( isUndefined( childMaterial ) || !childMaterial.isHighlightableMaterial ) { continue }

            childMaterial.highlight( value );
        }

    }

    raycast ( raycaster, intersects ) {

        const intersections = raycaster.intersectObject( this._hitbox, false );
        if ( intersections.length > 0 ) {
            intersects.push( {
                distance: intersections[ 0 ].distance,
                object:   this
            } );
        }

    }

    setRotationFromAxisAndAngle ( axis, angle ) {

        this.quaternion.setFromAxisAngle( axis, angle );
        this.baseQuaternion.copy( this.quaternion );
        return this

    }

    // eslint-disable-next-line no-unused-vars
    update ( cameraDirection ) {}

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class OctahedricalHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:  0xffffff,
                hitbox: new OctahedricalHitbox()
            }, ...parameters
        };

        super( _parameters );
        this.isOmnidirectionalHandle = true;
        this.type                    = 'OmnidirectionalHandle';

        const octahedronGeometry    = new OctahedronBufferGeometry( 0.1, 0 );
        const octahedronMaterial    = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.55
        } );
        const octahedron            = new Mesh( octahedronGeometry, octahedronMaterial );
        octahedron.matrixAutoUpdate = false;
        this.add( octahedron );

        const edgesGeometry    = new EdgesGeometry( octahedronGeometry );
        const edgesMaterial    = new HighlightableLineMaterial( {
            color:     _parameters.color,
            linewidth: 4
        } );
        const edges            = new LineSegments( edgesGeometry, edgesMaterial );
        edges.matrixAutoUpdate = false;
        this.add( edges );

    }

    update ( cameraDirection ) {
        super.update( cameraDirection );

        this.updateMatrix();
        this.hitbox.updateMatrix();
    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { Float32BufferAttribute } from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }         from 'three-full/sources/core/BufferGeometry'

class PlanarHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const planePositions = ( parameters.centered ) ?
            [
                -0.6, -0.6, 0.0,
                0.6, -0.6, 0.0,
                0.6, 0.6, 0.0,
                -0.6, 0.6, 0.0
            ] : [
                0.0, 0.0, 0.0,
                1.1, 0.0, 0.0,
                1.1, 1.1, 0.0,
                0.0, 1.1, 0.0
            ];

        const planeIndexes        = [
            0, 1, 2,
            2, 3, 0
        ];
        const planeBufferGeometry = new BufferGeometry();
        planeBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( planePositions, 3 ) );
        planeBufferGeometry.setIndex( planeIndexes );

        const _parameters = {
            ...{
                geometry: planeBufferGeometry
            }, ...parameters
        };

        super( _parameters );
        this.isPlanarHitbox = true;
        this.type           = 'PlanarHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class PlaneHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                showEdges: false,
                centered:  false,
                color:     0xffffff,
                hitbox:    new PlanarHitbox( { centered: parameters.centered || false } ),
                direction: new Vector3( 0, 1, 0 )
            }, ...parameters
        };

        super( _parameters );
        this.isPlaneHandle = true;
        this.type          = 'PlaneHandle';

        // Edge line
        if ( _parameters.showEdges ) {

            const lineBufferGeometry = new BufferGeometry();
            lineBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0.75, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.75, 0.0 ], 3 ) );

            const lineMaterial = new HighlightableLineMaterial( {
                color: _parameters.color
            } );

            const line            = new Line( lineBufferGeometry, lineMaterial );
            line.matrixAutoUpdate = false;
            this.add( line );

        }


        // Plane
        const planePositions = ( _parameters.centered ) ?
            [
                -0.5, -0.5, 0.0,
                0.5, -0.5, 0.0,
                0.5, 0.5, 0.0,
                -0.5, 0.5, 0.0
            ] : [
                0.1, 0.1, 0.0,
                1.0, 0.1, 0.0,
                1.0, 1.0, 0.0,
                0.1, 1.0, 0.0
            ];

        const planeIndexes        = [
            0, 1, 2,
            2, 3, 0
        ];
        const planeBufferGeometry = new BufferGeometry();
        planeBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( planePositions, 3 ) );
        planeBufferGeometry.setIndex( planeIndexes );

        const planeMaterial    = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.35
        } );
        const plane            = new Mesh( planeBufferGeometry, planeMaterial );
        plane.matrixAutoUpdate = false;
        this.add( plane );

        this.xAxis = new Vector3( 1, 0, 0 );
        this.yAxis = new Vector3( 0, 1, 0 );
        this.zAxis = new Vector3( 0, 0, 1 );

        this.xDirection = new Vector3( _parameters.direction.x, 0, 0 );
        this.yDirection = new Vector3( 0, _parameters.direction.y, 0 );
        this.zDirection = new Vector3( 0, 0, _parameters.direction.z );
        this.direction  = _parameters.direction;

        if ( this.debug ) {
            const origin      = new Vector3( 0, 0, 0 );
            const direction   = _parameters.direction;
            const arrowHelper = new ArrowHelper( direction, origin, 1, 0x123456 );
            this.add( arrowHelper );
        }
    }

    get direction () {

        return this._direction

    }

    set direction ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

        this._direction = value;

    }

    update ( cameraDirection ) {

        super.update( cameraDirection );

        // Decompose direction by main orientation
        const xDirection = new Vector3( this._direction.x, 0, 0 );
        const yDirection = new Vector3( 0, this._direction.y, 0 );
        const zDirection = new Vector3( 0, 0, this._direction.z );
        const xDot       = xDirection.dot( cameraDirection );
        const yDot       = yDirection.dot( cameraDirection );
        const zDot       = zDirection.dot( cameraDirection );

        this.quaternion.copy( this.baseQuaternion );

        // XY Plane
        if ( xDot > 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );
            this.xDirection.setX( -1 );
            this.yDirection.setY( -1 );
            this.zDirection.setZ( 0 );

        } else if ( xDot > 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );
            this.xDirection.setX( -1 );
            this.yDirection.setY( 1 );
            this.zDirection.setZ( 0 );

        } else if ( xDot < 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );
            this.xDirection.setX( 1 );
            this.yDirection.setY( -1 );
            this.zDirection.setZ( 0 );

        } else if ( xDot < 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );
            this.xDirection.setX( 1 );
            this.yDirection.setY( 1 );
            this.zDirection.setZ( 0 );

        }

        // XZ Plane
        else if ( xDot > 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );
            this.xDirection.setX( -1 );
            this.yDirection.setY( 0 );
            this.zDirection.setZ( -1 );

        } else if ( xDot > 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );
            this.xDirection.setX( -1 );
            this.yDirection.setY( 0 );
            this.zDirection.setZ( 1 );

        } else if ( xDot < 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );
            this.xDirection.setX( 1 );
            this.yDirection.setY( 0 );
            this.zDirection.setZ( -1 );

        } else if ( xDot < 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );
            this.xDirection.setX( 1 );
            this.yDirection.setY( 0 );
            this.zDirection.setZ( 1 );

        }

        // YZ Plane
        else if ( xDot === 0 && yDot > 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );
            this.xDirection.setX( 0 );
            this.yDirection.setY( -1 );
            this.zDirection.setZ( -1 );

        } else if ( xDot === 0 && yDot > 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );
            this.xDirection.setX( 0 );
            this.yDirection.setY( -1 );
            this.zDirection.setZ( 1 );

        } else if ( xDot === 0 && yDot < 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );
            this.xDirection.setX( 0 );
            this.yDirection.setY( 1 );
            this.zDirection.setZ( -1 );

        } else if ( xDot === 0 && yDot < 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );
            this.xDirection.setX( 0 );
            this.yDirection.setY( 1 );
            this.zDirection.setZ( 1 );

        }

        this.updateMatrix();
        this.hitbox.updateMatrix();

    }

    setDirection ( direction ) {

        this.direction = direction;
        return this

    }

    flipXDirection () {

        this.xDirection.setX( -this.xDirection.x );

    }

    flipYDirection () {

        this.yDirection.setY( -this.yDirection.y );

    }

    flipZDirection () {

        this.zDirection.setZ( -this.zDirection.z );

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { Float32BufferAttribute } from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }         from 'three-full/sources/core/BufferGeometry'
//import { Vector3 }                from 'three-full/sources/math/Vector3'

class LineGeometry extends BufferGeometry {

    constructor ( pointA = new Vector3( 0, 0, 0 ), pointB = new Vector3( 1, 0, 0 ) ) {
        super();

        this.type = 'LineGeometry';
        this.setAttribute( 'position', new Float32BufferAttribute( [ pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z ], 3 ) );

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { CylinderBufferGeometry } from 'three-full/sources/geometries/CylinderGeometry'

class CylindricaHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const cylinderGeometry = new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false );
        cylinderGeometry.translate( 0, 0.5, 0 );
        const _parameters = {
            ...{
                geometry: cylinderGeometry
            }, ...parameters
        };

        super( _parameters );
        this.isCylindricaHitbox = true;
        this.type               = 'CylindricaHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class ScaleHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:     0xffffff,
                hitbox:    new CylindricaHitbox(),
                direction: new Vector3( 0, 1, 0 )
            }, ...parameters
        };

        super( _parameters );
        this.isScaleHandle = true;
        this.type          = 'ScaleHandle';

        const lineGeometry    = new LineGeometry( new Vector3( 0, 0, 0 ), new Vector3( 0, 0.88, 0 ) );
        const lineMaterial    = new HighlightableLineMaterial( { color: _parameters.color } );
        const line            = new Line( lineGeometry, lineMaterial );
        line.matrixAutoUpdate = false;
        this.add( line );

        const boxGeometry = new BoxBufferGeometry( 0.12, 0.12, 0.12 );
        boxGeometry.translate( 0, 0.94, 0 );
        const boxMaterial    = new HighlightableMaterial( { color: _parameters.color } );
        const box            = new Mesh( boxGeometry, boxMaterial );
        box.matrixAutoUpdate = false;
        this.add( box );

        this.direction = _parameters.direction;

    }

    get direction () {

        return this._direction

    }

    set direction ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

        this._direction = value;

        if ( value.y > 0.99999 ) {

            this.quaternion.set( 0, 0, 0, 1 );

        } else if ( value.y < -0.99999 ) {

            this.quaternion.set( 1, 0, 0, 0 );

        } else {

            const axis    = new Vector3( value.z, 0, -value.x ).normalize();
            const radians = Math.acos( value.y );

            this.quaternion.setFromAxisAngle( axis, radians );

        }

    }

    update ( cameraDirection ) {

        super.update( cameraDirection );

        const dotProduct = this._direction.dot( cameraDirection );
        if ( dotProduct >= 0 ) {
            this.flipDirection();
        }

        this.updateMatrix();
        this.hitbox.updateMatrix();

    }

    setDirection ( direction ) {

        this.direction = direction;
        return this

    }

    flipDirection () {

        this.direction = this._direction.negate();

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { DoubleSide }          from 'three-full/sources/constants'
//import { Object3D }            from 'three-full/sources/core/Object3D'
//import { PlaneBufferGeometry } from 'three-full/sources/geometries/PlaneGeometry'
//import { MeshBasicMaterial }   from 'three-full/sources/materials/MeshBasicMaterial'
//import { Mesh }                from 'three-full/sources/objects/Mesh'

class AbstractGizmo extends Object3D {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                debug:     false,
                planeSize: 50
            },
            ...parameters
        };

        super( _parameters );
        this.isGizmo          = true;
        this.type             = 'AbstractGizmo';
        this.matrixAutoUpdate = true;

        this.debug = _parameters.debug;


        //        this.handles                  = new Object3D()
        //        this.handles.name             = 'Handles'
        //        this.handles.matrixAutoUpdate = false
        //
        //        this.add( this.handles )

        ///

        const planeGeometry                  = new PlaneBufferGeometry( _parameters.planeSize, _parameters.planeSize, 2, 2 );
        const planeMaterial                  = new MeshBasicMaterial( {
            side:        DoubleSide,
            visible:     this.debug,
            transparent: true,
            opacity:     0.33,
            color:       0x123456
        } );
        this.intersectPlane                  = new Mesh( planeGeometry, planeMaterial );
        this.intersectPlane.name             = 'IntersectPlane';
        this.intersectPlane.matrixAutoUpdate = true;
        this.intersectPlane.visible          = true;

        this.add( this.intersectPlane );

    }

    _setupHandles ( handlesMap ) {

        const parent = this;
        //        const parent = this.handles

        for ( let name in handlesMap ) {

            const element = handlesMap[ name ];
            if ( isNotArray( element ) ) {

                element.name        = name;
                element.renderOrder = Infinity;
                element.updateMatrix();

                parent.add( element );

            } else {

                for ( let i = element.length ; i-- ; ) {

                    const object   = handlesMap[ name ][ i ][ 0 ];
                    const position = handlesMap[ name ][ i ][ 1 ];
                    const rotation = handlesMap[ name ][ i ][ 2 ];
                    const scale    = handlesMap[ name ][ i ][ 3 ];
                    const tag      = handlesMap[ name ][ i ][ 4 ];

                    // name and tag properties are essential for picking and updating logic.
                    object.name = name;
                    object.tag  = tag;

                    // avoid being hidden by other transparent objects
                    object.renderOrder = Infinity;

                    if ( position ) {
                        object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] );
                    }
                    if ( rotation ) {
                        object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] );
                    }
                    if ( scale ) {
                        object.scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] );
                    }

                    object.updateMatrix();

                    const tempGeometry = object.geometry.clone();
                    tempGeometry.applyMatrix4( object.matrix );
                    object.geometry = tempGeometry;

                    object.position.set( 0, 0, 0 );
                    object.rotation.set( 0, 0, 0 );
                    object.scale.set( 1, 1, 1 );

                    parent.add( object );

                }

            }

        }

    }

    highlight ( axis ) {

        // Reset highlight for all of them
        for ( let key in this.handleGizmos ) {
            this.handleGizmos[ key ].highlight( false );
        }

        // Highlight the picked (if exist)
        const currentHandle = this.handleGizmos[ axis ];
        if ( currentHandle ) {
            currentHandle.highlight( true );
        }

    }

    update ( cameraPosition, cameraDirection ) {

        this.traverse( ( child ) => {

            if ( !child.isHandle ) { return }

            child.update( cameraDirection );

        } );

        this.updateIntersectPlane( cameraPosition );

    }

    updateIntersectPlane ( cameraPosition ) {

        this.intersectPlane.lookAt( cameraPosition );
        this.intersectPlane.updateMatrix();

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class ScaleGizmo extends AbstractGizmo {

    constructor () {

        super();
        this.isScaleGizmo = true;
        this.type         = 'ScaleGizmo';

        this.handleGizmos = {

            XYZ: new OctahedricalHandle( {
                color: 0xaaaaaa
            } ).setScale( 0.15, 0.15, 0.15 ),

            XY: new PlaneHandle( {
                color:     0xaaaa00,
                direction: new Vector3( 1, 1, 0 )
            } ).setScale( 0.33, 0.33, 1.0 ),

            YZ: new PlaneHandle( {
                color:     0x00aaaa,
                direction: new Vector3( 0, 1, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 0, 1, 0 ), degreesToRadians( -90 ) ),

            XZ: new PlaneHandle( {
                color:     0xaa00aa,
                direction: new Vector3( 1, 0, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( 90 ) ),

            X: new ScaleHandle( {
                color:     0xaa0000,
                direction: new Vector3( 1, 0, 0 )
            } ),

            Y: new ScaleHandle( {
                color:     0x00aa00,
                direction: new Vector3( 0, 1, 0 )
            } ),

            Z: new ScaleHandle( {
                color:     0x0000aa,
                direction: new Vector3( 0, 0, 1 )
            } )

        };

        this._setupHandles( this.handleGizmos );
        //        this.init()

    }

    raycast ( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 );
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            if ( handle.name === this.intersectPlane.name ) {continue}
            handle.raycast( raycaster, intersects );
        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
//import { BufferGeometry }         from 'three-full/sources/core/BufferGeometry'
//import { Float32BufferAttribute } from 'three-full/sources/core/BufferAttribute'

class LozengeHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        // Lozenge
        const lozengePositions        = [
            0.0, 0.0, 0.0,
            0.85, 0.0, 0.0,
            1.1, 1.1, 0.0,
            0.0, 0.85, 0.0
        ];
        const lozengeIndexes          = [
            0, 1, 2,
            2, 3, 0
        ];
        const positionBufferAttribute = new Float32BufferAttribute( lozengePositions, 3 );
        const lozengeBufferGeometry   = new BufferGeometry();
        lozengeBufferGeometry.setAttribute( 'position', positionBufferAttribute );
        lozengeBufferGeometry.setIndex( lozengeIndexes );

        const _parameters = {
            ...{
                geometry: lozengeBufferGeometry
            }, ...parameters
        };

        super( _parameters );
        this.isPlanarHitbox = true;
        this.type           = 'PlanarHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class LozengeHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:     0xffffff,
                hitbox:    new LozengeHitbox(),
                direction: new Vector3( 1, 1, 0 )
            }, ...parameters
        };

        super( _parameters );
        this.isPlaneHandle = true;
        this.type          = 'PlaneHandle';

        // Edge line
        const lineBufferGeometry = new BufferGeometry();
        lineBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( [ 0.1, 0.75, 0.0, 1.0, 1.0, 0.0, 0.75, 0.1, 0.0 ], 3 ) );

        const lineMaterial = new HighlightableLineMaterial( {
            color: _parameters.color
        } );

        const line            = new Line( lineBufferGeometry, lineMaterial );
        line.matrixAutoUpdate = false;
        this.add( line );

        // Lozenge
        const lozengePositions      = [
            0.1, 0.1, 0.0,
            0.75, 0.1, 0.0,
            1.0, 1.0, 0.0,
            0.1, 0.75, 0.0
        ];
        const lozengeIndexes        = [
            0, 1, 2,
            2, 3, 0
        ];
        const lozengeBufferGeometry = new BufferGeometry();
        lozengeBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( lozengePositions, 3 ) );
        lozengeBufferGeometry.setIndex( lozengeIndexes );

        const lozengeMaterial    = new HighlightableMaterial( {
            color:       _parameters.color,
            transparent: true,
            opacity:     0.35
        } );
        const lozenge            = new Mesh( lozengeBufferGeometry, lozengeMaterial );
        lozenge.matrixAutoUpdate = false;
        this.add( lozenge );

        this.direction  = _parameters.direction;
        this.xDirection = new Vector3( _parameters.direction.x, 0, 0 );
        this.yDirection = new Vector3( 0, _parameters.direction.y, 0 );
        this.zDirection = new Vector3( 0, 0, _parameters.direction.z );
        this.xAxis      = new Vector3( 1, 0, 0 );
        this.yAxis      = new Vector3( 0, 1, 0 );
        this.zAxis      = new Vector3( 0, 0, 1 );
    }

    get direction () {

        return this._direction

    }

    set direction ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

        this._direction = value;

    }

    update ( cameraDirection ) {

        super.update( cameraDirection );

        const xDot = this.xDirection.dot( cameraDirection );
        const yDot = this.yDirection.dot( cameraDirection );
        const zDot = this.zDirection.dot( cameraDirection );

        this.quaternion.copy( this.baseQuaternion );

        // XY Plane
        if ( xDot > 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );

        } else if ( xDot > 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );

        } else if ( xDot < 0 && yDot > 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );

        } else if ( xDot < 0 && yDot < 0 && zDot === 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );

        }

        // XZ Plane
        else if ( xDot > 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );

        } else if ( xDot > 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );

        } else if ( xDot < 0 && yDot === 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );

        } else if ( xDot < 0 && yDot === 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );

        }

        // YZ Plane
        else if ( xDot === 0 && yDot > 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 180 ) );

        } else if ( xDot === 0 && yDot > 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 270 ) );

        } else if ( xDot === 0 && yDot < 0 && zDot > 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 90 ) );

        } else if ( xDot === 0 && yDot < 0 && zDot < 0 ) {

            this.rotateOnAxis( this.zAxis, degreesToRadians( 0 ) );

        }

        this.updateMatrix();
        this.hitbox.updateMatrix();

    }

    setDirection ( direction ) {

        this.direction = direction;
        return this

    }

    flipXAxis () {

        const tempDirection = this._direction.clone();
        tempDirection.x     = -tempDirection.x;

        this.direction = tempDirection;

    }

    flipYAxis () {

        const tempDirection = this._direction.clone();
        tempDirection.y     = -tempDirection.y;

        this.direction = tempDirection;

    }

    flipZAxis () {

        const tempDirection = this._direction.clone();
        tempDirection.z     = -tempDirection.z;

        this.direction = tempDirection;

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class TranslateHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                color:     0xffffff,
                hitbox:    new CylindricaHitbox(),
                direction: new Vector3( 0, 1, 0 )
            }, ...parameters
        };

        super( _parameters );
        this.isTranslateHandle = true;
        this.type              = 'TranslateHandle';

        const lineGeometry    = new LineGeometry( new Vector3( 0, 0, 0 ), new Vector3( 0, 0.8, 0 ) );
        const lineMaterial    = new HighlightableLineMaterial( { color: _parameters.color } );
        const line            = new Line( lineGeometry, lineMaterial );
        line.matrixAutoUpdate = false;
        this.add( line );

        const coneGeometry = new ConeBufferGeometry( 0.05, 0.2, 12, 1, false );
        coneGeometry.translate( 0, 0.9, 0 );
        const coneMaterial    = new HighlightableMaterial( { color: _parameters.color } );
        const cone            = new Mesh( coneGeometry, coneMaterial );
        cone.matrixAutoUpdate = false;
        this.add( cone );

        this.direction = _parameters.direction;

    }

    get direction () {

        return this._direction

    }

    set direction ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
        if ( !( value instanceof Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

        this._direction = value;

        if ( value.y > 0.99999 ) {

            this.quaternion.set( 0, 0, 0, 1 );

        } else if ( value.y < -0.99999 ) {

            this.quaternion.set( 1, 0, 0, 0 );

        } else {

            const axis    = new Vector3( value.z, 0, -value.x ).normalize();
            const radians = Math.acos( value.y );

            this.quaternion.setFromAxisAngle( axis, radians );

        }

    }

    update ( cameraDirection ) {

        super.update( cameraDirection );

        const dotProduct = this._direction.dot( cameraDirection );
        if ( dotProduct >= 0 ) {
            this.flipDirection();
        }

        this.updateMatrix();
        this.hitbox.updateMatrix();

    }

    setDirection ( direction ) {

        this.direction = direction;
        return this

    }

    flipDirection () {

        this.direction = this._direction.negate();

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class TranslateGizmo extends AbstractGizmo {

    constructor () {

        super();
        this.isTranslateGizmo = true;
        this.type             = 'TranslateGizmo';

        this.handleGizmos = {

            X: new TranslateHandle( {
                color:     0xaa0000,
                direction: new Vector3( 1, 0, 0 )
            } ),

            Y: new TranslateHandle( {
                color:     0x00aa00,
                direction: new Vector3( 0, 1, 0 )
            } ),

            Z: new TranslateHandle( {
                color:     0x0000aa,
                direction: new Vector3( 0, 0, 1 )
            } ),

            XY: new LozengeHandle( {
                color:     0xaaaa00,
                direction: new Vector3( 1, 1, 0 )
            } ).setScale( 0.33, 0.33, 1.0 ),

            YZ: new LozengeHandle( {
                color:     0x00aaaa,
                direction: new Vector3( 0, 1, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 0, 1, 0 ), degreesToRadians( -90 ) ),

            XZ: new LozengeHandle( {
                color:     0xaa00aa,
                direction: new Vector3( 1, 0, 1 )
            } ).setScale( 0.33, 0.33, 1.0 )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( 90 ) ),

            XYZ: new OctahedricalHandle( {
                color: 0xaaaaaa
            } ).setScale( 0.15, 0.15, 0.15 )

        };

        this._setupHandles( this.handleGizmos );
        //        this.init()

    }

    raycast ( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 );
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            if ( handle.name === this.intersectPlane.name ) {continue}
            handle.raycast( raycaster, intersects );
        }

    }
}

/**
 * @module Controllers/ClippingController
 *
 * @author [Ahmed DCHAR]{@link https://github.com/Dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @example Todo
 *
 */

// Basic Geometries
class ClippingBox extends LineSegments {

    constructor () {
        super();

        this.margin = 0.01;

        this.geometry         = new EdgesGeometry( new BoxBufferGeometry( 2, 2, 2 ) );
        this.material         = new LineBasicMaterial( {
            color: 0xffffff
        } );
        this.matrixAutoUpdate = false;

        // Planes
        this.normalPlanes = {
            normalRightSide:  new Vector3( -1, 0, 0 ),
            normalLeftSide:   new Vector3( 1, 0, 0 ),
            normalFrontSide:  new Vector3( 0, -1, 0 ),
            normalBackSide:   new Vector3( 0, 1, 0 ),
            normalTopSide:    new Vector3( 0, 0, -1 ),
            normalBottomSide: new Vector3( 0, 0, 1 )
        };

        this.planes = {
            rightSidePlane:  new Plane( this.normalPlanes.normalRightSide.clone(), 0 ),
            leftSidePlane:   new Plane( this.normalPlanes.normalLeftSide.clone(), 0 ),
            frontSidePlane:  new Plane( this.normalPlanes.normalFrontSide.clone(), 0 ),
            backSidePlane:   new Plane( this.normalPlanes.normalBackSide.clone(), 0 ),
            topSidePlane:    new Plane( this.normalPlanes.normalTopSide.clone(), 0 ),
            bottomSidePlane: new Plane( this.normalPlanes.normalBottomSide.clone(), 0 )
        };

        this._boundingBox = new Box3();

    }

    getBoundingSphere () {

        this.geometry.computeBoundingSphere();
        this.geometry.boundingSphere.applyMatrix4( this.matrixWorld );

        return this.geometry.boundingSphere

    }

    setColor ( color ) {

        this.material.color.set( color );

    }

    applyClippingTo ( state, objects ) {

        if ( isNotDefined( objects ) ) { return }

        let planes = [];
        for ( let i in this.planes ) {
            planes.push( this.planes[ i ] );
        }

        objects.traverse( ( object ) => {

            if ( isNotDefined( object ) ) { return }
            if ( isNotDefined( object.geometry ) ) { return }
            if ( isNotDefined( object.material ) ) { return }

            const materials = isArray( object.material ) ? object.material : [ object.material ];

            for ( let materialIndex = 0, numberOfMaterial = materials.length ; materialIndex < numberOfMaterial ; materialIndex++ ) {
                let material = materials[ materialIndex ];
                if ( !material.clippingPlanes ) {
                    material.clippingPlanes = [];
                }
                material.clippingPlanes = ( state ) ? planes : [];
            }

        } );

    }

    updateSize ( size ) {

        this.scale.set( size.x, size.y, size.z );

    }

    update () {

        this._boundingBox.setFromObject( this );

        const margin = this.margin;
        const min    = this._boundingBox.min;
        const max    = this._boundingBox.max;

        this.planes.rightSidePlane.constant  = max.x + margin;
        this.planes.leftSidePlane.constant   = -min.x + margin;
        this.planes.frontSidePlane.constant  = max.y + margin;
        this.planes.backSidePlane.constant   = -min.y + margin;
        this.planes.topSidePlane.constant    = max.z + margin;
        this.planes.bottomSidePlane.constant = -min.z + margin;

    }

}

// Controller
const ClippingModes = /*#__PURE__*/toEnum( {
    None:      'None',
    Translate: 'Translate',
    Rotate:    'Rotate',
    Scale:     'Scale'
} );

class ClippingControls extends Object3D {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                camera:        null,
                domElement:    window,
                mode:          ClippingModes.None,
                objectsToClip: new Object3D()
            }, ...parameters
        };

        super();

        // Need to be defined before domElement to make correct binding events
        this._handlers = {
            onMouseEnter:  this._onMouseEnter.bind( this ),
            onMouseLeave:  this._onMouseLeave.bind( this ),
            onMouseDown:   this._onMouseDown.bind( this ),
            onMouseMove:   this._onMouseMove.bind( this ),
            onMouseWheel:  this._onMouseWheel.bind( this ),
            onMouseUp:     this._onMouseUp.bind( this ),
            onDblClick:    this._onDblClick.bind( this ),
            onTouchStart:  this._onTouchStart.bind( this ),
            onTouchEnd:    this._onTouchEnd.bind( this ),
            onTouchCancel: this._onTouchCancel.bind( this ),
            onTouchLeave:  this._onTouchLeave.bind( this ),
            onTouchMove:   this._onTouchMove.bind( this ),
            onKeyDown:     this._onKeyDown.bind( this ),
            onKeyUp:       this._onKeyUp.bind( this )
        };

        this._events = {
            impose:     { type: 'impose' },
            dispose:    { type: 'dispose' },
            change:     { type: 'change' },
            translate:  { type: 'translate' },
            rotate:     { type: 'rotate' },
            scale:      { type: 'scale' },
            mouseEnter: { type: 'mouseEnter' },
            mouseLeave: { type: 'mouseLeave' },
            mouseDown:  { type: 'mouseDown' },
            mouseUp:    { type: 'mouseUp' }
        };

        // Could/Should(?) use the objectsToClip boundingbox if exist ! [only in case we are sure that boundingbox (is/must be) implemented for each object3D.]
        this._objectsToClipBoundingBox = new Box3();
        this._objectsToClipSize        = new Vector3();
        this._objectsToClipCenter      = new Vector3();

        this._clippingBox = new ClippingBox();
        this.add( this._clippingBox );

        this.camera           = _parameters.camera;
        this.domElement       = _parameters.domElement;
        this.mode             = _parameters.mode;
        this.objectsToClip    = _parameters.objectsToClip;
        this.translationSnap  = 0.1;
        this.scaleSnap        = 0.1;
        this.rotationSnap     = 0.1;
        this.matrixAutoUpdate = false;

        this.enabled = false; // Should be true by default

        this.size = 1;

        this._dragging          = false;
        this._firstPoint        = new Vector3();
        this._secondPoint       = new Vector3();
        this._mouseDisplacement = new Vector3();
        this._offset            = new Vector3();
        this._raycaster         = new Raycaster();
        this._pointerVector     = new Vector2();
        this._directionToMouse  = new Vector3();
        this._cameraPosition    = new Vector3();
        this._cameraDirection   = new Vector3();
        this._worldPosition     = new Vector3();
        this._worldRotation     = new Euler();

        this._gizmos = {
            //            'None':      null,
            'Translate': new TranslateGizmo(),
            'Scale':     new ScaleGizmo()
            //            'Rotate':    new RotateGizmo(),
        };
        for ( let mode in this._gizmos ) {
            this.add( this._gizmos[ mode ] );
        }
        this._currentGizmo  = null;
        this._currentHandle = null;

        // The actions map about input events
        this.actionsMap = {
            setMode: {
                translate: [ Keys.T.value ],
                rotate:    [ Keys.R.value ],
                scale:     [ Keys.S.value ]
            },
            translate: {
                front: [ Keys.Z.value, Keys.UP_ARROW.value ],
                back:  [ Keys.S.value, Keys.DOWN_ARROW.value ],
                up:    [ Keys.A.value, Keys.PAGE_UP.value ],
                down:  [ Keys.E.value, Keys.PAGE_DOWN.value ],
                left:  [ Keys.Q.value, Keys.LEFT_ARROW.value ],
                right: [ Keys.D.value, Keys.RIGHT_ARROW.value ]
            },
            scale: {
                widthPlus:   [ Keys.LEFT_ARROW.value ],
                widthMinus:  [ Keys.RIGHT_ARROW.value ],
                heightPlus:  [ Keys.PAGE_UP.value ],
                heightMinus: [ Keys.PAGE_DOWN.value ],
                depthPlus:   [ Keys.UP_ARROW.value ],
                depthMinus:  [ Keys.DOWN_ARROW.value ]
            },
            rotate: {
                xAxis: [ Keys.X.value ],
                yAxis: [ Keys.Y.value ],
                zAxis: [ Keys.Z.value ]
            }
        };

    }

    get objectsToClip () {
        return this._objectsToClip
    }

    set objectsToClip ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Objects to clip cannot be null ! Expect an instance of Object3D' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Objects to clip cannot be undefined ! Expect an instance of Object3D' ) }
        if ( !( value instanceof Object3D ) ) { throw new Error( `Objects to clip cannot be an instance of ${ value.constructor.name }. Expect an instance of Object3D.` ) }

        this._objectsToClip = value;
        this.updateClipping();

    }

    get camera () {
        return this._camera
    }

    set camera ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
        if ( !value.isCamera && !value.isPerspectiveCamera && !value.isOrthographicCamera ) { throw new Error( `Camera cannot be an instance of ${ value.constructor.name }. Expect an instance of Camera, PerspectiveCamera, or OrthographicCamera.` ) }

        this._camera = value;

    }

    get domElement () {
        return this._domElement
    }

    set domElement ( value ) {

        if ( isNull( value ) ) { throw new Error( 'DomElement cannot be null ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'DomElement cannot be undefined ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
        if ( !( ( value instanceof Window ) || ( value instanceof HTMLDocument ) || ( value instanceof HTMLDivElement ) || ( value instanceof HTMLCanvasElement ) ) ) { throw new Error( `Target cannot be an instance of ${ value.constructor.name }. Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.` ) }

        // Clear previous element
        if ( this._domElement ) {
            this._domElement.removeEventListener( 'mouseenter', this._handlers.onMouseEnter, false );
            this._domElement.removeEventListener( 'mouseleave', this._handlers.onMouseLeave, false );
            this.dispose();
        }

        this._domElement = value;
        this._domElement.addEventListener( 'mouseenter', this._handlers.onMouseEnter, false );
        this._domElement.addEventListener( 'mouseleave', this._handlers.onMouseLeave, false );
        this.impose();

    }

    get mode () {
        return this._mode
    }

    set mode ( value ) {

        if ( isNull( value ) ) { throw new Error( 'Mode cannot be null ! Expect a value from ClippingModes enum.' ) }
        if ( isUndefined( value ) ) { throw new Error( 'Mode cannot be undefined ! Expect a value from ClippingModes enum.' ) }
        //        if ( !( value instanceof ClippingModes ) ) { throw new Error( `Mode cannot be an instance of ${value.constructor.name}. Expect a value from TClippingModes enum.` ) }

        this._mode = value;

        // Reset gizmos visibility
        for ( let mode in this._gizmos ) {
            this._gizmos[ mode ].visible = false;
        }

        if ( this._mode === ClippingModes.None ) {

            this._currentGizmo = null;

        } else {

            this._currentGizmo         = this._gizmos[ this._mode ];
            this._currentGizmo.visible = true;

        }

        this.updateGizmo();

    }

    setCamera ( value ) {

        this.camera = value;
        return this

    }

    setDomElement ( value ) {

        this.domElement = value;
        return this

    }

    setMode ( value ) {

        this.mode = value;
        return this

    }

    setObjectsToClip ( objects ) {

        this.objectsToClip = objects;
        return this

    }

    impose () {

        this._domElement.addEventListener( 'keydown', this._handlers.onKeyDown, false );
        this._domElement.addEventListener( 'keyup', this._handlers.onKeyUp, false );

        this._domElement.addEventListener( 'dblclick', this._handlers.onDblClick, false );
        this._domElement.addEventListener( 'mousedown', this._handlers.onMouseDown, false );
        this._domElement.addEventListener( 'mousemove', this._handlers.onMouseMove, false );
        this._domElement.addEventListener( 'mouseup', this._handlers.onMouseUp, false );
        this._domElement.addEventListener( 'wheel', this._handlers.onMouseWheel, {
            capture: true,
            once:    false,
            passive: false
        } );

        this._domElement.addEventListener( 'touchcancel', this._handlers.onTouchCancel, false );
        this._domElement.addEventListener( 'touchend', this._handlers.onTouchEnd, false );
        this._domElement.addEventListener( 'touchleave', this._handlers.onTouchLeave, false );
        this._domElement.addEventListener( 'touchmove', this._handlers.onTouchMove, {
            capture: true,
            once:    false,
            passive: false
        } );
        this._domElement.addEventListener( 'touchstart', this._handlers.onTouchStart, {
            capture: true,
            once:    false,
            passive: false
        } );

        this.dispatchEvent( this._events.impose );

    }

    dispose () {

        this._domElement.removeEventListener( 'keydown', this._handlers.onKeyDown, false );
        this._domElement.removeEventListener( 'keyup', this._handlers.onKeyUp, false );

        this._domElement.removeEventListener( 'dblclick', this._handlers.onDblClick, false );
        this._domElement.removeEventListener( 'mousedown', this._handlers.onMouseDown, false );
        this._domElement.removeEventListener( 'mousemove', this._handlers.onMouseMove, false );
        this._domElement.removeEventListener( 'mouseup', this._handlers.onMouseUp, false );
        this._domElement.removeEventListener( 'wheel', this._handlers.onMouseWheel, {
            capture: true,
            once:    false,
            passive: false
        } );

        this._domElement.removeEventListener( 'touchcancel', this._handlers.onTouchCancel, false );
        this._domElement.removeEventListener( 'touchend', this._handlers.onTouchEnd, false );
        this._domElement.removeEventListener( 'touchleave', this._handlers.onTouchLeave, false );
        this._domElement.removeEventListener( 'touchmove', this._handlers.onTouchMove, {
            capture: true,
            once:    false,
            passive: false
        } );
        this._domElement.removeEventListener( 'touchstart', this._handlers.onTouchStart, {
            capture: true,
            once:    false,
            passive: false
        } );

        this.dispatchEvent( this._events.dispose );

    }

    setTranslationSnap ( translationSnap ) {
        this.translationSnap = translationSnap;
    }

    setRotationSnap ( rotationSnap ) {
        this.rotationSnap = rotationSnap;
    }

    enable () {

        this.visible = true;
        this.enabled = true;

        // Init size and position
        if ( isDefined( this._objectsToClip ) ) {

            this._objectsToClipBoundingBox.setFromObject( this._objectsToClip );

            this._objectsToClipBoundingBox.getSize( this._objectsToClipSize );
            this._objectsToClipSize.divideScalar( 2 );
            this.scale.set( this._objectsToClipSize.x, this._objectsToClipSize.y, this._objectsToClipSize.z );

            this._objectsToClipBoundingBox.getCenter( this._objectsToClipCenter );
            this.position.set( this._objectsToClipCenter.x, this._objectsToClipCenter.y, this._objectsToClipCenter.z );

            // update...
            this.updateMatrix();
            this.updateMatrixWorld();
        }

        this.updateClipping();
        this.updateGizmo();

    }

    disable () {

        this.visible = false;
        this.enabled = false;
        this.updateClipping();

    }

    updateClipping () {

        if ( isNotDefined( this._objectsToClip ) ) { return }

        this._clippingBox.update();
        this._clippingBox.applyClippingTo( this.enabled, this._objectsToClip );

    }

    updateGizmo () {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        if ( isNotDefined( this._currentGizmo ) ) { return }

        this._camera.getWorldPosition( this._cameraPosition );
        this._camera.getWorldDirection( this._cameraDirection );
        this._currentGizmo.update( this._cameraPosition, this._cameraDirection );

    }

    /// Handlers
    _consumeEvent ( event ) {

        if ( !event.cancelable ) {
            return
        }

        event.stopImmediatePropagation();

    }

    // Keyboard
    _onKeyDown ( keyEvent ) {

        if ( !this.enabled ) { return }
        keyEvent.preventDefault();

        const actionMap  = this.actionsMap;
        const key        = keyEvent.keyCode;
        //        const altActive   = keyEvent.altKey
        const ctrlActive = keyEvent.ctrlKey;
        //        const metaActive  = keyEvent.metaKey
        //        const shiftActive = keyEvent.shiftKey

        /* if ( altActive ) {

         } else */
        if ( ctrlActive ) {

            switch ( this._mode ) {

                case ClippingModes.Translate:

                    if ( actionMap.translate.front.includes( key ) ) {

                        this._translateZ( this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.translate.back.includes( key ) ) {

                        this._translateZ( -this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.translate.right.includes( key ) ) {

                        this._translateX( this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.translate.left.includes( key ) ) {

                        this._translateX( -this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.translate.up.includes( key ) ) {

                        this._translateY( this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.translate.down.includes( key ) ) {

                        this._translateY( -this.translationSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    }

                    break

                case ClippingModes.Rotate:

                    break

                case ClippingModes.Scale:

                    if ( actionMap.scale.depthPlus.includes( key ) ) {

                        this._scaleZ( this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.scale.depthMinus.includes( key ) ) {

                        this._scaleZ( -this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.scale.widthPlus.includes( key ) ) {

                        this._scaleX( this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.scale.widthMinus.includes( key ) ) {

                        this._scaleX( -this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.scale.heightPlus.includes( key ) ) {

                        this._scaleY( this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    } else if ( actionMap.scale.heightMinus.includes( key ) ) {

                        this._scaleY( -this.scaleSnap );
                        this.updateClipping();
                        this._consumeEvent( keyEvent );
                        this.dispatchEvent( this._events.change );

                    }

                    break

            }

            //        } else if ( metaActive ) {
            //        } else if ( shiftActive ) {
        } else if ( actionMap.setMode.translate.includes( key ) ) {

            this.setMode( ClippingModes.Translate );
            this.updateClipping();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.setMode.rotate.includes( key ) ) {

            this.setMode( ClippingModes.Rotate );
            this.updateClipping();
            this._consumeEvent( keyEvent );

        } else if ( actionMap.setMode.scale.includes( key ) ) {

            this.setMode( ClippingModes.Scale );
            this.updateClipping();
            this._consumeEvent( keyEvent );

        }

    }

    _onKeyUp ( keyEvent ) {

        if ( !this.enabled || keyEvent.defaultPrevented ) { return }
        keyEvent.preventDefault();

        // Todo...

    }

    // Mouse
    _onDblClick ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        mouseEvent.preventDefault();

        // Todo...

    }

    _onMouseDown ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        if ( mouseEvent.button !== Mouse.Left.value ) { return }
        if ( isNotDefined( this._currentHandle ) ) { return }

        mouseEvent.preventDefault();

        this._dragging = true;

        // Set the current plane to intersect with mouse
        // Add first reference to mouse position for next usage under mouse move
        const planeIntersect = this.intersectObjects( mouseEvent, [ this._currentGizmo.intersectPlane ] );
        if ( planeIntersect ) {
            this._firstPoint = planeIntersect.point;
        }

        this._consumeEvent( mouseEvent );
        this.dispatchEvent( this._events.mouseDown );

    }

    _onMouseEnter ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        mouseEvent.preventDefault();

        this.impose();
        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.focus();
        }

    }

    _onMouseLeave ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        mouseEvent.preventDefault();

        this._dragging = false;

        if ( mouseEvent.target.constructor !== HTMLDocument ) {
            this._domElement.blur();
        }
        this.dispose();

    }

    _onMouseMove ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }

        mouseEvent.preventDefault();

        // Check for hovering or not
        if ( this._dragging === false ) {

            // Check mouseIn
            const intersect = this.intersectObjects( mouseEvent, [ this._currentGizmo ] );
            //            const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.children )
            //            const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.handles.children )
            if ( intersect ) {

                const handle = intersect.object;

                // Check if a previous handle is already selected
                if ( this._currentHandle && handle !== this._currentHandle ) {
                    this._currentHandle.highlight( false );
                    this.dispatchEvent( this._events.mouseLeave );
                }

                this._currentHandle = handle;
                this._currentHandle.highlight( true );
                this.dispatchEvent( this._events.mouseEnter );

                this._consumeEvent( mouseEvent );

            } else if ( isDefined( this._currentHandle ) ) {

                this._currentHandle.highlight( false );
                this._currentHandle = null;
                this.dispatchEvent( this._events.mouseLeave );

            }

        } else {

            const currentHandle     = this._currentHandle;
            const currentHandleName = currentHandle.name;

            const planeIntersect = this.intersectObjects( mouseEvent, [ this._currentGizmo.intersectPlane ] );
            if ( planeIntersect ) {

                this._secondPoint = planeIntersect.point;

            }

            // Update the mouse displacement in world coordinates
            this._mouseDisplacement.subVectors( this._secondPoint, this._firstPoint );
            this._firstPoint.copy( this._secondPoint );

            // Apply change
            switch ( this._mode ) {

                case ClippingModes.Translate:

                    if ( currentHandleName === 'X' ) {

                        this._offset.set( 1, 0, 0 );

                    } else if ( currentHandleName === 'Y' ) {

                        this._offset.set( 0, 1, 0 );

                    } else if ( currentHandleName === 'Z' ) {

                        this._offset.set( 0, 0, 1 );

                    } else if ( currentHandleName === 'XY' ) {

                        this._offset.set( 1, 1, 0 );

                    } else if ( currentHandleName === 'YZ' ) {

                        this._offset.set( 0, 1, 1 );

                    } else if ( currentHandleName === 'XZ' ) {

                        this._offset.set( 1, 0, 1 );

                    } else if ( currentHandleName === 'XYZ' ) {

                        this._offset.set( 1, 1, 1 );

                    }

                    this._offset.multiply( this._mouseDisplacement );
                    this._translate( this._offset );
                    break

                case ClippingModes.Rotate:
                    /*
                     if ( currentHandle.isRotateHandle ) {

                     } else if ( currentHandle.isPlaneHandle ) {

                     } else if ( currentHandle.isOmnidirectionalHandle ) {

                     }
                     */
                    break

                case ClippingModes.Scale:

                    if ( currentHandle.isScaleHandle ) {

                        this._offset
                            .copy( this._currentHandle.direction )
                            .multiply( this._mouseDisplacement );

                    } else if ( currentHandle.isPlaneHandle ) {

                        const xDot = this._currentHandle.xDirection.dot( this._mouseDisplacement );
                        if ( xDot > 0 ) {
                            this._offset.setX( Math.abs( this._mouseDisplacement.x ) );
                        } else if ( xDot < 0 ) {
                            this._offset.setX( -Math.abs( this._mouseDisplacement.x ) );
                        } else {
                            this._offset.setX( 0 );
                        }

                        const yDot = this._currentHandle.yDirection.dot( this._mouseDisplacement );
                        if ( yDot > 0 ) {
                            this._offset.setY( Math.abs( this._mouseDisplacement.y ) );
                        } else if ( yDot < 0 ) {
                            this._offset.setY( -Math.abs( this._mouseDisplacement.y ) );
                        } else {
                            this._offset.setY( 0 );
                        }

                        const zDot = this._currentHandle.zDirection.dot( this._mouseDisplacement );
                        if ( zDot > 0 ) {
                            this._offset.setZ( Math.abs( this._mouseDisplacement.z ) );
                        } else if ( zDot < 0 ) {
                            this._offset.setZ( -Math.abs( this._mouseDisplacement.z ) );
                        } else {
                            this._offset.setZ( 0 );
                        }

                    } else if ( currentHandle.isOmnidirectionalHandle ) {

                        this.getWorldPosition( this._worldPosition );
                        this._directionToMouse.subVectors( this._firstPoint, this._worldPosition );
                        const worldDot = this._directionToMouse.dot( this._mouseDisplacement );
                        const length   = ( worldDot > 0 ) ? this._mouseDisplacement.length() : -this._mouseDisplacement.length();
                        this._offset.set( length, length, length );

                    }

                    this._scale( this._offset );
                    break

                default:
                    throw new RangeError( `Invalid switch parameter: ${ this._mode }` )

            }

            this.updateClipping();
            this._consumeEvent( mouseEvent );
            this.dispatchEvent( this._events.change );

        }

    }

    _onMouseUp ( mouseEvent ) {

        if ( !this.enabled ) { return }
        if ( this._mode === ClippingModes.None ) { return }
        if ( mouseEvent.button !== Mouse.Left.value ) { return }
        // todo isActive when mouse enter

        mouseEvent.preventDefault();

        this._dragging = false;
        this.dispatchEvent( this._events.mouseUp );

        // Check mouseIn
        const intersect = this.intersectObjects( mouseEvent, [ this._currentGizmo ] );
        //        const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.children )
        //        const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.handles.children )
        if ( intersect ) {

            this._currentHandle = intersect.object;
            this._currentHandle.highlight( true );

            this._consumeEvent( mouseEvent );
            this.dispatchEvent( this._events.mouseEnter );

        } else if ( isDefined( this._currentHandle ) ) {

            this._currentHandle.highlight( false );
            this._currentHandle = null;

            this.dispatchEvent( this._events.mouseLeave );

        }

        this.updateGizmo();

    }

    _onMouseWheel ( mouseEvent ) {

        if ( !this.enabled ) { return }
        mouseEvent.preventDefault();

        // Todo...

    }

    // Touche
    _onTouchCancel ( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault();

        // Todo...

    }

    _onTouchEnd ( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault();

        // Todo...

    }

    _onTouchLeave ( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault();

        // Todo...

    }

    _onTouchMove ( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault();

        // Todo...

    }

    _onTouchStart ( touchEvent ) {

        if ( !this.enabled ) { return }
        touchEvent.preventDefault();

        // Todo...

    }

    /// Utils
    // eslint-disable-next-line no-unused-vars
    getActiveHandle ( pointer ) {

    }

    intersectObjects ( pointer, objects ) {

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components
        /*
         const mousePositionX  = mouseEvent.layerX || mouseEvent.offsetX || 1
         const mousePositionY  = mouseEvent.layerY || mouseEvent.offsetY || 1
         const containerWidth  = this._domElement.offsetWidth
         const containerHeight = this._domElement.offsetHeight
         const x               = ( mousePositionX / containerWidth ) * 2 - 1
         const y               = -( mousePositionY / containerHeight ) * 2 + 1
         */

        const clientRect = this._domElement.getBoundingClientRect();
        const x          = ( ( ( pointer.clientX - clientRect.left ) / clientRect.width ) * 2 ) - 1;
        const y          = ( -( ( pointer.clientY - clientRect.top ) / clientRect.height ) * 2 ) + 1;

        this._pointerVector.set( x, y );
        this._raycaster.setFromCamera( this._pointerVector, this._camera );

        const intersections = this._raycaster.intersectObjects( objects, false );
        return intersections[ 0 ] ? intersections[ 0 ] : null

    }

    // Methods

    // Moving
    _translate ( displacement ) {

        this.position.add( displacement );
        this.updateMatrix();

    }

    _translateX ( deltaX ) {

        this.position.setX( this.position.x + deltaX );
        this.updateMatrix();

    }

    _translateY ( deltaY ) {

        this.position.setY( this.position.y + deltaY );
        this.updateMatrix();

    }

    _translateZ ( deltaZ ) {

        this.position.setZ( this.position.z + deltaZ );
        this.updateMatrix();

    }

    _translateXY ( deltaX, deltaY ) {

        this.position.setX( this.position.x + deltaX );
        this.position.setY( this.position.y + deltaY );
        this.updateMatrix();

    }

    _translateXZ ( deltaX, deltaZ ) {

        this.position.setX( this.position.x + deltaX );
        this.position.setZ( this.position.z + deltaZ );
        this.updateMatrix();

    }

    _translateYZ ( deltaY, deltaZ ) {

        this.position.setY( this.position.y + deltaY );
        this.position.setZ( this.position.z + deltaZ );
        this.updateMatrix();

    }

    _translateXYZ ( deltaX, deltaY, deltaZ ) {

        this.position.set( this.position.x + deltaX, this.position.y + deltaY, this.position.z + deltaZ );
        this.updateMatrix();

    }

    // Rotating
    // eslint-disable-next-line no-unused-vars
    _rotateX ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateY ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateZ ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateXY ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateXZ ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateYZ ( delta ) {}

    // eslint-disable-next-line no-unused-vars
    _rotateXYZ ( delta ) {}

    // Scaling
    _scale ( changeAmout ) {

        this.scale.add( changeAmout );
        this.updateMatrix();

    }

    _scaleX ( deltaX ) {

        this.scale.setX( this.scale.x + deltaX );
        this.updateMatrix();

    }

    _scaleY ( deltaY ) {

        this.scale.setY( this.scale.y + deltaY );
        this.updateMatrix();

    }

    _scaleZ ( deltaZ ) {

        this.scale.setZ( this.scale.z + deltaZ );
        this.updateMatrix();

    }

    _scaleXY ( deltaX, deltaY ) {

        this.scale.setX( this.scale.x + deltaX );
        this.scale.setY( this.scale.y + deltaY );
        this.updateMatrix();

    }

    _scaleXZ ( deltaX, deltaZ ) {

        this.scale.setX( this.scale.x + deltaX );
        this.scale.setZ( this.scale.z + deltaZ );
        this.updateMatrix();

    }

    _scaleYZ ( deltaY, deltaZ ) {

        this.scale.setY( this.scale.y + deltaY );
        this.scale.setZ( this.scale.z + deltaZ );
        this.updateMatrix();

    }

    _scaleXYZ ( deltaX, deltaY, deltaZ ) {

        this.scale.set( this.scale.x + deltaX, this.scale.y + deltaY, this.scale.z + deltaZ );
        this.updateMatrix();

    }

}

/**
 * @module Managers/CurvesManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @example Todo
 *
 */

class CurvesManager extends TDataBaseManager {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                basePath: '/curves'
            },
            ...parameters
        };

        super( _parameters );

    }

    convert ( data ) {

        if ( !data ) {
            throw new Error( 'CurvesManager: Unable to convert null or undefined data !' )
        }

        const curveType = data.type;
        let curve       = undefined;

        switch ( curveType ) {

            case 'ArcCurve':
                curve = new ArcCurve();
                break

            case 'CatmullRomCurve3':
                curve = new CatmullRomCurve3();
                break

            case 'CubicBezierCurve':
                curve = new CubicBezierCurve();
                break

            case 'CubicBezierCurve3':
                curve = new CubicBezierCurve3();
                break

            case 'Curve':
                curve = new Curve();
                break

            case 'CurvePath':
                curve = new CurvePath();
                break

            case 'EllipseCurve':
                curve = new EllipseCurve();
                break

            case 'LineCurve':
                curve = new LineCurve();
                break

            case 'LineCurve3':
                curve = new LineCurve3();
                break

            // Missing NURBSCurve

            case 'Path':
                curve = new Path();
                break

            case 'QuadraticBezierCurve':
                curve = new QuadraticBezierCurve();
                break

            case 'QuadraticBezierCurve3':
                curve = new QuadraticBezierCurve3();
                break

            case 'SplineCurve':
                curve = new SplineCurve();
                break

            case 'Shape':
                curve = new Shape();
                break

            default:
                throw new Error( `TCurvesManager: Unknown curve of type: ${ curveType }` )

        }

        curve.fromJSON( data );

        return curve

    }

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData;
        const results = {};

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ];

            try {
                results[ data._id ] = this.convert( data );
            } catch ( err ) {
                onError( err );
            }

            onProgress( dataIndex / numberOfDatas );

        }

        onSuccess( results );

    }

}

/**
 * @module Managers/GeometriesManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @requires {@link TDataBaseManager}
 * @requires '../../../node_modules/three/src/core/Geometry'
 * @requires { BufferGeometry } from 'three'
 * @requires '../../../node_modules/three/src/core/BufferAttribute'
 *
 */

const ArrayType = /*#__PURE__*/toEnum( {
    Int8Array:         0,
    Uint8Array:        1,
    Uint8ClampedArray: 2,
    Int16Array:        3,
    Uint16Array:       4,
    Int32Array:        5,
    Uint32Array:       6,
    Float32Array:      7,
    Float64Array:      8
} );

/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class GeometriesManager extends TDataBaseManager {

    /**
     *
     * @param parameters
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                basePath:              '/geometries',
                projectionSystem:      'zBack',
                globalScale:           1,
                computeNormals:        true,
                computeBoundingBox:    true,
                computeBoundingSphere: true
            }, ...parameters
        };

        super( _parameters );

        this.projectionSystem      = _parameters.projectionSystem;
        this.globalScale           = _parameters.globalScale;
        this.computeNormals        = _parameters.computeNormals;
        this.computeBoundingBox    = _parameters.computeBoundingBox;
        this.computeBoundingSphere = _parameters.computeBoundingSphere;
    }

    //// Getter/Setter

    get computeBoundingBox () {
        return this._computeBoundingBox
    }

    set computeBoundingBox ( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Compute bounding box cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Compute bounding box cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Compute bounding box cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._computeBoundingBox = value;
    }

    get computeBoundingSphere () {
        return this._computeBoundingSphere
    }

    set computeBoundingSphere ( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Compute bounding sphere cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Compute bounding sphere cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Compute bounding sphere cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._computeBoundingSphere = value;
    }

    get computeNormals () {
        return this._computeNormals
    }

    set computeNormals ( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Compute normals cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Compute normals cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Compute normals cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._computeNormals = value;
    }

    get projectionSystem () {
        return this._projectionSystem
    }

    set projectionSystem ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Projection system cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Projection system cannot be undefined ! Expect a positive number.' ) }

        this._projectionSystem = value;

    }

    get globalScale () {
        return this._globalScale
    }

    set globalScale ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }

        this._globalScale = value;

    }

    setComputeBoundingBox ( value ) {

        this.computeBoundingBox = value;
        return this

    }

    setComputeBoundingShpere ( value ) {

        this.computeBoundingSphere = value;
        return this

    }

    setComputeNormals ( value ) {
        this.computeNormals = value;
        return this
    }

    setProjectionSystem ( value ) {

        this.projectionSystem = value;
        return this

    }

    setGlobalScale ( value ) {

        this.globalScale = value;
        return this

    }

    //// Methods

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData;
        const results = {};

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ];

            try {
                results[ data._id ] = this.convert( data );
            } catch ( err ) {
                onError( err );
            }

            onProgress( new ProgressEvent( 'GeometriesManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) );

        }

        onSuccess( results );

    }

    /**
     * @public
     * @memberOf GeometriesManager.prototype
     *
     * @param data
     * @returns {*}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'GeometriesManager: Unable to convert null or undefined data !' )
        }

        const geometryType = data.type;
        if ( !geometryType ) {
            throw new Error( 'GeometriesManager: Unable to convert untyped data !' )
        }

        let geometry = null;

        // Keep backward compat to next Major release
        if ( data.isBufferGeometry || geometryType.includes( 'BufferGeometry' ) ) {

            geometry = this._convertJsonToBufferGeometry( data );
            if ( this._computeNormals ) {
                geometry.computeVertexNormals();
            }

        } else if ( data.isGeometry || geometryType.includes( 'Geometry' ) ) {

            geometry = this._convertJsonToGeometry( data );
            if ( this._computeNormals ) {
                geometry.computeFaceNormals();
            }

        } else {

            throw new Error( `TGeometriesManager: Unable to retrieve geometry of type ${ geometryType } !` )

        }

        // Todo: Allow to force if exist
        if ( this.computeBoundingBox ) {
            geometry.boundingBox = null;
            geometry.computeBoundingBox();
        }

        if ( this.computeBoundingSphere ) {
            geometry.boundingSphere = null;
            geometry.computeBoundingSphere();
        }

        return geometry

    }

    _convertJsonToGeometry ( data ) {

        const geometryType = data.types;
        let geometry       = null;

        switch ( geometryType ) {

            case 'BoxGeometry':
                geometry = new BoxGeometry();
                break

            case 'CircleGeometry':
                geometry = new CircleGeometry();
                break

            case 'CylinderGeometry':
                geometry = new CylinderGeometry();
                break

            case 'ConeGeometry':
                geometry = new ConeGeometry();
                break

            case 'EdgesGeometry':
                geometry = new EdgesGeometry();
                break

            case 'DodecahedronGeometry':
                geometry = new DodecahedronGeometry();
                break

            case 'ExtrudeGeometry':
                geometry = new ExtrudeGeometry();
                break

            case 'Geometry':
                geometry = new Geometry();
                break

            case 'IcosahedronGeometry':
                geometry = new IcosahedronGeometry();
                break

            case 'LatheGeometry':
                geometry = new LatheGeometry();
                break

            case 'OctahedronGeometry':
                geometry = new OctahedronGeometry();
                break

            case 'ParametricGeometry':
                geometry = new ParametricGeometry();
                break

            case 'PlaneGeometry':
                geometry = new PlaneGeometry();
                break

            case 'PolyhedronGeometry':
                geometry = new PolyhedronGeometry();
                break

            case 'RingGeometry':
                geometry = new RingGeometry();
                break

            case 'ShapeGeometry':
                geometry = new ShapeGeometry();
                break

            case 'TetrahedronGeometry':
                geometry = new TetrahedronGeometry();
                break

            case 'TextGeometry':
                geometry = new TextGeometry();
                break

            case 'TorusGeometry':
                geometry = new TorusGeometry();
                break

            case 'TorusKnotGeometry':
                geometry = new TorusKnotGeometry();
                break

            case 'TubeGeometry':
                geometry = new TubeGeometry();
                break

            case 'SphereGeometry':
                geometry = new SphereGeometry();
                break

            case 'WireframeGeometry':
                geometry = new WireframeGeometry();
                break

            default:
                throw new Error( `TGeometriesManager: Unknown geometry of type: ${ geometryType }` )

        }

        geometry.uuid = data.uuid;
        geometry.name = data.name;
        geometry.type = data.type;

        var vertices = [];
        var vertex   = undefined;
        for ( var index = 0, numberOfVertices = data.vertices.length ; index < numberOfVertices ; ++index ) {

            vertex = data.vertices[ index ];
            vertices.push( new Vector3( vertex.x, vertex.y, vertex.z ) );

        }
        geometry.vertices = vertices;
        //                geometry.colors                  = data.colors

        var faces = [];
        var face  = undefined;
        for ( var faceIndex = 0, numberOfFaces = data.faces.length ; faceIndex < numberOfFaces ; faceIndex++ ) {
            face = data.faces[ faceIndex ];
            faces.push( new Face3( face.a, face.b, face.c, face.normal, face.color, face.materialIndex ) );
        }
        geometry.faces         = faces;
        //                geometry.faceVertexUvs           = [ [ Number ] ]
        geometry.morphTargets  = [];
        geometry.morphNormals  = [];
        geometry.skinWeights   = [];
        geometry.skinIndices   = [];
        geometry.lineDistances = [];

        geometry.elementsNeedUpdate      = true; //data.elementsNeedUpdate
        geometry.verticesNeedUpdate      = true; //data.verticesNeedUpdate
        geometry.uvsNeedUpdate           = true; //data.uvsNeedUpdate
        geometry.normalsNeedUpdate       = true; //data.normalsNeedUpdate
        geometry.colorsNeedUpdate        = true; //data.colorsNeedUpdate
        geometry.lineDistancesNeedUpdate = true; //data.lineDistancesNeedUpdate
        geometry.groupsNeedUpdate        = true; //data.groupsNeedUpdate

    }

    _convertJsonToBufferGeometry ( data ) {

        const bufferGeometryType = data.type;
        let bufferGeometry       = null;

        switch ( bufferGeometryType ) {

            case 'BoxBufferGeometry':
                bufferGeometry = new BoxBufferGeometry();
                break

            case 'BufferGeometry':
                bufferGeometry = new BufferGeometry();
                break

            case 'CircleBufferGeometry':
                bufferGeometry = new CircleBufferGeometry();
                break

            case 'CylinderBufferGeometry':
                bufferGeometry = new CylinderBufferGeometry();
                break

            case 'ConeBufferGeometry':
                bufferGeometry = new ConeBufferGeometry();
                break

            case 'DodecahedronBufferGeometry':
                bufferGeometry = new DodecahedronBufferGeometry();
                break

            case 'ExtrudeBufferGeometry':
                bufferGeometry = new ExtrudeBufferGeometry();
                break

            case 'IcosahedronBufferGeometry':
                bufferGeometry = new IcosahedronBufferGeometry();
                break

            case 'LatheBufferGeometry':
                bufferGeometry = new LatheBufferGeometry();
                break

            case 'OctahedronBufferGeometry':
                bufferGeometry = new OctahedronBufferGeometry();
                break

            case 'ParametricBufferGeometry':
                bufferGeometry = new ParametricBufferGeometry();
                break

            case 'PlaneBufferGeometry':
                bufferGeometry = new PlaneBufferGeometry();
                break

            case 'PolyhedronBufferGeometry':
                bufferGeometry = new PolyhedronBufferGeometry();
                break

            case 'RingBufferGeometry':
                bufferGeometry = new RingBufferGeometry();
                break

            case 'ShapeBufferGeometry':
                bufferGeometry = new BufferGeometry();
                //                bufferGeometry = new ShapeBufferGeometry(  )
                break

            case 'TetrahedronBufferGeometry':
                bufferGeometry = new TetrahedronBufferGeometry();
                break

            case 'TextBufferGeometry':
                bufferGeometry = new TextBufferGeometry();
                break

            case 'TorusBufferGeometry':
                bufferGeometry = new TorusBufferGeometry();
                break

            case 'TorusKnotBufferGeometry':
                bufferGeometry = new TorusKnotBufferGeometry();
                break

            case 'TubeBufferGeometry':
                bufferGeometry = new TubeBufferGeometry();
                break

            case 'SphereBufferGeometry':
                bufferGeometry = new SphereBufferGeometry();
                break

            case 'InstancedBufferGeometry':
                bufferGeometry = new InstancedBufferGeometry();
                break

            default:
                throw new Error( `TGeometriesManager: Unknown buffer geometry of type: ${ bufferGeometryType }` )

        }

        // COMMON PARTS
        bufferGeometry._id  = data._id;
        bufferGeometry.uuid = data.uuid;
        bufferGeometry.name = data.name;

        // Extract index
        const dataIndexes = data.index;
        if ( dataIndexes && dataIndexes.array && dataIndexes.array.length > 0 ) {

            const arrayBuffer    = this.__convertBase64ToArrayBuffer( dataIndexes.array );
            const typedArray     = this.__convertArrayBufferToTypedArray( arrayBuffer );
            bufferGeometry.index = new BufferAttribute( typedArray, dataIndexes.itemSize, dataIndexes.normalized );

        }

        // Extract attributes
        const dataAttributes = data.attributes;
        if ( dataAttributes ) {

            let attributes = {};

            // TODO: using loop instead !!
            const positionAttributes = dataAttributes.position;
            if ( positionAttributes ) {

                const arrayBuffer = this.__convertBase64ToArrayBuffer( positionAttributes.array );
                const typedArray  = this.__convertArrayBufferToTypedArray( arrayBuffer );
                const globalScale = this.globalScale;

                const positionArray = new Float32Array( typedArray );

                if ( this._projectionSystem === 'zBack' ) {

                    let x = null;
                    let y = null;
                    let z = null;
                    for ( let pi = 0, numPos = positionArray.length ; pi < numPos ; pi += 3 ) {
                        x                       = positionArray[ pi ] / globalScale;
                        y                       = positionArray[ pi + 2 ] / globalScale;
                        z                       = -positionArray[ pi + 1 ] / globalScale;
                        positionArray[ pi ]     = x;
                        positionArray[ pi + 1 ] = y;
                        positionArray[ pi + 2 ] = z;
                    }

                } else {

                    for ( let posIndex = 0, numPos = positionArray.length ; posIndex < numPos ; posIndex++ ) {
                        positionArray[ posIndex ] /= globalScale;
                    }

                }

                attributes[ 'position' ] = new BufferAttribute( positionArray, positionAttributes.itemSize, positionAttributes.normalized );

            }

            const normalAttributes = dataAttributes.normal;
            if ( normalAttributes ) {

                const arrayBuffer      = this.__convertBase64ToArrayBuffer( normalAttributes.array );
                const typedArray       = this.__convertArrayBufferToTypedArray( arrayBuffer );
                attributes[ 'normal' ] = new BufferAttribute( typedArray, normalAttributes.itemSize, normalAttributes.normalized );

            }

            const uvAttributes = dataAttributes.uv;
            if ( uvAttributes ) {

                const arrayBuffer  = this.__convertBase64ToArrayBuffer( uvAttributes.array );
                const typedArray   = this.__convertArrayBufferToTypedArray( arrayBuffer );
                attributes[ 'uv' ] = new BufferAttribute( typedArray, uvAttributes.itemSize, uvAttributes.normalized );

            }

            bufferGeometry.attributes = attributes;

        }

        if ( isDefined( data.groups ) ) {
            bufferGeometry.groups = data.groups;
        }

        // Need to set null because only checked vs undefined data.boundingBox
        if ( isDefined( data.boundingBox ) ) {
            bufferGeometry.boundingBox = data.boundingBox;
        }

        // idem... data.boundingSphere
        if ( isDefined( data.boundingSphere ) ) {
            bufferGeometry.boundingSphere = data.boundingSphere;
        }

        //        if ( isDefined( data.drawRange ) ) {
        //            bufferGeometry.drawRange = data.drawRange
        //        }

        if ( bufferGeometryType === 'ShapeBufferGeometry' ) {

            bufferGeometry.shapes        = data.shapes.map( jsonShape => {return new Shape().fromJSON( jsonShape )} );
            bufferGeometry.curveSegments = data.curveSegments;

        }

        return bufferGeometry

    }

    __convertArrayBufferToTypedArray ( arrayBuffer ) {

        const ONE_BYTE       = 1;
        const TWO_BYTE       = 2;
        const FOUR_BYTE      = 4;
        const HEIGHT_BYTE    = 8;
        const dataView       = new DataView( arrayBuffer );
        const dataByteLength = arrayBuffer.byteLength - 1;
        const type           = dataView.getUint8( 0 );

        let typedArray = null;

        switch ( type ) {

            case ArrayType.Int8Array:
                typedArray = new Int8Array( dataByteLength / ONE_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += ONE_BYTE ) {
                    typedArray[ index ] = dataView.getInt8( offset );
                }
                break

            case ArrayType.Uint8Array:
                typedArray = new Uint8Array( dataByteLength / ONE_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += ONE_BYTE ) {
                    typedArray[ index ] = dataView.getUint8( offset );
                }
                break

            case ArrayType.Uint8ClampedArray:
                typedArray = new Uint8ClampedArray( dataByteLength / ONE_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += ONE_BYTE ) {
                    typedArray[ index ] = dataView.getUint8( offset );
                }
                break

            case ArrayType.Int16Array:
                typedArray = new Int16Array( dataByteLength / TWO_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += TWO_BYTE ) {
                    typedArray[ index ] = dataView.getInt16( offset );
                }
                break

            case ArrayType.Uint16Array:
                typedArray = new Uint16Array( dataByteLength / TWO_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += TWO_BYTE ) {
                    typedArray[ index ] = dataView.getUint16( offset );
                }
                break

            case ArrayType.Int32Array:
                typedArray = new Int32Array( dataByteLength / FOUR_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += FOUR_BYTE ) {
                    typedArray[ index ] = dataView.getInt32( offset );
                }
                break

            case ArrayType.Uint32Array:
                typedArray = new Uint32Array( dataByteLength / FOUR_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += FOUR_BYTE ) {
                    typedArray[ index ] = dataView.getUint32( offset );
                }
                break

            case ArrayType.Float32Array:
                typedArray = new Float32Array( dataByteLength / FOUR_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += FOUR_BYTE ) {
                    typedArray[ index ] = dataView.getFloat32( offset );
                }
                break

            case ArrayType.Float64Array:
                typedArray = new Float64Array( dataByteLength / HEIGHT_BYTE );
                for ( let index = 0, offset = 1 ; offset < dataByteLength ; index++, offset += HEIGHT_BYTE ) {
                    typedArray[ index ] = dataView.getFloat64( offset );
                }
                break

            default:
                throw new RangeError( `Invalid switch parameter: ${ type }` )

        }

        return typedArray

    }

    __convertBase64ToArrayBuffer ( base64 ) {

        const chars  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const lookup = new Uint8Array( 256 );
        for ( let i = 0 ; i < chars.length ; i++ ) {
            lookup[ chars.charCodeAt( i ) ] = i;
        }

        ////////

        const base64Length = base64.length;

        let bufferLength = base64Length * 0.75;
        if ( base64[ base64Length - 1 ] === '=' ) {
            bufferLength--;
            if ( base64[ base64Length - 2 ] === '=' ) {
                bufferLength--;
            }
        }

        let arraybuffer = new ArrayBuffer( bufferLength );
        let bytes       = new Uint8Array( arraybuffer );
        let encoded1    = undefined;
        let encoded2    = undefined;
        let encoded3    = undefined;
        let encoded4    = undefined;

        for ( let i = 0, pointer = 0 ; i < base64Length ; i += 4 ) {
            encoded1 = lookup[ base64.charCodeAt( i ) ];
            encoded2 = lookup[ base64.charCodeAt( i + 1 ) ];
            encoded3 = lookup[ base64.charCodeAt( i + 2 ) ];
            encoded4 = lookup[ base64.charCodeAt( i + 3 ) ];

            bytes[ pointer++ ] = ( encoded1 << 2 ) | ( encoded2 >> 4 );
            bytes[ pointer++ ] = ( ( encoded2 & 15 ) << 4 ) | ( encoded3 >> 2 );
            bytes[ pointer++ ] = ( ( encoded3 & 3 ) << 6 ) | ( encoded4 & 63 );
        }

        return arraybuffer

    }

}

/**
 * @module Managers/TexturesManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class TexturesManager extends TDataBaseManager {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                basePath: '/textures'
            },
            ...parameters
        };

        super( _parameters );

    }

    convert ( data ) {

        if ( !data ) {
            throw new Error( 'TexturesManager: Unable to convert null or undefined data !' )
        }

        const textureType = data.type;
        //        let texture       = undefined

        switch ( textureType ) {

            default:
                throw new Error( `TTexturesManager: Unknown texture of type: ${ textureType }` )

        }

        // Common object properties

        //        if ( textureType === 'Line' ) { }
        //        return texture

    }

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData;
        const results = {};

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ];

            try {
                results[ data._id ] = this.convert( data );
            } catch ( err ) {
                onError( err );
            }

            onProgress( dataIndex / numberOfDatas );

        }

        onSuccess( results );
    }

}

/**
 * @module Managers/MaterialsManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @requires TDataBaseManager
 *
 */

const DEFAULT_IMAGE = /*#__PURE__*/new ImageLoader().load( 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH4gkKDRoGpGNegQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAMSURBVAjXY/j//z8ABf4C/tzMWecAAAAASUVORK5CYII=' );

/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class MaterialsManager extends TDataBaseManager {

    /**
     *
     * @param basePath
     * @param responseType
     * @param bunchSize
     * @param progressManager
     * @param errorManager
     * @param texturesPath
     * @param texturesProvider
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                basePath:                '/materials',
                texturesPath:            '/textures',
                texturesProviderOptions: {},
                generateMipmap:          false,
                autoFillTextures:        true
            }, ...parameters
        };

        super( _parameters );

        this.texturesPath     = _parameters.texturesPath;
        this.generateMipmap   = _parameters.generateMipmap;
        this.autoFillTextures = _parameters.autoFillTextures;
        this.texturesProvider = new TextureLoader( _parameters.texturesProviderOptions );

    }

    get texturesPath () {
        return this._texturesPath
    }

    set texturesPath ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Textures path cannot be null ! Expect a non empty string.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Textures path cannot be undefined ! Expect a non empty string.' ) }
        if ( isNotString( value ) ) { throw new TypeError( `Textures path cannot be an instance of ${ value.constructor.name } ! Expect a non empty string.` ) }
        if ( isEmptyString( value ) ) { throw new TypeError( 'Textures path cannot be empty ! Expect a non empty string.' ) }
        if ( isBlankString( value ) ) { throw new TypeError( 'Textures path cannot contain only whitespace ! Expect a non empty string.' ) }

        this._texturesPath = value;

    }

    get texturesProvider () {
        return this._texturesProvider
    }

    set texturesProvider ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Textures provider cannot be null ! Expect an instance of TextureLoader.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Textures provider cannot be undefined ! Expect an instance of TextureLoader.' ) }
        if ( !( value instanceof TexturesManager ) && !( value instanceof TextureLoader ) ) { throw new TypeError( `Textures provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TTexturesManager.` ) }

        this._texturesProvider = value;

    }

    get generateMipmap () {
        return this._generateMipmap
    }

    set generateMipmap ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Generate mipmap cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Generate mipmap cannot be undefined ! Expect a boolean.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( `Generate mipmap cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

        this._generateMipmap = value;
    }

    get autoFillTextures () {
        return this._autoFillTextures
    }

    set autoFillTextures ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }

        this._autoFillTextures = value;

    }

    setTexturesPath ( value ) {

        this.texturesPath = value;
        return this

    }

    setTexturesProvider ( value ) {

        this.texturesProvider = value;
        return this

    }

    setGenerateMipmap ( value ) {

        this.generateMipmap = value;
        return this

    }

    setAutoFillTextures ( value ) {

        this.autoFillTextures = value;
        return this

    }

    //// Methods

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

        // Normalize to array
        const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData;
        const results = {};

        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = datas[ dataIndex ];

            try {
                results[ data._id ] = this.convert( data );
            } catch ( err ) {
                onError( err );
            }

            onProgress( new ProgressEvent( 'MaterialsManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) );

        }

        if ( this._autoFillTextures ) {
            this.fillTextures( results, onSuccess, onProgress, onError );
        } else {
            onSuccess( results );
        }

    }

    /**
     *
     * @param data
     * @return {undefined}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'MaterialsManager: Unable to convert null or undefined data !' )
        }

        const type   = data.type;
        let material = null;

        switch ( type ) {

            case 'MeshPhongMaterial': {
                material = new MeshPhongMaterial();
                this._fillBaseMaterialData( material, data );

                const color = data.color;
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color );
                }

                const specular = data.specular;
                if ( isDefined( specular ) ) {
                    material.specular = this._setColor( specular );
                }

                const shininess = data.shininess;
                if ( isDefined( shininess ) ) {
                    material.shininess = shininess;
                }

                const map = data.map;
                if ( isDefined( map ) ) {
                    material.map = map;
                }

                const lightMap = data.lightMap;
                if ( isDefined( lightMap ) ) {
                    material.lightMap = lightMap;
                }

                const lightMapIntensity = data.lightMapIntensity;
                if ( isDefined( lightMapIntensity ) ) {
                    material.lightMapIntensity = lightMapIntensity;
                }

                const aoMap = data.aoMap;
                if ( isDefined( aoMap ) ) {
                    material.aoMap = aoMap;
                }

                const aoMapIntensity = data.aoMapIntensity;
                if ( isDefined( aoMapIntensity ) ) {
                    material.aoMapIntensity = aoMapIntensity;
                }

                const emissive = data.emissive;
                if ( isDefined( emissive ) ) {
                    material.emissive = this._setColor( emissive );
                }

                const emissiveIntensity = data.emissiveIntensity;
                if ( isDefined( emissiveIntensity ) ) {
                    material.emissiveIntensity = emissiveIntensity;
                }

                const emissiveMap = data.emissiveMap;
                if ( isDefined( emissiveMap ) ) {
                    material.emissiveMap = emissiveMap;
                }

                const bumpMap = data.bumpMap;
                if ( isDefined( bumpMap ) ) {
                    material.bumpMap = bumpMap;
                }

                const bumpScale = data.bumpScale;
                if ( isDefined( bumpScale ) ) {
                    material.bumpScale = bumpScale;
                }

                const normalMap = data.normalMap;
                if ( isDefined( normalMap ) ) {
                    material.normalMap = normalMap;
                }

                const normalScale = data.normalScale;
                if ( isDefined( normalScale ) ) {
                    material.normalScale = this._setVector2( normalScale );
                }

                const displacementMap = data.displacementMap;
                if ( isDefined( displacementMap ) ) {
                    material.displacementMap = displacementMap;
                }

                const displacementScale = data.displacementScale;
                if ( isDefined( displacementScale ) ) {
                    material.displacementScale = displacementScale;
                }

                const displacementBias = data.displacementBias;
                if ( isDefined( displacementBias ) ) {
                    material.displacementBias = displacementBias;
                }

                const specularMap = data.specularMap;
                if ( isDefined( specularMap ) ) {
                    material.specularMap = specularMap;
                }

                const alphaMap = data.alphaMap;
                if ( isDefined( alphaMap ) ) {
                    material.alphaMap = alphaMap;
                }

                const envMap = data.envMap;
                if ( isDefined( envMap ) ) {
                    material.envMap = envMap;
                }

                const combine = data.combine;
                if ( isDefined( combine ) ) {
                    material.combine = combine;
                }

                const reflectivity = data.reflectivity;
                if ( isDefined( reflectivity ) ) {
                    material.reflectivity = reflectivity;
                }

                const refractionRatio = data.refractionRatio;
                if ( isDefined( refractionRatio ) ) {
                    material.refractionRatio = refractionRatio;
                }

                const wireframe = data.wireframe;
                if ( isDefined( wireframe ) ) {
                    material.wireframe = wireframe;
                }

                const wireframeLinewidth = data.wireframeLinewidth;
                if ( isDefined( wireframeLinewidth ) ) {
                    material.wireframeLinewidth = wireframeLinewidth;
                }

                const wireframeLinecap = data.wireframeLinecap;
                if ( isDefined( wireframeLinecap ) ) {
                    material.wireframeLinecap = wireframeLinecap;
                }

                const wireframeLinejoin = data.wireframeLinejoin;
                if ( isDefined( wireframeLinejoin ) ) {
                    material.wireframeLinejoin = wireframeLinejoin;
                }

                const skinning = data.skinning;
                if ( isDefined( skinning ) ) {
                    material.skinning = skinning;
                }

                const morphTargets = data.morphTargets;
                if ( isDefined( morphTargets ) ) {
                    material.morphTargets = morphTargets;
                }

                const morphNormals = data.morphNormals;
                if ( isDefined( morphNormals ) ) {
                    material.morphNormals = morphNormals;
                }

            }
                break

            case 'MeshLambertMaterial': {
                material = new MeshLambertMaterial();
                this._fillBaseMaterialData( material, data );

                const color = data.color;
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color );
                }

                const map = data.map;
                if ( isDefined( map ) ) {
                    material.map = map;
                }

                const lightMap = data.lightMap;
                if ( isDefined( lightMap ) ) {
                    material.lightMap = lightMap;
                }

                const lightMapIntensity = data.lightMapIntensity;
                if ( isDefined( lightMapIntensity ) ) {
                    material.lightMapIntensity = lightMapIntensity;
                }

                const aoMap = data.aoMap;
                if ( isDefined( aoMap ) ) {
                    material.aoMap = aoMap;
                }

                const aoMapIntensity = data.aoMapIntensity;
                if ( isDefined( aoMapIntensity ) ) {
                    material.aoMapIntensity = aoMapIntensity;
                }

                const emissive = data.emissive;
                if ( isDefined( emissive ) ) {
                    material.emissive = this._setColor( emissive );
                }

                const emissiveIntensity = data.emissiveIntensity;
                if ( isDefined( emissiveIntensity ) ) {
                    material.emissiveIntensity = emissiveIntensity;
                }

                const emissiveMap = data.emissiveMap;
                if ( isDefined( emissiveMap ) ) {
                    material.emissiveMap = emissiveMap;
                }

                const specularMap = data.specularMap;
                if ( isDefined( specularMap ) ) {
                    material.specularMap = specularMap;
                }

                const alphaMap = data.alphaMap;
                if ( isDefined( alphaMap ) ) {
                    material.alphaMap = alphaMap;
                }

                const envMap = data.envMap;
                if ( isDefined( envMap ) ) {
                    material.envMap = envMap;
                }

                const combine = data.combine;
                if ( isDefined( combine ) ) {
                    material.combine = combine;
                }

                const reflectivity = data.reflectivity;
                if ( isDefined( reflectivity ) ) {
                    material.reflectivity = reflectivity;
                }

                const refractionRatio = data.refractionRatio;
                if ( isDefined( refractionRatio ) ) {
                    material.refractionRatio = refractionRatio;
                }

                const wireframe = data.wireframe;
                if ( isDefined( wireframe ) ) {
                    material.wireframe = wireframe;
                }

                const wireframeLinewidth = data.wireframeLinewidth;
                if ( isDefined( wireframeLinewidth ) ) {
                    material.wireframeLinewidth = wireframeLinewidth;
                }

                const wireframeLinecap = data.wireframeLinecap;
                if ( isDefined( wireframeLinecap ) ) {
                    material.wireframeLinecap = wireframeLinecap;
                }

                const wireframeLinejoin = data.wireframeLinejoin;
                if ( isDefined( wireframeLinejoin ) ) {
                    material.wireframeLinejoin = wireframeLinejoin;
                }

                const skinning = data.skinning;
                if ( isDefined( skinning ) ) {
                    material.skinning = skinning;
                }

                const morphTargets = data.morphTargets;
                if ( isDefined( morphTargets ) ) {
                    material.morphTargets = morphTargets;
                }

                const morphNormals = data.morphNormals;
                if ( isDefined( morphNormals ) ) {
                    material.morphNormals = morphNormals;
                }

            }
                break

            case 'LineBasicMaterial': {
                material = new LineBasicMaterial();
                this._fillBaseMaterialData( material, data );

                const color = data.color;
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color );
                }

            }
                break

            case 'PointsMaterial': {
                material = new PointsMaterial();
                this._fillBaseMaterialData( material, data );

                const color = data.color;
                if ( isDefined( color ) ) {
                    material.color = this._setColor( color );
                }

                const map = data.map;
                if ( isDefined( map ) ) {
                    material.map = map;
                }

                const morphTargets = data.morphTargets;
                if ( isDefined( morphTargets ) ) {
                    material.morphTargets = morphTargets;
                }

                const size = data.size;
                if ( isDefined( size ) ) {
                    material.size = size;
                }

                const sizeAttenuation = data.sizeAttenuation;
                if ( isDefined( sizeAttenuation ) ) {
                    material.sizeAttenuation = sizeAttenuation;
                }

            }
                break

            default:
                throw new Error( `TMaterialsManager: Unmanaged material of type: ${ type }` )

        }

        return material

    }

    _fillBaseMaterialData ( material, data ) {

        const _id = data._id;
        if ( isDefined( _id ) && isString( _id ) ) {
            material._id = _id;
        }

        const uuid = data.uuid;
        if ( isDefined( uuid ) && isString( uuid ) ) {
            material.uuid = uuid;
        }

        const name = data.name;
        if ( isDefined( name ) && isString( name ) ) {
            material.name = name;
        }

        const fog = data.fog;
        if ( isDefined( fog ) ) {
            material.fog = fog;
        }

        const lights = data.lights;
        if ( isDefined( lights ) ) {
            material.lights = lights;
        }

        const blending = data.blending;
        if ( isDefined( blending ) ) {
            material.blending = blending;
        }

        const side = data.side;
        if ( isDefined( side ) ) {
            material.side = side;
        }

        const flatShading = data.flatShading;
        if ( isDefined( flatShading ) ) {
            material.flatShading = flatShading;
        }

        const vertexColors = data.vertexColors;
        if ( isDefined( vertexColors ) ) {
            material.vertexColors = vertexColors;
        }

        const opacity = data.opacity;
        if ( isDefined( opacity ) ) {
            material.opacity = opacity;
        }

        const transparent = data.transparent;
        if ( isDefined( transparent ) ) {
            material.transparent = transparent;
        }

        const blendSrc = data.blendSrc;
        if ( isDefined( blendSrc ) ) {
            material.blendSrc = blendSrc;
        }

        const blendDst = data.blendDst;
        if ( isDefined( blendDst ) ) {
            material.blendDst = blendDst;
        }

        const blendEquation = data.blendEquation;
        if ( isDefined( blendEquation ) ) {
            material.blendEquation = blendEquation;
        }

        const blendSrcAlpha = data.blendSrcAlpha;
        if ( isDefined( blendSrcAlpha ) ) {
            material.blendSrcAlpha = blendSrcAlpha;
        }

        const blendDstAlpha = data.blendDstAlpha;
        if ( isDefined( blendDstAlpha ) ) {
            material.blendDstAlpha = blendDstAlpha;
        }

        const blendEquationAlpha = data.blendEquationAlpha;
        if ( isDefined( blendEquationAlpha ) ) {
            material.blendEquationAlpha = blendEquationAlpha;
        }

        const depthFunc = data.depthFunc;
        if ( isDefined( depthFunc ) ) {
            material.depthFunc = depthFunc;
        }

        const depthTest = data.depthTest;
        if ( isDefined( depthTest ) ) {
            material.depthTest = depthTest;
        }

        const depthWrite = data.depthWrite;
        if ( isDefined( depthWrite ) ) {
            material.depthWrite = depthWrite;
        }

        const clippingPlanes = data.clippingPlanes;
        if ( isDefined( clippingPlanes ) ) {
            material.clippingPlanes = clippingPlanes;
        }

        const clipIntersection = data.clipIntersection;
        if ( isDefined( clipIntersection ) ) {
            material.clipIntersection = clipIntersection;
        }

        const clipShadows = data.clipShadows;
        if ( isDefined( clipShadows ) ) {
            material.clipShadows = clipShadows;
        }

        const colorWrite = data.colorWrite;
        if ( isDefined( colorWrite ) ) {
            material.colorWrite = colorWrite;
        }

        const precision = data.precision;
        if ( isDefined( precision ) ) {
            material.precision = precision;
        }

        const polygonOffset = data.polygonOffset;
        if ( isDefined( polygonOffset ) ) {
            material.polygonOffset = polygonOffset;
        }

        const polygonOffsetFactor = data.polygonOffsetFactor;
        if ( isDefined( polygonOffsetFactor ) ) {
            material.polygonOffsetFactor = polygonOffsetFactor;
        }

        const polygonOffsetUnits = data.polygonOffsetUnits;
        if ( isDefined( polygonOffsetUnits ) ) {
            material.polygonOffsetUnits = polygonOffsetUnits;
        }

        const dithering = data.dithering;
        if ( isDefined( dithering ) ) {
            material.dithering = dithering;
        }

        const alphaTest = data.alphaTest;
        if ( isDefined( alphaTest ) ) {
            material.alphaTest = alphaTest;
        }

        const premultipliedAlpha = data.premultipliedAlpha;
        if ( isDefined( premultipliedAlpha ) ) {
            material.premultipliedAlpha = premultipliedAlpha;
        }

        const overdraw = data.overdraw;
        if ( isDefined( overdraw ) ) {
            material.overdraw = overdraw;
        }

        const visible = data.visible;
        if ( isDefined( visible ) ) {
            material.visible = visible;
        }

        const userData = data.userData;
        if ( isDefined( userData ) ) {
            material.userData = userData;
        }

        const needsUpdate = data.needsUpdate;
        if ( isDefined( needsUpdate ) ) {
            material.needsUpdate = needsUpdate;
        }

    }

    _setVector2 ( vec2 ) {

        const x = vec2.x;
        const y = vec2.y;
        if ( isNotDefined( x ) || isNotDefined( y ) ) {
            throw new Error( 'MaterialsManager: Unable to convert null or undefined vector 2 !' )
        }

        return new Vector2( x, y )

    }

    _setColor ( color ) {

        const r = color.r;
        const g = color.g;
        const b = color.b;
        if ( isNotDefined( r ) || isNotDefined( g ) || isNotDefined( b ) ) {
            throw new Error( 'MaterialsManager: Unable to convert null or undefined color !' )
        }

        return new Color( r, g, b )

    }

    fillTextures ( materials, onSuccess/*, onProgress, onError */ ) {

        const texturesMap = this._retrieveTexturesOf( materials );

        for ( let key in materials ) {

            const material = materials[ key ];
            const textures = texturesMap[ key ];

            for ( let textureKey in textures ) {
                material[ textureKey ] = textures[ textureKey ];
            }

        }

        // Don't forget to return all input object to callback,
        // else some ids won't never be considered as processed !
        onSuccess( materials );

    }

    _retrieveTexturesOf ( materials ) {

        const availableTextures = [ 'map', 'lightMap', 'aoMap', 'emissiveMap', 'bumpMap', 'normalMap', 'displacementMap', 'specularMap', 'alphaMap', 'envMap' ];
        const texturesMap       = {};
        const localCache        = {};

        for ( let id in materials ) {

            const material = materials[ id ];

            let textures = {};
            for ( let i = 0, numberOfAvailableTextures = availableTextures.length ; i < numberOfAvailableTextures ; i++ ) {
                let mapType = availableTextures[ i ];

                const map = material[ mapType ];
                if ( isDefined( map ) && isString( map ) && isNotEmptyString( map ) ) {

                    const texturePath  = `${ this._texturesPath }/${ map }`;
                    const cachedResult = localCache[ texturePath ];

                    if ( isDefined( cachedResult ) ) {

                        textures[ mapType ] = cachedResult;

                    } else {

                        const texture = this._texturesProvider.load(
                            texturePath,
                            () => {},
                            () => {},
                            () => {

                                if ( !texture.image ) {
                                    texture.image       = DEFAULT_IMAGE;
                                    texture.needsUpdate = true;
                                }

                            }
                        );
                        texture.name  = map;

                        if ( !this._generateMipmap ) {
                            texture.generateMipmaps = false;
                            texture.magFilter       = LinearFilter;
                            texture.minFilter       = LinearFilter;
                        }

                        localCache[ texturePath ] = texture;
                        textures[ mapType ]       = texture;

                    }

                }

            }

            texturesMap[ id ] = textures;

        }

        return texturesMap

    }

}

/**
 * @module Managers/ObjectsManager
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */

/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class ObjectsManager extends TDataBaseManager {

    /**
     *
     * @param parameters
     */
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                basePath:                  '/objects',
                geometriesProviderOptions: {},
                materialsProviderOptions:  {},
                projectionSystem:          'zBack',
                globalScale:               1,
                autoFillObjects3D:         true
            }, ...parameters
        };

        super( _parameters );

        this.projectionSystem   = _parameters.projectionSystem;
        this.globalScale        = _parameters.globalScale;
        this.autoFillObjects3D  = _parameters.autoFillObjects3D;
        this.geometriesProvider = new GeometriesManager( _parameters.geometriesProviderOptions );
        this.materialsProvider  = new MaterialsManager( _parameters.materialsProviderOptions );

    }

    //// Getter/Setter

    get geometriesProvider () {
        return this._geometriesProvider
    }

    set geometriesProvider ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Geometries provider cannot be null ! Expect an instance of GeometriesManager.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Geometries provider cannot be undefined ! Expect an instance of GeometriesManager.' ) }
        if ( !( value instanceof GeometriesManager ) ) { throw new TypeError( `Geometries provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TGeometriesManager.` ) }

        this._geometriesProvider = value;

    }

    get materialsProvider () {
        return this._materialsProvider
    }

    set materialsProvider ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Materials provider cannot be null ! Expect an instance of MaterialsManager.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Materials provider cannot be undefined ! Expect an instance of MaterialsManager.' ) }
        if ( !( value instanceof MaterialsManager ) ) { throw new TypeError( `Materials provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TMaterialsManager.` ) }

        this._materialsProvider = value;

    }

    get projectionSystem () {
        return this._projectionSystem
    }

    set projectionSystem ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Projection system cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Projection system cannot be undefined ! Expect a positive number.' ) }

        this._projectionSystem = value;

    }

    get globalScale () {
        return this._globalScale
    }

    set globalScale ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a positive number.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }

        this._globalScale = value;

    }

    get autoFillObjects3D () {
        return this._autoFillObjects3D
    }

    set autoFillObjects3D ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }

        this._autoFillObjects3D = value;

    }

    setGeometriesProvider ( value ) {

        this.geometriesProvider = value;
        return this

    }

    setMaterialsProvider ( value ) {

        this.materialsProvider = value;
        return this

    }

    setProjectionSystem ( value ) {

        this.projectionSystem = value;
        return this

    }

    setGlobalScale ( value ) {

        this.globalScale = value;
        return this

    }

    setAutoFillObjects3D ( value ) {

        this.autoFillObjects3D = value;
        return this

    }

    //// Methods

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

        // Convert data from db to instanced object and add them into a map
        const results = {};
        for ( let dataIndex = 0, numberOfDatas = jsonData.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

            data = jsonData[ dataIndex ];

            try {
                results[ data._id ] = this.convert( data );
            } catch ( err ) {
                onError( err );
            }

            onProgress( new ProgressEvent( 'ObjectsManager', {
                lengthComputable: true,
                loaded:           dataIndex + 1,
                total:            numberOfDatas
            } ) );

        }

        // In case autoFill is true query materials and geometry
        if ( this._autoFillObjects3D ) {
            this.fillObjects3D( results, onSuccess, onProgress, onError );
        } else {
            onSuccess( results );
        }

    }

    // eslint-disable-next-line no-unused-vars
    _onArrayBuffer ( data, onSuccess, onProgress, onError ) {}

    // eslint-disable-next-line no-unused-vars
    _onBlob ( data, onSuccess, onProgress, onError ) {}

    // eslint-disable-next-line no-unused-vars
    _onText ( data, onSuccess, onProgress, onError ) {}

    /**
     *
     * @param data
     * @return {*}
     */
    convert ( data ) {

        if ( !data ) {
            throw new Error( 'ObjectsManager: Unable to convert null or undefined data !' )
        }

        const objectType = data.type;
        let object       = null;

        // Todo: Use factory instead and allow user to register its own object type !!!
        switch ( objectType ) {

            case 'Object3D':
                object = new Object3D();
                this._fillBaseObjectsData( object, data );
                break

            case 'Scene':
                object = new Scene();
                this._fillBaseObjectsData( object, data );
                if ( isDefined( data.background ) ) {

                    if ( Number.isInteger( data.background ) ) {

                        object.background = new Color( data.background );

                    }

                }
                if ( isDefined( data.fog ) ) {

                    if ( data.fog.type === 'Fog' ) {

                        object.fog = new Fog( data.fog.color, data.fog.near, data.fog.far );

                    } else if ( data.fog.type === 'FogExp2' ) {

                        object.fog = new FogExp2( data.fog.color, data.fog.density );

                    }

                }
                object.overrideMaterial = data.overrideMaterial;
                object.autoUpdate       = data.autoUpdate;
                break

            case 'PerspectiveCamera':
                object = new PerspectiveCamera();
                this._fillBaseObjectsData( object, data );
                object.fov    = data.fov;
                object.aspect = data.aspect;
                object.near   = data.near;
                object.far    = data.far;
                if ( isDefined( data.focus ) ) {
                    object.focus = data.focus;
                }
                if ( isDefined( data.zoom ) ) {
                    object.zoom = data.zoom;
                }
                if ( isDefined( data.filmGauge ) ) {
                    object.filmGauge = data.filmGauge;
                }
                if ( isDefined( data.filmOffset ) ) {
                    object.filmOffset = data.filmOffset;
                }
                if ( isDefined( data.view ) ) {
                    object.view = Object.assign( {}, data.view );
                }
                break

            case 'OrthographicCamera':
                object = new OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );
                this._fillBaseObjectsData( object, data );
                break

            case 'AmbientLight':
                object = new AmbientLight( data.color, data.intensity );
                this._fillBaseObjectsData( object, data );
                break

            case 'DirectionalLight':
                object = new DirectionalLight( data.color, data.intensity );
                this._fillBaseObjectsData( object, data );
                break

            case 'PointLight':
                object = new PointLight( data.color, data.intensity, data.distance, data.decay );
                this._fillBaseObjectsData( object, data );
                break

            case 'RectAreaLight':
                object = new RectAreaLight( data.color, data.intensity, data.width, data.height );
                this._fillBaseObjectsData( object, data );
                break

            case 'SpotLight':
                object = new SpotLight( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay );
                this._fillBaseObjectsData( object, data );
                break

            case 'HemisphereLight':
                object = new HemisphereLight( data.color, data.groundColor, data.intensity );
                this._fillBaseObjectsData( object, data );
                break

            case 'SkinnedMesh':
                object = new SkinnedMesh();
                this._fillBaseObjectsData( object, data );
                object.geometry          = data.geometry;
                object.material          = data.material;
                object.drawMode          = data.drawMode;
                object.bindMode          = data.bindMode;
                object.bindMatrix        = data.bindMatrix;
                object.bindMatrixInverse = data.bindMatrixInverse;
                break

            case 'Mesh':
                object = new Mesh();
                this._fillBaseObjectsData( object, data );
                object.geometry = data.geometry;
                object.material = data.material;
                object.drawMode = data.drawMode;
                break

            case 'LOD':
                object = new LOD();
                this._fillBaseObjectsData( object, data );
                object.levels = data.levels;
                break

            case 'Line':
                object = new Line();
                this._fillBaseObjectsData( object, data );
                object.geometry = data.geometry;
                object.material = data.material;
                object.drawMode = data.drawMode;
                break

            case 'LineLoop':
                object = new LineLoop();
                this._fillBaseObjectsData( object, data );
                object.geometry = data.geometry;
                object.material = data.material;
                object.drawMode = data.drawMode;
                break

            case 'LineSegments':
                object = new LineSegments();
                this._fillBaseObjectsData( object, data );
                object.geometry = data.geometry;
                object.material = data.material;
                object.drawMode = data.drawMode;
                break

            case 'Points':
                object = new Points();
                this._fillBaseObjectsData( object, data );
                object.geometry = data.geometry;
                object.material = data.material;
                object.drawMode = data.drawMode;
                break

            case 'Sprite':
                object = new Sprite();
                this._fillBaseObjectsData( object, data );
                object.material = data.material;
                break

            case 'Group':
                object = new Group();
                this._fillBaseObjectsData( object, data );
                break

            default:
                throw new Error( `TObjectsManager: Unknown object of type: ${ objectType }` )

        }

        return object

    }

    _fillBaseObjectsData ( object, data ) {

        // Common object properties
        object._id = data._id;

        if ( isDefined( data.uuid ) ) {
            object.uuid = data.uuid;
        }

        if ( isDefined( data.name ) ) {
            object.name = data.name;
        }

        // IMPLICIT
        //        if ( isDefined( data.type ) ) {
        //            object.type = data.type
        //        }

        if ( isDefined( data.parent ) ) {
            object.parent = data.parent;
        }

        if ( isNotEmptyArray( data.children ) ) {
            object.children = data.children;
        }

        if ( isDefined( data.up ) ) {
            object.up.x = data.up.x;
            object.up.y = data.up.y;
            object.up.z = data.up.z;
        }

        if ( isDefined( data.position ) ) {

            if ( this._projectionSystem === 'zBack' ) {

                object.position.x = data.position.x / this._globalScale;
                object.position.y = data.position.z / this._globalScale;
                object.position.z = -data.position.y / this._globalScale;

            } else {

                object.position.x = data.position.x / this._globalScale;
                object.position.y = data.position.y / this._globalScale;
                object.position.z = data.position.z / this._globalScale;

            }

        }

        if ( isDefined( data.rotation ) ) {

            if ( this._projectionSystem === 'zBack' ) {

                object.rotation.x     = data.rotation.x;
                object.rotation.y     = data.rotation.z;
                object.rotation.z     = -data.rotation.y;
                object.rotation.order = data.rotation.order;

            } else {

                object.rotation.x     = data.rotation.x;
                object.rotation.y     = data.rotation.y;
                object.rotation.z     = data.rotation.z;
                object.rotation.order = data.rotation.order;

            }

        }

        if ( isDefined( data.quaternion ) ) {

            if ( this._projectionSystem === 'zBack' ) {

                object.quaternion.x = data.quaternion.x;
                object.quaternion.y = data.quaternion.z;
                object.quaternion.z = -data.quaternion.y;
                object.quaternion.w = data.quaternion.w;

            } else {

                object.quaternion.x = data.quaternion.x;
                object.quaternion.y = data.quaternion.y;
                object.quaternion.z = data.quaternion.z;
                object.quaternion.w = data.quaternion.w;

            }

        }

        if ( isDefined( data.scale ) ) {

            if ( data.scale.x !== 0 && data.scale.y !== 0 && data.scale.z !== 0 ) {
                object.scale.x = data.scale.x;
                object.scale.y = data.scale.y;
                object.scale.z = data.scale.z;
            } else {
                this.logger.warn( 'Try to assign null scale !' );
            }

        }

        if ( isDefined( data.modelViewMatrix ) && isNotEmptyArray( data.modelViewMatrix ) ) {
            object.modelViewMatrix.fromArray( data.modelViewMatrix );
        }

        if ( isDefined( data.normalMatrix ) && isNotEmptyArray( data.normalMatrix ) ) {
            object.normalMatrix.fromArray( data.normalMatrix );
        }

        if ( isDefined( data.matrix ) && isNotEmptyArray( data.matrix ) ) {
            object.matrix.fromArray( data.matrix );
        }

        if ( isDefined( data.matrixWorld ) && isNotEmptyArray( data.matrixWorld ) ) {
            object.matrixWorld.fromArray( data.matrixWorld );
        }

        if ( isDefined( data.matrixAutoUpdate ) ) {
            object.matrixAutoUpdate = data.matrixAutoUpdate;
        }

        if ( isDefined( data.matrixWorldNeedsUpdate ) ) {
            object.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate;
        }

        if ( isDefined( data.layers ) ) {
            object.layers.mask = data.layers;
        }

        if ( isDefined( data.visible ) ) {
            object.visible = data.visible;
        }

        if ( isDefined( data.castShadow ) ) {
            object.castShadow = data.castShadow;
        }

        if ( isDefined( data.receiveShadow ) ) {
            object.receiveShadow = data.receiveShadow;
        }

        if ( isDefined( data.frustumCulled ) ) {
            object.frustumCulled = data.frustumCulled;
        }

        if ( isDefined( data.renderOrder ) ) {
            object.renderOrder = data.renderOrder;
        }

        if ( isDefined( data.userData ) ) {
            object.userData = data.userData;
        }

    }

    //// Callback

    /**
     *
     * @param objects
     * @param {GlobalFunction} onSuccess
     * @param {GlobalCallback} onProgress
     * @param {module:Managers/ObjectsManager~ObjectsManager~ClassCallback} onError
     */
    fillObjects3D ( objects, onSuccess, onProgress, onError ) {

        const self = this;

        // Get objects that need geometry or materials
        const objectsArray = [];
        for ( let id in objects ) {

            const object = objects[ id ];
            if ( object.geometry || object.material ) {
                objectsArray.push( objects[ id ] );
            }

        }

        // In case no objects need to be filled return result
        if ( objectsArray.length === 0 ) {
            onSuccess( objects );
            return
        }

        // Else fill geometries and materials for filtered objects
        let geometriesMap = undefined;
        let materialsMap  = undefined;

        this._retrieveGeometriesOf( objectsArray, ( geometries ) => {
            geometriesMap = geometries;
            onEndDataFetching();
        }, onProgress, onError );

        this._retrieveMaterialsOf( objectsArray, ( materials ) => {
            materialsMap = materials;
            onEndDataFetching();
        }, onProgress, onError );

        function onEndDataFetching () {

            if ( !geometriesMap || !materialsMap ) { return }

            for ( let key in objects ) {
                const mesh = objects[ key ];
                self.applyGeometry( mesh, geometriesMap );
                self.applyMaterials( mesh, materialsMap );
            }

            // Don't forget to return all input object to callback,
            // else some ids won't never be considered as processed !
            onSuccess( objects );

        }

    }

    _retrieveGeometriesOf ( meshes, onSuccess, onProgress, onError ) {

        const geometriesIds = meshes.map( object => object.geometry )
                                    .filter( ( value, index, self ) => {
                                        return value && self.indexOf( value ) === index
                                    } );

        if ( geometriesIds.length === 0 ) {
            onSuccess( {} );
            return
        }

        this._geometriesProvider.read(
            geometriesIds,
            null,
            onSuccess,
            onProgress,
            onError
        );

    }

    _retrieveMaterialsOf ( meshes, onSuccess, onProgress, onError ) {

        const materialsArray       = meshes.map( object => object.material );
        const concatMaterialsArray = [].concat.apply( [], materialsArray );
        const materialsIds         = concatMaterialsArray.filter( ( value, index, self ) => {
            return value && self.indexOf( value ) === index
        } );

        if ( materialsIds.length === 0 ) {
            onSuccess( {} );
            return
        }

        this._materialsProvider.read(
            materialsIds,
            null,
            onSuccess,
            onProgress,
            onError
        );

    }

    /*
     ///// PROMISE

     async fillObjects3DByPromises ( objects, onSuccess, onProgress, onError ) {

     const self         = this
     const objectsArray = []
     for ( let id in objects ) {
     objectsArray.push( objects[ id ] )
     }

     const [ geometriesMap, materialsMap ] = await Promise.all( [
     this._getGeometriesPromiseOf( objectsArray, onProgress, onError ),
     this._getMaterialsPromiseOf( objectsArray, onProgress, onError )
     ] )

     for ( let key in objects ) {
     const mesh = objects[ key ]
     self.applyGeometry( mesh, geometriesMap )
     self.applyMaterials( mesh, materialsMap )
     }

     // Don't forget to return all input object to callback,
     // else some ids won't never be considered as processed !
     onSuccess( objects )

     }

     _getGeometriesPromiseOf ( meshes, onProgress, onError ) {

     const self = this

     return new Promise( function ( resolve, reject ) {

     const geometriesIds = meshes.map( object => object.geometry )
     .filter( ( value, index, self ) => {
     return value && self.indexOf( value ) === index
     } )

     if ( geometriesIds.length === 0 ) {
     resolve( {} )
     return
     }

     self._geometriesProvider.read(
     geometriesIds,
     null,
     geometries => {
     resolve( geometries )
     },
     onProgress,
     onError
     )

     } )

     }

     _getMaterialsPromiseOf ( meshes, onProgress, onError ) {

     const self = this

     return new Promise( function ( resolve, reject ) {

     const materialsArray       = meshes.map( object => object.material )
     const concatMaterialsArray = [].concat.apply( [], materialsArray )
     const materialsIds         = concatMaterialsArray.filter( ( value, index, self ) => {
     return value && self.indexOf( value ) === index
     } )

     if ( materialsIds.length === 0 ) {
     resolve( {} )
     return
     }

     self._materialsProvider.read(
     materialsIds,
     null,
     materials => {
     resolve( materials )
     },
     onProgress,
     onError
     )

     } )

     }

     ///// ASYNC

     async fillObjects3D ( objects, onSuccess, onProgress, onError ) {

     const self         = this
     const objectsArray = []
     for ( let id in objects ) {

     const object = objects[ id ]
     if ( object.geometry || object.material ) {
     objectsArray.push( objects[ id ] )
     }

     }

     if ( objectsArray.length === 0 ) {
     onSuccess( objects )
     return
     }

     let geometriesMap = undefined
     this._retrieveGeometriesOf( objectsArray, ( geometries ) => {
     geometriesMap = geometries
     onEndDataFetching()
     }, onProgress, onError )

     let materialsMap = undefined
     this._retrieveMaterialsOf( objectsArray, ( materials ) => {
     materialsMap = materials
     onEndDataFetching()
     }, onProgress, onError )

     function onEndDataFetching () {

     if ( !geometriesMap || !materialsMap ) { return }

     for ( let key in objects ) {
     const mesh = objects[ key ]
     self.applyGeometry( mesh, geometriesMap )
     self.applyMaterials( mesh, materialsMap )
     }

     // Don't forget to return all input object to callback,
     // else some ids won't never be considered as processed !
     onSuccess( objects )

     }

     }

     _retrieveGeometriesOf ( meshes, onSucess, onProgress, onError ) {

     const geometriesIds = meshes.map( object => object.geometry )
     .filter( ( value, index, self ) => {
     return value && self.indexOf( value ) === index
     } )

     if ( geometriesIds.length === 0 ) {
     onSucess( {} )
     return
     }

     this._geometriesProvider.read(
     geometriesIds,
     null,
     onSucess,
     onProgress,
     onError
     )

     }

     _retrieveMaterialsOf ( meshes, onSucess, onProgress, onError ) {

     const materialsArray       = meshes.map( object => object.material )
     const concatMaterialsArray = [].concat.apply( [], materialsArray )
     const materialsIds         = concatMaterialsArray.filter( ( value, index, self ) => {
     return value && self.indexOf( value ) === index
     } )

     if ( materialsIds.length === 0 ) {
     onSucess( {} )
     return
     }

     this._materialsProvider.read(
     materialsIds,
     null,
     onSucess,
     onProgress,
     onError
     )

     }

     /////////////
     */

    applyGeometry ( object, geometries ) {

        const geometryId = object.geometry;
        if ( !geometryId ) {
            return
        }

        const geometry = geometries[ geometryId ];
        if ( !geometry ) {
            this.logger.error( 'Unable to retrieve geometry !!!' );
            return
        }

        object.geometry = geometry;

    }

    applyMaterials ( object, materials ) {

        const materialIds = object.material;
        if ( !materialIds ) {
            return
        }

        if ( Array.isArray( materialIds ) ) {

            if ( materialIds.length === 1 ) {

                const materialId = materialIds[ 0 ];
                const material   = materials[ materialId ];
                if ( !material ) {
                    this.logger.error( 'Unable to retrieve material !!!' );
                    return null
                }

                object.material = material.clone();

            } else {

                object.material = [];
                for ( let materialIndex = 0, numberOfMaterial = materialIds.length ; materialIndex < numberOfMaterial ; materialIndex++ ) {
                    const materialId = materialIds[ materialIndex ];
                    const material   = materials[ materialId ];
                    if ( !material ) {
                        this.logger.error( 'Unable to retrieve material !!!' );
                        return null
                    }

                    object.material.push( material.clone() );
                }
            }

        } else if ( typeof materialIds === 'string' ) {

            const material = materials[ materialIds ];
            if ( !material ) {
                this.logger.error( 'Unable to retrieve material !!!' );
                return
            }

            object.material = material.clone();

        } else {

            this.logger.error( 'Invalid material ids, expected string or array of string' );

        }

    }

}

/**
 * @module Objects3D/OrbitControlsHelper
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */

/**
 * @class
 * @classdesc Todo...
 * @example Todo...
 */
class OrbitControlsHelper extends LineSegments {

    static _createInternalGeometry ( RADIUS, RADIALS, CIRCLES, DIVISIONS, color1, color2 ) {

        const vertices = [];
        const colors   = [];

        let x,
            z,
            v,
            i,
            j,
            r,
            color;

        // create the radials
        for ( i = 0 ; i <= RADIALS ; i++ ) {

            v = ( i / RADIALS ) * ( Math.PI * 2 );

            x = Math.sin( v ) * RADIUS;
            z = Math.cos( v ) * RADIUS;

            vertices.push( 0, 0, 0 );
            vertices.push( x, 0, z );

            color = ( i & 1 ) ? color1 : color2;

            colors.push( color.r, color.g, color.b );
            colors.push( color.r, color.g, color.b );

        }

        // create the circles
        for ( i = 0 ; i <= CIRCLES ; i++ ) {

            color = ( i & 1 ) ? color1 : color2;

            r = RADIUS - ( RADIUS / CIRCLES * i );

            for ( j = 0 ; j < DIVISIONS ; j++ ) {

                // first vertex
                v = ( j / DIVISIONS ) * ( Math.PI * 2 );

                x = Math.sin( v ) * r;
                z = Math.cos( v ) * r;

                vertices.push( x, 0, z );
                colors.push( color.r, color.g, color.b );

                // second vertex
                v = ( ( j + 1 ) / DIVISIONS ) * ( Math.PI * 2 );

                x = Math.sin( v ) * r;
                z = Math.cos( v ) * r;

                vertices.push( x, 0, z );
                colors.push( color.r, color.g, color.b );

            }

            // create axis
            vertices.push(
                -1, 0, 0, 1, 0, 0,
                0, -1, 0, 0, 1, 0,
                0, 0, -1, 0, 0, 1
            );
            colors.push(
                0, 0, 0, 1, 0, 0, // black to red
                0, 0, 0, 0, 1, 0, // black to green
                0, 0, 0, 0, 0, 1 // black to blue
            );

        }

        const positionBufferAttribute = new Float32BufferAttribute( vertices, 3 );
        positionBufferAttribute.name  = 'TOrbitControlsHelperPositionBufferAttribute';

        const colorBufferAttribute = new Float32BufferAttribute( colors, 3 );
        colorBufferAttribute.name  = 'TOrbitControlsHelperColorBufferAttribute';

        const geometry = new BufferGeometry();
        geometry.setAttribute( 'position', positionBufferAttribute );
        geometry.setAttribute( 'color', colorBufferAttribute );
        geometry.name = 'TOrbitControlsHelperGeometry';

        return geometry

    }
    static _createInternalMaterial () {

        const material       = new LineBasicMaterial( { vertexColors: VertexColors } );
        material.transparent = true;
        material.opacity     = 0.0;
        material.name        = 'TOrbitControlsHelperMaterial';

        return material

    }
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                radius:     2,
                radials:    16,
                circles:    2,
                divisions:  64,
                innerColor: new Color( 0x444444 ),
                outerColor: new Color( 0x888888 )
            }, ...parameters
        };

        super( OrbitControlsHelper._createInternalGeometry( _parameters.radius, _parameters.radials, _parameters.circles, _parameters.divisions, _parameters.innerColor, _parameters.outerColor ), OrbitControlsHelper._createInternalMaterial() );


        this.matrixAutoUpdate = false;
        //        this.control     = control
        this._intervalId      = undefined;

        //        this.impose()

    }
    startOpacityAnimation () {

        // In case fade off is running, kill it an restore opacity to 1
        if ( this._intervalId !== undefined ) {

            clearInterval( this._intervalId );
            this._intervalId = undefined;

        }

        this.material.opacity = 1.0;

    }

    endOpacityAnimation () {

        // Manage transparency interval
        this._intervalId = setInterval( function () {

            if ( this.material.opacity <= 0.0 ) {

                this.material.opacity = 0.0;
                clearInterval( this._intervalId );
                this._intervalId = undefined;

            } else {

                this.material.opacity -= 0.1;

            }

        }.bind( this ), 100 );

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { TorusBufferGeometry } from 'three-full/sources/geometries/TorusGeometry'

class TorusHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI )
            }, ...parameters
        };

        super( _parameters );
        this.isTorusHitbox = true;
        this.type          = 'TorusHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class RotateGizmo extends AbstractGizmo {

    constructor () {

        super();
        this.isRotateGizmo = true;
        this.type          = 'RotateGizmo';

        const CircleGeometry = ( radius, facing, arc ) => {

            const geometry = new BufferGeometry();
            let vertices   = [];
            arc            = arc ? arc : 1;

            for ( let i = 0 ; i <= 64 * arc ; ++i ) {

                if ( facing === 'x' ) {
                    vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
                }
                if ( facing === 'y' ) {
                    vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius );
                }
                if ( facing === 'z' ) {
                    vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 );
                }

            }

            geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
            return geometry

        };

        this.handleGizmos = {

            X: [ [ new Line( new CircleGeometry( 1, 'x', 0.5 ), new HighlightableLineMaterial( { color: 0xff0000 } ) ) ],
                 [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0xff0000 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ] ],

            Y: [ [ new Line( new CircleGeometry( 1, 'y', 0.5 ), new HighlightableLineMaterial( { color: 0x00ff00 } ) ) ],
                 [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0x00ff00 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ] ],

            Z: [ [ new Line( new CircleGeometry( 1, 'z', 0.5 ), new HighlightableLineMaterial( { color: 0x0000ff } ) ) ],
                 [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0x0000ff } ) ), [ 0.99, 0, 0 ], null, [ 1, 3, 1 ] ] ],

            E: [ [ new Line( new CircleGeometry( 1.25, 'z', 1 ), new HighlightableLineMaterial( { color: 0xcccc00 } ) ) ] ],

            XYZ: [ [ new Line( new CircleGeometry( 1, 'z', 1 ), new HighlightableLineMaterial( { color: 0x787878 } ) ) ] ]

        };

        this.pickerGizmos = {

            X: [ [ new TorusHitbox(), [ 0, 0, 0 ], [ 0, -Math.PI / 2, -Math.PI / 2 ] ] ],

            Y: [ [ new TorusHitbox(), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ] ],

            Z: [ [ new TorusHitbox(), [ 0, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ] ],

            E: [ [ new TorusHitbox( {
                radius:          1.25,
                tube:            0.12,
                radialSegments:  2,
                tubularSegments: 24
            } ) ] ],

            XYZ: [ [ new TorusHitbox() ] ]

        };

        //        this.pickerGizmos.XYZ[ 0 ][ 0 ].visible = false // disable XYZ picker gizmo

        this._setupHandles( this.handleGizmos );
        //        this.init()

    }

    raycast ( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 );
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            if ( handle.name === this.intersectPlane.name ) {continue}
            handle.raycast( raycaster, intersects );
        }

    }
    /*
     update ( rotation, eye2 ) {

     super.update( rotation, eye2 )

     const tempMatrix     = new Matrix4()
     const worldRotation  = new Euler( 0, 0, 1 )
     const tempQuaternion = new Quaternion()
     const unitX          = new Vector3( 1, 0, 0 )
     const unitY          = new Vector3( 0, 1, 0 )
     const unitZ          = new Vector3( 0, 0, 1 )
     const quaternionX    = new Quaternion()
     const quaternionY    = new Quaternion()
     const quaternionZ    = new Quaternion()
     const eye            = eye2.clone()

     worldRotation.copy( this.planes[ 'XY' ].rotation )
     tempQuaternion.setFromEuler( worldRotation )

     tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix )
     eye.applyMatrix4( tempMatrix )

     this.traverse( child => {

     tempQuaternion.setFromEuler( worldRotation )

     if ( child.name === 'X' ) {

     quaternionX.setFromAxisAngle( unitX, Math.atan2( -eye.y, eye.z ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX )
     child.quaternion.copy( tempQuaternion )

     }

     if ( child.name === 'Y' ) {

     quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY )
     child.quaternion.copy( tempQuaternion )

     }

     if ( child.name === 'Z' ) {

     quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ )
     child.quaternion.copy( tempQuaternion )

     }

     } )

     }
     */

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { BoxBufferGeometry } from 'three-full/sources/geometries/BoxGeometry'

class BoxHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new BoxBufferGeometry( 1, 1, 1, 1, 1, 1 )
            }, ...parameters
        };

        super( _parameters );
        this.isBoxHitbox = true;
        this.type        = 'BoxHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class BoxHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                boxColor:   0x104b83,
                edgesColor: 0x123456,
                hitbox:     new BoxHitbox( {
                    geometry: new BoxBufferGeometry( 1.1, 1.1, 1.1, 1, 1, 1 )
                } )
            }, ...parameters
        };

        super( _parameters );
        this.isOmnidirectionalHandle = true;
        this.type                    = 'OmnidirectionalHandle';

        ////

        const boxGeometry = new BoxBufferGeometry( 1.0, 1.0, 1.0, 1, 1, 1 );
        boxGeometry.name  = 'BoxHandle_Box_Geometry';

        const boxMaterial = new HighlightableMaterial( {
            color:       _parameters.boxColor,
            transparent: false,
            opacity:     1.0
        } );
        boxMaterial.name  = 'BoxHandle_Box_Material';

        const box            = new Mesh( boxGeometry, boxMaterial );
        box.name             = 'BoxHandle_Box';
        box.matrixAutoUpdate = false;

        this.add( box );

        ////

        const edgesGeometry = new EdgesGeometry( boxGeometry );
        edgesGeometry.name  = 'BoxHandle_Edges_Geometry';

        const edgesMaterial = new HighlightableLineMaterial( {
            color:       _parameters.edgesColor,
            linewidth:   4,
            transparent: false,
            opacity:     1.0
        } );
        edgesMaterial.name  = 'BoxHandle_Edges_Material';

        const edges            = new LineSegments( edgesGeometry, edgesMaterial );
        edges.name             = 'BoxHandle_Edges';
        edges.matrixAutoUpdate = false;

        this.add( edges );

    }

    update ( cameraDirection ) {
        super.update( cameraDirection );

        this.updateMatrix();
        this.hitbox.updateMatrix();
    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class ConeHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                coneColor:  0x104b83,
                edgesColor: 0x123456,
                hitbox:     new BoxHitbox( {
                    geometry: new ConeBufferGeometry( 1.1, 1.1 )
                } )
            }, ...parameters
        };

        super( _parameters );
        this.isOmnidirectionalHandle = true;
        this.type                    = 'OmnidirectionalHandle';

        ////

        const coneGeometry = new ConeBufferGeometry( 1.0, 1.0 );
        coneGeometry.name  = 'ConeHandle_Cone_Geometry';

        const coneMaterial = new HighlightableMaterial( {
            color:       _parameters.coneColor,
            transparent: false,
            opacity:     1.0
        } );
        coneMaterial.name  = 'ConeHandle_Cone_Material';

        const cone            = new Mesh( coneGeometry, coneMaterial );
        cone.name             = 'ConeHandle_Cone';
        cone.matrixAutoUpdate = true;

        this.add( cone );

        ////

        //        const edgesGeometry = new EdgesGeometry( coneGeometry )
        //        edgesGeometry.name  = 'ConeHandle_Edges_Geometry'
        //
        //        const edgesMaterial = new HighlightableLineMaterial( {
        //            color:       _parameters.edgesColor,
        //            linewidth:   4,
        //            transparent: false,
        //            opacity:     1.0
        //        } )
        //        edgesMaterial.name  = 'ConeHandle_Edges_Material'
        //
        //        const edges            = new LineSegments( edgesGeometry, edgesMaterial )
        //        edges.name             = 'ConeHandle_Edges'
        //        edges.matrixAutoUpdate = false
        //
        //        this.add( edges )

    }

    update ( cameraDirection ) {
        super.update( cameraDirection );

        this.updateMatrix();
        this.hitbox.updateMatrix();
    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class LookAtGizmo extends AbstractGizmo {


    //TYPE ENTITY ENUM COLOMNU

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                boxColor:   0xA9A9A9,
                edgesColor: 0xD3D3D3
            },
            ...parameters
        };

        super( _parameters );
        this.isLookAtGizmo = true;
        this.type          = 'LookAtGizmo';

        this.explodeFactor = 0.25;

        this.handleGizmos = {

            // Cone faces
            FACE_RIGHT: new ConeHandle( {
                coneColor: 0xdd0000
            } ).setPosition( +( 4 + this.explodeFactor ), +0, +0 )
               .setRotationFromAxisAndAngle( new Vector3( 0, 0, 1 ), degreesToRadians( 90 ) )
               .setScale( 1, 4, 1 ),

            FACE_LEFT: new ConeHandle( {
                coneColor: 0x550000
            } ).setPosition( -( 4 + this.explodeFactor ), +0, +0 )
               .setRotationFromAxisAndAngle( new Vector3( 0, 0, 1 ), degreesToRadians( -90 ) )
               .setScale( 1, 4, 1 ),

            FACE_TOP: new ConeHandle( {
                coneColor: 0x0000dd
            } ).setPosition( +0, +( 4 + this.explodeFactor ), +0 )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( 180 ) )
               .setScale( 1, 4, 1 ),

            FACE_BOTTOM: new ConeHandle( {
                coneColor: 0x000055
            } ).setPosition( +0, -( 4 + this.explodeFactor ), +0 )
               .setScale( 1, 4, 1 ),

            FACE_FRONT: new ConeHandle( {
                coneColor: 0x005500
            } ).setPosition( +0, +0, +( 4 + this.explodeFactor ) )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( -90 ) )
               .setScale( 1, 4, 1 ),

            FACE_BACK: new ConeHandle( {
                coneColor: 0x00dd00
            } ).setPosition( +0, +0, -( 4 + this.explodeFactor ) )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( 90 ) )
               .setScale( 1, 4, 1 ),

            // Planar faces
            //            FACE_RIGHT:  new BoxHandle().setPosition( +( 2 + this.explodeFactor ), +0, +0 ).setScale( 1, 3, 3 ),
            //            FACE_LEFT:   new BoxHandle().setPosition( -( 2 + this.explodeFactor ), +0, +0 ).setScale( 1, 3, 3 ),
            //            FACE_TOP:    new BoxHandle().setPosition( +0, +( 2 + this.explodeFactor ), +0 ).setScale( 3, 1, 3 ),
            //            FACE_BOTTOM: new BoxHandle().setPosition( +0, -( 2 + this.explodeFactor ), +0 ).setScale( 3, 1, 3 ),
            //            FACE_FRONT:  new BoxHandle().setPosition( +0, +0, +( 2 + this.explodeFactor ) ).setScale( 3, 3, 1 ),
            //            FACE_BACK:   new BoxHandle().setPosition( +0, +0, -( 2 + this.explodeFactor ) ).setScale( 3, 3, 1 ),

            CORNER_TOP_LEFT_FRONT:     new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_TOP_LEFT_BACK:      new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),
            CORNER_TOP_RIGHT_FRONT:    new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_TOP_RIGHT_BACK:     new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_LEFT_FRONT:  new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_LEFT_BACK:   new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_RIGHT_FRONT: new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_RIGHT_BACK:  new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),

            EDGE_TOP_FRONT:    new BoxHandle( _parameters ).setPosition( +0, +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_TOP_LEFT:     new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), +0 ).setScale( 1, 1, 3 ),
            EDGE_TOP_BACK:     new BoxHandle( _parameters ).setPosition( +0, +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_TOP_RIGHT:    new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), +0 ).setScale( 1, 1, 3 ),
            EDGE_LEFT_FRONT:   new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +0, +( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_LEFT_BACK:    new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +0, -( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_RIGHT_FRONT:  new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +0, +( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_RIGHT_BACK:   new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +0, -( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_BOTTOM_FRONT: new BoxHandle( _parameters ).setPosition( +0, -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_BOTTOM_LEFT:  new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), +0 ).setScale( 1, 1, 3 ),
            EDGE_BOTTOM_BACK:  new BoxHandle( _parameters ).setPosition( +0, -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_BOTTOM_RIGHT: new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), +0 ).setScale( 1, 1, 3 )

        };

        this._setupHandles( this.handleGizmos );

    }

    raycast ( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 );
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            handle.raycast( raycaster, intersects );
        }

    }
}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class RotateHandle extends AbstractHandle {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{}, ...parameters
        };

        super( _parameters );
        this.isRotateHandle = true;
        this.type           = 'RotateHandle';

    }

    update ( cameraDirection ) {
        super.update( cameraDirection );


        this.updateMatrix();
        this.hitbox.updateMatrix();
    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

//import { SphereBufferGeometry } from 'three-full/sources/geometries/SphereGeometry'

class SphericalHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new SphereBufferGeometry( 1, 8, 6, 0, 2 * Math.PI, 0, Math.PI )
            }, ...parameters
        };

        super( _parameters );
        this.isSphericalHitbox = true;
        this.type              = 'SphericalHitbox';

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

class HighlightableMesh extends Mesh {

    constructor ( geometry, parameters = {} ) {
        super( geometry, new HighlightableMaterial( {
            color:       parameters.color,
            transparent: true,
            opacity:     0.55
        } ) );

        this.isHighlightableMesh = true;
        this.type                = 'HighlightableMesh';

    }

    highlight ( value ) {

        this.material.highlight( value );

    }

}

export { ASCLoader, AbstractGizmo, AbstractHandle, AbstractHitbox, BitArray, BitManager, CameraControlMode, CameraControls, ClippingBox, ClippingControls, ClippingModes, CurvesManager, CylindricaHitbox, DBFLoader, GeometriesManager, HighlightableMesh, LASLoader, LookAtGizmo, LozengeHandle, LozengeHitbox, MaterialsManager, ObjectsManager, OctahedricalHandle, OctahedricalHitbox, OrbitControlsHelper, PlanarHitbox, PlaneHandle, PointClasses, RotateGizmo, RotateHandle, SHPLoader, ScaleGizmo, ScaleHandle, ShapeType, SphericalHitbox, TexturesManager, TorusHitbox, TranslateGizmo, TranslateHandle };
//# sourceMappingURL=itee-plugin-three.esm.js.map
