console.log('Itee.Plugin.Three v1.2.4 - Standalone')
this.Itee = this.Itee || {};
this.Itee.Plugin = this.Itee.Plugin || {};
this.Itee.Plugin.Three = (function (exports, iteeClient, threeFull, iteeUtils, iteeValidators) {
	'use strict';

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @file A loader for ASC cloud point files.
	 *
	 * @example
	 *    var loader = new ASCLoader();
	 *    loader.load('/path/to/file.asc', function (geometry) {
	 *
	 *		scene.add( new Mesh( geometry ) );
	 *
	 *	} );
	 *
	 * If the ASC file need to be offset,
	 * it can be set before loading file.
	 *
	 * loader.setOffset( {
	 *	x: 1.0,
	 *  y: 52.0,
	 *  z: -5.0
	 * } );
	 *
	 */

	class ASCLoader {

	    constructor ( manager = threeFull.DefaultLoadingManager, logger = iteeClient.DefaultLogger ) {

	        this.manager = manager;
	        this.logger  = logger;

	        this._boundingBox    = new threeFull.Box3();
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
	     *
	     * @param url
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @param sampling
	     */
	    load ( url, onLoad, onProgress, onError, sampling ) {

	        //        //this.logger.time("ASCLoader")

	        const loader = new threeFull.FileLoader( this.manager );
	        loader.setResponseType( 'blob' );
	        loader.load( url, function ( blob ) {

	            const groupToFeed = new threeFull.Group();
	            this._parse( blob, groupToFeed, onLoad, onProgress, onError, sampling );
	            onLoad( groupToFeed );

	        }.bind( this ), onProgress, onError );

	    }

	    /**
	     *
	     * @param offset
	     */
	    setOffset ( offset ) {

	        //TODO: check is correct

	        this._offset     = offset;
	        this._autoOffset = false;

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

	            const geometry  = new threeFull.BufferGeometry();
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

	            geometry.setAttribute( 'position', new threeFull.BufferAttribute( positions, 3 ) );
	            geometry.setAttribute( 'color', new threeFull.BufferAttribute( colors, 3 ) );

	            const material = new threeFull.PointsMaterial( {
	                size:         0.01,
	                vertexColors: true
	            } );

	            cloud = new threeFull.Points( geometry, material );
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
	        const geometry       = new threeFull.BufferGeometry();
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

	        geometry.setAttribute( 'position', new threeFull.BufferAttribute( positions, 3 ) );
	        geometry.setAttribute( 'color', new threeFull.BufferAttribute( colors, 3 ) );

	        const material = new threeFull.PointsMaterial( {
	            size:         0.005,
	            vertexColors: true
	        } );

	        const cloud = new threeFull.Points( geometry, material );

	        //Todo: Apply import coordinates syteme here !
	        cloud.rotation.x -= Math.PI / 2;

	        group.children.push( cloud );

	        // Clear current processed points
	        this._points = [];

	    }

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * From:
	 * https://www.clicketyclick.dk/databases/xbase/format/db2_dbf.html#DBII_DBF_STRUCT
	 * http://web.archive.org/web/20150323061445/http://ulisse.elettra.trieste.it/services/doc/dbase/DBFstruct.htm
	 * http://www.dbase.com/Knowledgebase/INT/db7_file_fmt.htm
	 *
	 * @class Todo...
	 * @classdesc Todo...
	 * @example Todo...
	 *
	 */

	/**
	 *
	 * @type {Object}
	 */
	const DBFVersion = Object.freeze( {
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
	const DataType = Object.freeze( {
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
	 *
	 * @param manager
	 * @param logger
	 * @constructor
	 */
	function DBFLoader ( manager = threeFull.DefaultLoadingManager, logger = iteeClient.DefaultLogger ) {

	    this.manager = manager;
	    this.logger  = logger;
	    this.reader  = new iteeClient.TBinaryReader();

	}

	Object.assign( DBFLoader, {

	    /**
	     *
	     */
	    Terminator: 0x0D,

	    /**
	     *
	     */
	    DeletedRecord: 0x1A,

	    /**
	     *
	     */
	    YearOffset: 1900

	} );

	Object.assign( DBFLoader.prototype, {

	    /**
	     *
	     * @param url
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     */
	    load ( url, onLoad, onProgress, onError ) {

	        const scope = this;

	        const loader = new threeFull.FileLoader( scope.manager );
	        loader.setResponseType( 'arraybuffer' );
	        loader.load( url, arrayBuffer => {

	            onLoad( scope.parse( arrayBuffer ) );

	        }, onProgress, onError );

	    },

	    /**
	     *
	     * @param arrayBuffer
	     * @return {*}
	     */
	    parse ( arrayBuffer ) {

	        this.reader
	            .setEndianess( iteeClient.Endianness.Big )
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

	    },

	    /**
	     *
	     * @param version
	     * @return {boolean}
	     * @private
	     */
	    _isValidVersion ( version ) {

	        const availablesVersionValues = Object.values( DBFVersion );
	        return ( availablesVersionValues.includes( version ) )

	    },

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

	    },

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

	    },

	    /**
	     *
	     * @return {{year: *, month: (*|number), day: (*|number), numberOfRecords, numberOfByteInHeader, numberOfByteInRecord, fields: Array}}
	     * @private
	     */
	    _parseHeaderV2_5 () {

	        const year  = this.reader.getInt8() + DBFLoader.YearOffset;
	        const month = this.reader.getInt8();
	        const day   = this.reader.getInt8();

	        this.reader.setEndianess( iteeClient.Endianness.Little );
	        const numberOfRecords      = this.reader.getInt32();
	        const numberOfByteInHeader = this.reader.getInt16();
	        const numberOfByteInRecord = this.reader.getInt16();
	        this.reader.setEndianess( iteeClient.Endianness.Big );
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

	    },

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
	        this.reader.setEndianess( iteeClient.Endianness.Little );
	        const numberOfRecords      = this.reader.getInt32();
	        const numberOfByteInHeader = this.reader.getInt16();
	        const numberOfByteInRecord = this.reader.getInt16();
	        this.reader.setEndianess( iteeClient.Endianness.Big );
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

	    },

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
	        this.reader.setEndianess( iteeClient.Endianness.Little );
	        const numberOfRecords      = this.reader.getInt32();
	        const numberOfByteInHeader = this.reader.getInt16();
	        const numberOfByteInRecord = this.reader.getInt16();
	        this.reader.setEndianess( iteeClient.Endianness.Big );
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

	    },

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

	    },

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

	    },

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

	    },

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

	    },

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

	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @class Todo...
	 * @classdesc Todo...
	 * @example Todo...
	 *
	 */

	/**
	 *
	 * @param manager
	 * @param logger
	 * @constructor
	 */
	function RZMLLoader ( manager = threeFull.DefaultLoadingManager, logger = iteeClient.DefaultLogger ) {

	    this.manager = manager;
	    this.logger  = logger;

	    this.textureLoader  = new threeFull.TextureLoader();
	    this.imagesShotData = [];

	}

	Object.assign( RZMLLoader.prototype, {

	    /**
	     *
	     */
	    constructor: RZMLLoader,

	    /**
	     *
	     * @param url
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     */
	    load: function ( url, onLoad, onProgress, onError ) {

	        //this.logger.time( "RZMLLoader" )

	        const filePath = url.replace( /[^/]*$/, '' );
	        const loader   = new threeFull.FileLoader( this.manager );
	        loader.setResponseType( 'text/plain' );
	        loader.load( url, text => {

	            onLoad( this._parse( text, filePath ) );

	        }, onProgress, onError );

	    },

	    /**
	     *
	     * @param text
	     * @param filePath
	     * @return {*}
	     * @private
	     */
	    _parse ( text, filePath ) {

	        let document = null;

	        if ( window.DOMParser ) {
	            const parser = new DOMParser();
	            document     = parser.parseFromString( text, 'text/xml' );
	        } else // Internet Explorer
	        {
	            document       = new window.ActiveXObject( 'Microsoft.XMLDOM' );
	            document.async = false;
	            document.loadXML( text );
	        }

	        const shots            = document.getElementsByTagName( 'SHOT' );
	        let shot               = null;
	        let cfrmElement        = null;
	        let translationElement = null;
	        let rotationElement    = null;
	        //        let iplnElement        = null

	        for ( let i = 0, numberOfShots = shots.length ; i < numberOfShots ; ++i ) {
	            shot               = shots[ i ];
	            cfrmElement        = shot.children[ 0 ];
	            //            iplnElement        = shot.children[ 1 ]
	            translationElement = cfrmElement.children[ 0 ];
	            rotationElement    = cfrmElement.children[ 1 ];

	            // Todo: consider using array and/or create directly floating images from there
	            this.imagesShotData.push( {
	                imageName: shot.attributes[ 'n' ].value, //        imagePath: iplnElement.attributes["img"].value,
	                position:  {
	                    x: parseFloat( translationElement.attributes[ 'x' ].value ),
	                    y: parseFloat( translationElement.attributes[ 'y' ].value ),
	                    z: parseFloat( translationElement.attributes[ 'z' ].value )
	                },
	                rotation: {
	                    x: parseFloat( rotationElement.attributes[ 'x' ].value ),
	                    y: parseFloat( rotationElement.attributes[ 'y' ].value ),
	                    z: parseFloat( rotationElement.attributes[ 'z' ].value )
	                }
	            } );
	        }

	        //this.logger.timeEnd( "RZMLLoader" );

	        return this._createImagesPacks( filePath )
	    },

	    /**
	     *
	     * @param filePath
	     * @return {Group}
	     * @private
	     */
	    _createImagesPacks ( filePath ) {

	        var imagesShots = this.imagesShotData;
	        var planesGroup = new threeFull.Group();
	        var imageShot   = undefined;
	        var plane       = undefined;
	        for ( var i = 0, numberOfShots = imagesShots.length ; i < numberOfShots ; ++i ) {

	            imageShot = imagesShots[ i ];

	            plane = new threeFull.Mesh(
	                new threeFull.PlaneGeometry( 0.06528, 0.04896, 1, 1 ),
	                new threeFull.MeshBasicMaterial( {
	                    color: 0xffffff,
	                    side:  threeFull.DoubleSide
	                } ) );

	            plane.name       = imageShot.imageName;
	            plane.position.x = imageShot.position.x - 600200;
	            plane.position.y = imageShot.position.y - 131400;
	            plane.position.z = imageShot.position.z - 60 - 0.34;
	            plane.rotation.x = threeFull.MathUtils.degToRad( imageShot.rotation.x );
	            plane.rotation.y = threeFull.MathUtils.degToRad( imageShot.rotation.z ); // Need to inverse y and z due to z up import !!!
	            plane.rotation.z = -( threeFull.MathUtils.degToRad( imageShot.rotation.y ) );
	            // plane.visible    = false

	            plane.userData = {
	                filePath: filePath
	            };

	            planesGroup.add( plane );

	        }

	        planesGroup.rotateX( -( Math.PI / 2 ) );

	        return planesGroup

	    }

	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * This class allow to split any geometries type during runtime.
	 * Keeping normals and Uvs. It is really usefull to see inside mesh like building.
	 *
	 * Constructor parameter:
	 *
	 * size - the size of the square view
	 *
	 * @class Todo...
	 * @classdesc Todo...
	 * @example Todo...
	 *
	 */

	/**
	 *
	 * @type {Object}
	 */
	const ShapeType = Object.freeze( {
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

	// Helpers
	/**
	 *
	 * @param ring
	 * @return {boolean}
	 */
	function ringClockwise ( ring ) {

	    if ( ( n = ring.length ) < 4 ) {
	        return false
	    }

	    var i    = 0,
	        n,
	        area = ring[ n - 1 ][ 1 ] * ring[ 0 ][ 0 ] - ring[ n - 1 ][ 0 ] * ring[ 0 ][ 1 ];
	    while ( ++i < n ) {
	        area += ring[ i - 1 ][ 1 ] * ring[ i ][ 0 ] - ring[ i - 1 ][ 0 ] * ring[ i ][ 1 ];
	    }
	    return area >= 0
	}

	/**
	 *
	 * @param ring
	 * @param hole
	 * @return {boolean}
	 */
	function ringContainsSome ( ring, hole ) {

	    let i = 0;
	    let n = hole.length;

	    do {

	        if ( ringContains( ring, hole[ i ] ) > 0 ) {
	            return true
	        }

	    } while ( ++i < n )

	    return false

	}

	/**
	 *
	 * @param ring
	 * @param point
	 * @return {number}
	 */
	function ringContains ( ring, point ) {

	    let x        = point[ 0 ];
	    let y        = point[ 1 ];
	    let contains = -1;

	    for ( let i = 0, n = ring.length, j = n - 1 ; i < n ; j = i++ ) {

	        const pi = ring[ i ];
	        const xi = pi[ 0 ];
	        const yi = pi[ 1 ];
	        const pj = ring[ j ];
	        const xj = pj[ 0 ];
	        const yj = pj[ 1 ];

	        if ( segmentContains( pi, pj, point ) ) {
	            contains = 0;
	        } else if ( ( ( yi > y ) !== ( yj > y ) ) && ( ( x < ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi ) ) ) {
	            contains = -contains;
	        }

	    }

	    return contains

	}

	/**
	 *
	 * @param p0
	 * @param p1
	 * @param p2
	 * @return {boolean}
	 */
	function segmentContains ( p0, p1, p2 ) {
	    var x20 = p2[ 0 ] - p0[ 0 ],
	        y20 = p2[ 1 ] - p0[ 1 ];
	    if ( x20 === 0 && y20 === 0 ) {
	        return true
	    }
	    var x10 = p1[ 0 ] - p0[ 0 ],
	        y10 = p1[ 1 ] - p0[ 1 ];
	    if ( x10 === 0 && y10 === 0 ) {
	        return false
	    }
	    var t = ( x20 * x10 + y20 * y10 ) / ( x10 * x10 + y10 * y10 );
	    return t < 0 || t > 1 ? false : t === 0 || t === 1 ? true : t * x10 === x20 && t * y10 === y20
	}

	/**
	 *
	 * @param manager
	 * @param logger
	 * @constructor
	 */
	function SHPLoader ( manager = threeFull.DefaultLoadingManager, logger = iteeClient.DefaultLogger ) {

	    this.manager = manager;
	    this.logger  = logger;

	    this.globalOffset = new threeFull.Vector3();
	    this.worldAxis    = {
	        from: 'zUp',
	        to:   'zForward'
	    };

	    this._reader = new iteeClient.TBinaryReader();

	}

	Object.assign( SHPLoader, {

	    /**
	     *
	     */
	    FileCode: 9994,

	    /**
	     *
	     */
	    MinFileLength: 100,

	    /**
	     *
	     */
	    MinVersion: 1000

	} );

	Object.assign( SHPLoader.prototype, {

	    /**
	     *
	     * @param url
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     */
	    load ( url, onLoad, onProgress, onError ) {

	        const scope = this;

	        const loader = new threeFull.FileLoader( scope.manager );
	        loader.setResponseType( 'arraybuffer' );
	        loader.load( url, arrayBuffer => {

	            onLoad( scope.parse( arrayBuffer ) );

	        }, onProgress, onError );

	    },

	    /**
	     *
	     * @param arrayBuffer
	     * @return {*}
	     */
	    parse ( arrayBuffer ) {

	        this._reader
	            .setEndianess( iteeClient.Endianness.Big )
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

	    },

	    /**
	     *
	     * @return {{fileCode, fileLength, version, shapeType, boundingBox: {xMin, xMax, yMin, yMax, zMin, zMax, mMin, mMax}}}
	     * @private
	     */
	    _parseHeader () {

	        const fileCode = this._reader.getInt32();
	        this._reader.skipOffsetOf( 20 );
	        const fileLength = this._reader.getInt32();

	        this._reader.setEndianess( iteeClient.Endianness.Little );

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

	    },

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
	            this._reader.setEndianess( iteeClient.Endianness.Little );

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

	    },

	    /**
	     *
	     * @return {{recordNumber, contentLength}}
	     * @private
	     */
	    _parseRecordHeader () {

	        this._reader.setEndianess( iteeClient.Endianness.Big );

	        const recordNumber  = this._reader.getInt32();
	        const contentLength = this._reader.getInt32();

	        return {
	            recordNumber,
	            contentLength
	        }

	    },

	    //    _parseNull () {
	    //
	    //        this._reader.getInt32();
	    //
	    //        return null;
	    //    },

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

	    },

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

	    },

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

	    },

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

	    },

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

	    },

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

	            shapes.push( new threeFull.Shape( points ) );

	        }

	        return shapes

	    }

	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @class UniversalLoader
	 * @classdesc The TUniversalLoader allow to automatically select correct THREE loader for given files. (based on https://github.com/jeromeetienne/threex.universalloader)
	 * @example Todo...
	 *
	 */

	// Helpers
	/**
	 *
	 * @param fileUrl
	 * @return {string|*}
	 */
	function getFilePath ( fileUrl ) {

	    return fileUrl.substring( 0, fileUrl.lastIndexOf( '/' ) )

	}

	/**
	 *
	 * @param fileUrl
	 * @return {string|*}
	 */
	function getFileName ( fileUrl ) {

	    return fileUrl.substring( fileUrl.lastIndexOf( '/' ) + 1 )

	}

	/**
	 *
	 * @param fileName
	 */
	function getFileExtension ( fileName ) {

	    return fileName.slice( ( fileName.lastIndexOf( '.' ) - 1 >>> 0 ) + 2 )

	}

	/**
	 *
	 * @param fileUrl
	 * @return {string|*}
	 */
	function computeUrl ( fileUrl ) {

	    const filePath = getFilePath( fileUrl );
	    const isBlob   = ( fileUrl.indexOf( 'blob' ) > -1 );

	    return ( isBlob ) ? filePath : fileUrl

	}

	/**
	 *
	 * @param manager
	 * @param logger
	 * @constructor
	 */
	function UniversalLoader ( manager = threeFull.DefaultLoadingManager, logger = iteeClient.DefaultLogger ) {

	    this.manager = manager;
	    this.logger  = logger;

	}

	Object.assign( UniversalLoader.prototype, {

	    /**
	     *
	     * @param files
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     */
	    load ( files, onLoad, onProgress, onError ) {

	        if ( !files ) {
	            this.logger.error( 'Unable to load null or undefined files !' );
	            return
	        }

	        if ( files instanceof FileList ) {

	            const numberOfFiles = files.length;
	            this.logger.log( `numberOfFiles: ${ numberOfFiles }` );

	            const filesUrls = [];
	            let fileUrl     = '';
	            let fileObject  = null;

	            for ( let fileIndex = 0 ; fileIndex < numberOfFiles ; ++fileIndex ) {
	                fileObject = files[ fileIndex ];
	                fileUrl    = `${ URL.createObjectURL( fileObject ) }/${ fileObject.name }`;

	                filesUrls.push( { url: fileUrl } );
	            }

	            this.load( filesUrls, onLoad, onProgress, onError );

	        } else if ( files instanceof File ) {

	            const fileUrl = `${ URL.createObjectURL( files ) }/${ files.name }`;
	            this.loadSingleFile( { url: fileUrl }, onLoad, onProgress, onError );

	        } else if ( iteeValidators.isObject( files ) ) {

	            this.loadSingleFile( files, onLoad, onProgress, onError );

	        } else if ( iteeValidators.isFunction( files ) ) {

	            this.load( files(), onLoad, onProgress, onError );

	        } else if ( iteeValidators.isArray( files ) ) {

	            // Todo: need to rework logic here and use wrapper object instead of array of object to avoid
	            // Todo: array of 2 differents files.
	            if ( ( files.length === 2 ) && ( iteeValidators.isObject( files[ 0 ] ) && iteeValidators.isObject( files[ 1 ] ) ) ) {

	                this.loadAssociatedFiles( files, onLoad, onProgress, onError );

	            } else {

	                for ( let fileIndex = 0, numberOfFiles = files.length ; fileIndex < numberOfFiles ; fileIndex++ ) {
	                    this.load( files[ fileIndex ], onLoad, onProgress, onError );
	                }

	            }

	        } else if ( iteeValidators.isString( files ) ) {

	            this.loadSingleFile( { url: files }, onLoad, onProgress, onError );

	        } else {

	            this.logger.error( 'TUniversalLoader: Invalid files parameter !!!' );

	        }

	    },

	    /**
	     *
	     * @param file
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     */
	    loadSingleFile ( file, onLoad, onProgress, onError ) {

	        const fileUrl       = file.url;
	        const fileName      = getFileName( fileUrl );
	        const fileExtension = getFileExtension( fileName );
	        file.url            = computeUrl( fileUrl );

	        switch ( fileExtension ) {

	            case iteeClient.FileFormat.Asc.value:
	                this._loadAsc( file, onLoad, onProgress, onError );
	                break

	            case iteeClient.FileFormat.Dae.value:
	                this._loadDae( file, onLoad, onProgress, onError );
	                break

	            case iteeClient.FileFormat.Dbf.value:
	                this._loadDbf( file, onLoad, onProgress, onError );
	                break

	            case iteeClient.FileFormat.Fbx.value:
	                this._loadFbx( file, onLoad, onProgress, onError );
	                break

	            case iteeClient.FileFormat.Json.value:
	                this._loadJson( file, onLoad, onProgress, onError );
	                break

	            case iteeClient.FileFormat.Obj.value:
	                this._loadObj( file, onLoad, onProgress, onError );
	                break

	            case iteeClient.FileFormat.Shp.value:
	                this._loadShp( file, onLoad, onProgress, onError );
	                break

	            case iteeClient.FileFormat.Stl.value:
	                this._loadStl( file, onLoad, onProgress, onError );
	                break

	            default:
	                throw new RangeError( `Invalid file extension: ${ fileExtension }. Supported formats are: ${ iteeClient.FileFormat.toString() }` )

	        }

	    },

	    /**
	     *
	     * @param files
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     */
	    loadAssociatedFiles ( files, onLoad, onProgress, onError ) {

	        const firstFile          = files[ 0 ];
	        const firstUrl           = firstFile.url;
	        const firstFileName      = getFileName( firstUrl );
	        const firstFileExtension = getFileExtension( firstFileName );
	        firstFile.url            = computeUrl( firstUrl );

	        const secondFile          = files[ 1 ];
	        const secondUrl           = secondFile.url;
	        const secondFileName      = getFileName( secondUrl );
	        const secondFileExtension = getFileExtension( secondFileName );
	        secondFile.url            = computeUrl( secondUrl );

	        if ( firstFileExtension === iteeClient.FileFormat.Mtl.value && secondFileExtension === iteeClient.FileFormat.Obj.value ) {

	            this._loadObjMtlCouple( secondFile, firstFile, onLoad, onProgress, onError );

	        } else if ( firstFileExtension === iteeClient.FileFormat.Obj.value && secondFileExtension === iteeClient.FileFormat.Mtl.value ) {

	            this._loadObjMtlCouple( firstFile, secondFile, onLoad, onProgress, onError );

	        } else if ( firstFileExtension === iteeClient.FileFormat.Shp.value && secondFileExtension === iteeClient.FileFormat.Dbf.value ) {

	            this._loadShpDbfCouple( firstFile, secondFile, onLoad, onProgress, onError );

	        } else if ( firstFileExtension === iteeClient.FileFormat.Dbf.value && secondFileExtension === iteeClient.FileFormat.Shp.value ) {

	            this._loadShpDbfCouple( secondFile, firstFile, onLoad, onProgress, onError );

	        } else {

	            this.loadSingleFile( files[ 0 ], onLoad, onProgress, onError );
	            this.loadSingleFile( files[ 1 ], onLoad, onProgress, onError );

	        }

	    },

	    /**
	     *
	     * @param file
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @private
	     */
	    _loadAsc ( file, onLoad, onProgress, onError ) {

	        const loader = new ASCLoader( this.manager );
	        loader.load(
	            file.url,
	            onLoad,
	            onProgress,
	            onError
	        );

	    },

	    /**
	     *
	     * @param file
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @private
	     */
	    _loadDae ( file, onLoad, onProgress, onError ) {

	        const loader = new threeFull.ColladaLoader( this.manager );
	        loader.load(
	            file.url,
	            data => {

	                onLoad( data.scene );

	            },
	            onProgress,
	            onError
	        );

	    },

	    /**
	     *
	     * @param file
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @private
	     */
	    _loadDbf ( file, onLoad, onProgress, onError ) {

	        const loader = new DBFLoader( this.manager );
	        loader.load(
	            file.url,
	            onLoad,
	            onProgress,
	            onError
	        );

	    },

	    /**
	     *
	     * @param file
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @private
	     */
	    _loadFbx ( file, onLoad, onProgress, onError ) {

	        const loader = new threeFull.FBXLoader( this.manager );
	        loader.load(
	            file.url,
	            object => {

	                const position = file.position;
	                if ( position ) {
	                    object.position.set( position.x, position.y, position.z );
	                }

	                onLoad( object );

	            },
	            onProgress,
	            onError
	        );

	    },

	    /**
	     *
	     * @param file
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @private
	     */
	    _loadJson ( file, onLoad, onProgress, onError ) {

	        const loader = new threeFull.ObjectLoader( this.manager );
	        loader.load(
	            file.url,
	            onLoad,
	            onProgress,
	            onError
	        );

	    },

	    /**
	     *
	     * @param file
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @private
	     */
	    _loadObj ( file, onLoad, onProgress, onError ) {

	        const loader = new threeFull.OBJLoader( this.manager );
	        loader.load(
	            file.url,
	            onLoad,
	            onProgress,
	            onError
	        );

	    },

	    /**
	     *
	     * @param file
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @private
	     */
	    _loadShp ( file, onLoad, onProgress, onError ) {

	        const loader = new SHPLoader( this.manager );
	        loader.load(
	            file.url,
	            shapes => {

	                const group = new threeFull.Group();

	                for ( let shapeIndex = 0, numberOfShapes = shapes.length ; shapeIndex < numberOfShapes ; shapeIndex++ ) {

	                    group.add(
	                        new threeFull.Mesh(
	                            new threeFull.ShapeBufferGeometry( shapes[ shapeIndex ] ),
	                            new threeFull.MeshPhongMaterial( {
	                                color: Math.random() * 0xffffff,
	                                side:  threeFull.DoubleSide
	                            } )
	                        )
	                    );

	                }

	                // Todo: make proper import system from different referentiels
	                group.rotateX( iteeUtils.degreesToRadians( -90 ) );

	                onLoad( group );

	            },
	            onProgress,
	            onError
	        );

	    },

	    /**
	     *
	     * @param file
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @private
	     */
	    _loadStl ( file, onLoad, onProgress, onError ) {

	        const loader = new threeFull.STLLoader( this.manager );
	        loader.load(
	            file.url,
	            geometry => {

	                const material = new threeFull.MeshPhongMaterial();
	                const object   = new threeFull.Mesh( geometry, material );

	                const position = file.position;
	                if ( position ) {
	                    object.position.set( position.x, position.y, position.z );
	                }

	                onLoad( object );

	            },
	            onProgress,
	            onError
	        );

	    },

	    /**
	     *
	     * @param objFile
	     * @param mtlFile
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @private
	     */
	    _loadObjMtlCouple ( objFile, mtlFile, onLoad, onProgress, onError ) {

	        const mtlLoader = new threeFull.MTLLoader( this.manager );
	        const objLoader = new threeFull.OBJLoader( this.manager );

	        const texturePath = mtlFile.texturePath;
	        if ( texturePath ) {
	            mtlLoader.setTexturePath( texturePath );
	        }

	        mtlLoader.load(
	            mtlFile.url,
	            materials => {

	                materials.preload();

	                for ( let materialIndex = 0, numberOfMaterials = materials.materials.length ; materialIndex < numberOfMaterials ; materialIndex++ ) {
	                    const material                       = materials.materials[ materialIndex ];
	                    material.opacity                     = 1.0;
	                    materials.materials[ materialIndex ] = material;
	                }

	                objLoader.setMaterials( materials );
	                objLoader.load(
	                    objFile.url,
	                    onLoad,
	                    onProgress,
	                    onError
	                );

	            },
	            onProgress,
	            onError
	        );

	    },

	    /**
	     *
	     * @param shpFile
	     * @param dbfFile
	     * @param onLoad
	     * @param onProgress
	     * @param onError
	     * @private
	     */
	    _loadShpDbfCouple ( shpFile, dbfFile, onLoad, onProgress, onError ) {

	        let _shapes = undefined;
	        let _dbf    = undefined;

	        const shpLoader = new SHPLoader( this.manager );
	        shpLoader.load(
	            shpFile.url,
	            shapes => {

	                _shapes = shapes;
	                checkEnd();

	            },
	            onProgress,
	            onError
	        );

	        const dbfLoader = new DBFLoader( this.manager );
	        dbfLoader.load(
	            dbfFile.url,
	            dbf => {

	                _dbf = dbf;
	                checkEnd();

	            },
	            onProgress,
	            onError
	        );

	        function checkEnd () {

	            if ( !_shapes || !_dbf ) {
	                return
	            }

	            const group = new threeFull.Group();
	            group.name  = 'Locaux';

	            let mesh = undefined;
	            for ( let shapeIndex = 0, numberOfShapes = _shapes.length ; shapeIndex < numberOfShapes ; shapeIndex++ ) {

	                mesh = new threeFull.Mesh(
	                    new threeFull.ShapeBufferGeometry( _shapes[ shapeIndex ] ),
	                    new threeFull.MeshPhongMaterial( {
	                        color: 0xb0f2b6,
	                        //                        color: Math.random() * 0xffffff,
	                        side:  threeFull.DoubleSide
	                    } )
	                );

	                const shapeName         = _dbf.datas[ shapeIndex ][ 'CODE' ];
	                mesh.name               = shapeName;
	                mesh.userData[ 'Code' ] = shapeName;

	                group.add( mesh );

	            }

	            onLoad( group );

	        }

	    }

	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @file Todo
	 *
	 * @example Todo
	 *
	 */

	const FRONT = new threeFull.Vector3( 0, 0, -1 );
	const BACK  = new threeFull.Vector3( 0, 0, 1 );
	const UP    = new threeFull.Vector3( 0, 1, 0 );
	const DOWN  = new threeFull.Vector3( 0, -1, 0 );
	const RIGHT = new threeFull.Vector3( 1, 0, 0 );
	const LEFT  = new threeFull.Vector3( -1, 0, 0 );

	const State = iteeUtils.toEnum( {
	    None:     0,
	    Rotating: 1,
	    Panning:  2,
	    Rolling:  3,
	    Zooming:  4,
	    Moving:   5
	} );

	const CameraControlMode = iteeUtils.toEnum( {
	    FirstPerson: 1,
	    Orbit:       2,
	    Fly:         3,
	    Path:        4
	} );

	class CameraControls extends threeFull.EventDispatcher {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                logger:     iteeClient.DefaultLogger,
	                camera:     null,
	                target:     new threeFull.Object3D(),
	                mode:       CameraControlMode.Orbit,
	                domElement: window
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
	            front:  [ iteeClient.Keys.Z.value, iteeClient.Keys.UP_ARROW.value ],
	            back:   [ iteeClient.Keys.S.value, iteeClient.Keys.DOWN_ARROW.value ],
	            up:     [ iteeClient.Keys.A.value, iteeClient.Keys.PAGE_UP.value ],
	            down:   [ iteeClient.Keys.E.value, iteeClient.Keys.PAGE_DOWN.value ],
	            left:   [ iteeClient.Keys.Q.value, iteeClient.Keys.LEFT_ARROW.value ],
	            right:  [ iteeClient.Keys.D.value, iteeClient.Keys.RIGHT_ARROW.value ],
	            rotate: [ iteeClient.Mouse.LEFT.value ],
	            pan:    [ iteeClient.Mouse.MIDDLE.value ],
	            roll:   {
	                left:  [ iteeClient.Keys.R.value ],
	                right: [ iteeClient.Keys.T.value ]
	            },
	            zoom:             [ iteeClient.Mouse.WHEEL.value ],
	            lookAtFront:      [ iteeClient.Keys.NUMPAD_2.value ],
	            lookAtFrontLeft:  [ iteeClient.Keys.NUMPAD_3.value ],
	            lookAtFrontRight: [ iteeClient.Keys.NUMPAD_1.value ],
	            lookAtBack:       [ iteeClient.Keys.NUMPAD_8.value ],
	            lookAtBackLeft:   [ iteeClient.Keys.NUMPAD_9.value ],
	            lookAtBackRight:  [ iteeClient.Keys.NUMPAD_7.value ],
	            lookAtUp:         [ iteeClient.Keys.NUMPAD_5.value ],
	            lookAtDown:       [ iteeClient.Keys.NUMPAD_0.value ],
	            lookAtLeft:       [ iteeClient.Keys.NUMPAD_6.value ],
	            lookAtRight:      [ iteeClient.Keys.NUMPAD_4.value ]
	        };

	        // The current internal state of controller
	        this._state = State.None;

	    }

	    get camera () {

	        return this._camera

	    }

	    set camera ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
	        if ( !( value instanceof threeFull.Camera ) ) { throw new Error( `Camera cannot be an instance of ${ value.constructor.name }. Expect an instance of Camera.` ) }

	        this._camera = value;

	    }

	    get target () {

	        return this._target

	    }

	    set target ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Target cannot be null ! Expect an instance of Object3D.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Target cannot be undefined ! Expect an instance of Object3D.' ) }
	        if ( !( value instanceof threeFull.Object3D ) ) { throw new Error( `Target cannot be an instance of ${ value.constructor.name }. Expect an instance of Object3D.` ) }

	        this._target = value;

	    }

	    get mode () {
	        return this._mode
	    }

	    set mode ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Mode cannot be null ! Expect a value from CameraControlMode enum.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Mode cannot be undefined ! Expect a value from CameraControlMode enum.' ) }
	        //        if ( !( value instanceof CameraControlMode ) ) { throw new Error( `Mode cannot be an instance of ${value.constructor.name}. Expect a value from TCameraControlMode enum.` ) }

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

	        if ( iteeValidators.isNotBoolean( value ) ) { throw new Error( `Track path cannot be an instance of ${ value.constructor.name }. Expect a boolean.` ) }

	        this._trackPath = value;

	        if ( this._trackPath ) {
	            this._initPathDisplacement();
	        }

	    }

	    get domElement () {

	        return this._domElement

	    }

	    set domElement ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'DomElement cannot be null ! Expect an instance of HTMLDocument.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'DomElement cannot be undefined ! Expect an instance of HTMLDocument.' ) }
	        if ( !( ( value instanceof Window ) || ( value instanceof HTMLDocument ) || ( value instanceof HTMLDivElement ) || ( value instanceof HTMLCanvasElement ) ) ) { throw new Error( `DomElement cannot be an instance of ${ value.constructor.name }. Expect an instance of Window, HTMLDocument or HTMLDivElement.` ) }

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

	    setCamera ( value ) {

	        this.camera = value;
	        return this

	    }

	    setTarget ( value ) {

	        this.target = value;
	        return this

	    }

	    setMode ( value ) {

	        this.mode = value;
	        return this

	    }

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

	    setTargetPosition ( newTargetPosition ) {

	        this._target.position.copy( newTargetPosition );
	        this._camera.lookAt( this._target.position );

	        return this

	    }

	    // Handlers
	    _consumeEvent ( event ) {

	        if ( !event.cancelable ) {
	            return
	        }

	        event.stopImmediatePropagation();

	    }

	    // Keys
	    _onKeyDown ( keyEvent ) {

	        if ( !this.enabled ) { return }
	        keyEvent.preventDefault();

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

	            this._lookAt( new threeFull.Vector3( -1, 0, -1 ).normalize() );
	            this._consumeEvent( keyEvent );

	        } else if ( actionMap.lookAtFrontRight.includes( key ) ) {

	            this._lookAt( new threeFull.Vector3( 1, 0, -1 ).normalize() );
	            this._consumeEvent( keyEvent );

	        } else if ( actionMap.lookAtBack.includes( key ) ) {

	            this._lookAt( BACK );
	            this._consumeEvent( keyEvent );

	        } else if ( actionMap.lookAtBackLeft.includes( key ) ) {

	            this._lookAt( new threeFull.Vector3( -1, 0, 1 ).normalize() );
	            this._consumeEvent( keyEvent );

	        } else if ( actionMap.lookAtBackRight.includes( key ) ) {

	            this._lookAt( new threeFull.Vector3( 1, 0, 1 ).normalize() );
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

	        }

	    }

	    _onKeyUp ( keyEvent ) {

	        if ( !this.enabled ) { return }
	        keyEvent.preventDefault();

	    }

	    // Touches
	    _onTouchStart ( touchEvent ) {

	        if ( !this.enabled ) { return }
	        touchEvent.preventDefault();

	        this.previousTouches = touchEvent.touches;

	    }

	    _onTouchEnd ( touchEvent ) {

	        if ( !this.enabled ) { return }
	        touchEvent.preventDefault();

	        this.previousTouches = [];
	        this._state          = State.None;

	    }

	    _onTouchCancel ( touchEvent ) {

	        if ( !this.enabled ) { return }
	        touchEvent.preventDefault();

	        this.previousTouches = [];
	        this._state          = State.None;

	    }

	    _onTouchLeave ( touchEvent ) {

	        if ( !this.enabled ) { return }
	        touchEvent.preventDefault();

	        this.previousTouches = [];
	        this._state          = State.None;

	    }

	    _onTouchMove ( touchEvent ) {

	        if ( !this.enabled ) { return }
	        touchEvent.preventDefault();

	        const previousTouches         = this.previousTouches;
	        const currentTouches          = touchEvent.changedTouches;
	        const numberOfPreviousTouches = previousTouches.length;
	        const numberOfCurrentTouches  = currentTouches.length;

	        if ( numberOfPreviousTouches === 2 && numberOfCurrentTouches === 2 ) {

	            const previousTouchA    = new threeFull.Vector2( previousTouches[ 0 ].clientX, previousTouches[ 0 ].clientY );
	            const previousTouchB    = new threeFull.Vector2( previousTouches[ 1 ].clientX, previousTouches[ 1 ].clientY );
	            const previousGap       = previousTouchA.distanceTo( previousTouchB );
	            const previousCenter    = new threeFull.Vector2().addVectors( previousTouchA, previousTouchB ).divideScalar( 2 );
	            const previousDirection = new threeFull.Vector2().subVectors( previousTouchA, previousTouchB ).normalize();

	            const currentTouchA    = new threeFull.Vector2( currentTouches[ 0 ].clientX, currentTouches[ 0 ].clientY );
	            const currentTouchB    = new threeFull.Vector2( currentTouches[ 1 ].clientX, currentTouches[ 1 ].clientY );
	            const currentGap       = currentTouchA.distanceTo( currentTouchB );
	            const currentCenter    = new threeFull.Vector2().addVectors( currentTouchA, currentTouchB ).divideScalar( 2 );
	            const currentDirection = new threeFull.Vector2().subVectors( previousTouchA, previousTouchB ).normalize();

	            const deltaPan  = new threeFull.Vector2().subVectors( currentCenter, previousCenter );
	            const deltaZoom = currentGap - previousGap;
	            const deltaRoll = currentDirection.dot( previousDirection );

	            this._pan( deltaPan );
	            this._zoom( deltaZoom );
	            this._roll( deltaRoll );
	            this._consumeEvent( touchEvent );

	        } else if ( numberOfPreviousTouches === 1 && numberOfCurrentTouches === 1 ) {

	            const deltaRotate = new threeFull.Vector2(
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
	        mouseEvent.preventDefault();

	        this.impose();
	        if ( mouseEvent.target.constructor !== HTMLDocument ) {
	            this._domElement.focus();
	        }

	    }

	    _onMouseLeave ( mouseEvent ) {

	        if ( !this.enabled ) { return }
	        mouseEvent.preventDefault();

	        if ( mouseEvent.target.constructor !== HTMLDocument ) {
	            this._domElement.blur();
	        }
	        this.dispose();
	        this._state = State.None;

	    }

	    _onMouseDown ( mouseEvent ) {

	        if ( !this.enabled ) { return }
	        mouseEvent.preventDefault();

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
	        mouseEvent.preventDefault();

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
	        mouseEvent.preventDefault();

	        const delta = mouseEvent.wheelDelta || mouseEvent.deltaY;
	        this._zoom( delta );
	        this._consumeEvent( mouseEvent );

	    }

	    _onMouseUp ( mouseEvent ) {

	        if ( !this.enabled ) { return }
	        mouseEvent.preventDefault();

	        this._state = State.None;
	        this._consumeEvent( mouseEvent );

	    }

	    _onDblClick ( mouseEvent ) {

	        if ( !this.enabled ) { return }
	        mouseEvent.preventDefault();

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

	            console.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

	        }

	        this.dispatchEvent( { type: 'move' } );
	        this.dispatchEvent( { type: 'change' } );

	    }

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

	            console.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

	        }

	        this.dispatchEvent( { type: 'move' } );
	        this.dispatchEvent( { type: 'change' } );

	    }

	    _up () {

	        if ( !this.canMove || !this.canUp ) { return }

	        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

	            const displacement = UP.clone()
	                                   .applyQuaternion( this._camera.quaternion )
	                                   .multiplyScalar( this.upSpeed );

	            this._camera.position.add( displacement );
	            this._target.position.add( displacement );

	        } else {

	            console.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

	        }

	        this.dispatchEvent( { type: 'move' } );
	        this.dispatchEvent( { type: 'change' } );

	    }

	    _down () {

	        if ( !this.canMove || !this.canDown ) { return }

	        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

	            const displacement = DOWN.clone()
	                                     .applyQuaternion( this._camera.quaternion )
	                                     .multiplyScalar( this.downSpeed );

	            this._camera.position.add( displacement );
	            this._target.position.add( displacement );

	        } else {

	            console.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

	        }

	        this.dispatchEvent( { type: 'move' } );
	        this.dispatchEvent( { type: 'change' } );

	    }

	    _left () {

	        if ( !this.canMove || !this.canLeft ) { return }

	        if ( this._camera.isPerspectiveCamera || this._camera.isOrthographicCamera ) {

	            const displacement = LEFT.clone()
	                                     .applyQuaternion( this._camera.quaternion )
	                                     .multiplyScalar( this.leftSpeed );

	            this._camera.position.add( displacement );
	            this._target.position.add( displacement );

	        } else {

	            console.error( `Unmanaged displacement for camera of type ${ this._camera.type }` );

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
	            const targetToCamera = new threeFull.Vector3().subVectors( cameraPosition, targetPosition ).normalize();
	            const rotateSpeed    = this.rotateSpeed;

	            switch ( this._mode ) {

	                case CameraControlMode.FirstPerson: {

	                    //        const normalizedX = (delta.x / this._domElement.clientWidth) - 1.0
	                    //        const normalizedY = (delta.y / this._domElement.clientHeight) - 1.0
	                    const normalizedX = delta.x;
	                    const normalizedY = delta.y;

	                    const newTargetPosition = new threeFull.Vector3( -normalizedX, normalizedY, 0 )
	                        .applyQuaternion( this._camera.quaternion )
	                        .multiplyScalar( rotateSpeed )
	                        .add( targetPosition );

	                    // Protect against owl head
	                    const cameraToTargetDirection = new threeFull.Vector3().subVectors( newTargetPosition, cameraPosition ).normalize();
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
	                    const spherical = new threeFull.Spherical().setFromVector3( targetToCamera );

	                    const newTheta  = spherical.theta + ( iteeUtils.degreesToRadians( -delta.x ) * rotateSpeed );
	                    const newPhi    = spherical.phi + ( iteeUtils.degreesToRadians( -delta.y ) * rotateSpeed );
	                    spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, newTheta ) );
	                    spherical.phi   = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, newPhi ) );

	                    const newPosition = new threeFull.Vector3().setFromSpherical( spherical )
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
	            const displacement   = new threeFull.Vector3( -delta.x, delta.y, 0 ).applyQuaternion( this._camera.quaternion )
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
	            const targetToCamera = new threeFull.Vector3().subVectors( cameraPosition, targetPosition ).normalize();
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
	                    const currentCameraToNextCameraDirection = new threeFull.Vector3().subVectors( cameraNextPosition, cameraPosition ).normalize();
	                    const targetToCurrentCameraDirection     = new threeFull.Vector3().subVectors( cameraPosition, targetPosition ).normalize();
	                    const targetToNextCameraDirection        = new threeFull.Vector3().subVectors( cameraNextPosition, targetPosition ).normalize();
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

	            const cameraPosition                 = this._camera.position;
	            const targetPosition                 = this._target.position;
	            const distanceBetweenCameraAndTarget = cameraPosition.distanceTo( targetPosition );
	            const deltaZoom                      = ( delta * this.zoomSpeed * distanceBetweenCameraAndTarget );

	            if ( this._camera.zoom + deltaZoom <= 0.0 ) {
	                this._camera.zoom = 0.01;
	            } else {
	                this._camera.zoom += deltaZoom;
	            }

	            this._camera.updateProjectionMatrix();

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

	        if ( iteeValidators.isEmptyArray( this._paths ) ) {
	            this.logger.warn( 'Try to init path displacement without any paths' );
	            return
	        }

	        if ( iteeValidators.isNotDefined( this._currentPath ) ) {

	            this._currentPathIndex  = 0;
	            this._currentPathOffset = 0;
	            this._currentPath       = this._paths[ 0 ];

	        }

	        this._currentPathPosition = this._currentPath.getPointAt( this._currentPathOffset );

	        switch ( this._mode ) {

	            case CameraControlMode.FirstPerson: {

	                if ( this._lockedTarget ) {

	                    const displacement = new threeFull.Vector3().subVectors( this._currentPathPosition, this.camera.position );
	                    this._camera.position.add( displacement );
	                    this._target.position.add( displacement );

	                } else {

	                    this.setCameraPosition( this._currentPathPosition );

	                }
	            }
	                break

	            case CameraControlMode.Orbit: {

	                if ( this._lockedTarget ) {

	                    const displacement = new threeFull.Vector3().subVectors( this._currentPathPosition, this.target.position );
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
	        const positiveDisplacement = new threeFull.Vector3().subVectors( positivePathPosition, currentPathPosition );
	        const positiveDirection    = positiveDisplacement.clone().normalize();
	        const positiveDot          = cameraDirection.dot( positiveDirection );

	        const nextNegativeOffset   = this._currentPathOffset - this._cameraJump;
	        const negativeOffset       = ( nextNegativeOffset > 0 ) ? nextNegativeOffset : 0;
	        const negativePathPosition = this._currentPath.getPointAt( negativeOffset );
	        const negativeDisplacement = new threeFull.Vector3().subVectors( negativePathPosition, currentPathPosition );
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
	                displacement = new threeFull.Vector3();

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
	                displacement = new threeFull.Vector3();

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
	            displacement = new threeFull.Vector3();

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
	                startDisplacement = new threeFull.Vector3().subVectors( path.getPointAt( jump ), start );
	            }

	            const end           = path.getPointAt( 1 );
	            const distanceToEnd = currentPathPosition.distanceToSquared( end );
	            let endDisplacement = undefined;
	            if ( distanceToEnd < maxDistance ) {
	                endDisplacement = new threeFull.Vector3().subVectors( path.getPointAt( 1 - jump ), end );
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
	 *
	 * @file Todo
	 *
	 * @example Todo
	 *
	 */

	const PI_2    = Math.PI / 2;
	const STATE   = {
	    NONE:   -1,
	    ROTATE: 0,
	    ZOOM:   1,
	    PAN:    2
	};
	const xVector = new threeFull.Vector3( 1, 0, 0 );
	const yVector = new threeFull.Vector3( 0, 1, 0 );

	/**
	 *
	 * @param camera
	 * @param domElement
	 * @constructor
	 */
	function CameraPathController ( parameters = {} ) {

	    const _parameters = {
	        ...{
	            camera:     null,
	            target:     new threeFull.Object3D(),
	            mode:       CameraControlMode.Orbit,
	            domElement: document
	        }, ...parameters
	    };

	    const self = this;

	    let currentState = STATE.NONE;

	    this.camera     = _parameters.camera;
	    this.cameraJump = 0.0;

	    this.paths               = [];
	    this.pathsMap            = new Map();
	    this.currentPath         = undefined;
	    this.currentPathIndex    = -1;
	    this.currentPathPosition = 0;

	    this.domElement      = _parameters.domElement;
	    this.forwardControl  = this.domElement.children[ 0 ].children[ 0 ].children[ 0 ];
	    this.backwardControl = this.domElement.children[ 0 ].children[ 1 ].children[ 0 ];
	    this.timeoutId       = undefined;

	    // Set to false to disable controls
	    this.enabled = false;

	    // Set to false to disable zooming
	    this.enableZoom = true;
	    this.zoomSpeed  = 1.0;

	    // Set to false to disable rotating
	    this.enableRotate = true;
	    this.rotateSpeed  = 0.0025;

	    // Set to false to disable panning
	    this.enablePan   = true;
	    this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	    this.verticalOffset = 1.5;

	    this.keysCodes = {
	        forwardKeys:  [ iteeClient.Keys.Z, iteeClient.Keys.UP_ARROW ],
	        backwardKeys: [ iteeClient.Keys.S, iteeClient.Keys.BOTTOM_ARROW ]
	    };

	    // Mouse
	    let mouseQuat = {
	        x: new threeFull.Quaternion(),
	        y: new threeFull.Quaternion()
	    };

	    this.mouseButtons = {
	        ORBIT: threeFull.MOUSE.LEFT,
	        ZOOM:  threeFull.MOUSE.MIDDLE,
	        PAN:   threeFull.MOUSE.RIGHT
	    };

	    this.orientation = {
	        x: 0,
	        y: 0
	    };

	    // Private methods
	    function moveForward () {

	        self.currentPathPosition += self.cameraJump;
	        if ( self.currentPathPosition > 1 ) {

	            iteeClient.DefaultLogger.log( 'reachEnd' );
	            var indexOfNextPath           = self.pathsMap.get( self.currentPathIndex ).indexOfNextPath;
	            var indexOfNextPathOfNextPath = self.pathsMap.get( indexOfNextPath ).indexOfNextPath;

	            // If next path of the next path is the current path that means flows are in the same direction
	            // so we need to inverse the current path position to 1 to start at the right position
	            if ( indexOfNextPathOfNextPath === self.currentPathIndex ) {
	                self.currentPathPosition = 1;
	            } else {
	                self.currentPathPosition = 0;
	            }

	            self.currentPathIndex = indexOfNextPath;
	            self.currentPath      = self.paths[ indexOfNextPath ];

	        }

	        self.update();
	        self.dispatchEvent( { type: 'move' } );

	    }

	    function moveBackward () {

	        self.currentPathPosition -= self.cameraJump;
	        if ( self.currentPathPosition < 0 ) {

	            iteeClient.DefaultLogger.log( 'reachStart' );
	            var indexOfPreviousPath               = self.pathsMap.get( self.currentPathIndex ).indexOfPreviousPath;
	            var indexOfPreviousPathOfPreviousPath = self.pathsMap.get( indexOfPreviousPath ).indexOfPreviousPath;

	            // If previous path of the previous path is the current path that means flows have the same origin
	            // so we need to inverse the current path position to 0 to start at the right position
	            if ( indexOfPreviousPathOfPreviousPath === self.currentPathIndex ) {
	                self.currentPathPosition = 0;
	            } else {
	                self.currentPathPosition = 1;
	            }

	            self.currentPathIndex = indexOfPreviousPath;
	            self.currentPath      = self.paths[ indexOfPreviousPath ];

	        }

	        self.update();
	        self.dispatchEvent( { type: 'move' } );

	    }

	    function rotate ( event ) {

	        //TLogger.log( 'handleMouseMoveRotate' )

	        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

	        var orientation = self.orientation;
	        orientation.y += movementX * self.rotateSpeed;
	        orientation.x += movementY * self.rotateSpeed;
	        orientation.x   = Math.max( -PI_2, Math.min( PI_2, orientation.x ) );

	        self.update();
	        self.dispatchEvent( { type: 'rotate' } );

	    }

	    // Handlers
	    function onKeyDown ( event ) {

	        if ( self.enabled === false ) {
	            return
	        }

	        var pathCurrentPoint = self.currentPath.getPointAt( self.currentPathPosition );
	        var pathNextPoint    = undefined;
	        var pathDirection    = undefined;
	        if ( self.currentPathPosition + self.cameraJump > 1 ) { // end of path
	            pathNextPoint = self.currentPath.getPointAt( self.currentPathPosition - self.cameraJump );
	            pathDirection = pathNextPoint.sub( pathCurrentPoint ).normalize().negate();
	        } else {
	            pathNextPoint = self.currentPath.getPointAt( self.currentPathPosition + self.cameraJump );
	            pathDirection = pathNextPoint.sub( pathCurrentPoint ).normalize();
	        }

	        var cameraDirection = self.camera.getWorldDirection().normalize();
	        var dotProduct      = cameraDirection.dot( pathDirection );

	        if ( dotProduct > 0 && self.keysCodes.forwardKeys.includes( event.keyCode ) ) {

	            event.preventDefault();
	            moveForward();

	        } else if ( dotProduct < 0 && self.keysCodes.forwardKeys.includes( event.keyCode ) ) {

	            event.preventDefault();
	            moveBackward();

	        } else if ( dotProduct > 0 && self.keysCodes.backwardKeys.includes( event.keyCode ) ) {

	            event.preventDefault();
	            moveBackward();

	        } else if ( dotProduct < 0 && self.keysCodes.backwardKeys.includes( event.keyCode ) ) {

	            event.preventDefault();
	            moveForward();

	        } else {

	            iteeClient.DefaultLogger.warn( `The key event is not implemented for key code: ${ event.keyCode }` );

	        }

	    }

	    function onKeyUp ( event ) {

	        if ( self.enabled === false ) {
	            return
	        }

	        if ( !self.keysCodes.forwardKeys.includes( event.keyCode ) && !self.keysCodes.backwardKeys.includes( event.keyCode ) ) {
	            return
	        }

	        if ( event ) { event.preventDefault(); }

	        self.dispatchEvent( { type: 'moveEnd' } );

	    }

	    function onMouseDown ( event ) {

	        if ( self.enabled === false ) {
	            return
	        }

	        event.preventDefault();

	        if ( self.enableRotate === true && event.button === self.mouseButtons.ORBIT ) {

	            currentState = STATE.ROTATE;

	        } else if ( self.enableZoom === true && event.button === self.mouseButtons.ZOOM ) ; else if ( self.enablePan === true && event.button === self.mouseButtons.PAN ) ;

	    }

	    function onMouseMove ( event ) {

	        if ( self.enabled === false ) {
	            return
	        }

	        event.preventDefault();

	        if ( currentState === STATE.ROTATE ) {

	            rotate( event );

	        }

	    }

	    function onMouseUp ( event ) {

	        if ( self.enabled === false ) {
	            return
	        }

	        if ( event ) { event.preventDefault(); }

	        currentState = STATE.NONE;

	        self.dispatchEvent( { type: 'rotateEnd' } );

	    }

	    function onForward ( event ) {

	        clearTimeout( self.timeoutId );

	        event.keyCode = iteeClient.Keys.UP_ARROW;
	        onKeyDown( event );

	        self.timeoutId = setTimeout( onKeyUp.bind( self ), 750 );

	    }

	    function onBackward ( event ) {

	        clearTimeout( self.timeoutId );

	        event.keyCode = iteeClient.Keys.BOTTOM_ARROW;
	        onKeyDown( event );

	        self.timeoutId = setTimeout( onKeyUp.bind( self ), 750 );

	    }

	    // Public function that access private methods
	    this.update = function () {

	        if ( this.enabled === false ) {
	            return
	        }

	        // Update position
	        var newPosition        = this.currentPath.getPointAt( this.currentPathPosition );
	        this.camera.position.x = newPosition.x;
	        this.camera.position.y = newPosition.y + this.verticalOffset;
	        this.camera.position.z = newPosition.z;

	        // Update rotation
	        mouseQuat.x.setFromAxisAngle( xVector, this.orientation.x );
	        mouseQuat.y.setFromAxisAngle( yVector, this.orientation.y );
	        this.camera.quaternion.copy( mouseQuat.y ).multiply( mouseQuat.x );

	    };

	    this.dispose = function () {

	        this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
	        this.domElement.removeEventListener( 'mousemove', onMouseMove, false );
	        this.domElement.removeEventListener( 'mouseup', onMouseUp, false );

	        window.removeEventListener( 'keydown', onKeyDown, false );
	        window.removeEventListener( 'keyup', onKeyUp, false );

	    };

	    this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	    this.domElement.addEventListener( 'mousemove', onMouseMove, false );
	    this.domElement.addEventListener( 'mouseup', onMouseUp, false );

	    window.addEventListener( 'keydown', onKeyDown, false );
	    window.addEventListener( 'keyup', onKeyUp, false );

	    this.forwardControl.addEventListener( 'click', onForward, false );
	    this.backwardControl.addEventListener( 'click', onBackward, false );

	}

	Object.assign( CameraPathController.prototype, threeFull.EventDispatcher.prototype, {

	    get camera () {

	        return this._camera

	    },

	    set camera ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
	        if ( !( value instanceof threeFull.Camera ) ) { throw new Error( `Camera cannot be an instance of ${ value.constructor.name }. Expect an instance of Camera.` ) }

	        this._camera = value;

	    },

	    setCamera ( value ) {

	        this.camera = value;
	        return this

	    },

	    /**
	     *
	     * @param path
	     */
	    setPath ( path ) {

	        this.currentPath = path;
	        this.cameraJump  = 1 / path.getLength();

	    },

	    /**
	     *
	     * @param paths
	     * @param nameOfFirstPathToFollow
	     */
	    setPaths ( paths, nameOfFirstPathToFollow ) {

	        this.paths            = paths;
	        this.currentPathIndex = 0;

	        var pathToFollow = this.paths[ this.currentPathIndex ];

	        var numberOfPaths = this.paths.length;

	        var firstPath      = undefined;
	        var startFirstPath = undefined;
	        var endFirstPath   = undefined;

	        var secondPath      = undefined;
	        var startSecondPath = undefined;
	        var endSecondPath   = undefined;

	        for ( var firstPathIndex = 0 ; firstPathIndex < numberOfPaths ; firstPathIndex++ ) {

	            firstPath      = this.paths[ firstPathIndex ];
	            startFirstPath = firstPath.getPointAt( 0 );
	            endFirstPath   = firstPath.getPointAt( 1 );

	            if ( nameOfFirstPathToFollow && firstPath.name === nameOfFirstPathToFollow ) {
	                pathToFollow          = firstPath;
	                this.currentPathIndex = firstPathIndex;
	            }

	            var closestStartDistance    = Infinity;
	            var closestEndDistance      = Infinity;
	            var indexOfClosestStartPath = undefined;
	            var indexOfClosestEndPath   = undefined;

	            for ( var secondPathIndex = 0 ; secondPathIndex < numberOfPaths ; secondPathIndex++ ) {

	                if ( firstPathIndex === secondPathIndex ) {
	                    continue
	                }

	                secondPath      = this.paths[ secondPathIndex ];
	                startSecondPath = secondPath.getPointAt( 0 );
	                endSecondPath   = secondPath.getPointAt( 1 );

	                if ( startFirstPath.distanceTo( startSecondPath ) < closestStartDistance ) {

	                    closestStartDistance    = startFirstPath.distanceTo( startSecondPath );
	                    indexOfClosestStartPath = secondPathIndex;

	                }

	                if ( startFirstPath.distanceTo( endSecondPath ) < closestStartDistance ) {

	                    closestStartDistance    = startFirstPath.distanceTo( endSecondPath );
	                    indexOfClosestStartPath = secondPathIndex;

	                }

	                if ( endFirstPath.distanceTo( startSecondPath ) < closestEndDistance ) {

	                    closestEndDistance    = endFirstPath.distanceTo( startSecondPath );
	                    indexOfClosestEndPath = secondPathIndex;

	                }

	                if ( endFirstPath.distanceTo( endSecondPath ) < closestEndDistance ) {

	                    closestEndDistance    = endFirstPath.distanceTo( endSecondPath );
	                    indexOfClosestEndPath = secondPathIndex;

	                }

	            }

	            this.pathsMap.set( firstPathIndex, {
	                indexOfPreviousPath: indexOfClosestStartPath,
	                indexOfNextPath:     indexOfClosestEndPath
	            } );

	        }

	        //        TLogger.log( this.pathsMap )

	        this.setPath( pathToFollow );

	    },

	    /**
	     *
	     * @param quat
	     */
	    setMouseQuat ( quat ) {

	        this.orientation.y = Math.asin( quat.y ) * 2;
	        this.orientation.x = 0;

	    },

	    /**
	     *
	     */
	    getCurrentPathPosition () {

	        return this.currentPath.getPointAt( this.currentPathPosition )

	    },

	    /**
	     *
	     * @return {undefined}
	     */
	    getNextPathPosition () {

	        var nextPosition = undefined;

	        if ( this.currentPathPosition + this.cameraJump > 1 ) { // end of path
	            nextPosition = this.currentPath.getPointAt( this.currentPathPosition - this.cameraJump ).negate();
	        } else {
	            nextPosition = this.currentPath.getPointAt( this.currentPathPosition + this.cameraJump );
	        }

	        return nextPosition

	    },

	    /**
	     *
	     * @return {number}
	     */
	    getDistanceFromStart () {

	        //Linear distance
	        //		var firstPosition = this.currentPath.getPointAt( 0 )
	        //		var currentPosition = this.currentPath.getPointAt( this.currentPathPosition )
	        //
	        //		return firstPosition.distanceTo( currentPosition )

	        // Accordingly to the fact than currentPathPosition is an multiple of cameraJump that is equals to 1 / path.getLength()
	        // Todo: need to go the projection to Tronçon
	        return this.currentPathPosition * this.currentPath.getLength()

	    },

	    /**
	     *
	     */
	    lookAtPath () {

	        // Set lookup point at the camera height
	        var nextPosition = this.getNextPathPosition();
	        nextPosition.y   = this.camera.position.y;

	        this.camera.lookAt( nextPosition );

	        // We need to update local orientation else on first move event the camera will return to default position !
	        this.setMouseQuat( this.camera.quaternion );

	    },

	    /**
	     *
	     * @param position
	     */
	    goTo ( position ) {

	        //Todo: Should use 2D instead of 3D !

	        var numberOfPoints    = undefined;
	        var currentPath       = undefined;
	        var currentPathPoints = undefined;
	        var closestPointIndex = undefined;
	        var closestPath       = undefined;
	        var closestPathIndex  = undefined;
	        var currentDistance   = undefined;
	        var closestDistance   = Infinity;

	        for ( var pathIndex = 0, numberOfPath = this.paths.length ; pathIndex < numberOfPath ; pathIndex++ ) {

	            currentPath       = this.paths[ pathIndex ];
	            numberOfPoints    = Math.floor( currentPath.getLength() );
	            currentPathPoints = currentPath.getSpacedPoints( numberOfPoints );

	            for ( var pointIndex = 0 ; pointIndex < numberOfPoints ; pointIndex++ ) {

	                currentDistance = position.distanceTo( currentPathPoints[ pointIndex ] );

	                if ( currentDistance < closestDistance ) {

	                    closestDistance   = currentDistance;
	                    closestPathIndex  = pathIndex;
	                    closestPath       = currentPath;
	                    closestPointIndex = pointIndex;

	                }

	            }

	        }

	        this.setPath( closestPath );
	        this.currentPathIndex    = closestPathIndex;
	        this.currentPathPosition = this.cameraJump * closestPointIndex;

	        this.lookAtPath();
	        this.update();

	        this.dispatchEvent( { type: 'moveEnd' } );
	        this.dispatchEvent( { type: 'rotateEnd' } );

	    }

	} );

	/**
	 * @author [Ahmed DCHAR]{@link https://github.com/Dragoneel}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @file Todo
	 *
	 * @example Todo
	 *
	 */

	// Basic Geometries

	class LineGeometry extends threeFull.BufferGeometry {

	    constructor ( pointA = new threeFull.Vector3( 0, 0, 0 ), pointB = new threeFull.Vector3( 1, 0, 0 ) ) {
	        super();

	        this.type = 'LineGeometry';
	        this.setAttribute( 'position', new threeFull.Float32BufferAttribute( [ pointA.x, pointA.y, pointA.z, pointB.x, pointB.y, pointB.z ], 3 ) );

	    }

	}

	class ClippingBox extends threeFull.LineSegments {

	    constructor () {
	        super();

	        this.margin = 0.01;

	        this.geometry         = new threeFull.EdgesGeometry( new threeFull.BoxBufferGeometry( 2, 2, 2 ) );
	        this.material         = new threeFull.LineBasicMaterial( {
	            color: 0xffffff
	        } );
	        this.matrixAutoUpdate = false;

	        // Planes
	        this.normalPlanes = {
	            normalRightSide:  new threeFull.Vector3( -1, 0, 0 ),
	            normalLeftSide:   new threeFull.Vector3( 1, 0, 0 ),
	            normalFrontSide:  new threeFull.Vector3( 0, -1, 0 ),
	            normalBackSide:   new threeFull.Vector3( 0, 1, 0 ),
	            normalTopSide:    new threeFull.Vector3( 0, 0, -1 ),
	            normalBottomSide: new threeFull.Vector3( 0, 0, 1 )
	        };

	        this.planes = {
	            rightSidePlane:  new threeFull.Plane( this.normalPlanes.normalRightSide.clone(), 0 ),
	            leftSidePlane:   new threeFull.Plane( this.normalPlanes.normalLeftSide.clone(), 0 ),
	            frontSidePlane:  new threeFull.Plane( this.normalPlanes.normalFrontSide.clone(), 0 ),
	            backSidePlane:   new threeFull.Plane( this.normalPlanes.normalBackSide.clone(), 0 ),
	            topSidePlane:    new threeFull.Plane( this.normalPlanes.normalTopSide.clone(), 0 ),
	            bottomSidePlane: new threeFull.Plane( this.normalPlanes.normalBottomSide.clone(), 0 )
	        };

	        this._boundingBox = new threeFull.Box3();

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

	        if ( iteeValidators.isNotDefined( objects ) ) { return }

	        let planes = [];
	        for ( let i in this.planes ) {
	            planes.push( this.planes[ i ] );
	        }

	        objects.traverse( ( object ) => {

	            if ( iteeValidators.isNotDefined( object ) ) { return }
	            if ( iteeValidators.isNotDefined( object.geometry ) ) { return }
	            if ( iteeValidators.isNotDefined( object.material ) ) { return }

	            const materials = iteeValidators.isArray( object.material ) ? object.material : [ object.material ];

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

	// Materials

	class HighlightableMaterial extends threeFull.MeshBasicMaterial {

	    constructor ( parameters ) {
	        super( parameters );
	        this.isHighlightableMaterial = true;
	        //        this.type                    = 'HighlightableMaterial'

	        this.depthTest   = false;
	        this.depthWrite  = false;
	        this.fog         = false;
	        this.side        = threeFull.DoubleSide;
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

	class HighlightableLineMaterial extends threeFull.LineBasicMaterial {

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

	// Pickers

	class AbstractHitbox extends threeFull.Mesh {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                geometry: new threeFull.BufferGeometry(),
	                material: new threeFull.MeshBasicMaterial( {
	                    visible:    false,
	                    depthTest:  false,
	                    depthWrite: false,
	                    fog:        false,
	                    side:       threeFull.DoubleSide
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

	class CylindricaHitbox extends AbstractHitbox {

	    constructor ( parameters = {} ) {

	        const cylinderGeometry = new threeFull.CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false );
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

	class PlanarHitbox extends AbstractHitbox {

	    constructor ( parameters = {} ) {

	        const planePositions      = [
	            0.0, 0.0, 0.0,
	            1.1, 0.0, 0.0,
	            1.1, 1.1, 0.0,
	            0.0, 1.1, 0.0
	        ];
	        const planeIndexes        = [
	            0, 1, 2,
	            2, 3, 0
	        ];
	        const planeBufferGeometry = new threeFull.BufferGeometry();
	        planeBufferGeometry.setAttribute( 'position', new threeFull.Float32BufferAttribute( planePositions, 3 ) );
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
	        const positionBufferAttribute = new threeFull.Float32BufferAttribute( lozengePositions, 3 );
	        const lozengeBufferGeometry   = new threeFull.BufferGeometry();
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

	class OctahedricalHitbox extends AbstractHitbox {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                geometry: new threeFull.OctahedronBufferGeometry( 1.2, 0 )
	            }, ...parameters
	        };

	        super( _parameters );
	        this.isOctahedricalHitbox = true;
	        this.type                 = 'OctahedricalHitbox';

	    }

	}

	class SphericalHitbox extends AbstractHitbox {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                geometry: new threeFull.SphereBufferGeometry( 1, 8, 6, 0, 2 * Math.PI, 0, Math.PI )
	            }, ...parameters
	        };

	        super( _parameters );
	        this.isSphericalHitbox = true;
	        this.type              = 'SphericalHitbox';

	    }

	}

	class TorusHitbox extends AbstractHitbox {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                geometry: new threeFull.TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI )
	            }, ...parameters
	        };

	        super( _parameters );
	        this.isTorusHitbox = true;
	        this.type          = 'TorusHitbox';

	    }

	}

	// Handles
	class AbstractHandle extends threeFull.Object3D {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                color:  0xffffff,
	                hitbox: null
	            }, ...parameters
	        };

	        super();
	        this.isHandle         = true;
	        this.type             = 'Handle';
	        this.matrixAutoUpdate = false;

	        this.color  = _parameters.color;
	        this.hitbox = _parameters.hitbox;

	        this.baseQuaternion = new threeFull.Quaternion();

	    }

	    get color () {

	        return this.line.material.color.clone()

	    }

	    set color ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Color cannot be null ! Expect an instance of Color.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Color cannot be undefined ! Expect an instance of Color.' ) }
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
	            if ( iteeValidators.isUndefined( childMaterial ) || !childMaterial.isHighlightableMaterial ) { continue }

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

	class TranslateHandle extends AbstractHandle {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                color:     0xffffff,
	                hitbox:    new CylindricaHitbox(),
	                direction: new threeFull.Vector3( 0, 1, 0 )
	            }, ...parameters
	        };

	        super( _parameters );
	        this.isTranslateHandle = true;
	        this.type              = 'TranslateHandle';

	        const lineGeometry    = new LineGeometry( new threeFull.Vector3( 0, 0, 0 ), new threeFull.Vector3( 0, 0.8, 0 ) );
	        const lineMaterial    = new HighlightableLineMaterial( { color: _parameters.color } );
	        const line            = new threeFull.Line( lineGeometry, lineMaterial );
	        line.matrixAutoUpdate = false;
	        this.add( line );

	        const coneGeometry = new threeFull.ConeBufferGeometry( 0.05, 0.2, 12, 1, false );
	        coneGeometry.translate( 0, 0.9, 0 );
	        const coneMaterial    = new HighlightableMaterial( { color: _parameters.color } );
	        const cone            = new threeFull.Mesh( coneGeometry, coneMaterial );
	        cone.matrixAutoUpdate = false;
	        this.add( cone );

	        this.direction = _parameters.direction;

	    }

	    get direction () {

	        return this._direction

	    }

	    set direction ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
	        if ( !( value instanceof threeFull.Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

	        this._direction = value;

	        if ( value.y > 0.99999 ) {

	            this.quaternion.set( 0, 0, 0, 1 );

	        } else if ( value.y < -0.99999 ) {

	            this.quaternion.set( 1, 0, 0, 0 );

	        } else {

	            const axis    = new threeFull.Vector3( value.z, 0, -value.x ).normalize();
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

	    }

	    setDirection ( direction ) {

	        this.direction = direction;
	        return this

	    }

	    flipDirection () {

	        this.direction = this._direction.negate();

	    }

	}

	class ScaleHandle extends AbstractHandle {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                color:     0xffffff,
	                hitbox:    new CylindricaHitbox(),
	                direction: new threeFull.Vector3( 0, 1, 0 )
	            }, ...parameters
	        };

	        super( _parameters );
	        this.isScaleHandle = true;
	        this.type          = 'ScaleHandle';

	        const lineGeometry    = new LineGeometry( new threeFull.Vector3( 0, 0, 0 ), new threeFull.Vector3( 0, 0.88, 0 ) );
	        const lineMaterial    = new HighlightableLineMaterial( { color: _parameters.color } );
	        const line            = new threeFull.Line( lineGeometry, lineMaterial );
	        line.matrixAutoUpdate = false;
	        this.add( line );

	        const boxGeometry = new threeFull.BoxBufferGeometry( 0.12, 0.12, 0.12 );
	        boxGeometry.translate( 0, 0.94, 0 );
	        const boxMaterial    = new HighlightableMaterial( { color: _parameters.color } );
	        const box            = new threeFull.Mesh( boxGeometry, boxMaterial );
	        box.matrixAutoUpdate = false;
	        this.add( box );

	        this.direction = _parameters.direction;

	    }

	    get direction () {

	        return this._direction

	    }

	    set direction ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
	        if ( !( value instanceof threeFull.Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

	        this._direction = value;

	        if ( value.y > 0.99999 ) {

	            this.quaternion.set( 0, 0, 0, 1 );

	        } else if ( value.y < -0.99999 ) {

	            this.quaternion.set( 1, 0, 0, 0 );

	        } else {

	            const axis    = new threeFull.Vector3( value.z, 0, -value.x ).normalize();
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

	    }

	    setDirection ( direction ) {

	        this.direction = direction;
	        return this

	    }

	    flipDirection () {

	        this.direction = this._direction.negate();

	    }

	}

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
	    }

	}

	class PlaneHandle extends AbstractHandle {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                color:     0xffffff,
	                hitbox:    new PlanarHitbox(),
	                direction: new threeFull.Vector3( 0, 1, 0 )
	            }, ...parameters
	        };

	        super( _parameters );
	        this.isPlaneHandle = true;
	        this.type          = 'PlaneHandle';

	        // Edge line
	        const lineBufferGeometry = new threeFull.BufferGeometry();
	        lineBufferGeometry.setAttribute( 'position', new threeFull.Float32BufferAttribute( [ 0.75, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.75, 0.0 ], 3 ) );

	        const lineMaterial = new HighlightableLineMaterial( {
	            color: _parameters.color
	        } );

	        const line            = new threeFull.Line( lineBufferGeometry, lineMaterial );
	        line.matrixAutoUpdate = false;
	        this.add( line );

	        // Plane
	        const planePositions      = [
	            0.1, 0.1, 0.0,
	            1.0, 0.1, 0.0,
	            1.0, 1.0, 0.0,
	            0.1, 1.0, 0.0
	        ];
	        const planeIndexes        = [
	            0, 1, 2,
	            2, 3, 0
	        ];
	        const planeBufferGeometry = new threeFull.BufferGeometry();
	        planeBufferGeometry.setAttribute( 'position', new threeFull.Float32BufferAttribute( planePositions, 3 ) );
	        planeBufferGeometry.setIndex( planeIndexes );

	        const planeMaterial    = new HighlightableMaterial( {
	            color:       _parameters.color,
	            transparent: true,
	            opacity:     0.35
	        } );
	        const plane            = new threeFull.Mesh( planeBufferGeometry, planeMaterial );
	        plane.matrixAutoUpdate = false;
	        this.add( plane );

	        this.xAxis = new threeFull.Vector3( 1, 0, 0 );
	        this.yAxis = new threeFull.Vector3( 0, 1, 0 );
	        this.zAxis = new threeFull.Vector3( 0, 0, 1 );

	        this.xDirection = new threeFull.Vector3( _parameters.direction.x, 0, 0 );
	        this.yDirection = new threeFull.Vector3( 0, _parameters.direction.y, 0 );
	        this.zDirection = new threeFull.Vector3( 0, 0, _parameters.direction.z );
	        this.direction  = _parameters.direction;

	    }

	    get direction () {

	        return this._direction

	    }

	    set direction ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
	        if ( !( value instanceof threeFull.Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

	        this._direction = value;

	    }

	    update ( cameraDirection ) {

	        super.update( cameraDirection );

	        // Decompose direction by main orientation
	        const xDirection = new threeFull.Vector3( this._direction.x, 0, 0 );
	        const yDirection = new threeFull.Vector3( 0, this._direction.y, 0 );
	        const zDirection = new threeFull.Vector3( 0, 0, this._direction.z );
	        const xDot       = xDirection.dot( cameraDirection );
	        const yDot       = yDirection.dot( cameraDirection );
	        const zDot       = zDirection.dot( cameraDirection );

	        this.quaternion.copy( this.baseQuaternion );

	        // XY Plane
	        if ( xDot > 0 && yDot > 0 && zDot === 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 180 ) );
	            this.xDirection.setX( -1 );
	            this.yDirection.setY( -1 );
	            this.zDirection.setZ( 0 );

	        } else if ( xDot > 0 && yDot < 0 && zDot === 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 90 ) );
	            this.xDirection.setX( -1 );
	            this.yDirection.setY( 1 );
	            this.zDirection.setZ( 0 );

	        } else if ( xDot < 0 && yDot > 0 && zDot === 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 270 ) );
	            this.xDirection.setX( 1 );
	            this.yDirection.setY( -1 );
	            this.zDirection.setZ( 0 );

	        } else if ( xDot < 0 && yDot < 0 && zDot === 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 0 ) );
	            this.xDirection.setX( 1 );
	            this.yDirection.setY( 1 );
	            this.zDirection.setZ( 0 );

	        }

	        // XZ Plane
	        else if ( xDot > 0 && yDot === 0 && zDot > 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 180 ) );
	            this.xDirection.setX( -1 );
	            this.yDirection.setY( 0 );
	            this.zDirection.setZ( -1 );

	        } else if ( xDot > 0 && yDot === 0 && zDot < 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 90 ) );
	            this.xDirection.setX( -1 );
	            this.yDirection.setY( 0 );
	            this.zDirection.setZ( 1 );

	        } else if ( xDot < 0 && yDot === 0 && zDot > 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 270 ) );
	            this.xDirection.setX( 1 );
	            this.yDirection.setY( 0 );
	            this.zDirection.setZ( -1 );

	        } else if ( xDot < 0 && yDot === 0 && zDot < 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 0 ) );
	            this.xDirection.setX( 1 );
	            this.yDirection.setY( 0 );
	            this.zDirection.setZ( 1 );

	        }

	        // YZ Plane
	        else if ( xDot === 0 && yDot > 0 && zDot > 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 180 ) );
	            this.xDirection.setX( 0 );
	            this.yDirection.setY( -1 );
	            this.zDirection.setZ( -1 );

	        } else if ( xDot === 0 && yDot > 0 && zDot < 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 270 ) );
	            this.xDirection.setX( 0 );
	            this.yDirection.setY( -1 );
	            this.zDirection.setZ( 1 );

	        } else if ( xDot === 0 && yDot < 0 && zDot > 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 90 ) );
	            this.xDirection.setX( 0 );
	            this.yDirection.setY( 1 );
	            this.zDirection.setZ( -1 );

	        } else if ( xDot === 0 && yDot < 0 && zDot < 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 0 ) );
	            this.xDirection.setX( 0 );
	            this.yDirection.setY( 1 );
	            this.zDirection.setZ( 1 );

	        }

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

	class LozengeHandle extends AbstractHandle {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                color:     0xffffff,
	                hitbox:    new LozengeHitbox(),
	                direction: new threeFull.Vector3( 1, 1, 0 )
	            }, ...parameters
	        };

	        super( _parameters );
	        this.isPlaneHandle = true;
	        this.type          = 'PlaneHandle';

	        // Edge line
	        const lineBufferGeometry = new threeFull.BufferGeometry();
	        lineBufferGeometry.setAttribute( 'position', new threeFull.Float32BufferAttribute( [ 0.1, 0.75, 0.0, 1.0, 1.0, 0.0, 0.75, 0.1, 0.0 ], 3 ) );

	        const lineMaterial = new HighlightableLineMaterial( {
	            color: _parameters.color
	        } );

	        const line            = new threeFull.Line( lineBufferGeometry, lineMaterial );
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
	        const lozengeBufferGeometry = new threeFull.BufferGeometry();
	        lozengeBufferGeometry.setAttribute( 'position', new threeFull.Float32BufferAttribute( lozengePositions, 3 ) );
	        lozengeBufferGeometry.setIndex( lozengeIndexes );

	        const lozengeMaterial    = new HighlightableMaterial( {
	            color:       _parameters.color,
	            transparent: true,
	            opacity:     0.35
	        } );
	        const lozenge            = new threeFull.Mesh( lozengeBufferGeometry, lozengeMaterial );
	        lozenge.matrixAutoUpdate = false;
	        this.add( lozenge );

	        this.direction  = _parameters.direction;
	        this.xDirection = new threeFull.Vector3( _parameters.direction.x, 0, 0 );
	        this.yDirection = new threeFull.Vector3( 0, _parameters.direction.y, 0 );
	        this.zDirection = new threeFull.Vector3( 0, 0, _parameters.direction.z );
	        this.xAxis      = new threeFull.Vector3( 1, 0, 0 );
	        this.yAxis      = new threeFull.Vector3( 0, 1, 0 );
	        this.zAxis      = new threeFull.Vector3( 0, 0, 1 );
	    }

	    get direction () {

	        return this._direction

	    }

	    set direction ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Direction cannot be null ! Expect an instance of Color.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Direction cannot be undefined ! Expect an instance of Color.' ) }
	        if ( !( value instanceof threeFull.Vector3 ) ) { throw new Error( `Direction cannot be an instance of ${ value.constructor.name }. Expect an instance of Vector3.` ) }

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

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 180 ) );

	        } else if ( xDot > 0 && yDot < 0 && zDot === 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 90 ) );

	        } else if ( xDot < 0 && yDot > 0 && zDot === 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 270 ) );

	        } else if ( xDot < 0 && yDot < 0 && zDot === 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 0 ) );

	        }

	        // XZ Plane
	        else if ( xDot > 0 && yDot === 0 && zDot > 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 180 ) );

	        } else if ( xDot > 0 && yDot === 0 && zDot < 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 90 ) );

	        } else if ( xDot < 0 && yDot === 0 && zDot > 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 270 ) );

	        } else if ( xDot < 0 && yDot === 0 && zDot < 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 0 ) );

	        }

	        // YZ Plane
	        else if ( xDot === 0 && yDot > 0 && zDot > 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 180 ) );

	        } else if ( xDot === 0 && yDot > 0 && zDot < 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 270 ) );

	        } else if ( xDot === 0 && yDot < 0 && zDot > 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 90 ) );

	        } else if ( xDot === 0 && yDot < 0 && zDot < 0 ) {

	            this.rotateOnAxis( this.zAxis, iteeUtils.degreesToRadians( 0 ) );

	        }

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

	        const octahedronGeometry    = new threeFull.OctahedronBufferGeometry( 1, 0 );
	        const octahedronMaterial    = new HighlightableMaterial( {
	            color:       _parameters.color,
	            transparent: true,
	            opacity:     0.55
	        } );
	        const octahedron            = new threeFull.Mesh( octahedronGeometry, octahedronMaterial );
	        octahedron.matrixAutoUpdate = false;
	        this.add( octahedron );

	        const edgesGeometry    = new threeFull.EdgesGeometry( octahedronGeometry );
	        const edgesMaterial    = new HighlightableLineMaterial( {
	            color:     _parameters.color,
	            linewidth: 4
	        } );
	        const edges            = new threeFull.LineSegments( edgesGeometry, edgesMaterial );
	        edges.matrixAutoUpdate = false;
	        this.add( edges );

	    }

	    update ( cameraDirection ) {
	        super.update( cameraDirection );
	    }

	}

	// Gizmos

	class AbstractGizmo extends threeFull.Object3D {

	    constructor () {

	        super();
	        this.isGizmo          = true;
	        this.type             = 'AbstractGizmo';
	        this.matrixAutoUpdate = false;

	    }

	    init () {

	        this.handles                  = new threeFull.Object3D();
	        this.handles.matrixAutoUpdate = false;

	        this.add( this.handles );

	        //// PLANES
	        const planeGeometry                  = new threeFull.PlaneBufferGeometry( 50, 50, 2, 2 );
	        const planeMaterial                  = new threeFull.MeshBasicMaterial( {
	            side:    threeFull.DoubleSide,
	            visible: false
	            //            transparent: true,
	            //            opacity:     0.1
	        } );
	        this.intersectPlane                  = new threeFull.Mesh( planeGeometry, planeMaterial );
	        this.intersectPlane.matrixAutoUpdate = false;
	        this.intersectPlane.visible          = false;

	        this.add( this.intersectPlane );

	        //// HANDLES

	        const setupGizmos = ( gizmoMap, parent ) => {

	            for ( let name in gizmoMap ) {

	                const element = gizmoMap[ name ];
	                if ( iteeValidators.isNotArray( element ) ) {

	                    element.name        = name;
	                    element.renderOrder = Infinity;

	                    parent.add( element );

	                } else {

	                    for ( let i = element.length ; i-- ; ) {

	                        const object   = gizmoMap[ name ][ i ][ 0 ];
	                        const position = gizmoMap[ name ][ i ][ 1 ];
	                        const rotation = gizmoMap[ name ][ i ][ 2 ];
	                        const scale    = gizmoMap[ name ][ i ][ 3 ];
	                        const tag      = gizmoMap[ name ][ i ][ 4 ];

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

	        };

	        setupGizmos( this.handleGizmos, this.handles );

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

	    }

	}

	class TranslateGizmo extends AbstractGizmo {

	    constructor () {

	        super();
	        this.isTranslateGizmo = true;
	        this.type             = 'TranslateGizmo';

	        this.handleGizmos = {

	            X: new TranslateHandle( {
	                color:     0xaa0000,
	                direction: new threeFull.Vector3( 1, 0, 0 )
	            } ),

	            Y: new TranslateHandle( {
	                color:     0x00aa00,
	                direction: new threeFull.Vector3( 0, 1, 0 )
	            } ),

	            Z: new TranslateHandle( {
	                color:     0x0000aa,
	                direction: new threeFull.Vector3( 0, 0, 1 )
	            } ),

	            XY: new LozengeHandle( {
	                color:     0xaaaa00,
	                direction: new threeFull.Vector3( 1, 1, 0 )
	            } ).setScale( 0.33, 0.33, 1.0 ),

	            YZ: new LozengeHandle( {
	                color:     0x00aaaa,
	                direction: new threeFull.Vector3( 0, 1, 1 )
	            } ).setScale( 0.33, 0.33, 1.0 )
	               .setRotationFromAxisAndAngle( new threeFull.Vector3( 0, 1, 0 ), iteeUtils.degreesToRadians( -90 ) ),

	            XZ: new LozengeHandle( {
	                color:     0xaa00aa,
	                direction: new threeFull.Vector3( 1, 0, 1 )
	            } ).setScale( 0.33, 0.33, 1.0 )
	               .setRotationFromAxisAndAngle( new threeFull.Vector3( 1, 0, 0 ), iteeUtils.degreesToRadians( 90 ) ),

	            XYZ: new OctahedricalHandle( {
	                color: 0xaaaaaa
	            } ).setScale( 0.15, 0.15, 0.15 )

	        };

	        this.init();

	    }

	}

	class RotateGizmo extends AbstractGizmo {

	    constructor () {

	        super();
	        this.isRotateGizmo = true;
	        this.type          = 'RotateGizmo';

	        const CircleGeometry = ( radius, facing, arc ) => {

	            const geometry = new threeFull.BufferGeometry();
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

	            geometry.setAttribute( 'position', new threeFull.Float32BufferAttribute( vertices, 3 ) );
	            return geometry

	        };

	        this.handleGizmos = {

	            X: [ [ new threeFull.Line( new CircleGeometry( 1, 'x', 0.5 ), new HighlightableLineMaterial( { color: 0xff0000 } ) ) ],
	                 [ new threeFull.Mesh( new threeFull.OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0xff0000 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ] ],

	            Y: [ [ new threeFull.Line( new CircleGeometry( 1, 'y', 0.5 ), new HighlightableLineMaterial( { color: 0x00ff00 } ) ) ],
	                 [ new threeFull.Mesh( new threeFull.OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0x00ff00 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ] ],

	            Z: [ [ new threeFull.Line( new CircleGeometry( 1, 'z', 0.5 ), new HighlightableLineMaterial( { color: 0x0000ff } ) ) ],
	                 [ new threeFull.Mesh( new threeFull.OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0x0000ff } ) ), [ 0.99, 0, 0 ], null, [ 1, 3, 1 ] ] ],

	            E: [ [ new threeFull.Line( new CircleGeometry( 1.25, 'z', 1 ), new HighlightableLineMaterial( { color: 0xcccc00 } ) ) ] ],

	            XYZ: [ [ new threeFull.Line( new CircleGeometry( 1, 'z', 1 ), new HighlightableLineMaterial( { color: 0x787878 } ) ) ] ]

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

	        this.init();

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
	                direction: new threeFull.Vector3( 1, 1, 0 )
	            } ).setScale( 0.33, 0.33, 1.0 ),

	            YZ: new PlaneHandle( {
	                color:     0x00aaaa,
	                direction: new threeFull.Vector3( 0, 1, 1 )
	            } ).setScale( 0.33, 0.33, 1.0 )
	               .setRotationFromAxisAndAngle( new threeFull.Vector3( 0, 1, 0 ), iteeUtils.degreesToRadians( -90 ) ),

	            XZ: new PlaneHandle( {
	                color:     0xaa00aa,
	                direction: new threeFull.Vector3( 1, 0, 1 )
	            } ).setScale( 0.33, 0.33, 1.0 )
	               .setRotationFromAxisAndAngle( new threeFull.Vector3( 1, 0, 0 ), iteeUtils.degreesToRadians( 90 ) ),

	            X: new ScaleHandle( {
	                color:     0xaa0000,
	                direction: new threeFull.Vector3( 1, 0, 0 )
	            } ),

	            Y: new ScaleHandle( {
	                color:     0x00aa00,
	                direction: new threeFull.Vector3( 0, 1, 0 )
	            } ),

	            Z: new ScaleHandle( {
	                color:     0x0000aa,
	                direction: new threeFull.Vector3( 0, 0, 1 )
	            } )

	        };

	        this.init();

	    }

	}

	// Controller
	const ClippingModes = iteeUtils.toEnum( {
	    None:      'None',
	    Translate: 'Translate',
	    Rotate:    'Rotate',
	    Scale:     'Scale'
	} );

	class ClippingControls extends threeFull.Object3D {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                camera:        null,
	                domElement:    window,
	                mode:          ClippingModes.None,
	                objectsToClip: new threeFull.Object3D()
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
	        this._objectsToClipBoundingBox = new threeFull.Box3();
	        this._objectsToClipSize        = new threeFull.Vector3();
	        this._objectsToClipCenter      = new threeFull.Vector3();

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
	        this._firstPoint        = new threeFull.Vector3();
	        this._secondPoint       = new threeFull.Vector3();
	        this._mouseDisplacement = new threeFull.Vector3();
	        this._offset            = new threeFull.Vector3();
	        this._raycaster         = new threeFull.Raycaster();
	        this._pointerVector     = new threeFull.Vector2();
	        this._directionToMouse  = new threeFull.Vector3();
	        this._cameraPosition    = new threeFull.Vector3();
	        this._cameraDirection   = new threeFull.Vector3();
	        this._worldPosition     = new threeFull.Vector3();
	        this._worldRotation     = new threeFull.Euler();

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
	                translate: [ iteeClient.Keys.T.value ],
	                rotate:    [ iteeClient.Keys.R.value ],
	                scale:     [ iteeClient.Keys.S.value ]
	            },
	            translate: {
	                front: [ iteeClient.Keys.Z.value, iteeClient.Keys.UP_ARROW.value ],
	                back:  [ iteeClient.Keys.S.value, iteeClient.Keys.DOWN_ARROW.value ],
	                up:    [ iteeClient.Keys.A.value, iteeClient.Keys.PAGE_UP.value ],
	                down:  [ iteeClient.Keys.E.value, iteeClient.Keys.PAGE_DOWN.value ],
	                left:  [ iteeClient.Keys.Q.value, iteeClient.Keys.LEFT_ARROW.value ],
	                right: [ iteeClient.Keys.D.value, iteeClient.Keys.RIGHT_ARROW.value ]
	            },
	            scale: {
	                widthPlus:   [ iteeClient.Keys.LEFT_ARROW.value ],
	                widthMinus:  [ iteeClient.Keys.RIGHT_ARROW.value ],
	                heightPlus:  [ iteeClient.Keys.PAGE_UP.value ],
	                heightMinus: [ iteeClient.Keys.PAGE_DOWN.value ],
	                depthPlus:   [ iteeClient.Keys.UP_ARROW.value ],
	                depthMinus:  [ iteeClient.Keys.DOWN_ARROW.value ]
	            },
	            rotate: {
	                xAxis: [ iteeClient.Keys.X.value ],
	                yAxis: [ iteeClient.Keys.Y.value ],
	                zAxis: [ iteeClient.Keys.Z.value ]
	            }
	        };

	    }

	    get objectsToClip () {
	        return this._objectsToClip
	    }

	    set objectsToClip ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Objects to clip cannot be null ! Expect an instance of Object3D' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Objects to clip cannot be undefined ! Expect an instance of Object3D' ) }
	        if ( !( value instanceof threeFull.Object3D ) ) { throw new Error( `Objects to clip cannot be an instance of ${ value.constructor.name }. Expect an instance of Object3D.` ) }

	        this._objectsToClip = value;
	        this.updateClipping();

	    }

	    get camera () {
	        return this._camera
	    }

	    set camera ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Camera cannot be null ! Expect an instance of Camera' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Camera cannot be undefined ! Expect an instance of Camera' ) }
	        if ( !( value instanceof threeFull.Camera ) ) { throw new Error( `Camera cannot be an instance of ${ value.constructor.name }. Expect an instance of Camera.` ) }

	        this._camera = value;

	    }

	    get domElement () {
	        return this._domElement
	    }

	    set domElement ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'DomElement cannot be null ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'DomElement cannot be undefined ! Expect an instance of Window, HTMLDocument, HTMLDivElement or HTMLCanvasElement.' ) }
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

	        if ( iteeValidators.isNull( value ) ) { throw new Error( 'Mode cannot be null ! Expect a value from ClippingModes enum.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new Error( 'Mode cannot be undefined ! Expect a value from ClippingModes enum.' ) }
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
	        if ( iteeValidators.isDefined( this._objectsToClip ) ) {

	            this._objectsToClipBoundingBox.setFromObject( this._objectsToClip );

	            this._objectsToClipBoundingBox.getSize( this._objectsToClipSize );
	            this._objectsToClipSize.divideScalar( 2 );
	            this.scale.set( this._objectsToClipSize.x, this._objectsToClipSize.y, this._objectsToClipSize.z );

	            this._objectsToClipBoundingBox.getCenter( this._objectsToClipCenter );
	            this.position.set( this._objectsToClipCenter.x, this._objectsToClipCenter.y, this._objectsToClipCenter.z );

	            // update...
	            this.updateMatrixWorld();
	        }

	        this.updateClipping();

	    }

	    disable () {

	        this.visible = false;
	        this.enabled = false;
	        this.updateClipping();

	    }

	    updateClipping () {

	        if ( iteeValidators.isNotDefined( this._objectsToClip ) ) { return }

	        this._clippingBox.update();
	        this._clippingBox.applyClippingTo( this.enabled, this._objectsToClip );

	    }

	    update () {

	        if ( !this.enabled ) { return }
	        if ( this._mode === ClippingModes.None ) { return }
	        if ( iteeValidators.isNotDefined( this._currentGizmo ) ) { return }

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
	        if ( mouseEvent.button !== iteeClient.Mouse.LEFT.value ) { return }
	        if ( iteeValidators.isNotDefined( this._currentHandle ) ) { return }

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
	            const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.handles.children );
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

	            } else if ( iteeValidators.isDefined( this._currentHandle ) ) {

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
	        if ( mouseEvent.button !== iteeClient.Mouse.LEFT.value ) { return }
	        // todo isActive when mouse enter

	        mouseEvent.preventDefault();

	        this._dragging = false;
	        this.dispatchEvent( this._events.mouseUp );

	        // Check mouseIn
	        const intersect = this.intersectObjects( mouseEvent, this._currentGizmo.handles.children );
	        if ( intersect ) {

	            this._currentHandle = intersect.object;
	            this._currentHandle.highlight( true );

	            this._consumeEvent( mouseEvent );
	            this.dispatchEvent( this._events.mouseEnter );

	        } else if ( iteeValidators.isDefined( this._currentHandle ) ) {

	            this._currentHandle.highlight( false );
	            this._currentHandle = null;

	            this.dispatchEvent( this._events.mouseLeave );

	        }

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

	    }

	    _translateX ( deltaX ) {

	        this.position.setX( this.position.x + deltaX );

	    }

	    _translateY ( deltaY ) {

	        this.position.setY( this.position.y + deltaY );

	    }

	    _translateZ ( deltaZ ) {

	        this.position.setZ( this.position.z + deltaZ );

	    }

	    _translateXY ( deltaX, deltaY ) {

	        this.position.setX( this.position.x + deltaX );
	        this.position.setY( this.position.y + deltaY );

	    }

	    _translateXZ ( deltaX, deltaZ ) {

	        this.position.setX( this.position.x + deltaX );
	        this.position.setZ( this.position.z + deltaZ );

	    }

	    _translateYZ ( deltaY, deltaZ ) {

	        this.position.setY( this.position.y + deltaY );
	        this.position.setZ( this.position.z + deltaZ );

	    }

	    _translateXYZ ( deltaX, deltaY, deltaZ ) {

	        this.position.set( this.position.x + deltaX, this.position.y + deltaY, this.position.z + deltaZ );

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

	    }

	    _scaleX ( deltaX ) {

	        this.scale.setX( this.scale.x + deltaX );

	    }

	    _scaleY ( deltaY ) {

	        this.scale.setY( this.scale.y + deltaY );

	    }

	    _scaleZ ( deltaZ ) {

	        this.scale.setZ( this.scale.z + deltaZ );

	    }

	    _scaleXY ( deltaX, deltaY ) {

	        this.scale.setX( this.scale.x + deltaX );
	        this.scale.setY( this.scale.y + deltaY );

	    }

	    _scaleXZ ( deltaX, deltaZ ) {

	        this.scale.setX( this.scale.x + deltaX );
	        this.scale.setZ( this.scale.z + deltaZ );

	    }

	    _scaleYZ ( deltaY, deltaZ ) {

	        this.scale.setY( this.scale.y + deltaY );
	        this.scale.setZ( this.scale.z + deltaZ );

	    }

	    _scaleXYZ ( deltaX, deltaY, deltaZ ) {

	        this.scale.set( this.scale.x + deltaX, this.scale.y + deltaY, this.scale.z + deltaZ );

	    }

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @file Todo
	 *
	 * @example Todo
	 *
	 */

	/**
	 *
	 * @constructor
	 */
	function BufferGeometriesManager () {

	    iteeClient.TDataBaseManager.call( this );
	    this.basePath = '/buffergeometries';

	}

	BufferGeometriesManager.prototype = Object.assign( Object.create( iteeClient.TDataBaseManager.prototype ), {

	    /**
	     *
	     */
	    constructor: BufferGeometriesManager,

	    /**
	     *
	     * @param data
	     * @returns {Scene|Object3D}
	     */
	    convert ( data/*, onError */ ) {

	        const textureType = data.type;
	        let texture       = null;

	        switch ( textureType ) {

	            case 'Scene':
	                texture = new threeFull.Scene();
	                break

	            default:
	                texture = new threeFull.Object3D();
	                break

	        }

	        // Common object properties

	        //        if ( textureType === 'Line' ) {
	        //
	        //        }

	        return texture

	    }

	} );

	Object.defineProperties( BufferGeometriesManager.prototype, {

	    /**
	     *
	     */
	    _onJson: {
	        value: function _onJson ( jsonData, onSuccess, onProgress, onError ) {

	            // Normalize to array
	            const datas   = ( iteeValidators.isObject( jsonData ) ) ? [ jsonData ] : jsonData;
	            const results = {};
	            let result    = undefined;

	            for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

	                data   = datas[ dataIndex ];
	                result = this.convert( data, onError );
	                if ( result ) { results[ data._id ] = result; }

	                onProgress( dataIndex / numberOfDatas );

	            }

	            onSuccess( results );

	        }
	    }

	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @file Todo
	 *
	 * @example Todo
	 *
	 */

	/**
	 *
	 * @constructor
	 */
	function CurvesManager () {

	    iteeClient.TDataBaseManager.call( this );
	    this.basePath = '/curves';

	}

	CurvesManager.prototype = Object.assign( Object.create( iteeClient.TDataBaseManager.prototype ), {

	    /**
	     *
	     */
	    constructor: CurvesManager,

	    /**
	     *
	     * @param data
	     * @return {*}
	     */
	    convert ( data ) {

	        if ( !data ) {
	            throw new Error( 'CurvesManager: Unable to convert null or undefined data !' )
	        }

	        const curveType = data.type;
	        let curve       = undefined;

	        switch ( curveType ) {

	            case 'ArcCurve':
	                curve = new threeFull.ArcCurve();
	                break

	            case 'CatmullRomCurve3':
	                curve = new threeFull.CatmullRomCurve3();
	                break

	            case 'CubicBezierCurve':
	                curve = new threeFull.CubicBezierCurve();
	                break

	            case 'CubicBezierCurve3':
	                curve = new threeFull.CubicBezierCurve3();
	                break

	            case 'Curve':
	                curve = new threeFull.Curve();
	                break

	            case 'CurvePath':
	                curve = new threeFull.CurvePath();
	                break

	            case 'EllipseCurve':
	                curve = new threeFull.EllipseCurve();
	                break

	            case 'LineCurve':
	                curve = new threeFull.LineCurve();
	                break

	            case 'LineCurve3':
	                curve = new threeFull.LineCurve3();
	                break

	            // Missing NURBSCurve

	            case 'Path':
	                curve = new threeFull.Path();
	                break

	            case 'QuadraticBezierCurve':
	                curve = new threeFull.QuadraticBezierCurve();
	                break

	            case 'QuadraticBezierCurve3':
	                curve = new threeFull.QuadraticBezierCurve3();
	                break

	            case 'SplineCurve':
	                curve = new threeFull.SplineCurve();
	                break

	            case 'Shape':
	                curve = new threeFull.Shape();
	                break

	            default:
	                throw new Error( `TCurvesManager: Unknown curve of type: ${ curveType }` )

	        }

	        curve.fromJSON( data );

	        return curve

	    }

	} );

	Object.defineProperties( CurvesManager.prototype, {

	    /**
	     *
	     */
	    _onJson: {
	        value: function _onJson ( jsonData, onSuccess, onProgress, onError ) {

	            // Normalize to array
	            const datas   = ( iteeValidators.isObject( jsonData ) ) ? [ jsonData ] : jsonData;
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

	} );

	/**
	 * @author [Ahmed DCHAR]{@link https://github.com/Dragoneel}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @class ClassName
	 * @classdesc Todo...
	 * @example Todo...
	 *
	 */

	class FilairesManager extends iteeClient.TDataBaseManager {

	    /**
	     *
	     * @param basePath
	     * @param responseType
	     * @param bunchSize
	     * @param progressManager
	     * @param errorManager
	     */
	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                basePath:               '/',
	                responseType:           iteeClient.ResponseType.Json,
	                bunchSize:              500,
	                requestAggregationTime: 200,
	                requestsConcurrency:    6,
	                logger:                 iteeClient.DefaultLogger
	            }, ...parameters
	        };

	        super( _parameters );

	    }

	    //// Methods

	    _onJson ( jsonData, onSuccess, onProgress, onError ) {

	        // Normalize to array
	        const datas   = ( iteeValidators.isObject( jsonData ) ) ? [ jsonData ] : jsonData;
	        const results = {};

	        for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

	            data = datas[ dataIndex ];

	            try {
	                results[ data.id ] = this.convert( data );
	            } catch ( err ) {
	                onError( err );
	            }

	            onProgress( new ProgressEvent( 'FilairesManager', {
	                lengthComputable: true,
	                loaded:           dataIndex + 1,
	                total:            numberOfDatas
	            } ) );

	        }

	        onSuccess( results );

	    }

	    /**
	     *
	     * @param data
	     * @return {*}
	     */
	    convert ( data ) {

	        if ( !data ) {
	            throw new Error( 'FilairesManager: Unable to convert null or undefined data !' )
	        }

	        const objectType = data.type;
	        let object       = null;

	        if ( iteeValidators.isNotDefined( objectType ) ) {
	            throw new Error( `TFilaireManager.convert() : data type must be defined !!!` )
	        }

	        switch ( objectType ) {

	            case 'NaissanceVoute':
	                object = this._parseFilaire( data, 0x875100 );
	                break

	            case 'Radier':
	                object = this._parseFilaire( data, 0x0089af );
	                break

	            case 'Intrados':
	                object = this._parseFilaire( data, 0xc100b4 );
	                break

	            case 'Br':
	            case 'Bp':
	            case 'Src':
	                object = this._parsePoint( data, 0x00ff00 );
	                break

	            default:
	                throw new Error( `TFilaireManager: Unknown object of type: ${ objectType }` )

	        }

	        return object

	    }

	    _parseFilaire ( data, color ) {

	        const geoJson   = JSON.parse( data.geojson );
	        const positions = geoJson.coordinates.reduce( ( acc, val ) => acc.concat( val ), [] );

	        if ( iteeValidators.isNotDefined( positions ) ) {
	            throw new Error( `TFilaireManager._parseFilaire() : ${ data.type } geometry doesn't contains coordinates !!!` )
	        }

	        const material = new threeFull.LineBasicMaterial( {
	            color: color
	        } );

	        const bufferGeometry = new threeFull.BufferGeometry();
	        bufferGeometry.setAttribute( 'position', new threeFull.Float32BufferAttribute( positions, 3 ) );

	        let object = new threeFull.Line( bufferGeometry, material );
	        if ( !iteeValidators.isNotDefined( data.type ) ) {
	            object.name = ''.concat( data.type, '_' ).concat( data.numero_bloc, '_' ).concat( data.id );
	        } else {
	            object.name = ''.concat( data.id );
	        }

	        return object

	    }

	    _parsePoint ( data, color ) {

	        const geoJson   = JSON.parse( data.geojson );
	        const positions = geoJson.coordinates.reduce( ( acc, val ) => acc.concat( val ), [] );

	        if ( iteeValidators.isNotDefined( positions ) ) {
	            throw new Error( 'FilairesManager._parsePoint() : '.concat( data.type, ' geometry doesn\'t contains coordinates !!!' ) )
	        }

	        let geometry = new threeFull.SphereBufferGeometry( parseFloat( data.attribut ), 50, 50, 0, Math.PI * 2, 0, Math.PI * 2 );
	        geometry.computeVertexNormals();

	        let material = new threeFull.MeshPhongMaterial( { color: color } );
	        let object   = new threeFull.Mesh( geometry, material );

	        object.position.set( positions[ '0' ], positions[ '1' ], positions[ '2' ] );

	        if ( !iteeValidators.isNotDefined( data.type ) ) {
	            object.name = ''.concat( data.type, '_' ).concat( data.numero_bloc, '_' ).concat( data.id );
	        } else {
	            object.name = ''.concat( data.id );
	        }

	        return object

	    }

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @class GeometriesManager
	 * @classdesc Todo...
	 * @example Todo...
	 *
	 * @requires {@link TDataBaseManager}
	 * @requires '../../../node_modules/three/src/core/Geometry'
	 * @requires { BufferGeometry } from 'three'
	 * @requires '../../../node_modules/three/src/core/BufferAttribute'
	 *
	 */

	const ArrayType = {
	    Int8Array:         0,
	    Uint8Array:        1,
	    Uint8ClampedArray: 2,
	    Int16Array:        3,
	    Uint16Array:       4,
	    Int32Array:        5,
	    Uint32Array:       6,
	    Float32Array:      7,
	    Float64Array:      8
	};

	class GeometriesManager extends iteeClient.TDataBaseManager {

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
	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Compute bounding box cannot be null ! Expect a boolean.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Compute bounding box cannot be undefined ! Expect a boolean.' ) }
	        if ( iteeValidators.isNotBoolean( value ) ) { throw new TypeError( `Compute bounding box cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

	        this._computeBoundingBox = value;
	    }

	    get computeBoundingSphere () {
	        return this._computeBoundingSphere
	    }

	    set computeBoundingSphere ( value ) {
	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Compute bounding sphere cannot be null ! Expect a boolean.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Compute bounding sphere cannot be undefined ! Expect a boolean.' ) }
	        if ( iteeValidators.isNotBoolean( value ) ) { throw new TypeError( `Compute bounding sphere cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

	        this._computeBoundingSphere = value;
	    }

	    get computeNormals () {
	        return this._computeNormals
	    }

	    set computeNormals ( value ) {
	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Compute normals cannot be null ! Expect a boolean.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Compute normals cannot be undefined ! Expect a boolean.' ) }
	        if ( iteeValidators.isNotBoolean( value ) ) { throw new TypeError( `Compute normals cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

	        this._computeNormals = value;
	    }

	    get projectionSystem () {
	        return this._projectionSystem
	    }

	    set projectionSystem ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Projection system cannot be null ! Expect a positive number.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Projection system cannot be undefined ! Expect a positive number.' ) }

	        this._projectionSystem = value;

	    }

	    get globalScale () {
	        return this._globalScale
	    }

	    set globalScale ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a positive number.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }

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
	        const datas   = ( iteeValidators.isObject( jsonData ) ) ? [ jsonData ] : jsonData;
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
	                geometry = new threeFull.BoxGeometry();
	                break

	            case 'CircleGeometry':
	                geometry = new threeFull.CircleGeometry();
	                break

	            case 'CylinderGeometry':
	                geometry = new threeFull.CylinderGeometry();
	                break

	            case 'ConeGeometry':
	                geometry = new threeFull.ConeGeometry();
	                break

	            case 'EdgesGeometry':
	                geometry = new threeFull.EdgesGeometry();
	                break

	            case 'DodecahedronGeometry':
	                geometry = new threeFull.DodecahedronGeometry();
	                break

	            case 'ExtrudeGeometry':
	                geometry = new threeFull.ExtrudeGeometry();
	                break

	            case 'Geometry':
	                geometry = new threeFull.Geometry();
	                break

	            case 'IcosahedronGeometry':
	                geometry = new threeFull.IcosahedronGeometry();
	                break

	            case 'LatheGeometry':
	                geometry = new threeFull.LatheGeometry();
	                break

	            case 'OctahedronGeometry':
	                geometry = new threeFull.OctahedronGeometry();
	                break

	            case 'ParametricGeometry':
	                geometry = new threeFull.ParametricGeometry();
	                break

	            case 'PlaneGeometry':
	                geometry = new threeFull.PlaneGeometry();
	                break

	            case 'PolyhedronGeometry':
	                geometry = new threeFull.PolyhedronGeometry();
	                break

	            case 'RingGeometry':
	                geometry = new threeFull.RingGeometry();
	                break

	            case 'ShapeGeometry':
	                geometry = new threeFull.ShapeGeometry();
	                break

	            case 'TetrahedronGeometry':
	                geometry = new threeFull.TetrahedronGeometry();
	                break

	            case 'TextGeometry':
	                geometry = new threeFull.TextGeometry();
	                break

	            case 'TorusGeometry':
	                geometry = new threeFull.TorusGeometry();
	                break

	            case 'TorusKnotGeometry':
	                geometry = new threeFull.TorusKnotGeometry();
	                break

	            case 'TubeGeometry':
	                geometry = new threeFull.TubeGeometry();
	                break

	            case 'SphereGeometry':
	                geometry = new threeFull.SphereGeometry();
	                break

	            case 'WireframeGeometry':
	                geometry = new threeFull.WireframeGeometry();
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
	            vertices.push( new threeFull.Vector3( vertex.x, vertex.y, vertex.z ) );

	        }
	        geometry.vertices = vertices;
	        //                geometry.colors                  = data.colors

	        var faces = [];
	        var face  = undefined;
	        for ( var faceIndex = 0, numberOfFaces = data.faces.length ; faceIndex < numberOfFaces ; faceIndex++ ) {
	            face = data.faces[ faceIndex ];
	            faces.push( new threeFull.Face3( face.a, face.b, face.c, face.normal, face.color, face.materialIndex ) );
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
	                bufferGeometry = new threeFull.BoxBufferGeometry();
	                break

	            case 'BufferGeometry':
	                bufferGeometry = new threeFull.BufferGeometry();
	                break

	            case 'CircleBufferGeometry':
	                bufferGeometry = new threeFull.CircleBufferGeometry();
	                break

	            case 'CylinderBufferGeometry':
	                bufferGeometry = new threeFull.CylinderBufferGeometry();
	                break

	            case 'ConeBufferGeometry':
	                bufferGeometry = new threeFull.ConeBufferGeometry();
	                break

	            case 'DodecahedronBufferGeometry':
	                bufferGeometry = new threeFull.DodecahedronBufferGeometry();
	                break

	            case 'ExtrudeBufferGeometry':
	                bufferGeometry = new threeFull.ExtrudeBufferGeometry();
	                break

	            case 'IcosahedronBufferGeometry':
	                bufferGeometry = new threeFull.IcosahedronBufferGeometry();
	                break

	            case 'LatheBufferGeometry':
	                bufferGeometry = new threeFull.LatheBufferGeometry();
	                break

	            case 'OctahedronBufferGeometry':
	                bufferGeometry = new threeFull.OctahedronBufferGeometry();
	                break

	            case 'ParametricBufferGeometry':
	                bufferGeometry = new threeFull.ParametricBufferGeometry();
	                break

	            case 'PlaneBufferGeometry':
	                bufferGeometry = new threeFull.PlaneBufferGeometry();
	                break

	            case 'PolyhedronBufferGeometry':
	                bufferGeometry = new threeFull.PolyhedronBufferGeometry();
	                break

	            case 'RingBufferGeometry':
	                bufferGeometry = new threeFull.RingBufferGeometry();
	                break

	            case 'ShapeBufferGeometry':
	                bufferGeometry = new threeFull.BufferGeometry();
	                //                bufferGeometry = new ShapeBufferGeometry(  )
	                break

	            case 'TetrahedronBufferGeometry':
	                bufferGeometry = new threeFull.TetrahedronBufferGeometry();
	                break

	            case 'TextBufferGeometry':
	                bufferGeometry = new threeFull.TextBufferGeometry();
	                break

	            case 'TorusBufferGeometry':
	                bufferGeometry = new threeFull.TorusBufferGeometry();
	                break

	            case 'TorusKnotBufferGeometry':
	                bufferGeometry = new threeFull.TorusKnotBufferGeometry();
	                break

	            case 'TubeBufferGeometry':
	                bufferGeometry = new threeFull.TubeBufferGeometry();
	                break

	            case 'SphereBufferGeometry':
	                bufferGeometry = new threeFull.SphereBufferGeometry();
	                break

	            case 'InstancedBufferGeometry':
	                bufferGeometry = new threeFull.InstancedBufferGeometry();
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
	            bufferGeometry.index = new threeFull.BufferAttribute( typedArray, dataIndexes.itemSize, dataIndexes.normalized );

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

	                attributes[ 'position' ] = new threeFull.BufferAttribute( positionArray, positionAttributes.itemSize, positionAttributes.normalized );

	            }

	            const normalAttributes = dataAttributes.normal;
	            if ( normalAttributes ) {

	                const arrayBuffer      = this.__convertBase64ToArrayBuffer( normalAttributes.array );
	                const typedArray       = this.__convertArrayBufferToTypedArray( arrayBuffer );
	                attributes[ 'normal' ] = new threeFull.BufferAttribute( typedArray, normalAttributes.itemSize, normalAttributes.normalized );

	            }

	            const uvAttributes = dataAttributes.uv;
	            if ( uvAttributes ) {

	                const arrayBuffer  = this.__convertBase64ToArrayBuffer( uvAttributes.array );
	                const typedArray   = this.__convertArrayBufferToTypedArray( arrayBuffer );
	                attributes[ 'uv' ] = new threeFull.BufferAttribute( typedArray, uvAttributes.itemSize, uvAttributes.normalized );

	            }

	            bufferGeometry.attributes = attributes;

	        }

	        if ( iteeValidators.isDefined( data.groups ) ) {
	            bufferGeometry.groups = data.groups;
	        }

	        // Need to set null because only checked vs undefined data.boundingBox
	        if ( iteeValidators.isDefined( data.boundingBox ) ) {
	            bufferGeometry.boundingBox = data.boundingBox;
	        }

	        // idem... data.boundingSphere
	        if ( iteeValidators.isDefined( data.boundingSphere ) ) {
	            bufferGeometry.boundingSphere = data.boundingSphere;
	        }

	        //        if ( isDefined( data.drawRange ) ) {
	        //            bufferGeometry.drawRange = data.drawRange
	        //        }

	        if ( bufferGeometryType === 'ShapeBufferGeometry' ) {

	            bufferGeometry.shapes        = data.shapes.map( jsonShape => {return new threeFull.Shape().fromJSON( jsonShape )} );
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
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @file Todo
	 *
	 * @example Todo
	 *
	 */

	/**
	 *
	 * @constructor
	 */
	function TexturesManager () {

	    iteeClient.TDataBaseManager.call( this );
	    this.basePath = '/textures';

	}

	TexturesManager.prototype = Object.assign( Object.create( iteeClient.TDataBaseManager.prototype ), {

	    /**
	     *
	     */
	    constructor: TexturesManager,

	    /**
	     *
	     * @param data
	     * @return {*}
	     */
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

	} );

	Object.defineProperties( TexturesManager.prototype, {

	    /**
	     *
	     */
	    _onJson: {
	        value: function _onJson ( jsonData, onSuccess, onProgress, onError ) {

	            // Normalize to array
	            const datas   = ( iteeValidators.isObject( jsonData ) ) ? [ jsonData ] : jsonData;
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

	} );

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @class TScenesManager
	 * @classdesc Todo...
	 * @example Todo...
	 * @requires TDataBaseManager
	 *
	 */

	const DEFAULT_IMAGE = new threeFull.ImageLoader().load( 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH4gkKDRoGpGNegQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAAAMSURBVAjXY/j//z8ABf4C/tzMWecAAAAASUVORK5CYII=' );

	class MaterialsManager extends iteeClient.TDataBaseManager {

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
	                basePath:         '/materials',
	                texturesPath:     '/textures',
	                texturesProvider: new threeFull.TextureLoader(),
	                generateMipmap:   false,
	                autoFillTextures: true
	            }, ...parameters
	        };

	        super( _parameters );

	        this.texturesPath     = _parameters.texturesPath;
	        this.texturesProvider = _parameters.texturesProvider;
	        this.generateMipmap   = _parameters.generateMipmap;
	        this.autoFillTextures = _parameters.autoFillTextures;

	    }

	    get texturesPath () {
	        return this._texturesPath
	    }

	    set texturesPath ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Textures path cannot be null ! Expect a non empty string.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Textures path cannot be undefined ! Expect a non empty string.' ) }
	        if ( iteeValidators.isNotString( value ) ) { throw new TypeError( `Textures path cannot be an instance of ${ value.constructor.name } ! Expect a non empty string.` ) }
	        if ( iteeValidators.isEmptyString( value ) ) { throw new TypeError( 'Textures path cannot be empty ! Expect a non empty string.' ) }
	        if ( iteeValidators.isBlankString( value ) ) { throw new TypeError( 'Textures path cannot contain only whitespace ! Expect a non empty string.' ) }

	        this._texturesPath = value;

	    }

	    get texturesProvider () {
	        return this._texturesProvider
	    }

	    set texturesProvider ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Textures provider cannot be null ! Expect an instance of TextureLoader.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Textures provider cannot be undefined ! Expect an instance of TextureLoader.' ) }
	        if ( !( value instanceof TexturesManager ) && !( value instanceof threeFull.TextureLoader ) ) { throw new TypeError( `Textures provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TTexturesManager.` ) }

	        this._texturesProvider = value;

	    }

	    get generateMipmap () {
	        return this._generateMipmap
	    }

	    set generateMipmap ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Generate mipmap cannot be null ! Expect a boolean.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Generate mipmap cannot be undefined ! Expect a boolean.' ) }
	        if ( iteeValidators.isNotBoolean( value ) ) { throw new TypeError( `Generate mipmap cannot be an instance of ${ value.constructor.name } ! Expect a boolean.` ) }

	        this._generateMipmap = value;
	    }

	    get autoFillTextures () {
	        return this._autoFillTextures
	    }

	    set autoFillTextures ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }
	        if ( iteeValidators.isNotBoolean( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }

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
	        const datas   = ( iteeValidators.isObject( jsonData ) ) ? [ jsonData ] : jsonData;
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
	                material = new threeFull.MeshPhongMaterial();
	                this._fillBaseMaterialData( material, data );

	                const color = data.color;
	                if ( iteeValidators.isDefined( color ) ) {
	                    material.color = this._setColor( color );
	                }

	                const specular = data.specular;
	                if ( iteeValidators.isDefined( specular ) ) {
	                    material.specular = this._setColor( specular );
	                }

	                const shininess = data.shininess;
	                if ( iteeValidators.isDefined( shininess ) ) {
	                    material.shininess = shininess;
	                }

	                const map = data.map;
	                if ( iteeValidators.isDefined( map ) ) {
	                    material.map = map;
	                }

	                const lightMap = data.lightMap;
	                if ( iteeValidators.isDefined( lightMap ) ) {
	                    material.lightMap = lightMap;
	                }

	                const lightMapIntensity = data.lightMapIntensity;
	                if ( iteeValidators.isDefined( lightMapIntensity ) ) {
	                    material.lightMapIntensity = lightMapIntensity;
	                }

	                const aoMap = data.aoMap;
	                if ( iteeValidators.isDefined( aoMap ) ) {
	                    material.aoMap = aoMap;
	                }

	                const aoMapIntensity = data.aoMapIntensity;
	                if ( iteeValidators.isDefined( aoMapIntensity ) ) {
	                    material.aoMapIntensity = aoMapIntensity;
	                }

	                const emissive = data.emissive;
	                if ( iteeValidators.isDefined( emissive ) ) {
	                    material.emissive = this._setColor( emissive );
	                }

	                const emissiveIntensity = data.emissiveIntensity;
	                if ( iteeValidators.isDefined( emissiveIntensity ) ) {
	                    material.emissiveIntensity = emissiveIntensity;
	                }

	                const emissiveMap = data.emissiveMap;
	                if ( iteeValidators.isDefined( emissiveMap ) ) {
	                    material.emissiveMap = emissiveMap;
	                }

	                const bumpMap = data.bumpMap;
	                if ( iteeValidators.isDefined( bumpMap ) ) {
	                    material.bumpMap = bumpMap;
	                }

	                const bumpScale = data.bumpScale;
	                if ( iteeValidators.isDefined( bumpScale ) ) {
	                    material.bumpScale = bumpScale;
	                }

	                const normalMap = data.normalMap;
	                if ( iteeValidators.isDefined( normalMap ) ) {
	                    material.normalMap = normalMap;
	                }

	                const normalScale = data.normalScale;
	                if ( iteeValidators.isDefined( normalScale ) ) {
	                    material.normalScale = this._setVector2( normalScale );
	                }

	                const displacementMap = data.displacementMap;
	                if ( iteeValidators.isDefined( displacementMap ) ) {
	                    material.displacementMap = displacementMap;
	                }

	                const displacementScale = data.displacementScale;
	                if ( iteeValidators.isDefined( displacementScale ) ) {
	                    material.displacementScale = displacementScale;
	                }

	                const displacementBias = data.displacementBias;
	                if ( iteeValidators.isDefined( displacementBias ) ) {
	                    material.displacementBias = displacementBias;
	                }

	                const specularMap = data.specularMap;
	                if ( iteeValidators.isDefined( specularMap ) ) {
	                    material.specularMap = specularMap;
	                }

	                const alphaMap = data.alphaMap;
	                if ( iteeValidators.isDefined( alphaMap ) ) {
	                    material.alphaMap = alphaMap;
	                }

	                const envMap = data.envMap;
	                if ( iteeValidators.isDefined( envMap ) ) {
	                    material.envMap = envMap;
	                }

	                const combine = data.combine;
	                if ( iteeValidators.isDefined( combine ) ) {
	                    material.combine = combine;
	                }

	                const reflectivity = data.reflectivity;
	                if ( iteeValidators.isDefined( reflectivity ) ) {
	                    material.reflectivity = reflectivity;
	                }

	                const refractionRatio = data.refractionRatio;
	                if ( iteeValidators.isDefined( refractionRatio ) ) {
	                    material.refractionRatio = refractionRatio;
	                }

	                const wireframe = data.wireframe;
	                if ( iteeValidators.isDefined( wireframe ) ) {
	                    material.wireframe = wireframe;
	                }

	                const wireframeLinewidth = data.wireframeLinewidth;
	                if ( iteeValidators.isDefined( wireframeLinewidth ) ) {
	                    material.wireframeLinewidth = wireframeLinewidth;
	                }

	                const wireframeLinecap = data.wireframeLinecap;
	                if ( iteeValidators.isDefined( wireframeLinecap ) ) {
	                    material.wireframeLinecap = wireframeLinecap;
	                }

	                const wireframeLinejoin = data.wireframeLinejoin;
	                if ( iteeValidators.isDefined( wireframeLinejoin ) ) {
	                    material.wireframeLinejoin = wireframeLinejoin;
	                }

	                const skinning = data.skinning;
	                if ( iteeValidators.isDefined( skinning ) ) {
	                    material.skinning = skinning;
	                }

	                const morphTargets = data.morphTargets;
	                if ( iteeValidators.isDefined( morphTargets ) ) {
	                    material.morphTargets = morphTargets;
	                }

	                const morphNormals = data.morphNormals;
	                if ( iteeValidators.isDefined( morphNormals ) ) {
	                    material.morphNormals = morphNormals;
	                }

	            }
	                break

	            case 'MeshLambertMaterial': {
	                material = new threeFull.MeshLambertMaterial();
	                this._fillBaseMaterialData( material, data );

	                const color = data.color;
	                if ( iteeValidators.isDefined( color ) ) {
	                    material.color = this._setColor( color );
	                }

	                const map = data.map;
	                if ( iteeValidators.isDefined( map ) ) {
	                    material.map = map;
	                }

	                const lightMap = data.lightMap;
	                if ( iteeValidators.isDefined( lightMap ) ) {
	                    material.lightMap = lightMap;
	                }

	                const lightMapIntensity = data.lightMapIntensity;
	                if ( iteeValidators.isDefined( lightMapIntensity ) ) {
	                    material.lightMapIntensity = lightMapIntensity;
	                }

	                const aoMap = data.aoMap;
	                if ( iteeValidators.isDefined( aoMap ) ) {
	                    material.aoMap = aoMap;
	                }

	                const aoMapIntensity = data.aoMapIntensity;
	                if ( iteeValidators.isDefined( aoMapIntensity ) ) {
	                    material.aoMapIntensity = aoMapIntensity;
	                }

	                const emissive = data.emissive;
	                if ( iteeValidators.isDefined( emissive ) ) {
	                    material.emissive = this._setColor( emissive );
	                }

	                const emissiveIntensity = data.emissiveIntensity;
	                if ( iteeValidators.isDefined( emissiveIntensity ) ) {
	                    material.emissiveIntensity = emissiveIntensity;
	                }

	                const emissiveMap = data.emissiveMap;
	                if ( iteeValidators.isDefined( emissiveMap ) ) {
	                    material.emissiveMap = emissiveMap;
	                }

	                const specularMap = data.specularMap;
	                if ( iteeValidators.isDefined( specularMap ) ) {
	                    material.specularMap = specularMap;
	                }

	                const alphaMap = data.alphaMap;
	                if ( iteeValidators.isDefined( alphaMap ) ) {
	                    material.alphaMap = alphaMap;
	                }

	                const envMap = data.envMap;
	                if ( iteeValidators.isDefined( envMap ) ) {
	                    material.envMap = envMap;
	                }

	                const combine = data.combine;
	                if ( iteeValidators.isDefined( combine ) ) {
	                    material.combine = combine;
	                }

	                const reflectivity = data.reflectivity;
	                if ( iteeValidators.isDefined( reflectivity ) ) {
	                    material.reflectivity = reflectivity;
	                }

	                const refractionRatio = data.refractionRatio;
	                if ( iteeValidators.isDefined( refractionRatio ) ) {
	                    material.refractionRatio = refractionRatio;
	                }

	                const wireframe = data.wireframe;
	                if ( iteeValidators.isDefined( wireframe ) ) {
	                    material.wireframe = wireframe;
	                }

	                const wireframeLinewidth = data.wireframeLinewidth;
	                if ( iteeValidators.isDefined( wireframeLinewidth ) ) {
	                    material.wireframeLinewidth = wireframeLinewidth;
	                }

	                const wireframeLinecap = data.wireframeLinecap;
	                if ( iteeValidators.isDefined( wireframeLinecap ) ) {
	                    material.wireframeLinecap = wireframeLinecap;
	                }

	                const wireframeLinejoin = data.wireframeLinejoin;
	                if ( iteeValidators.isDefined( wireframeLinejoin ) ) {
	                    material.wireframeLinejoin = wireframeLinejoin;
	                }

	                const skinning = data.skinning;
	                if ( iteeValidators.isDefined( skinning ) ) {
	                    material.skinning = skinning;
	                }

	                const morphTargets = data.morphTargets;
	                if ( iteeValidators.isDefined( morphTargets ) ) {
	                    material.morphTargets = morphTargets;
	                }

	                const morphNormals = data.morphNormals;
	                if ( iteeValidators.isDefined( morphNormals ) ) {
	                    material.morphNormals = morphNormals;
	                }

	            }
	                break

	            case 'LineBasicMaterial': {
	                material = new threeFull.LineBasicMaterial();
	                this._fillBaseMaterialData( material, data );

	                const color = data.color;
	                if ( iteeValidators.isDefined( color ) ) {
	                    material.color = this._setColor( color );
	                }

	            }
	                break

	            case 'PointsMaterial': {
	                material = new threeFull.PointsMaterial();
	                this._fillBaseMaterialData( material, data );

	                const color = data.color;
	                if ( iteeValidators.isDefined( color ) ) {
	                    material.color = this._setColor( color );
	                }

	                const map = data.map;
	                if ( iteeValidators.isDefined( map ) ) {
	                    material.map = map;
	                }

	                const morphTargets = data.morphTargets;
	                if ( iteeValidators.isDefined( morphTargets ) ) {
	                    material.morphTargets = morphTargets;
	                }

	                const size = data.size;
	                if ( iteeValidators.isDefined( size ) ) {
	                    material.size = size;
	                }

	                const sizeAttenuation = data.sizeAttenuation;
	                if ( iteeValidators.isDefined( sizeAttenuation ) ) {
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
	        if ( iteeValidators.isDefined( _id ) && iteeValidators.isString( _id ) ) {
	            material._id = _id;
	        }

	        const uuid = data.uuid;
	        if ( iteeValidators.isDefined( uuid ) && iteeValidators.isString( uuid ) ) {
	            material.uuid = uuid;
	        }

	        const name = data.name;
	        if ( iteeValidators.isDefined( name ) && iteeValidators.isString( name ) ) {
	            material.name = name;
	        }

	        const fog = data.fog;
	        if ( iteeValidators.isDefined( fog ) ) {
	            material.fog = fog;
	        }

	        const lights = data.lights;
	        if ( iteeValidators.isDefined( lights ) ) {
	            material.lights = lights;
	        }

	        const blending = data.blending;
	        if ( iteeValidators.isDefined( blending ) ) {
	            material.blending = blending;
	        }

	        const side = data.side;
	        if ( iteeValidators.isDefined( side ) ) {
	            material.side = side;
	        }

	        const flatShading = data.flatShading;
	        if ( iteeValidators.isDefined( flatShading ) ) {
	            material.flatShading = flatShading;
	        }

	        const vertexColors = data.vertexColors;
	        if ( iteeValidators.isDefined( vertexColors ) ) {
	            material.vertexColors = vertexColors;
	        }

	        const opacity = data.opacity;
	        if ( iteeValidators.isDefined( opacity ) ) {
	            material.opacity = opacity;
	        }

	        const transparent = data.transparent;
	        if ( iteeValidators.isDefined( transparent ) ) {
	            material.transparent = transparent;
	        }

	        const blendSrc = data.blendSrc;
	        if ( iteeValidators.isDefined( blendSrc ) ) {
	            material.blendSrc = blendSrc;
	        }

	        const blendDst = data.blendDst;
	        if ( iteeValidators.isDefined( blendDst ) ) {
	            material.blendDst = blendDst;
	        }

	        const blendEquation = data.blendEquation;
	        if ( iteeValidators.isDefined( blendEquation ) ) {
	            material.blendEquation = blendEquation;
	        }

	        const blendSrcAlpha = data.blendSrcAlpha;
	        if ( iteeValidators.isDefined( blendSrcAlpha ) ) {
	            material.blendSrcAlpha = blendSrcAlpha;
	        }

	        const blendDstAlpha = data.blendDstAlpha;
	        if ( iteeValidators.isDefined( blendDstAlpha ) ) {
	            material.blendDstAlpha = blendDstAlpha;
	        }

	        const blendEquationAlpha = data.blendEquationAlpha;
	        if ( iteeValidators.isDefined( blendEquationAlpha ) ) {
	            material.blendEquationAlpha = blendEquationAlpha;
	        }

	        const depthFunc = data.depthFunc;
	        if ( iteeValidators.isDefined( depthFunc ) ) {
	            material.depthFunc = depthFunc;
	        }

	        const depthTest = data.depthTest;
	        if ( iteeValidators.isDefined( depthTest ) ) {
	            material.depthTest = depthTest;
	        }

	        const depthWrite = data.depthWrite;
	        if ( iteeValidators.isDefined( depthWrite ) ) {
	            material.depthWrite = depthWrite;
	        }

	        const clippingPlanes = data.clippingPlanes;
	        if ( iteeValidators.isDefined( clippingPlanes ) ) {
	            material.clippingPlanes = clippingPlanes;
	        }

	        const clipIntersection = data.clipIntersection;
	        if ( iteeValidators.isDefined( clipIntersection ) ) {
	            material.clipIntersection = clipIntersection;
	        }

	        const clipShadows = data.clipShadows;
	        if ( iteeValidators.isDefined( clipShadows ) ) {
	            material.clipShadows = clipShadows;
	        }

	        const colorWrite = data.colorWrite;
	        if ( iteeValidators.isDefined( colorWrite ) ) {
	            material.colorWrite = colorWrite;
	        }

	        const precision = data.precision;
	        if ( iteeValidators.isDefined( precision ) ) {
	            material.precision = precision;
	        }

	        const polygonOffset = data.polygonOffset;
	        if ( iteeValidators.isDefined( polygonOffset ) ) {
	            material.polygonOffset = polygonOffset;
	        }

	        const polygonOffsetFactor = data.polygonOffsetFactor;
	        if ( iteeValidators.isDefined( polygonOffsetFactor ) ) {
	            material.polygonOffsetFactor = polygonOffsetFactor;
	        }

	        const polygonOffsetUnits = data.polygonOffsetUnits;
	        if ( iteeValidators.isDefined( polygonOffsetUnits ) ) {
	            material.polygonOffsetUnits = polygonOffsetUnits;
	        }

	        const dithering = data.dithering;
	        if ( iteeValidators.isDefined( dithering ) ) {
	            material.dithering = dithering;
	        }

	        const alphaTest = data.alphaTest;
	        if ( iteeValidators.isDefined( alphaTest ) ) {
	            material.alphaTest = alphaTest;
	        }

	        const premultipliedAlpha = data.premultipliedAlpha;
	        if ( iteeValidators.isDefined( premultipliedAlpha ) ) {
	            material.premultipliedAlpha = premultipliedAlpha;
	        }

	        const overdraw = data.overdraw;
	        if ( iteeValidators.isDefined( overdraw ) ) {
	            material.overdraw = overdraw;
	        }

	        const visible = data.visible;
	        if ( iteeValidators.isDefined( visible ) ) {
	            material.visible = visible;
	        }

	        const userData = data.userData;
	        if ( iteeValidators.isDefined( userData ) ) {
	            material.userData = userData;
	        }

	        const needsUpdate = data.needsUpdate;
	        if ( iteeValidators.isDefined( needsUpdate ) ) {
	            material.needsUpdate = needsUpdate;
	        }

	    }

	    _setVector2 ( vec2 ) {

	        const x = vec2.x;
	        const y = vec2.y;
	        if ( iteeValidators.isNotDefined( x ) || iteeValidators.isNotDefined( y ) ) {
	            throw new Error( 'MaterialsManager: Unable to convert null or undefined vector 2 !' )
	        }

	        return new threeFull.Vector2( x, y )

	    }

	    _setColor ( color ) {

	        const r = color.r;
	        const g = color.g;
	        const b = color.b;
	        if ( iteeValidators.isNotDefined( r ) || iteeValidators.isNotDefined( g ) || iteeValidators.isNotDefined( b ) ) {
	            throw new Error( 'MaterialsManager: Unable to convert null or undefined color !' )
	        }

	        return new threeFull.Color( r, g, b )

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
	                if ( iteeValidators.isDefined( map ) && iteeValidators.isString( map ) && iteeValidators.isNotEmptyString( map ) ) {

	                    const texturePath  = `${ this._texturesPath }/${ map }`;
	                    const cachedResult = localCache[ texturePath ];

	                    if ( iteeValidators.isDefined( cachedResult ) ) {

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
	                            texture.magFilter       = threeFull.LinearFilter;
	                            texture.minFilter       = threeFull.LinearFilter;
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
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @class ClassName
	 * @classdesc Todo...
	 * @example Todo...
	 *
	 */

	class ObjectsManager extends iteeClient.TDataBaseManager {

	    /**
	     *
	     * @param parameters
	     */
	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                basePath:           '/objects',
	                geometriesProvider: new GeometriesManager(),
	                materialsProvider:  new MaterialsManager(),
	                projectionSystem:   'zBack',
	                globalScale:        1,
	                autoFillObjects3D:  true
	            }, ...parameters
	        };

	        super( _parameters );

	        this.geometriesProvider = _parameters.geometriesProvider;
	        this.materialsProvider  = _parameters.materialsProvider;
	        this.projectionSystem   = _parameters.projectionSystem;
	        this.globalScale        = _parameters.globalScale;
	        this.autoFillObjects3D  = _parameters.autoFillObjects3D;

	    }

	    //// Getter/Setter

	    get geometriesProvider () {
	        return this._geometriesProvider
	    }

	    set geometriesProvider ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Geometries provider cannot be null ! Expect an instance of GeometriesManager.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Geometries provider cannot be undefined ! Expect an instance of GeometriesManager.' ) }
	        if ( !( value instanceof GeometriesManager ) ) { throw new TypeError( `Geometries provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TGeometriesManager.` ) }

	        this._geometriesProvider = value;

	    }

	    get materialsProvider () {
	        return this._materialsProvider
	    }

	    set materialsProvider ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Materials provider cannot be null ! Expect an instance of MaterialsManager.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Materials provider cannot be undefined ! Expect an instance of MaterialsManager.' ) }
	        if ( !( value instanceof MaterialsManager ) ) { throw new TypeError( `Materials provider cannot be an instance of ${ value.constructor.name } ! Expect an instance of TMaterialsManager.` ) }

	        this._materialsProvider = value;

	    }

	    get projectionSystem () {
	        return this._projectionSystem
	    }

	    set projectionSystem ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Projection system cannot be null ! Expect a positive number.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Projection system cannot be undefined ! Expect a positive number.' ) }

	        this._projectionSystem = value;

	    }

	    get globalScale () {
	        return this._globalScale
	    }

	    set globalScale ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a positive number.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }

	        this._globalScale = value;

	    }

	    get autoFillObjects3D () {
	        return this._autoFillObjects3D
	    }

	    set autoFillObjects3D ( value ) {

	        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }
	        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Global scale cannot be undefined ! Expect a positive number.' ) }
	        if ( iteeValidators.isNotBoolean( value ) ) { throw new TypeError( 'Global scale cannot be null ! Expect a boolean.' ) }

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
	                object = new threeFull.Object3D();
	                this._fillBaseObjectsData( object, data );
	                break

	            case 'Scene':
	                object = new threeFull.Scene();
	                this._fillBaseObjectsData( object, data );
	                if ( iteeValidators.isDefined( data.background ) ) {

	                    if ( Number.isInteger( data.background ) ) {

	                        object.background = new threeFull.Color( data.background );

	                    }

	                }
	                if ( iteeValidators.isDefined( data.fog ) ) {

	                    if ( data.fog.type === 'Fog' ) {

	                        object.fog = new threeFull.Fog( data.fog.color, data.fog.near, data.fog.far );

	                    } else if ( data.fog.type === 'FogExp2' ) {

	                        object.fog = new threeFull.FogExp2( data.fog.color, data.fog.density );

	                    }

	                }
	                object.overrideMaterial = data.overrideMaterial;
	                object.autoUpdate       = data.autoUpdate;
	                break

	            case 'PerspectiveCamera':
	                object = new threeFull.PerspectiveCamera();
	                this._fillBaseObjectsData( object, data );
	                object.fov    = data.fov;
	                object.aspect = data.aspect;
	                object.near   = data.near;
	                object.far    = data.far;
	                if ( iteeValidators.isDefined( data.focus ) ) {
	                    object.focus = data.focus;
	                }
	                if ( iteeValidators.isDefined( data.zoom ) ) {
	                    object.zoom = data.zoom;
	                }
	                if ( iteeValidators.isDefined( data.filmGauge ) ) {
	                    object.filmGauge = data.filmGauge;
	                }
	                if ( iteeValidators.isDefined( data.filmOffset ) ) {
	                    object.filmOffset = data.filmOffset;
	                }
	                if ( iteeValidators.isDefined( data.view ) ) {
	                    object.view = Object.assign( {}, data.view );
	                }
	                break

	            case 'OrthographicCamera':
	                object = new threeFull.OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );
	                this._fillBaseObjectsData( object, data );
	                break

	            case 'AmbientLight':
	                object = new threeFull.AmbientLight( data.color, data.intensity );
	                this._fillBaseObjectsData( object, data );
	                break

	            case 'DirectionalLight':
	                object = new threeFull.DirectionalLight( data.color, data.intensity );
	                this._fillBaseObjectsData( object, data );
	                break

	            case 'PointLight':
	                object = new threeFull.PointLight( data.color, data.intensity, data.distance, data.decay );
	                this._fillBaseObjectsData( object, data );
	                break

	            case 'RectAreaLight':
	                object = new threeFull.RectAreaLight( data.color, data.intensity, data.width, data.height );
	                this._fillBaseObjectsData( object, data );
	                break

	            case 'SpotLight':
	                object = new threeFull.SpotLight( data.color, data.intensity, data.distance, data.angle, data.penumbra, data.decay );
	                this._fillBaseObjectsData( object, data );
	                break

	            case 'HemisphereLight':
	                object = new threeFull.HemisphereLight( data.color, data.groundColor, data.intensity );
	                this._fillBaseObjectsData( object, data );
	                break

	            case 'SkinnedMesh':
	                object = new threeFull.SkinnedMesh();
	                this._fillBaseObjectsData( object, data );
	                object.geometry          = data.geometry;
	                object.material          = data.material;
	                object.drawMode          = data.drawMode;
	                object.bindMode          = data.bindMode;
	                object.bindMatrix        = data.bindMatrix;
	                object.bindMatrixInverse = data.bindMatrixInverse;
	                break

	            case 'Mesh':
	                object = new threeFull.Mesh();
	                this._fillBaseObjectsData( object, data );
	                object.geometry = data.geometry;
	                object.material = data.material;
	                object.drawMode = data.drawMode;
	                break

	            case 'LOD':
	                object = new threeFull.LOD();
	                this._fillBaseObjectsData( object, data );
	                object.levels = data.levels;
	                break

	            case 'Line':
	                object = new threeFull.Line();
	                this._fillBaseObjectsData( object, data );
	                object.geometry = data.geometry;
	                object.material = data.material;
	                object.drawMode = data.drawMode;
	                break

	            case 'LineLoop':
	                object = new threeFull.LineLoop();
	                this._fillBaseObjectsData( object, data );
	                object.geometry = data.geometry;
	                object.material = data.material;
	                object.drawMode = data.drawMode;
	                break

	            case 'LineSegments':
	                object = new threeFull.LineSegments();
	                this._fillBaseObjectsData( object, data );
	                object.geometry = data.geometry;
	                object.material = data.material;
	                object.drawMode = data.drawMode;
	                break

	            case 'Points':
	                object = new threeFull.Points();
	                this._fillBaseObjectsData( object, data );
	                object.geometry = data.geometry;
	                object.material = data.material;
	                object.drawMode = data.drawMode;
	                break

	            case 'Sprite':
	                object = new threeFull.Sprite();
	                this._fillBaseObjectsData( object, data );
	                object.material = data.material;
	                break

	            case 'Group':
	                object = new threeFull.Group();
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

	        if ( iteeValidators.isDefined( data.uuid ) ) {
	            object.uuid = data.uuid;
	        }

	        if ( iteeValidators.isDefined( data.name ) ) {
	            object.name = data.name;
	        }

	        // IMPLICIT
	        //        if ( isDefined( data.type ) ) {
	        //            object.type = data.type
	        //        }

	        if ( iteeValidators.isDefined( data.parent ) ) {
	            object.parent = data.parent;
	        }

	        if ( iteeValidators.isNotEmptyArray( data.children ) ) {
	            object.children = data.children;
	        }

	        if ( iteeValidators.isDefined( data.up ) ) {
	            object.up.x = data.up.x;
	            object.up.y = data.up.y;
	            object.up.z = data.up.z;
	        }

	        if ( iteeValidators.isDefined( data.position ) ) {

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

	        if ( iteeValidators.isDefined( data.rotation ) ) {

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

	        if ( iteeValidators.isDefined( data.quaternion ) ) {

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

	        if ( iteeValidators.isDefined( data.scale ) ) {

	            if ( data.scale.x !== 0 && data.scale.y !== 0 && data.scale.z !== 0 ) {
	                object.scale.x = data.scale.x;
	                object.scale.y = data.scale.y;
	                object.scale.z = data.scale.z;
	            } else {
	                console.warn( 'Try to assign null scale !' );
	            }

	        }

	        if ( iteeValidators.isDefined( data.modelViewMatrix ) && iteeValidators.isNotEmptyArray( data.modelViewMatrix ) ) {
	            object.modelViewMatrix.fromArray( data.modelViewMatrix );
	        }

	        if ( iteeValidators.isDefined( data.normalMatrix ) && iteeValidators.isNotEmptyArray( data.normalMatrix ) ) {
	            object.normalMatrix.fromArray( data.normalMatrix );
	        }

	        if ( iteeValidators.isDefined( data.matrix ) && iteeValidators.isNotEmptyArray( data.matrix ) ) {
	            object.matrix.fromArray( data.matrix );
	        }

	        if ( iteeValidators.isDefined( data.matrixWorld ) && iteeValidators.isNotEmptyArray( data.matrixWorld ) ) {
	            object.matrixWorld.fromArray( data.matrixWorld );
	        }

	        if ( iteeValidators.isDefined( data.matrixAutoUpdate ) ) {
	            object.matrixAutoUpdate = data.matrixAutoUpdate;
	        }

	        if ( iteeValidators.isDefined( data.matrixWorldNeedsUpdate ) ) {
	            object.matrixWorldNeedsUpdate = data.matrixWorldNeedsUpdate;
	        }

	        if ( iteeValidators.isDefined( data.layers ) ) {
	            object.layers.mask = data.layers;
	        }

	        if ( iteeValidators.isDefined( data.visible ) ) {
	            object.visible = data.visible;
	        }

	        if ( iteeValidators.isDefined( data.castShadow ) ) {
	            object.castShadow = data.castShadow;
	        }

	        if ( iteeValidators.isDefined( data.receiveShadow ) ) {
	            object.receiveShadow = data.receiveShadow;
	        }

	        if ( iteeValidators.isDefined( data.frustumCulled ) ) {
	            object.frustumCulled = data.frustumCulled;
	        }

	        if ( iteeValidators.isDefined( data.renderOrder ) ) {
	            object.renderOrder = data.renderOrder;
	        }

	        if ( iteeValidators.isDefined( data.userData ) ) {
	            object.userData = data.userData;
	        }

	    }

	    //// Callback

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
	        this._retrieveGeometriesOf( objectsArray, ( geometries ) => {
	            geometriesMap = geometries;
	            onEndDataFetching();
	        }, onProgress, onError );

	        let materialsMap = undefined;
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
	            console.error( 'Unable to retrieve geometry !!!' );
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
	                    console.error( 'Unable to retrieve material !!!' );
	                    return null
	                }

	                object.material = material.clone();

	            } else {

	                object.material = [];
	                for ( let materialIndex = 0, numberOfMaterial = materialIds.length ; materialIndex < numberOfMaterial ; materialIndex++ ) {
	                    const materialId = materialIds[ materialIndex ];
	                    const material   = materials[ materialId ];
	                    if ( !material ) {
	                        console.error( 'Unable to retrieve material !!!' );
	                        return null
	                    }

	                    object.material.push( material.clone() );
	                }
	            }

	        } else if ( typeof materialIds === 'string' ) {

	            const material = materials[ materialIds ];
	            if ( !material ) {
	                console.error( 'Unable to retrieve material !!!' );
	                return
	            }

	            object.material = material.clone();

	        } else {

	            console.error( 'Invalid material ids, expected string or array of string' );

	        }

	    }

	}

	/**
	 * @author [Tristan Valcke]{@link https://github.com/Itee}
	 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
	 *
	 * @class OrbitControlsHelper
	 * @classdesc Todo...
	 * @example Todo...
	 *
	 */

	class OrbitControlsHelper extends threeFull.LineSegments {

	    constructor ( parameters = {} ) {

	        const _parameters = {
	            ...{
	                radius:     2,
	                radials:    16,
	                circles:    2,
	                divisions:  64,
	                innerColor: new threeFull.Color( 0x444444 ),
	                outerColor: new threeFull.Color( 0x888888 )
	            }, ...parameters
	        };

	        super( OrbitControlsHelper._createInternalGeometry( _parameters.radius, _parameters.radials, _parameters.circles, _parameters.divisions, _parameters.innerColor, _parameters.outerColor ), OrbitControlsHelper._createInternalMaterial() );


	        this.matrixAutoUpdate = false;
	        //        this.control     = control
	        this._intervalId      = undefined;

	        //        this.impose()

	    }

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

	        const positionBufferAttribute = new threeFull.Float32BufferAttribute( vertices, 3 );
	        positionBufferAttribute.name  = 'TOrbitControlsHelperPositionBufferAttribute';

	        const colorBufferAttribute = new threeFull.Float32BufferAttribute( colors, 3 );
	        colorBufferAttribute.name  = 'TOrbitControlsHelperColorBufferAttribute';

	        const geometry = new threeFull.BufferGeometry();
	        geometry.setAttribute( 'position', positionBufferAttribute );
	        geometry.setAttribute( 'color', colorBufferAttribute );
	        geometry.name = 'TOrbitControlsHelperGeometry';

	        return geometry

	    }

	    static _createInternalMaterial () {

	        const material       = new threeFull.LineBasicMaterial( { vertexColors: threeFull.VertexColors } );
	        material.transparent = true;
	        material.opacity     = 0.0;
	        material.name        = 'TOrbitControlsHelperMaterial';

	        return material

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

	exports.ASCLoader = ASCLoader;
	exports.AbstractGizmo = AbstractGizmo;
	exports.AbstractHandle = AbstractHandle;
	exports.AbstractHitbox = AbstractHitbox;
	exports.BufferGeometriesManager = BufferGeometriesManager;
	exports.CameraControlMode = CameraControlMode;
	exports.CameraControls = CameraControls;
	exports.CameraPathController = CameraPathController;
	exports.ClippingBox = ClippingBox;
	exports.ClippingControls = ClippingControls;
	exports.ClippingModes = ClippingModes;
	exports.CurvesManager = CurvesManager;
	exports.CylindricaHitbox = CylindricaHitbox;
	exports.DBFLoader = DBFLoader;
	exports.FilairesManager = FilairesManager;
	exports.GeometriesManager = GeometriesManager;
	exports.HighlightableLineMaterial = HighlightableLineMaterial;
	exports.HighlightableMaterial = HighlightableMaterial;
	exports.LozengeHandle = LozengeHandle;
	exports.LozengeHitbox = LozengeHitbox;
	exports.MaterialsManager = MaterialsManager;
	exports.ObjectsManager = ObjectsManager;
	exports.OctahedricalHandle = OctahedricalHandle;
	exports.OctahedricalHitbox = OctahedricalHitbox;
	exports.OrbitControlsHelper = OrbitControlsHelper;
	exports.PlanarHitbox = PlanarHitbox;
	exports.PlaneHandle = PlaneHandle;
	exports.RZMLLoader = RZMLLoader;
	exports.RotateGizmo = RotateGizmo;
	exports.RotateHandle = RotateHandle;
	exports.SHPLoader = SHPLoader;
	exports.ScaleGizmo = ScaleGizmo;
	exports.ScaleHandle = ScaleHandle;
	exports.ShapeType = ShapeType;
	exports.SphericalHitbox = SphericalHitbox;
	exports.TexturesManager = TexturesManager;
	exports.TorusHitbox = TorusHitbox;
	exports.TranslateGizmo = TranslateGizmo;
	exports.TranslateHandle = TranslateHandle;
	exports.UniversalLoader = UniversalLoader;

	return exports;

}({}, Itee.Client, Three, Itee.Utils, Itee.Validators));
//# sourceMappingURL=itee-plugin-three.iife.js.map