(() => {
  'use strict'
  const forms = document.querySelectorAll('.needs-validation')
  console.log("DEBUG: Forms found =>", forms.length);
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        console.log("DEBUG: Invalid form detected");
        event.preventDefault()
        event.stopPropagation()
      }
      form.classList.add('was-validated')
    }, false)
  })
})()
