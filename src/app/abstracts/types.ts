import { Router } from "express";

export type ID = string|number;
export type PLAIN_OBJECT<V=any> = {[k:string]:V};

export interface Initializable<C>{
    init( config :C ) : Promise<any>;
}

/**
 * All controller should implement this interface
 */
export interface Controller<C> extends Initializable<C> {
    registerEndpoints( router:Router ):Promise<void>;
}

/**
 * All model should implement this interface
 */
export interface Model<C> extends Initializable<C> {
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
export interface SubSystem<C,H> extends Initializable<C>{
    getHandler() : H;
}
