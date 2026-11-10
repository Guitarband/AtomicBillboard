"use client";
import {useEffect} from "react";
export function Attribution(){useEffect(()=>{void fetch("/api/attribution",{method:"POST"});},[]);return null;}
export function TrackVisit({id}:{id:string}){useEffect(()=>{void fetch("/api/visit",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id})});},[id]);return null;}
