/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { TDataBaseManager } from 'itee-client'
import { isObject }         from 'itee-validators'
import {
    ArcCurve,
    CatmullRomCurve3,
    CubicBezierCurve,
    CubicBezierCurve3,
    Curve,
    CurvePath,
    EllipseCurve,
    LineCurve,
    LineCurve3,
    Path,
    QuadraticBezierCurve,
    QuadraticBezierCurve3,
    Shape,
    SplineCurve
}                           from 'three-full'

/**
 *
 * @constructor
 */
function CurvesManager () {

    TDataBaseManager.call( this )
    this.basePath = '/curves'

}

CurvesManager.prototype = Object.assign( Object.create( TDataBaseManager.prototype ), {

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

        const curveType = data.type
        let curve       = undefined

        switch ( curveType ) {

            case 'ArcCurve':
                curve = new ArcCurve()
                break

            case 'CatmullRomCurve3':
                curve = new CatmullRomCurve3()
                break

            case 'CubicBezierCurve':
                curve = new CubicBezierCurve()
                break

            case 'CubicBezierCurve3':
                curve = new CubicBezierCurve3()
                break

            case 'Curve':
                curve = new Curve()
                break

            case 'CurvePath':
                curve = new CurvePath()
                break

            case 'EllipseCurve':
                curve = new EllipseCurve()
                break

            case 'LineCurve':
                curve = new LineCurve()
                break

            case 'LineCurve3':
                curve = new LineCurve3()
                break

            // Missing NURBSCurve

            case 'Path':
                curve = new Path()
                break

            case 'QuadraticBezierCurve':
                curve = new QuadraticBezierCurve()
                break

            case 'QuadraticBezierCurve3':
                curve = new QuadraticBezierCurve3()
                break

            case 'SplineCurve':
                curve = new SplineCurve()
                break

            case 'Shape':
                curve = new Shape()
                break

            default:
                throw new Error( `TCurvesManager: Unknown curve of type: ${curveType}` )

        }

        curve.fromJSON( data )

        return curve

    }

} )

Object.defineProperties( CurvesManager.prototype, {

    /**
     *
     */
    _onJson: {
        value: function _onJson ( jsonData, onSuccess, onProgress, onError ) {

            // Normalize to array
            const datas   = ( isObject( jsonData ) ) ? [ jsonData ] : jsonData
            const results = {}

            for ( let dataIndex = 0, numberOfDatas = datas.length, data = undefined ; dataIndex < numberOfDatas ; dataIndex++ ) {

                data = datas[ dataIndex ]

                try {
                    results[ data._id ] = this.convert( data )
                } catch ( err ) {
                    onError( err )
                }

                onProgress( dataIndex / numberOfDatas )

            }

            onSuccess( results )

        }
    }

} )

export { CurvesManager }
