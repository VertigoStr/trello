/**
 * Loading Skeleton component for placeholder content.
 */

import React from 'react'

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

/**
 * Form Loading Skeleton for input fields.
 */
export function FormLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <LoadingSkeleton className="h-4 w-20 mb-2" />
        <LoadingSkeleton className="h-10 w-full" />
      </div>
      <div>
        <LoadingSkeleton className="h-4 w-20 mb-2" />
        <LoadingSkeleton className="h-10 w-full" />
      </div>
      <div>
        <LoadingSkeleton className="h-4 w-20 mb-2" />
        <LoadingSkeleton className="h-10 w-full" />
      </div>
      <LoadingSkeleton className="h-10 w-full mt-6" />
    </div>
  )
}

/**
 * Dashboard Loading Skeleton.
 */
export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <LoadingSkeleton className="h-6 w-3/4 mb-4" />
            <LoadingSkeleton className="h-4 w-full mb-2" />
            <LoadingSkeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Profile Loading Skeleton.
 */
export function ProfileLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <LoadingSkeleton className="h-8 w-32" />
      <div className="space-y-4">
        <div>
          <LoadingSkeleton className="h-4 w-20 mb-2" />
          <LoadingSkeleton className="h-10 w-full" />
        </div>
        <div>
          <LoadingSkeleton className="h-4 w-20 mb-2" />
          <LoadingSkeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}

export default LoadingSkeleton
