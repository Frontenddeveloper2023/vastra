import { Save, Edit2, Trash2, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Standard Save Button
 */
export function AdminSaveButton({
  onClick,
  children = 'Save Changes',
  disabled = false,
  className = '',
  type = 'button',
  icon = true,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-[#6D021B] hover:bg-[#850320] text-white text-xs font-bold rounded-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${className}`}
      {...props}
    >
      {icon && <Save className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </button>
  )
}

/**
 * Standard Update Button
 */
export function AdminUpdateButton({
  onClick,
  children = 'Update',
  disabled = false,
  className = '',
  type = 'button',
  icon = true,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-[#6D021B] hover:bg-[#850320] text-white text-xs font-bold rounded-none transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs ${className}`}
      {...props}
    >
      {icon && <RefreshCw className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </button>
  )
}

/**
 * Standard Edit Button
 */
export function AdminEditButton({
  onClick,
  children = 'Edit',
  disabled = false,
  className = '',
  type = 'button',
  icon = true,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 text-stone-600 hover:text-[#6D021B] hover:bg-[#FAF7F2] border border-[#EDE4D8] rounded-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1 text-xs font-semibold ${className}`}
      title={typeof children === 'string' ? children : 'Edit'}
      {...props}
    >
      {icon && <Edit2 className="w-3.5 h-3.5 shrink-0" />}
      {children !== 'Edit' && <span>{children}</span>}
    </button>
  )
}

/**
 * Standard Delete Button
 */
export function AdminDeleteButton({
  onClick,
  children = 'Delete',
  disabled = false,
  className = '',
  type = 'button',
  icon = true,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`p-1.5 text-stone-600 hover:text-red-700 hover:bg-red-50 border border-[#EDE4D8] rounded-none transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1 text-xs font-semibold ${className}`}
      title={typeof children === 'string' ? children : 'Delete'}
      {...props}
    >
      {icon && <Trash2 className="w-3.5 h-3.5 shrink-0" />}
      {children !== 'Delete' && <span>{children}</span>}
    </button>
  )
}

/**
 * Standard Cancel Button
 */
export function AdminCancelButton({
  onClick,
  children = 'Cancel',
  disabled = false,
  className = '',
  type = 'button',
  icon = true,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-none transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {icon && <X className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </button>
  )
}

/**
 * Standard Luxury Admin Table Container
 */
export function AdminTableContainer({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white border border-[#EDE4D8] rounded-none shadow-2xs overflow-hidden ${className}`}
      {...props}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          {children}
        </table>
      </div>
    </div>
  )
}

/**
 * Standard Table Head
 */
export function AdminTableHead({ columns = [], children }) {
  if (children) {
    return (
      <thead>
        <tr className="bg-[#FAF7F2] border-b border-[#EDE4D8] text-[#73655B] uppercase font-bold tracking-wider text-[11px]">
          {children}
        </tr>
      </thead>
    )
  }

  return (
    <thead>
      <tr className="bg-[#FAF7F2] border-b border-[#EDE4D8] text-[#73655B] uppercase font-bold tracking-wider text-[11px]">
        {columns.map((col, idx) => (
          <th
            key={idx}
            className={`py-3.5 px-4 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
          >
            {col.label || col}
          </th>
        ))}
      </tr>
    </thead>
  )
}

/**
 * Standard Table Body
 */
export function AdminTableBody({ children, className = '' }) {
  return (
    <tbody className={`divide-y divide-[#EDE4D8]/60 ${className}`}>
      {children}
    </tbody>
  )
}

/**
 * Standard Admin Pagination Bar (8 items per page standard)
 */
export function AdminPagination({
  currentPage,
  totalCount,
  pageSize = 8,
  onPageChange,
  itemName = 'items',
}) {
  const totalPages = Math.ceil(totalCount / pageSize) || 1
  if (totalCount <= 0) return null

  return (
    <div className="p-4 border-t border-[#EDE4D8] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF7F2]/60 select-none">
    

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-none text-xs font-semibold transition-all ${
            currentPage === 1
              ? 'text-stone-300 border border-stone-200 cursor-not-allowed bg-stone-50'
              : 'text-[#1F1713] border border-[#EDE4D8] bg-white hover:border-[#6D021B] hover:text-[#6D021B] cursor-pointer shadow-2xs'
          }`}
        >
          <span>Prev</span>
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
            const isActive = num === currentPage
            return (
              <button
                key={num}
                type="button"
                onClick={() => onPageChange(num)}
                className={`w-8 h-8 rounded-none text-xs font-bold transition-all cursor-pointer flex items-center justify-center border ${
                  isActive
                    ? 'bg-[#6D021B] text-white border-[#6D021B] shadow-xs'
                    : 'bg-white text-stone-700 border-[#EDE4D8] hover:border-[#6D021B] hover:text-[#6D021B]'
                }`}
              >
                {num}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-none text-xs font-semibold transition-all ${
            currentPage === totalPages
              ? 'text-stone-300 border border-stone-200 cursor-not-allowed bg-stone-50'
              : 'text-[#1F1713] border border-[#EDE4D8] bg-white hover:border-[#6D021B] hover:text-[#6D021B] cursor-pointer shadow-2xs'
          }`}
        >
          <span>Next</span>
        </button>
      </div>
    </div>
  )
}

