import toast from 'react-hot-toast';

/**
 * Affiche un toast de succès
 */
export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  });
};

/**
 * Affiche un toast d'erreur
 */
export const showError = (message: string) => {
  toast.error(message, {
    duration: 5000,
    position: 'top-right',
    ariaProps: {
      role: 'alert',
      'aria-live': 'assertive',
    },
  });
};

/**
 * Affiche un toast d'information
 */
export const showInfo = (message: string) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: 'ℹ️',
    ariaProps: {
      role: 'status',
      'aria-live': 'polite',
    },
  });
};

/**
 * Affiche un toast de chargement
 */
export const showLoading = (message: string) => {
  return toast.loading(message, {
    position: 'top-right',
  });
};

/**
 * Dismiss un toast spécifique
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

/**
 * Dismiss tous les toasts
 */
export const dismissAllToasts = () => {
  toast.dismiss();
};
