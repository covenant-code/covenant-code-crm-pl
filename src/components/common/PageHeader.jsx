export function PageHeader({ title, subtitle, extra }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary m-0">{title}</h1>
        {subtitle && <p className="text-sm text-text-secondary mt-1 mb-0">{subtitle}</p>}
      </div>
      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </div>
  )
}
