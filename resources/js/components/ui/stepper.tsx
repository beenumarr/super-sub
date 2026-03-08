import { cn } from "@/lib/utils";
import React from "react";

interface StepperProps {
    activeStep: number;
    alternativeLabel?: boolean;
    children: React.ReactNode;
    className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
    activeStep = 0,
    alternativeLabel = false,
    children,
    className,
}) => {
    const childrenArray = React.Children.toArray(children);

    return (
        <div className={cn("flex w-full", alternativeLabel ? "flex-row" : "flex-col", className)}>
            {childrenArray.map((child, index) => {
                if (!React.isValidElement(child)) return null;

                return React.cloneElement(child as React.ReactElement<StepProps>, {
                    index,
                    active: index === activeStep,
                    completed: index < activeStep,
                    last: index === childrenArray.length - 1,
                    alternativeLabel,
                });
            })}
        </div>
    );
};

export interface StepProps {
    active?: boolean;
    completed?: boolean;
    index?: number;
    last?: boolean;
    alternativeLabel?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export const Step: React.FC<StepProps> = ({
    active = false,
    completed = false,
    index = 0,
    last = false,
    alternativeLabel = false,
    className,
    children,
}) => {
    return (
        <div className={cn(
            "relative flex",
            alternativeLabel ? "flex-1 flex-col items-center" : "items-center",
            className
        )}>
            <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2",
                active ? "border-transparent bg-theme-1 text-white" :
                completed ? "border-transparent bg-primary text-white" :
                "border-gray-300 bg-white text-gray-500"
            )}>
                {completed ? (
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <span>{index + 1}</span>
                )}
            </div>

            {!last && alternativeLabel && (
                <div className={cn(
                    "absolute top-4 w-full border-t",
                    (active || completed) ? "border-transparent" : "border-transparent"
                )} />
            )}

            {!last && !alternativeLabel && (
                <div className={cn(
                    "ml-4 flex-1 border-t",
                    (active || completed) ? "border-transparent" : "border-transparent"
                )} />
            )}

            {children}
        </div>
    );
};

export interface StepLabelProps {
    children?: React.ReactNode;
    className?: string;
}

export const StepLabel: React.FC<StepLabelProps> = ({
    children,
    className,
}) => {
    return (
        <span className={cn("mt-2 text-xs font-medium", className)}>
            {children}
        </span>
    );
};
