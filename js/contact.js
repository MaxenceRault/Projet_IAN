document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector(".contact-form-validate");

  const errorMessages = {
    nom: {
      valueMissing: "Veuillez entrer votre nom complet",
      tooShort: "Le nom doit contenir au moins 2 caractères",
    },
    email: {
      valueMissing: "Veuillez entrer votre adresse email",
      typeMismatch: "Veuillez entrer une adresse email valide",
    },
    sujet: {
      valueMissing: "Veuillez sélectionner un sujet",
    },
    message: {
      valueMissing: "Veuillez entrer votre message",
      tooShort: "Le message doit contenir au moins 10 caractères",
    },
  };

  function showError(input, message) {
    const formGroup = input.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");

    formGroup.classList.remove("is-valid");
    formGroup.classList.add("has-error");
    input.setAttribute("aria-invalid", "true");
    errorElement.textContent = message;

    // Add shake animation to highlight the error
    formGroup.classList.add("shake");
    setTimeout(() => formGroup.classList.remove("shake"), 500);
  }

  function showSuccess(input) {
    const formGroup = input.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");

    formGroup.classList.remove("has-error");
    formGroup.classList.add("is-valid");
    input.setAttribute("aria-invalid", "false");
    errorElement.textContent = "";
  }

  function clearValidation(input) {
    const formGroup = input.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");

    formGroup.classList.remove("has-error", "is-valid");
    input.setAttribute("aria-invalid", "false");
    errorElement.textContent = "";
  }

  function showFormMessage(message, isError = false) {
    // Supprimer tout message existant
    const existingMessage = document.getElementById("form-message");
    if (existingMessage) {
      existingMessage.remove();
    }

    // Créer le nouveau message
    const messageElement = document.createElement("div");
    messageElement.id = "form-message";
    messageElement.className = isError
      ? "form-error-message"
      : "form-success-message";
    messageElement.setAttribute("role", "alert");
    messageElement.textContent = message;

    // Insérer le message au début du formulaire
    form.insertBefore(messageElement, form.firstChild);

    // Faire défiler jusqu'au message
    messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function validateInput(input) {
    // If the field is empty and not required, or if it's empty and we haven't interacted with it yet
    if (input.value.trim() === "" && !input.hasAttribute("required")) {
      clearValidation(input);
      return true;
    }

    // If the field is empty but required, show error
    if (input.value.trim() === "" && input.hasAttribute("required")) {
      showError(input, errorMessages[input.name].valueMissing);
      return false;
    }

    // Validate the input
    if (!input.validity.valid) {
      let message = "";

      if (input.validity.typeMismatch) {
        message = errorMessages[input.name].typeMismatch;
      } else if (input.validity.tooShort) {
        message = errorMessages[input.name].tooShort;
      }

      showError(input, message);
      return false;
    }

    // If we get here, the input is valid
    showSuccess(input);
    return true;
  }

  // Add validation on blur (when leaving the field)
  form.querySelectorAll("input, select, textarea").forEach((input) => {
    // Initial state - no validation indication
    clearValidation(input);

    // Validate on blur
    input.addEventListener("blur", () => {
      if (input.value.trim() !== "") {
        validateInput(input);
      }
    });

    // Clear validation state when starting to type
    input.addEventListener("focus", () => {
      if (input.value.trim() === "") {
        clearValidation(input);
      }
    });

    // Validate while typing (but only if the field already has a validation state)
    input.addEventListener("input", () => {
      const formGroup = input.closest(".form-group");
      if (
        formGroup.classList.contains("has-error") ||
        formGroup.classList.contains("is-valid")
      ) {
        validateInput(input);
      }
    });
  });

  // Form submission
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    let isValid = true;
    let firstError = null;

    // Valider tous les champs
    form.querySelectorAll("input, select, textarea").forEach((input) => {
      if (!validateInput(input)) {
        isValid = false;
        if (!firstError) firstError = input;
      }
    });

    if (!isValid) {
      showFormMessage(
        "Veuillez corriger les erreurs dans le formulaire avant de l'envoyer.",
        true
      );
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => firstError.focus(), 500);
      }
      return;
    }

    // Si le formulaire est valide, envoi asynchrone
    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Succès
        showFormMessage("Votre message a été envoyé avec succès !");
        form.reset();
        form
          .querySelectorAll("input, select, textarea")
          .forEach(clearValidation);
      } else {
        // Erreur serveur
        throw new Error("Erreur serveur");
      }
    } catch (error) {
      showFormMessage(
        "Une erreur est survenue lors de l'envoi du formulaire. Veuillez réessayer.",
        true
      );
    }
  });
});
