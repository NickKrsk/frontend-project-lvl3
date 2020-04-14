

export const renderValidation = (submitButton, input, state) => {
    //input.style.border = state.form.valid ? null : "thick solid red";
    if (state.form.valid) {
        input.classList.remove('is-invalid');
        submitButton.disabled = false; 
    }

    if (!state.form.valid) {
        input.classList.add('is-invalid');
        submitButton.disabled = true; 
    }
}

export const renderFeedsAndPosts = (state) => {
    const resultElement = document.getElementById('result');
    const postsElement = document.getElementById('posts');
    resultElement.innerHTML = `<ul>${state.feeds.map(feed => `<li><b>${feed.title}</b>\n${feed.description}</li>`).join('')}</ul>`;
    postsElement.innerHTML = `<ul>${state.posts.map(post => `<li><a href=${post.postLink} target="_blank">${post.postTitle}</a></li>`).join('')}</ul>`;
}

export const renderSpinner = (state) => {
    const spinner = document.querySelector('.spinner-grow');    
    const jumbotron = document.querySelector('.jumbotron');

    if (state.form.processState === 'filling') {
      spinner.classList.add('d-none');
      //jumbotron.classList.remove('d-none');
      return;
    }
    if (state.form.processState === 'processing') {
      spinner.classList.remove('d-none');
      //jumbotron.classList.add('d-none');
      return;
    }
}

export const renderErrors = (state) => {
    /*const jumbotron = document.querySelector('.jumbotron');
    const div = document.createElement('div');
    div.classList.add('text-danger');
    div.textContent = 'haha';
    jumbotron.appendChild(div);
    console.log(state.form.errors);*/
}