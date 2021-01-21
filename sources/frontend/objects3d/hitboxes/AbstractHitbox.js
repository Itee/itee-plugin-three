/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { DoubleSide }        from 'three-full/sources/constants'
import { BufferGeometry }    from 'three-full/sources/core/BufferGeometry'
import { MeshBasicMaterial } from 'three-full/sources/materials/MeshBasicMaterial'
import { Mesh }              from 'three-full/sources/objects/Mesh'

class AbstractHitbox extends Mesh {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                geometry: new BufferGeometry(),
                material: new MeshBasicMaterial( {
                    visible:    false,
                    depthTest:  false,
                    depthWrite: false,
                    fog:        false,
                    side:       DoubleSide,
                    color:       0x654321
                    //                    opacity:     0.0,
                    //                    transparent: true
                } )
            }, ...parameters
        }

        super( _parameters.geometry, _parameters.material )
        this.isHitbox         = true
        this.type             = 'Hitbox'
        this.matrixAutoUpdate = false

    }
}

export { AbstractHitbox }
