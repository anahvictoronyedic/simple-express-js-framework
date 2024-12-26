import { RequestHandler } from "express";

export type ID = string|number;

export type Controller = { [name:string] : { method:'get'|'post'|'delete'|'put'|'patch'|'options', 
path:string , handler:RequestHandler } };

export interface Model{
} ;

export interface System<C,H>{
    load( config :C ) : Promise<any>;
    getHandler() : H;
}