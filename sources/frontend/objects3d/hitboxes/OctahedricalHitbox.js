/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { AbstractHitbox }           from './AbstractHitbox'
import { OctahedronBufferGeometry } from 'three-full/sources/geometries/OctahedronGeometry'

class OctahedricalHitbox extends AbstractHitbox {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new OctahedronBufferGeometry( 1.2, 0 )
            }, ...parameters
        }

        super( _parameters )
        this.isOctahedricalHitbox = true
        this.type                 = 'OctahedricalHitbox'

    }

}

export { OctahedricalHitbox }
