/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { SphereBufferGeometry } from 'three-full'
import { AbstractHitbox }       from './AbstractHitbox'

//import { SphereBufferGeometry } from 'three-full/sources/geometries/SphereGeometry'

class SphericalHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new SphereBufferGeometry( 1, 8, 6, 0, 2 * Math.PI, 0, Math.PI )
            }, ...parameters
        }

        super( _parameters )
        this.isSphericalHitbox = true
        this.type              = 'SphericalHitbox'

    }

}

export { SphericalHitbox }
