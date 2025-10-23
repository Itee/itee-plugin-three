/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { AbstractHandle } from './AbstractHandle'

class RotateHandle extends AbstractHandle {

    constructor( parameters = {} ) {

        const _parameters = {
            ...{}, ...parameters
        }

        super( _parameters )
        this.isRotateHandle = true
        this.type           = 'RotateHandle'

    }

    update( cameraDirection ) {
        super.update( cameraDirection )


        this.updateMatrix()
        this.hitbox.updateMatrix()
    }

}

export { RotateHandle }
