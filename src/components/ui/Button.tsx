import React, { FC,ButtonHTMLAttributes } from "react";
import { cva,VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "active:scale95 inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo transition ease-in-out duration-150 sm:text-sm sm:leading-5",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white hover:bg-slate-800",
        ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
      },
      size: {
        default: "j-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-12 px-6",
      },
    },
    defaultVariants:{
      size: "default",
      variant: "default",
    }
  }
);
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> ,VariantProps<typeof buttonVariants>{
  isLoading?:boolean
  
}
const Button:FC<ButtonProps> = ({className,children,variant,isLoading,size,...props})=>{
  return <button className={cn(buttonVariants({variant,size,className}))} disabled={isLoading}{...props}>
    {isLoading ?<Loader2 className='mr-2 h4 w4 animate-spin'/>:null}
    {children}
  </button>
}
export default Button