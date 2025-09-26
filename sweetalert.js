function showAlert(message, type) {
    Swal.fire({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        text: message,
        icon: type,
        confirmButtonText: 'OK'
    });
}
function confirmAction(message) {
    return Swal.fire({
        title: 'Confirmation',
        text: message, // Dynamic message
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Okay',
        cancelButtonText: 'Cancel',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            return true;
        } else {
            return false; 
        }
    });
}