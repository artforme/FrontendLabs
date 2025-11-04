import JustValidate from "just-validate";

document.addEventListener("DOMContentLoaded", function () {
  const validatorFooter = new JustValidate(".newsletter__form", {
    validateBeforeSubmitting: true,
    focusUnvalidField: true,
    errorLabelStyle: { display: "none" },
    errorFieldCssClass: "is-invalid",
  });

  validatorFooter
    .addField("#conditional-checkbox", [{ rule: "required" }])
    .addField("#before-submit_newsletter_email", [
      { rule: "required" },
      { rule: "email" },
    ])
    .onSuccess((event) => {
      event.preventDefault();

      const form = event.currentTarget;
      const formData = new FormData(form);

      fetch("https://httpbin.org/post", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Success", data);
          form.reset();
        })
        .catch(console.error);
    });
});