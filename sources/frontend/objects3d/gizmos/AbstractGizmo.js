/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { isNotArray }          from 'itee-validators'
import { DoubleSide }          from 'three-full/sources/constants'
import { Object3D }            from 'three-full/sources/core/Object3D'
import { PlaneBufferGeometry } from 'three-full/sources/geometries/PlaneGeometry'
import { MeshBasicMaterial }   from 'three-full/sources/materials/MeshBasicMaterial'
import { Mesh }                from 'three-full/sources/objects/Mesh'

class AbstractGizmo extends Object3D {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                debug: false,
                planeSize: 50
            },
            ...parameters
        }

        super( _parameters )
        this.isGizmo          = true
        this.type             = 'AbstractGizmo'
        this.matrixAutoUpdate = true

        this.debug = _parameters.debug


//        this.handles                  = new Object3D()
//        this.handles.name             = 'Handles'
//        this.handles.matrixAutoUpdate = false
//
//        this.add( this.handles )

        ///

        const planeGeometry                  = new PlaneBufferGeometry( _parameters.planeSize, _parameters.planeSize, 2, 2 )
        const planeMaterial                  = new MeshBasicMaterial( {
            side:        DoubleSide,
            visible:     this.debug,
            transparent: true,
            opacity:     0.33,
            color:       0x123456
        } )
        this.intersectPlane                  = new Mesh( planeGeometry, planeMaterial )
        this.intersectPlane.name             = 'IntersectPlane'
        this.intersectPlane.matrixAutoUpdate = true
        this.intersectPlane.visible          = true

        this.add( this.intersectPlane )

    }

    _setupHandles ( handlesMap ) {

        const parent = this
//        const parent = this.handles

        for ( let name in handlesMap ) {

            const element = handlesMap[ name ]
            if ( isNotArray( element ) ) {

                element.name        = name
                element.renderOrder = Infinity
                element.updateMatrix()

                parent.add( element )

            } else {

                for ( let i = element.length ; i-- ; ) {

                    const object   = handlesMap[ name ][ i ][ 0 ]
                    const position = handlesMap[ name ][ i ][ 1 ]
                    const rotation = handlesMap[ name ][ i ][ 2 ]
                    const scale    = handlesMap[ name ][ i ][ 3 ]
                    const tag      = handlesMap[ name ][ i ][ 4 ]

                    // name and tag properties are essential for picking and updating logic.
                    object.name = name
                    object.tag  = tag

                    // avoid being hidden by other transparent objects
                    object.renderOrder = Infinity

                    if ( position ) {
                        object.position.set( position[ 0 ], position[ 1 ], position[ 2 ] )
                    }
                    if ( rotation ) {
                        object.rotation.set( rotation[ 0 ], rotation[ 1 ], rotation[ 2 ] )
                    }
                    if ( scale ) {
                        object.scale.set( scale[ 0 ], scale[ 1 ], scale[ 2 ] )
                    }

                    object.updateMatrix()

                    const tempGeometry = object.geometry.clone()
                    tempGeometry.applyMatrix4( object.matrix )
                    object.geometry = tempGeometry

                    object.position.set( 0, 0, 0 )
                    object.rotation.set( 0, 0, 0 )
                    object.scale.set( 1, 1, 1 )

                    parent.add( object )

                }

            }

        }

    }

    highlight ( axis ) {

        // Reset highlight for all of them
        for ( let key in this.handleGizmos ) {
            this.handleGizmos[ key ].highlight( false )
        }

        // Highlight the picked (if exist)
        const currentHandle = this.handleGizmos[ axis ]
        if ( currentHandle ) {
            currentHandle.highlight( true )
        }

    }

    update ( cameraPosition, cameraDirection ) {

        this.traverse( ( child ) => {

            if ( !child.isHandle ) { return }

            child.update( cameraDirection )

        } )

        this.updateIntersectPlane( cameraPosition )

    }

    updateIntersectPlane ( cameraPosition ) {

        this.intersectPlane.lookAt( cameraPosition )
        this.intersectPlane.updateMatrix()

    }

}

export { AbstractGizmo }
