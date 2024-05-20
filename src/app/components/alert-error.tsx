export function AlertError({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full rounded-md mt-4 p-4 bg-red-50 text-red-800 text-sm">
      {children}
    </div>
  )
}
