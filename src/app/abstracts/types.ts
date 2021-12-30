import { Router } from "express";

export type ID = string|number;
export type PLAIN_OBJECT<V=any> = {[k:string]:V};

export interface Model{
} ;

export interface Controller {
    registerEndpoints( router:Router ):Promise<void>;
}

export interface Script<ARGS=PLAIN_OBJECT> {
    run( args?:ARGS ):Promise<void>;
}

export interface System<C,H>{
    load( config :C ) : Promise<any>;
    getHandler() : H;
}
