/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
import { degreesToRadians } from 'itee-utils'
import { Vector3 }                           from 'three-full'
import { BoxHandle }        from '../handles/BoxHandle'
import { ConeHandle }       from '../handles/ConeHandle'
import { AbstractGizmo }    from './AbstractGizmo'

class LookAtGizmo extends AbstractGizmo {


    //TYPE ENTITY ENUM COLOMNU

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                boxColor:   0xA9A9A9,
                edgesColor: 0xD3D3D3
            },
            ...parameters
        }

        super( _parameters )
        this.isLookAtGizmo = true
        this.type          = 'LookAtGizmo'

        this.explodeFactor = 0.25

        this.handleGizmos = {

            // Cone faces
            FACE_RIGHT: new ConeHandle( {
                coneColor: 0xdd0000
            } ).setPosition( +( 4 + this.explodeFactor ), +0, +0 )
               .setRotationFromAxisAndAngle( new Vector3( 0, 0, 1 ), degreesToRadians( 90 ) )
               .setScale( 1, 4, 1 ),

            FACE_LEFT: new ConeHandle( {
                coneColor: 0x550000
            } ).setPosition( -( 4 + this.explodeFactor ), +0, +0 )
               .setRotationFromAxisAndAngle( new Vector3( 0, 0, 1 ), degreesToRadians( -90 ) )
               .setScale( 1, 4, 1 ),

            FACE_TOP: new ConeHandle( {
                coneColor: 0x0000dd
            } ).setPosition( +0, +( 4 + this.explodeFactor ), +0 )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( 180 ) )
               .setScale( 1, 4, 1 ),

            FACE_BOTTOM: new ConeHandle( {
                coneColor: 0x000055
            } ).setPosition( +0, -( 4 + this.explodeFactor ), +0 )
               .setScale( 1, 4, 1 ),

            FACE_FRONT: new ConeHandle( {
                coneColor: 0x005500
            } ).setPosition( +0, +0, +( 4 + this.explodeFactor ) )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( -90 ) )
               .setScale( 1, 4, 1 ),

            FACE_BACK: new ConeHandle( {
                coneColor: 0x00dd00
            } ).setPosition( +0, +0, -( 4 + this.explodeFactor ) )
               .setRotationFromAxisAndAngle( new Vector3( 1, 0, 0 ), degreesToRadians( 90 ) )
               .setScale( 1, 4, 1 ),

            // Planar faces
            //            FACE_RIGHT:  new BoxHandle().setPosition( +( 2 + this.explodeFactor ), +0, +0 ).setScale( 1, 3, 3 ),
            //            FACE_LEFT:   new BoxHandle().setPosition( -( 2 + this.explodeFactor ), +0, +0 ).setScale( 1, 3, 3 ),
            //            FACE_TOP:    new BoxHandle().setPosition( +0, +( 2 + this.explodeFactor ), +0 ).setScale( 3, 1, 3 ),
            //            FACE_BOTTOM: new BoxHandle().setPosition( +0, -( 2 + this.explodeFactor ), +0 ).setScale( 3, 1, 3 ),
            //            FACE_FRONT:  new BoxHandle().setPosition( +0, +0, +( 2 + this.explodeFactor ) ).setScale( 3, 3, 1 ),
            //            FACE_BACK:   new BoxHandle().setPosition( +0, +0, -( 2 + this.explodeFactor ) ).setScale( 3, 3, 1 ),

            CORNER_TOP_LEFT_FRONT:     new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_TOP_LEFT_BACK:      new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),
            CORNER_TOP_RIGHT_FRONT:    new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_TOP_RIGHT_BACK:     new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_LEFT_FRONT:  new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_LEFT_BACK:   new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_RIGHT_FRONT: new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ),
            CORNER_BOTTOM_RIGHT_BACK:  new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ),

            EDGE_TOP_FRONT:    new BoxHandle( _parameters ).setPosition( +0, +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_TOP_LEFT:     new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), +0 ).setScale( 1, 1, 3 ),
            EDGE_TOP_BACK:     new BoxHandle( _parameters ).setPosition( +0, +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_TOP_RIGHT:    new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ), +0 ).setScale( 1, 1, 3 ),
            EDGE_LEFT_FRONT:   new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +0, +( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_LEFT_BACK:    new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), +0, -( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_RIGHT_FRONT:  new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +0, +( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_RIGHT_BACK:   new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), +0, -( 2 + this.explodeFactor ) ).setScale( 1, 3, 1 ),
            EDGE_BOTTOM_FRONT: new BoxHandle( _parameters ).setPosition( +0, -( 2 + this.explodeFactor ), +( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_BOTTOM_LEFT:  new BoxHandle( _parameters ).setPosition( -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), +0 ).setScale( 1, 1, 3 ),
            EDGE_BOTTOM_BACK:  new BoxHandle( _parameters ).setPosition( +0, -( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ) ).setScale( 3, 1, 1 ),
            EDGE_BOTTOM_RIGHT: new BoxHandle( _parameters ).setPosition( +( 2 + this.explodeFactor ), -( 2 + this.explodeFactor ), +0 ).setScale( 1, 1, 3 )

        }

        this._setupHandles( this.handleGizmos )

    }

    raycast ( raycaster, intersects ) {

        const isIntersected = ( raycaster.intersectObject( this.intersectPlane, true ).length > 0 )
        if ( !isIntersected ) { return }

        for ( let handle of this.children ) {
            handle.raycast( raycaster, intersects )
        }

    }
}

export { LookAtGizmo }
