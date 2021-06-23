/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { TorusBufferGeometry } from 'three-full'
import { AbstractHitbox }      from './AbstractHitbox'

//import { TorusBufferGeometry } from 'three-full/sources/geometries/TorusGeometry'

class TorusHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new TorusBufferGeometry( 1, 0.12, 4, 12, Math.PI )
            }, ...parameters
        }

        super( _parameters )
        this.isTorusHitbox = true
        this.type          = 'TorusHitbox'

    }

}

export { TorusHitbox }
