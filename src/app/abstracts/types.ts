import { Router } from "express";

export type ID = string|number;

export type RESPONSE = { code:string , message:string };

export interface Model{
} ;

export interface Controller {
    registerEndpoints( router:Router ):Promise<void>;
}

export interface System<C,H>{
    load( config :C ) : Promise<any>;
    getHandler() : H;
}