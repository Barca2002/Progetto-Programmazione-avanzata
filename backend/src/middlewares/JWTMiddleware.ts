import { NextFunction, Request, Response } from "express";
import { ErrorFactory } from "../status/StatusFactory";
import { AppErrorNames } from "../enums/responseStatus/AppStatusNames";
import jwt from "jsonwebtoken";
import fs from "fs";

function JwtCheck(){
    
}