import { Request, Response } from "express";
import { Controller } from "../../../types";

const controller:Controller = {
    add:{
        method:'post',
        path:'/:id/add',
        handler:async function(req:Request , res:Response){
        },
    } ,
    sell:{
        method:'post',
        path:'/:id/add',
        handler:async function(req:Request , res:Response){
        },
    } ,
    quantity:{
        method:'get',
        path:'/:id/quantity',
        handler:async function(req:Request , res:Response){
        },
    } ,
};

export default controller;