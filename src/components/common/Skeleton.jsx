import React from 'react';
import { motion } from 'framer-motion';

const SkeletonBase = ({ className, variant = 'rect' }) => {
    const variants = {
        rect: "rounded-[2rem]",
        circle: "rounded-full",
        text: "rounded-lg h-4 w-full",
    };

    return (
        <div className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${variants[variant]} ${className}`}>
            <motion.div 
                animate={{ 
                    x: ['-100%', '100%'] 
                }}
                transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent skew-x-12"
            />
        </div>
    );
};

export const ProductCardSkeleton = () => (
    <div className="bg-white dark:bg-dark-card rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <SkeletonBase className="aspect-square w-full rounded-[2rem]" />
        <div className="space-y-4">
            <div className="flex justify-between items-start">
                <SkeletonBase className="h-6 w-2/3" />
                <SkeletonBase className="h-4 w-12" />
            </div>
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-5/6" />
            <div className="flex justify-between items-center pt-4">
                <SkeletonBase className="h-8 w-24" />
                <SkeletonBase className="h-12 w-12 rounded-2xl" />
            </div>
        </div>
    </div>
);

export const OrderSkeleton = () => (
    <div className="p-8 flex items-center space-x-6 bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-gray-800 mb-4 shadow-sm">
        <SkeletonBase className="w-20 h-20 rounded-3xl" />
        <div className="flex-1 space-y-3">
            <SkeletonBase className="h-6 w-1/3" />
            <SkeletonBase className="h-4 w-1/4" />
        </div>
        <SkeletonBase className="h-12 w-32 rounded-2xl" />
    </div>
);

export const CategorySkeleton = () => (
     <div className="flex flex-col items-center space-y-6">
        <SkeletonBase className="w-24 h-24 rounded-[2rem]" />
        <SkeletonBase className="h-4 w-20" />
    </div>
);

export const DashboardCardSkeleton = () => (
    <div className="bg-white dark:bg-dark-card p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex justify-between items-start mb-6">
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="h-10 w-10 rounded-xl" />
        </div>
        <SkeletonBase className="h-10 w-32 mb-4" />
        <SkeletonBase className="h-4 w-full" />
    </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
    <div className="bg-white dark:bg-dark-card rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-gray-50 dark:border-gray-800">
            <SkeletonBase className="h-6 w-48" />
        </div>
        <div className="p-8 space-y-6">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="flex items-center space-x-6">
                    <SkeletonBase className="h-12 w-12 rounded-2xl" />
                    <div className="flex-1 space-y-3">
                        <SkeletonBase className="h-4 w-full" />
                        <SkeletonBase className="h-3 w-2/3" />
                    </div>
                    <SkeletonBase className="h-10 w-24 rounded-xl" />
                </div>
            ))}
        </div>
    </div>
);

const Skeleton = SkeletonBase;
export default Skeleton;
