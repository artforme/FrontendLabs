import JustValidate from "just-validate";

document.addEventListener("DOMContentLoaded", () => {
  const postForm = async (form) => {
    const formData = new FormData(form);
    const res = await fetch("https://httpbin.org/post", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    console.log("Success:", data);

    form.reset();
  };

  const form = document.querySelector(".contact-form__field-group");
  if (!form) return;

  const validate = new JustValidate(form, {
    validateBeforeSubmitting: true,
    focusInvalidField: true,
    errorLabelStyle: { display: "none" },
    errorFieldCssClass: "is-invalid",
  });

  validate
    .addField("#before-submit_email", [{ rule: "required" }, { rule: "email" }])
    .addField("#before-submit_name", [
      { rule: "required" },
      { rule: "minLength", value: 2 },
      { rule: "maxLength", value: 50 },
      {
        rule: "customRegexp",
        value: /^[A-Za-zА-Яа-яЁё\s'-]+$/,
      },
    ])
    .addField("#before-submit_questions", [
      {
        rule: "maxLength",
        value: 1000,
      },
    ])
    .addField("#tooltips_consent_checkbox", [{ rule: "required" }], {
      errorsContainer: document.getElementById(
        "tooltips_consent_checkbox-errors-container",
      ),
    })
    .onSuccess(async (event) => {
      event.preventDefault();
      try {
        await postForm(event.currentTarget);
      } catch (e) {
        console.error(e);
      }
    });
});