/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file sources/frontend/managers/CurvesManager.js
 *
 * @example Todo
 *
 */

import { TDataBaseManager }      from 'itee-client'
import { isObject }              from 'itee-validators'
import { CurvePath }             from 'three-full/sources/core/CurvePath'
import { Path }                  from 'three-full/sources/core/Path'
import { Shape }                 from 'three-full/sources/core/Shape'
import { ArcCurve }              from 'three-full/sources/curves/ArcCurve'
import { CatmullRomCurve3 }      from 'three-full/sources/curves/CatmullRomCurve3'
import { CubicBezierCurve }      from 'three-full/sources/curves/CubicBezierCurve'
import { CubicBezierCurve3 }     from 'three-full/sources/curves/CubicBezierCurve3'
import { Curve }                 from 'three-full/sources/curves/Curve'
import { EllipseCurve }          from 'three-full/sources/curves/EllipseCurve'
import { LineCurve }             from 'three-full/sources/curves/LineCurve'
import { LineCurve3 }            from 'three-full/sources/curves/LineCurve3'
import { QuadraticBezierCurve }  from 'three-full/sources/curves/QuadraticBezierCurve'
import { QuadraticBezierCurve3 } from 'three-full/sources/curves/QuadraticBezierCurve3'
import { SplineCurve }           from 'three-full/sources/curves/SplineCurve'
// Waiting three-shaking fix
//import {
//    ArcCurve,
//    CatmullRomCurve3,
//    CubicBezierCurve,
//    CubicBezierCurve3,
//    Curve,
//    CurvePath,
//    EllipseCurve,
//    LineCurve,
//    LineCurve3,
//    Path,
//    QuadraticBezierCurve,
//    QuadraticBezierCurve3,
//    Shape,
//    SplineCurve
//}                           from 'three-full'

class CurvesManager extends TDataBaseManager {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                basePath: '/curves'
            },
            ...parameters
        }

        super( _parameters )

    }

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
                throw new Error( `TCurvesManager: Unknown curve of type: ${ curveType }` )

        }

        curve.fromJSON( data )

        return curve

    }

    _onJson ( jsonData, onSuccess, onProgress, onError ) {

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

export { CurvesManager }
