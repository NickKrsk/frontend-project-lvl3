export const renderValidation = (submitButton, input, state) => {
  // input.style.border = state.form.valid ? null : "thick solid red";
  if (state.form.valid) {
    input.classList.remove('is-invalid');
    submitButton.disabled = false;
  }

  if (!state.form.valid) {
    input.classList.add('is-invalid');
    submitButton.disabled = true;
  }
};

export const renderFeeds = (state) => {
  const feedsElement = document.getElementById('feeds');
  feedsElement.innerHTML = `<ul>${state.feeds.map((feed) => `<li><b>${feed.title}</b>\n${feed.description}</li>`).join('')}</ul>`;
};

export const renderPosts = (state) => {
  const postsElement = document.getElementById('posts');
  postsElement.innerHTML = `<ul>${state.posts.map((post) => `<li><a href=${post.postLink} target="_blank">${post.postTitle}</a></li>`).join('')}</ul>`;
};

export const renderSpinner = (state) => {
  const spinner = document.querySelector('.spinner-border');

  if (state.form.processState === 'filling') {
    spinner.classList.add('d-none');
    return;
  }
  if (state.form.processState === 'processing') {
    spinner.classList.remove('d-none');
  }
};

export const renderErrors = (errors) => {
  const errorsElement = document.querySelector('[name="errors"]');
  errorsElement.innerHTML = '';

  errors.forEach((error) => {
    const div = document.createElement('div');
    div.classList.add('text-danger');
    div.textContent = error.name;
    errorsElement.append(div);
  });
};
