/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [MIT]{@link https://opensource.org/licenses/MIT}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import {
    TAbstractConverterManager,
    TMongoDBPlugin,
    TMongooseController
}                         from 'itee-database'
import { DbfToThree }     from './converters/DbfToThree'
import { JsonToThree }    from './converters/JsonToThree'
import { MtlToThree }     from './converters/MtlToThree'
import { Obj2ToThree }    from './converters/Obj2ToThree'
import { ShpToThree }     from './converters/ShpToThree'
import { ThreeToMongoDB } from './converters/ThreeToMongoDB'
import { ColorType }      from './types/Color'

export default new TMongoDBPlugin()
    .addType( ColorType )
    .addController( TMongooseController )
    .addDescriptor( {
        route:      '/objects',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Objects3D'
            },
            can:     {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read:   {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/curves',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Curves'
            },
            can:     {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read:   {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/geometries',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Geometries'
            },
            can:     {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read:   {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/materials',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Materials'
            },
            can:     {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read:   {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addDescriptor( {
        route:      '/textures',
        controller: {
            name:    'TMongooseController',
            options: {
                schemaName: 'Textures'
            },
            can:     {
                create: {
                    on:   'put',
                    over: '/(:id)?'
                },
                read:   {
                    on:   'post',
                    over: '/(:id)?'
                },
                update: {
                    on:   'patch',
                    over: '/(:id)?'
                },
                delete: {
                    on:   'delete',
                    over: '/(:id)?'
                }
            }
        }
    } )
    .addController( TAbstractConverterManager )
    .addDescriptor( {
        route:      '/uploads',
        controller: {
            name:    'TAbstractConverterManager',
            options: {
                useNext:    true,
                converters: {
                    JsonToThree: new JsonToThree(),
                    ShpToThree:  new ShpToThree(),
                    DbfToThree:  new DbfToThree(),
                    MtlToThree:  new MtlToThree(),
                    ObjToThree:  new Obj2ToThree()
                },
                rules:      [
                    {
                        on:  '.json',
                        use: 'JsonToThree'
                    },
                    {
                        on:  '.shp',
                        use: 'ShpToThree'
                    },
                    {
                        on:  '.dbf',
                        use: 'DbfToThree'
                    },
                    {
                        on:  [ '.shp', '.dbf' ],
                        use: [ 'ShpToThree', 'DbfToThree' ]
                    },
                    {
                        on:  '.mtl',
                        use: 'MtlToThree'
                    },
                    {
                        on:  '.obj',
                        use: 'ObjToThree'
                    },
                    {
                        on:  [ '.mtl', '.obj' ],
                        use: [ 'MtlToThree', 'ObjToThree' ]
                    }
                ],
                inserter:   ThreeToMongoDB
            },
            can:     {
                processFiles: {
                    on:   'post',
                    over: '/'
                }
            }
        }
    } )
