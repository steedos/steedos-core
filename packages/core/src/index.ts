import "reflect-metadata";

import { getFromContainer } from "./container";
import { CreatorManager } from "./creator/CreatorManager";


/**
 * Gets a ObjectSchemaManager which creates object schema.
 */
export function getCreator(): CreatorManager{
    return getFromContainer(CreatorManager);
}

export { default as ODataRouter } from './odata/ODataRouter'
export { default as MeteorODataRouter } from './odata/MeteorODataRouter'
export { default as MeteorODataAPIV4Router } from './odata/MeteorODataAPIV4Router'
export {init} from './init'
export * from './routes'
export { default as Util } from './util'

export * from './plugins'
