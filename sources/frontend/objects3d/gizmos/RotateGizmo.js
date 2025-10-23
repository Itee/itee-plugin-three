/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import {
    BufferGeometry,
    Float32BufferAttribute,
    Line,
    Mesh,
    OctahedronBufferGeometry
}                                    from 'three-full'
import { HighlightableLineMaterial } from '../../materials/HighlightableLineMaterial'
import { HighlightableMaterial }     from '../../materials/HighlightableMaterial'
import { TorusHitbox }               from '../hitboxes/TorusHitbox'
//import { Float32BufferAttribute }    from 'three-full/sources/core/BufferAttribute'
//import { BufferGeometry }            from 'three-full/sources/core/BufferGeometry'
//import { OctahedronBufferGeometry }  from 'three-full/sources/geometries/OctahedronGeometry'
//import { Line }                      from 'three-full/sources/objects/Line'
//import { Mesh }                      from 'three-full/sources/objects/Mesh'
import { AbstractGizmo }             from './AbstractGizmo'

class RotateGizmo extends AbstractGizmo {

    constructor() {

        super()
        this.isRotateGizmo = true
        this.type          = 'RotateGizmo'

        const CircleGeometry = ( radius, facing, arc ) => {

            const geometry = new BufferGeometry()
            let vertices   = []
            arc            = arc ? arc : 1

            for ( let i = 0 ; i <= 64 * arc ; ++i ) {

                if ( facing === 'x' ) {
                    vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius )
                }
                if ( facing === 'y' ) {
                    vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius )
                }
                if ( facing === 'z' ) {
                    vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 )
                }

            }

            geometry.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) )
            return geometry

        }

        this.handleGizmos = {

            X: [
                [ new Line( new CircleGeometry( 1, 'x', 0.5 ), new HighlightableLineMaterial( { color: 0xff0000 } ) ) ],
                [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0xff0000 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ]
            ],

            Y: [
                [ new Line( new CircleGeometry( 1, 'y', 0.5 ), new HighlightableLineMaterial( { color: 0x00ff00 } ) ) ],
                [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0x00ff00 } ) ), [ 0, 0, 0.99 ], null, [ 3, 1, 1 ] ]
            ],

            Z: [
                [ new Line( new CircleGeometry( 1, 'z', 0.5 ), new HighlightableLineMaterial( { color: 0x0000ff } ) ) ],
                [ new Mesh( new OctahedronBufferGeometry( 0.04, 0 ), new HighlightableMaterial( { color: 0x0000ff } ) ), [ 0.99, 0, 0 ], null, [ 1, 3, 1 ] ]
            ],

            E: [ [ new Line( new CircleGeometry( 1.25, 'z', 1 ), new HighlightableLineMaterial( { color: 0xcccc00 } ) ) ] ],

            XYZ: [ [ new Line( new CircleGeometry( 1, 'z', 1 ), new HighlightableLineMaterial( { color: 0x787878 } ) ) ] ]

        }

        this.pickerGizmos = {

            X: [ [ new TorusHitbox(), [ 0, 0, 0 ], [ 0, -Math.PI / 2, -Math.PI / 2 ] ] ],

            Y: [ [ new TorusHitbox(), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ] ],

            Z: [ [ new TorusHitbox(), [ 0, 0, 0 ], [ 0, 0, -Math.PI / 2 ] ] ],

            E: [
                [
                    new TorusHitbox( {
                        radius:          1.25,
                        tube:            0.12,
                        radialSegments:  2,
                        tubularSegments: 24
                    } )
                ]
            ],

            XYZ: [ [ new TorusHitbox() ] ]

        }

        //        this.pickerGizmos.XYZ[ 0 ][ 0 ].visible = false // disable XYZ picker gizmo

        this._setupHandles( this.handleGizmos )
        //        this.init()

    }

    raycast( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 )
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            if ( handle.name === this.intersectPlane.name ) {continue}
            handle.raycast( raycaster, intersects )
        }

    }
    /*
     update ( rotation, eye2 ) {

     super.update( rotation, eye2 )

     const tempMatrix     = new Matrix4()
     const worldRotation  = new Euler( 0, 0, 1 )
     const tempQuaternion = new Quaternion()
     const unitX          = new Vector3( 1, 0, 0 )
     const unitY          = new Vector3( 0, 1, 0 )
     const unitZ          = new Vector3( 0, 0, 1 )
     const quaternionX    = new Quaternion()
     const quaternionY    = new Quaternion()
     const quaternionZ    = new Quaternion()
     const eye            = eye2.clone()

     worldRotation.copy( this.planes[ 'XY' ].rotation )
     tempQuaternion.setFromEuler( worldRotation )

     tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix )
     eye.applyMatrix4( tempMatrix )

     this.traverse( child => {

     tempQuaternion.setFromEuler( worldRotation )

     if ( child.name === 'X' ) {

     quaternionX.setFromAxisAngle( unitX, Math.atan2( -eye.y, eye.z ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX )
     child.quaternion.copy( tempQuaternion )

     }

     if ( child.name === 'Y' ) {

     quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY )
     child.quaternion.copy( tempQuaternion )

     }

     if ( child.name === 'Z' ) {

     quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) )
     tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ )
     child.quaternion.copy( tempQuaternion )

     }

     } )

     }
     */

}

export { RotateGizmo }
