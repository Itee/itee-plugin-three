/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

/**
 * This module load an asc file and store it in database
 *
 * @module Modules/AscFile
 *
 * @author Tristan Valcke <valcke.tristan@gmail.com>
 * @license LGPLv3
 *
 */

const readLine = require( 'readline' )
const fs       = require( 'fs' )

const Mongoose   = require( 'mongoose' )
const WorldCell  = Mongoose.model( 'WorldCell' )
const PointCloud = Mongoose.model( 'PointCloud' )

var _worldBoundingBox = {
    xMin: Number.MAX_VALUE,
    xMax: Number.MIN_VALUE,
    yMin: Number.MAX_VALUE,
    yMax: Number.MIN_VALUE,
    zMin: Number.MAX_VALUE,
    zMax: Number.MIN_VALUE
}
var _lineReader       = null
var _lineCounter      = 0
var _points           = []
var _cubeSize         = 0.255

/*
 * PRIVATE METHODS
 */

/**
 *
 * @param point
 * @param boundingBox
 * @private
 */
function _updateBoundingBox ( point, boundingBox ) {

    if ( point.x < boundingBox.xMin ) { boundingBox.xMin = point.x }
    if ( point.x > boundingBox.xMax ) { boundingBox.xMax = point.x }
    if ( point.y < boundingBox.yMin ) { boundingBox.yMin = point.y }
    if ( point.y > boundingBox.yMax ) { boundingBox.yMax = point.y }
    if ( point.z < boundingBox.zMin ) { boundingBox.zMin = point.z }
    if ( point.z > boundingBox.zMax ) { boundingBox.zMax = point.z }

}

/**
 *
 * @returns {{x: number, y: number, z: number}}
 * @private
 */
function _getWorldOffset () {

    return {
        x: ( _worldBoundingBox.xMin + _worldBoundingBox.xMax ) / 2,
        y: ( _worldBoundingBox.yMin + _worldBoundingBox.yMax ) / 2,
        z: ( _worldBoundingBox.zMin + _worldBoundingBox.zMax ) / 2
    }

}

/**
 *
 * @param offset
 * @returns {{xMin: number, xMax: number, yMin: number, yMax: number, zMin: number, zMax: number, width: number, height: number, depth: number, left: number, right: number, bottom: number, top:
 *     number, back: number, front: number}}
 * @private
 */
function _getOffsetBoundingBox ( offset ) {

    return {
        xMin:   _worldBoundingBox.xMin - offset.x,
        xMax:   _worldBoundingBox.xMax - offset.x,
        yMin:   _worldBoundingBox.yMin - offset.y,
        yMax:   _worldBoundingBox.yMax - offset.y,
        zMin:   _worldBoundingBox.zMin - offset.z,
        zMax:   _worldBoundingBox.zMax - offset.z,
        width:  _worldBoundingBox.xMax - _worldBoundingBox.xMin,
        height: _worldBoundingBox.yMax - _worldBoundingBox.yMin,
        depth:  _worldBoundingBox.zMax - _worldBoundingBox.zMin,
        left:   Math.floor( _worldBoundingBox.xMin - offset.x ),
        right:  Math.ceil( _worldBoundingBox.xMax - offset.x ),
        bottom: Math.floor( _worldBoundingBox.yMin - offset.y ),
        top:    Math.ceil( _worldBoundingBox.yMax - offset.y ),
        back:   Math.floor( _worldBoundingBox.zMin - offset.z ),
        front:  Math.ceil( _worldBoundingBox.zMax - offset.z )
    }

}

/**
 *
 * @param offset
 * @private
 */
function _offsetPoints ( offset ) {

    for ( var pointIndex = 0, numberOfPoints = _points.length ; pointIndex < numberOfPoints ; ++pointIndex ) {

        _points[ pointIndex ].x -= offset.x
        _points[ pointIndex ].y -= offset.y
        _points[ pointIndex ].z -= offset.z

    }

}

/**
 *
 * @param line
 * @private
 */
function _loadFileInMemory ( line, callback ) {

    // Ignore empty line !
    if ( !line ) { return }

    var words         = line.split( ' ' )
    var numberOfWords = words.length
    var point         = undefined

    if ( numberOfWords === 1 ) {
        words         = line.split( ',' )
        numberOfWords = words.length
    }

    if ( numberOfWords === 6 ) {

        point = {
            x: parseFloat( words[ 0 ] ),
            y: parseFloat( words[ 1 ] ),
            z: parseFloat( words[ 2 ] ),
            r: parseFloat( words[ 3 ] ),
            g: parseFloat( words[ 4 ] ),
            b: parseFloat( words[ 5 ] )
        }

        _points.push( point )
        _updateBoundingBox( point, _worldBoundingBox )

    } else if ( numberOfWords === 7 ) {

        point = {
            x: parseFloat( words[ 0 ] ),
            y: parseFloat( words[ 1 ] ),
            z: parseFloat( words[ 2 ] ),
            r: parseFloat( words[ 4 ] ),
            g: parseFloat( words[ 5 ] ),
            b: parseFloat( words[ 6 ] )
        }

        _points.push( point )
        _updateBoundingBox( point, _worldBoundingBox )

    } else if ( numberOfWords === 16 ) {

        point = {
            x: parseFloat( words[ 0 ] ),
            y: parseFloat( words[ 1 ] ),
            z: parseFloat( words[ 2 ] ),
            r: parseFloat( words[ 13 ] ),
            g: parseFloat( words[ 14 ] ),
            b: parseFloat( words[ 15 ] )
        }

        _points.push( point )
        _updateBoundingBox( point, _worldBoundingBox )

    } else {

        callback( 'Invalid data line: ' + line )

    }

    _lineCounter++

}

/**
 *
 * @private
 */
function _processFile ( callback ) {

    var lambertCoordinates = _getWorldOffset()
    var boundingBox        = _getOffsetBoundingBox( lambertCoordinates )

    // Offset points
    _offsetPoints( lambertCoordinates )
    console.log( '_offsetPoints' )

    // Sort on x
    var xDatas = _processPointsOnX( boundingBox )
    console.log( '_processPointsOnX' )

    // Sort on y
    var yDatas         = []
    var numberOfXDatas = xDatas.length
    var xData          = undefined
    var yData          = undefined

    for ( var arrayIndex = 0 ; arrayIndex < numberOfXDatas ; ++arrayIndex ) {

        xData = xDatas[ arrayIndex ]

        yData  = _processPointsOnY( boundingBox, xData )
        yDatas = yDatas.concat( yData )

    }
    console.log( '_processPointsOnY' )

    // Sort on z
    var zDatas         = []
    var numberOfYDatas = yDatas.length
    var yData          = undefined
    var zData          = undefined

    for ( var arrayIndex = 0 ; arrayIndex < numberOfYDatas ; ++arrayIndex ) {

        yData = yDatas[ arrayIndex ]

        zData  = _processPointsOnZ( boundingBox, yData )
        zDatas = zDatas.concat( zData )

    }
    console.log( '_processPointsOnZ' )

    // Create data buffers
    var dataToSave     = []
    var numberOfZDatas = zDatas.length
    var zData          = undefined
    var buffer         = undefined

    for ( var arrayIndex = 0 ; arrayIndex < numberOfZDatas ; ++arrayIndex ) {

        zData = zDatas[ arrayIndex ]

        buffer = _createDataBuffer( zData )
        dataToSave.push( buffer )

    }
    console.log( '_createDataBuffer' )

    _saveDataInDataBase( lambertCoordinates, boundingBox, dataToSave, callback )

}

/**
 *
 * @param boundingBox
 * @returns {Array}
 * @private
 */
function _processPointsOnX ( boundingBox ) {

    var left          = boundingBox.left
    var right         = left + _cubeSize
    var xDatas        = []
    var currentXArray = []
    var xIndex        = 0
    var pointX        = undefined

    _points.sort( function ( a, b ) {
        return ( a.x > b.x ) ? 1 : ( ( b.x > a.x ) ? -1 : 0 )
    } )

    for ( var indexPointX = 0, numberOfPoints = _points.length ; indexPointX < numberOfPoints ; ++indexPointX ) {

        pointX = _points[ indexPointX ]

        // Move cube to right
        while ( pointX.x > right ) {

            // If some data was store, append it before move "cursor"
            if ( currentXArray.length > 0 ) {

                xDatas.push( {
                    left:   left,
                    right:  right,
                    xIndex: xIndex,
                    data:   currentXArray
                } )

            }

            // Reset local data for new cube
            currentXArray = []
            xIndex++
            left = right
            right += _cubeSize

        }

        currentXArray.push( pointX )

    }

    // If there is some data after brek loop, do not forget to append them
    if ( currentXArray.length > 0 ) {

        xDatas.push( {
            left:   left,
            right:  right,
            xIndex: xIndex,
            data:   currentXArray
        } )

    }

    return xDatas

}

/**
 *
 * @param boundingBox
 * @param xData
 * @returns {Array}
 * @private
 */
function _processPointsOnY ( boundingBox, xData ) {

    var pointSortedOnX = xData.data
    var bottom         = boundingBox.bottom
    var top            = bottom + _cubeSize
    var yDatas         = []
    var currentYArray  = []
    var yIndex         = 0
    var pointY         = undefined

    pointSortedOnX.sort( function ( a, b ) {
        return ( a.y > b.y ) ? 1 : ( ( b.y > a.y ) ? -1 : 0 )
    } )

    for ( var indexPointY = 0, numberOfPointsSortedOnX = pointSortedOnX.length ; indexPointY < numberOfPointsSortedOnX ; ++indexPointY ) {

        pointY = pointSortedOnX[ indexPointY ]

        while ( pointY.y > top ) {

            if ( currentYArray.length > 0 ) {

                yDatas.push( {
                    left:   xData.left,
                    right:  xData.right,
                    bottom: bottom,
                    top:    top,
                    xIndex: xData.xIndex,
                    yIndex: yIndex,
                    data:   currentYArray
                } )

            }

            currentYArray = []
            yIndex++
            bottom = top
            top += _cubeSize

        }

        currentYArray.push( pointY )

    }

    if ( currentYArray.length > 0 ) {

        yDatas.push( {
            left:   xData.left,
            right:  xData.right,
            bottom: bottom,
            top:    top,
            xIndex: xData.xIndex,
            yIndex: yIndex,
            data:   currentYArray
        } )

    }

    return yDatas

}

/**
 *
 * @param boundingBox
 * @param yData
 * @returns {Array}
 * @private
 */
function _processPointsOnZ ( boundingBox, yData ) {

    var pointSortedOnY = yData.data
    var back           = boundingBox.back
    var front          = back + _cubeSize
    var zDatas         = []
    var currentZArray  = []
    var zIndex         = 0
    var pointZ         = undefined

    pointSortedOnY.sort( function ( a, b ) {
        return ( a.z > b.z ) ? 1 : ( ( b.z > a.z ) ? -1 : 0 )
    } )

    for ( var indexPointZ = 0, numberOfPointsSortedOnY = pointSortedOnY.length ; indexPointZ < numberOfPointsSortedOnY ; ++indexPointZ ) {

        pointZ = pointSortedOnY[ indexPointZ ]

        while ( pointZ.z > front ) {

            if ( currentZArray.length > 0 ) {

                zDatas.push( {
                    left:   yData.left,
                    right:  yData.right,
                    bottom: yData.bottom,
                    top:    yData.top,
                    back:   back,
                    front:  front,
                    xIndex: yData.xIndex,
                    yIndex: yData.yIndex,
                    zIndex: zIndex,
                    data:   currentZArray
                } )

            }

            currentZArray = []
            zIndex++
            back = front
            front += _cubeSize

        }

        currentZArray.push( pointZ )

    }

    if ( currentZArray.length > 0 ) {

        zDatas.push( {
            left:   yData.left,
            right:  yData.right,
            bottom: yData.bottom,
            top:    yData.top,
            back:   back,
            front:  front,
            xIndex: yData.xIndex,
            yIndex: yData.yIndex,
            zIndex: zIndex,
            data:   currentZArray
        } )

    }

    return zDatas

}

/**
 *
 * @param zData
 * @returns {{coordinates: {x: *, y: *, z: *}, data: (Array|*)}}
 * @private
 */
function _createDataBuffer ( zData ) {

    var LOCAL_DATA_COORDINATES_LENGTH = 3 // 3 int ( x, y, z )
    var DATA_LENGTH                   = 6 // 3 int for position + 3 int for color

    var pointSortedOnZ      = zData.data
    var numberOfPointInCube = pointSortedOnZ.length
    var dataArray           = new Uint8Array( LOCAL_DATA_COORDINATES_LENGTH + ( numberOfPointInCube * DATA_LENGTH ) )

    // Add local_coordinates to buffer first !
    dataArray[ 0 ] = zData.xIndex
    dataArray[ 1 ] = zData.yIndex
    dataArray[ 2 ] = zData.zIndex

    // Randomize point data due to display problem for buffer sampling
    // While there remain elements to shuffle…
    var remainElements = numberOfPointInCube
    var currentPoint   = undefined
    var randomIndex    = undefined
    while ( remainElements ) {

        // Pick a remaining element…
        randomIndex = Math.floor( Math.random() * remainElements-- )

        // And swap it with the current element.
        currentPoint                     = pointSortedOnZ[ remainElements ]
        pointSortedOnZ[ remainElements ] = pointSortedOnZ[ randomIndex ]
        pointSortedOnZ[ randomIndex ]    = currentPoint
    }

    // Convert randomized points to buffer
    var indexDataBuffer = LOCAL_DATA_COORDINATES_LENGTH
    var pointCube       = undefined
    for ( var indexPoint = 0 ; indexPoint < numberOfPointInCube ; indexPoint++ ) {

        pointCube = pointSortedOnZ[ indexPoint ]

        dataArray[ indexDataBuffer ]     = Math.round( ( pointCube.x - zData.left ) * 1000 )
        dataArray[ indexDataBuffer + 1 ] = Math.round( ( pointCube.y - zData.bottom ) * 1000 )
        dataArray[ indexDataBuffer + 2 ] = Math.round( ( pointCube.z - zData.back ) * 1000 )

        dataArray[ indexDataBuffer + 3 ] = pointCube.r
        dataArray[ indexDataBuffer + 4 ] = pointCube.g
        dataArray[ indexDataBuffer + 5 ] = pointCube.b

        indexDataBuffer += 6

    }

    var cubeCoordinates = {
        x: zData.left,
        y: zData.bottom,
        z: zData.back
    }

    return {
        coordinates: cubeCoordinates,
        data:        Buffer.from( dataArray )
    }
}

/**
 *
 * @param lambertCoordinates
 * @param boundingBox
 * @param dataToSave
 * @private
 */
function _saveDataInDataBase ( lambertCoordinates, boundingBox, dataToSave, callback ) {

    var idArray      = []
    var cubeIndex    = 0
    var numberOfCube = dataToSave.length

    if ( numberOfCube > 0 ) {
        insertPointCloudData()
    }

    function insertPointCloudData () {

        var cubeDataPointSchema = new PointCloud( {
            data: dataToSave[ cubeIndex ].data
        } )

        cubeDataPointSchema.save( function ( error, cube ) {

            if ( error ) {

                callback( error )
                return

            }

            idArray.push( {
                coordinates: dataToSave[ cubeIndex ].coordinates,
                id:          cube.id
            } )

            cubeIndex++

            if ( cubeIndex < numberOfCube ) {

                insertPointCloudData()

            } else if ( cubeIndex === numberOfCube ) {

                insertCellData()

            }

        } )

    }

    function insertCellData () {

        var newWorldCell = new WorldCell( {
            lambertCoordinates: lambertCoordinates,
            boundingBox:        boundingBox,
            cubeDataPoint:      idArray
        } )

        newWorldCell.save( function ( error ) {

            if ( error ) {

                callback( error )
                return

            }

            console.log( 'PointCoud successfully saved with ' + numberOfCube + ' data cubes.' )
            callback()

        } )

    }

}

/**
 *
 * @private
 */
function _freeMemory () {

    _points = []

}

/**
 * INTERFACE
 */
/**
 *
 * @param file
 */
function parseFile ( file, callback ) {

    var _callback  = callback || function ( error ) { console.error( error ) }
    var _isOnError = false

    _lineReader = readLine.createInterface( {
        input: fs.createReadStream( file )
    } )

    _lineReader.on( 'line', function ( line ) {

        _loadFileInMemory( line, function ( error ) {

            if ( error ) {

                _isOnError = true
                _lineReader.close()

            }

            _callback( error )

        } )

    } )

    _lineReader.on( 'close', function () {

        if ( !_isOnError ) { _processFile( _callback ) }
        _freeMemory()

    } )

    fs.unlink( file, function ( error ) {

        if ( error ) { _callback( error )}

    } )

}

module.exports = {
    parse: parseFile
}
