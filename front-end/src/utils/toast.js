import toast from 'react-hot-toast'

/**
 * Centralized toast notifications for Vastraa application.
 * All toast calls across frontend and admin panel should use this utility
 * to ensure uniform styling, icons, and behavior.
 */
export const notify = {
  success: (message, options = {}) => {
    return toast.success(message, {
      ...options,
    })
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      ...options,
    })
  },

  info: (message, options = {}) => {
    return toast(message, {
      icon: 'ℹ️',
      ...options,
    })
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...options,
    })
  },

  dismiss: (toastId) => {
    toast.dismiss(toastId)
  },

  promise: (promise, messages, options = {}) => {
    return toast.promise(promise, messages, options)
  },
}

export default notify

