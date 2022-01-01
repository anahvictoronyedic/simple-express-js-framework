import { Router } from "express";

export type ID = string|number;
export type PLAIN_OBJECT<V=any> = {[k:string]:V};

/**
 * All controller should implement this interface
 */
export interface Controller {
    registerEndpoints( router:Router ):Promise<void>;
}

/**
 * All script should implement this
 */
export interface Script<ARGS=PLAIN_OBJECT> {
    run( args?:ARGS ):Promise<void>;
}

/**
 * All subsystems classes should implement this.
 *
 * Subsystems include: mysql, redis, kafka
 */
export interface SubSystem<C,H>{
    load( config :C ) : Promise<any>;
    getHandler() : H;
}
