/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    BufferGeometry,
    Float32BufferAttribute
}                         from 'three-full'
import { AbstractHitbox } from './AbstractHitbox'
//import { Float32BufferAttribute } from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }         from 'three-full/sources/core/BufferGeometry'

class PlanarHitbox extends AbstractHitbox {

    constructor( parameters = {} ) {

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
            ]

        const planeIndexes        = [
            0, 1, 2,
            2, 3, 0
        ]
        const planeBufferGeometry = new BufferGeometry()
        planeBufferGeometry.setAttribute( 'position', new Float32BufferAttribute( planePositions, 3 ) )
        planeBufferGeometry.setIndex( planeIndexes )

        const _parameters = {
            ...{
                geometry: planeBufferGeometry
            }, ...parameters
        }

        super( _parameters )
        this.isPlanarHitbox = true
        this.type           = 'PlanarHitbox'

    }

}

export { PlanarHitbox }
