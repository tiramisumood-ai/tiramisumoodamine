const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".main-nav a");
const revealItems = document.querySelectorAll(".section-reveal");
const orderForm = document.querySelector(".order-form");
const formMessage = document.querySelector(".form-message");
const legalModal = document.querySelector(".legal-modal");
const legalOpen = document.querySelector("[data-legal-open]");
const legalCloseItems = document.querySelectorAll("[data-legal-close]");
const orderSubmitButton = orderForm.querySelector("button[type='submit']");
const ingredientsModal = document.querySelector(".ingredients-modal");
const ingredientsTitle = document.querySelector("#ingredients-title");
const ingredientsList = document.querySelector(".ingredients-list");
const ingredientsButtons = document.querySelectorAll(".ingredients-button");
const ingredientsCloseItems = document.querySelectorAll("[data-ingredients-close]");

const emailJsConfig = {
  serviceId: "service_8l3vwot",
  orderTemplateId: "template_1prhvxh",
  confirmationTemplateId: "template_fb6xeyc",
  publicKey: "uHc0C-GnVHycALXuG",
};

if (window.emailjs) {
  emailjs.init({
    publicKey: emailJsConfig.publicKey,
  });
}

// Ouvre et ferme le menu mobile.
menuToggle.addEventListener("click", () => {
  header.classList.toggle("is-open");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
  });
});

// Fait apparaître les sections progressivement au scroll.
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.16,
  }
);

revealItems.forEach((item) => observer.observe(item));

// Ouvre les mentions légales dans une modale élégante sans quitter la page.
const openLegalModal = () => {
  legalModal.classList.add("is-open");
  legalModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closeLegalModal = () => {
  legalModal.classList.remove("is-open");
  legalModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

legalOpen.addEventListener("click", (event) => {
  event.preventDefault();
  openLegalModal();
});

legalCloseItems.forEach((item) => {
  item.addEventListener("click", closeLegalModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && legalModal.classList.contains("is-open")) {
    closeLegalModal();
  }

  if (event.key === "Escape" && ingredientsModal.classList.contains("is-open")) {
    closeIngredientsModal();
  }
});

const openIngredientsModal = (button) => {
  const ingredients = button.dataset.ingredients.split("|");
  ingredientsTitle.textContent = button.dataset.product;
  ingredientsList.innerHTML = ingredients.map((ingredient) => `<li>${ingredient}</li>`).join("");
  ingredientsModal.classList.add("is-open");
  ingredientsModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closeIngredientsModal = () => {
  ingredientsModal.classList.remove("is-open");
  ingredientsModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

ingredientsButtons.forEach((button) => {
  button.addEventListener("click", () => openIngredientsModal(button));
});

ingredientsCloseItems.forEach((item) => {
  item.addEventListener("click", closeIngredientsModal);
});

const formFields = {
  nom: orderForm.elements.nom,
  telephone: orderForm.elements.telephone,
  email: orderForm.elements.email,
  tiramisu: orderForm.elements.tiramisu,
  quantite: orderForm.elements.quantite,
  adresse: orderForm.elements.adresse,
  message: orderForm.elements.message,
};

const allowedTiramisus = Array.from(formFields.tiramisu.options)
  .map((option) => option.value)
  .filter(Boolean);

const errorMessages = {
  nom: "Veuillez entrer un nom valide.",
  telephone: "Veuillez entrer un numéro de téléphone français valide.",
  email: "Veuillez entrer une adresse e-mail valide.",
  tiramisu: "Veuillez choisir un tiramisu.",
  quantite: "Veuillez entrer une quantité entre 1 et 20.",
  adresse: "Veuillez entrer une adresse de livraison complète.",
  message: "Les liens ne sont pas autorisés dans le message.",
};

const getOrCreateError = (field) => {
  const errorId = `${field.id}-error`;
  let error = document.querySelector(`#${errorId}`);

  if (!error) {
    error = document.createElement("span");
    error.className = "field-error";
    error.id = errorId;
    error.setAttribute("aria-live", "polite");
    field.insertAdjacentElement("afterend", error);
    field.setAttribute("aria-describedby", errorId);
  }

  return error;
};

const setFieldError = (field, message) => {
  const error = getOrCreateError(field);
  error.textContent = message;
  field.classList.add("is-invalid");
  field.setAttribute("aria-invalid", "true");
};

const clearFieldError = (field) => {
  const error = getOrCreateError(field);
  error.textContent = "";
  field.classList.remove("is-invalid");
  field.setAttribute("aria-invalid", "false");
};

const hasSuspiciousContent = (value) => /<script\b|<\/script>|https?:\/\/|www\.|<[^>]+>/i.test(value);

const validateOrderForm = () => {
  const values = {
    nom: formFields.nom.value.trim(),
    telephone: formFields.telephone.value.trim(),
    email: formFields.email.value.trim(),
    tiramisu: formFields.tiramisu.value.trim(),
    quantite: formFields.quantite.value.trim(),
    adresse: formFields.adresse.value.trim(),
    message: formFields.message.value.trim(),
  };

  const rules = {
    nom: values.nom.length >= 2 && values.nom.length <= 50 && /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(values.nom),
    telephone: /^(?:0[67]\d{8}|\+33[67]\d{8})$/.test(values.telephone),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email),
    tiramisu: allowedTiramisus.includes(values.tiramisu),
    quantite: /^\d+$/.test(values.quantite) && Number(values.quantite) >= 1 && Number(values.quantite) <= 20,
    adresse:
      values.adresse.length >= 8 &&
      values.adresse.length <= 120 &&
      /\d/.test(values.adresse) &&
      /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(values.adresse),
    message: values.message.length <= 300 && !hasSuspiciousContent(values.message),
  };

  Object.entries(formFields).forEach(([name, field]) => {
    if (rules[name]) {
      clearFieldError(field);
    } else {
      setFieldError(field, errorMessages[name]);
    }
  });

  return {
    isValid: Object.values(rules).every(Boolean),
    values,
  };
};

Object.values(formFields).forEach((field) => {
  field.addEventListener("input", () => {
    if (field.classList.contains("is-invalid")) {
      validateOrderForm();
    }
  });

  field.addEventListener("change", () => {
    if (field.classList.contains("is-invalid")) {
      validateOrderForm();
    }
  });
});

// EmailJS envoie une commande à TiraMood, puis une confirmation au client.
orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { isValid, values } = validateOrderForm();

  if (!isValid) {
    formMessage.textContent = "Veuillez corriger les champs indiqués avant d'envoyer la commande.";
    const firstInvalidField = orderForm.querySelector(".is-invalid");
    firstInvalidField?.focus();
    return;
  }

  const templateParams = {
    nom: values.nom,
    telephone: values.telephone,
    email: values.email,
    tiramisu: values.tiramisu,
    quantite: values.quantite,
    adresse: values.adresse,
    message: values.message || "Aucune précision",
  };

  try {
    if (!window.emailjs) {
      throw new Error("EmailJS n'est pas chargé.");
    }

    orderSubmitButton.disabled = true;
    formMessage.textContent = "Envoi de votre commande...";

    await emailjs.send(
      emailJsConfig.serviceId,
      emailJsConfig.confirmationTemplateId,
      templateParams
    );

    await emailjs.send(
      emailJsConfig.serviceId,
      emailJsConfig.orderTemplateId,
      templateParams
    );

    formMessage.textContent =
      "Merci, votre commande a bien été envoyée. Un e-mail de confirmation vous a été envoyé.";
    orderForm.reset();
    Object.values(formFields).forEach(clearFieldError);
  } catch (error) {
    formMessage.textContent =
      "Une erreur est survenue pendant l'envoi. Vérifiez la configuration EmailJS puis réessayez.";
  } finally {
    orderSubmitButton.disabled = false;
  }
});
