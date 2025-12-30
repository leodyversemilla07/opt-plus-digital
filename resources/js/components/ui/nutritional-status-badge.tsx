import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

export type NutritionalStatus = 'normal' | 'mam' | 'sam' | 'overweight' | 'obese' | 'underweight' | 'severely_underweight' | 'stunted' | 'severely_stunted' | 'wasted' | 'severely_wasted' | 'tall';

interface NutritionalStatusBadgeProps {
    status: NutritionalStatus | string | null;
    className?: string;
}

export function NutritionalStatusBadge({ status, className }: NutritionalStatusBadgeProps) {
    if (!status) return <Badge variant="secondary">No Data</Badge>;

    const s = status.toLowerCase();

    // Mapping for standard classes
    const styles: Record<string, string> = {
        normal: "bg-primary hover:bg-primary/90 text-primary-foreground",
        mam: "bg-orange-500 hover:bg-orange-600 text-white",
        sam: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
        overweight: "bg-blue-500 hover:bg-blue-600 text-white",
        obese: "bg-blue-700 hover:bg-blue-800 text-white",
        
        // Detailed WFA
        underweight: "bg-orange-400 hover:bg-orange-500 text-white",
        severely_underweight: "bg-destructive hover:bg-destructive/90 text-white",
        
        // Detailed HFA
        stunted: "bg-orange-400 hover:bg-orange-500 text-white",
        severely_stunted: "bg-destructive hover:bg-destructive/90 text-white",
        tall: "bg-purple-500 hover:bg-purple-600 text-white",
        
        // Detailed WFH
        wasted: "bg-orange-500 hover:bg-orange-600 text-white",
        severely_wasted: "bg-destructive hover:bg-destructive/90 text-white",
    };

    const label = status.replace(/_/g, ' ').toUpperCase();
    const style = styles[s] || "bg-slate-500";

    return (
        <Badge className={cn("font-bold tracking-tight px-2.5 py-0.5", style, className)}>
            {label}
        </Badge>
    );
}
