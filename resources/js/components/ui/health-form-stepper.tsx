import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface HealthFormStepperProps {
    value: number;
    onChange: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
    unit?: string;
    label?: string;
    className?: string;
}

export function HealthFormStepper({
    value,
    onChange,
    step = 0.1,
    min = 0,
    max = 200,
    unit = "kg",
    label,
    className
}: HealthFormStepperProps) {
    const handleIncrement = () => {
        const newValue = Math.min(max, parseFloat((value + step).toFixed(2)));
        onChange(newValue);
    };

    const handleDecrement = () => {
        const newValue = Math.max(min, parseFloat((value - step).toFixed(2)));
        onChange(newValue);
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>}
            <div className="flex items-center gap-1">
                <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 shrink-0 rounded-l-lg border-primary/20 hover:bg-primary/10 hover:text-primary active:scale-95"
                    onClick={handleDecrement}
                >
                    <Minus className="h-6 w-6" />
                </Button>
                <div className="relative flex-1">
                    <Input
                        type="number"
                        step={step}
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                        className="h-12 text-center text-lg font-bold pr-10 focus-visible:ring-primary appearance-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground uppercase">
                        {unit}
                    </span>
                </div>
                <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 shrink-0 rounded-r-lg border-primary/20 hover:bg-primary/10 hover:text-primary active:scale-95"
                    onClick={handleIncrement}
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}
