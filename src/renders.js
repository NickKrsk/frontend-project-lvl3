export const renderValidation = (submitButton, input, state) => {
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
  const renderFeed = (feed) => `<li><b>${feed.title}</b>\n${feed.description}</li>`;
  feedsElement.innerHTML = `<ul>${state.feeds.map((feed) => renderFeed(feed)).join('')}</ul>`;
};

export const renderPosts = (state) => {
  const postsElement = document.getElementById('posts');
  const renderPost = (post) => `<li><a href=${post.postLink} target="_blank">${post.postTitle}</a></li>`;
  postsElement.innerHTML = `<ul>${state.posts.map((post) => renderPost(post)).join('')}</ul>`;
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
