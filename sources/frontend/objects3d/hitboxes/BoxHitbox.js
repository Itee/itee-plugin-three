/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { BoxBufferGeometry } from 'three-full'
import { AbstractHitbox }    from './AbstractHitbox'

//import { BoxBufferGeometry } from 'three-full/sources/geometries/BoxGeometry'

class BoxHitbox extends AbstractHitbox {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new BoxBufferGeometry( 1, 1, 1, 1, 1, 1 )
            }, ...parameters
        }

        super( _parameters )
        this.isBoxHitbox = true
        this.type        = 'BoxHitbox'

    }

}

export { BoxHitbox }
