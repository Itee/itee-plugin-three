/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { CylinderBufferGeometry } from 'three-full'
import { AbstractHitbox }         from './AbstractHitbox'

//import { CylinderBufferGeometry } from 'three-full/sources/geometries/CylinderGeometry'

class CylindricaHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const cylinderGeometry = new CylinderBufferGeometry( 0.2, 0, 1, 4, 1, false )
        cylinderGeometry.translate( 0, 0.5, 0 )
        const _parameters = {
            ...{
                geometry: cylinderGeometry
            }, ...parameters
        }

        super( _parameters )
        this.isCylindricaHitbox = true
        this.type               = 'CylindricaHitbox'

    }

}

export { CylindricaHitbox }
