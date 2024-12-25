import { RequestHandler } from "express";

export type Controller = { [name:string] : { method:'get'|'post'|'delete'|'put'|'patch'|'options', 
path:string , handler:RequestHandler } };