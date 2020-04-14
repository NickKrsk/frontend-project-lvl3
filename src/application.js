import _ from 'lodash';
import { watch } from 'melanke-watchjs';
import * as yup from 'yup';
import axios from 'axios';
//import DOMParser from 'xmldom';

import { renderValidation, renderFeedsAndPosts, renderSpinner, renderErrors } from './renders';

const schema = yup.object().shape({
  rss: yup.string().required().min(5),
});

const parseDocument = (doc) => {
  const channel = doc.querySelector('channel');
  //console.log(channel);
  const title = channel.querySelector('title').innerHTML;
  const description = channel.querySelector('description').innerHTML;  

  const posts = [];

  const items = channel.querySelectorAll('item');
  //console.log(items);
  items.forEach(item => {
    //console.log(item);
    const postTitle = item.querySelector('title').textContent;//innerHTML;
    const postDescription = item.querySelector('description').textContent;//innerHTML; 
    const postLink = item.querySelector('link').innerHTML;
    posts.push({
      postTitle,
      postDescription,  
      postLink,
    });
  });

  return {
    title,
    description,
    posts,
  };
}

const updateValidationState = (state) => {
  if (_.findIndex(state.feeds, el => el.url === state.form.fields.rss) >= 0) {
    state.form.valid = false;
    return;
  }

  try {
    //console.log(state.form.fields);
    schema.validateSync(state.form.fields, { abortEarly: false });
    state.form.valid = true;
    // state.form.errors = {};
  } catch (e) {
    const errors = _.keyBy(e.inner, 'path');  
    state.form.errors = errors;
    state.form.valid = false;    
  }
}

export default () => {
  const state = {
    form: {
      valid: true,
      fields: {
        rss: '',
      },
      errors: [],
      processState: 'filling',
    },
    feeds: [],
    posts: [],
  };

  const submitButton = document.querySelector('input[type="submit"]');
  const input = document.getElementById('input-rss');
  input.addEventListener('keyup', () => {
    state.form.fields.rss = input.value;
    updateValidationState(state);
  });

  const form = document.querySelector('[data-form="add-rss-form"]');
  form.addEventListener('submit', (e) => {
    e.preventDefault();  
    const formData = new FormData(e.target);
    const proxy = 'https://cors-anywhere.herokuapp.com';
    const url = formData.get('rss');
    const proxyUrl = `${proxy}/${url}` 

    state.form.processState = 'processing';

    // http://lorem-rss.herokuapp.com/feed
    //https://ru.hexlet.io/lessons.rss
    axios.get(proxyUrl) 
    .then(response => {
      let domparser = new DOMParser();
      const doc = domparser.parseFromString(response.data, 'text/xml');// text/xml
      console.log(doc);

      const { title, description, posts } = parseDocument(doc);
      state.feeds.push({
        url,
        title,
        description,
      });
      state.posts = [...state.posts, ...posts];
      state.form.processState = 'filling';
    })
    .catch(error => {
      console.log('haha error!');
      //console.log(error);
      state.form.errors = error;
      state.form.processState = 'filling';
    });
    input.value = "";
  });

  /*watch(state.form, 'valid', () => {
    submitButton.disabled = !state.form.valid; 
    input.style.border = state.form.valid ? null : "thick solid red";
  });*/
  watch(state.form, 'valid', () => renderValidation(submitButton, input, state));
  watch(state, 'feeds', () => renderFeedsAndPosts(state));
  watch(state.form, 'processState', () => renderSpinner(state));
  watch(state.form, 'errors', () => renderErrors(state));
}