import Swal from 'sweetalert2';

/**
 * SweetAlert confirm box
 * @param {string} message - The confirmation message
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise
 */
export function ConfirmAlert(message) {
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    return Swal.fire({
        title: 'Are you sure?',
        text: message,
        icon: 'warning',
        showCancelButton: true,
        background: isDark ? '#2b3035' : '#fff',
        color: isDark ? '#f8f9fa' : '#545454',
        customClass: {
            confirmButton: 'btn btn-primary btn-hover',
            cancelButton: 'btn btn-danger btn-hover ms-2',
        },
        confirmButtonText: 'Continue',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        return result.isConfirmed;
    });
}