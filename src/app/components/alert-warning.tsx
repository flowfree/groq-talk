'use client'

export function AlertWarning({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`w-full p-2 text-yellow-900 bg-yellow-50 border-yellow-100 rounded-md  ${className}`}>
      <div className="grow">
        {children}
      </div>
    </div>
  )
}
