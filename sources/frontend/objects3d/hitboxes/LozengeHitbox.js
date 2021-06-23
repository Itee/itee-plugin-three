/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    BufferGeometry,
    Float32BufferAttribute
}                         from 'three-full'
import { AbstractHitbox } from './AbstractHitbox'
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
        ]
        const lozengeIndexes          = [
            0, 1, 2,
            2, 3, 0
        ]
        const positionBufferAttribute = new Float32BufferAttribute( lozengePositions, 3 )
        const lozengeBufferGeometry   = new BufferGeometry()
        lozengeBufferGeometry.setAttribute( 'position', positionBufferAttribute )
        lozengeBufferGeometry.setIndex( lozengeIndexes )

        const _parameters = {
            ...{
                geometry: lozengeBufferGeometry
            }, ...parameters
        }

        super( _parameters )
        this.isPlanarHitbox = true
        this.type           = 'PlanarHitbox'

    }

}

export { LozengeHitbox }
