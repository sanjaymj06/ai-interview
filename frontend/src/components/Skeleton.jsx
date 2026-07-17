export function CardSkeleton({ className = '' }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="skeleton h-4 w-24 mb-4" />
      <div className="skeleton h-8 w-16 mb-2" />
      <div className="skeleton h-3 w-32" />
    </div>
  );
}

export function ChartSkeleton({ className = '' }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="skeleton h-4 w-32 mb-6" />
      <div className="skeleton h-64 w-full rounded-xl" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, className = '' }) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="skeleton h-5 w-24" />
        <div className="skeleton h-9 w-48 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="skeleton h-4 flex-1" />
            <div className="skeleton h-4 w-20" />
            <div className="skeleton h-4 w-16" />
            <div className="skeleton h-8 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TextSkeleton({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4"
          style={{ width: `${100 - i * 15}%` }}
        />
      ))}
    </div>
  );
}

export function ProfileSkeleton({ className = '' }) {
  return (
    <div className={`glass-card p-8 ${className}`}>
      <div className="flex items-center gap-6 mb-8">
        <div className="skeleton h-20 w-20 rounded-full" />
        <div className="flex-1">
          <div className="skeleton h-6 w-40 mb-2" />
          <div className="skeleton h-4 w-56" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton h-3 w-20 mb-2" />
            <div className="skeleton h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
