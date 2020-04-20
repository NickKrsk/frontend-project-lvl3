import _ from 'lodash';
import { watch } from 'melanke-watchjs';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import uniqid from 'uniqid';
import {
  renderValidation, renderFeeds, renderPosts, renderSpinner, renderErrors,
} from './renders';
import resources from './locales';

const proxy = 'https://cors-anywhere.herokuapp.com';

const schema = yup.object().shape({
  rss: yup.string().required().min(5),
});

const parseDocument = (doc) => {
  const channel = doc.querySelector('channel');
  // console.log(channel);
  const title = channel.querySelector('title').innerHTML;
  const description = channel.querySelector('description').innerHTML;

  const posts = [];

  const items = channel.querySelectorAll('item');
  // console.log(items);
  items.forEach((item) => {
    // console.log(item);
    const postTitle = item.querySelector('title').textContent;// innerHTML;
    const postDescription = item.querySelector('description').textContent;// innerHTML;
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
};

const updateValidationState = (state) => {
  if (_.find(state.feeds, (el) => el.url === state.form.fields.rss)) {
    state.form.valid = false;
    state.form.errors = [{
      name: 'RSS already exist',
    }];
    return;
  }

  try {
    schema.validateSync(state.form.fields, { abortEarly: false });
    state.form.valid = true;
    state.form.errors = [];
  } catch (e) {
    // const errors = _.keyBy(e.inner, 'path');
    const { errors } = e;
    state.form.errors = [{
      name: errors.toString(),
    }];
    state.form.valid = false;
  }
};

const getStream = (state, url) => {
  // http://lorem-rss.herokuapp.com/feed
  // https://ru.hexlet.io/lessons.rss
  // http://static.feed.rbc.ru/rbc/logical/footer/news.rss

  const proxyUrl = `${proxy}/${url}`;

  return axios.get(proxyUrl)
    .then((response) => {
      const domparser = new DOMParser();
      const doc = domparser.parseFromString(response.data, 'text/xml');
      const { title, description, posts } = parseDocument(doc);
      return {
        url,
        title,
        description,
        posts,
      };
    })
    .catch((error) => {
      state.form.errors = [{
        name: error,
      }];
      state.form.processState = 'filling';
    });
};

const findNewPosts = (state) => {
  const updateCheckPeriod = 2000;
  const iter = () => {
    state.feeds.forEach(({ url }) => {
      getStream(state, url)
        .then(({ posts }) => {
          const predicate = (postLink) => _.find(state.posts, (post) => post.postLink === postLink);
          const newPosts = posts.filter(({ postLink }) => !predicate(postLink));
          state.posts = [...state.posts, ...newPosts];
        })
        .catch((error) => {
          state.form.errors = [{
            name: error,
          }];
        });
    });
    setTimeout(iter, updateCheckPeriod);
  };
  iter();
};

export default () => {
  const submitButton = document.querySelector('input[type="submit"]');
  const input = document.getElementById('input-rss');
  const form = document.querySelector('[data-form="add-rss-form"]');

  const state = {
    form: {
      valid: true,
      fields: {
        rss: '',
      },
      errors: [],
      processState: 'filling', // filling, processing,
    },
    feeds: [],
    posts: [],
  };

  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  })
    .then(() => {
      document.getElementById('head').innerHTML = i18next.t('head');
      submitButton.value = i18next.t('buttons.submit');
      document.querySelector('title').innerHTML = i18next.t('title');
      input.placeholder = i18next.t('input.placeholder');
    })
    .catch((error) => {
      state.form.errors = [{
        name: error,
      }];
    });

  input.addEventListener('keyup', () => {
    state.form.fields.rss = input.value;
    updateValidationState(state);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('rss');

    state.form.processState = 'processing';
    getStream(state, url)
      .then(({ title, description, posts }) => {
        state.feeds.push({
          id: uniqid(),
          url,
          title,
          description,
        });
        state.posts = [...state.posts, ...posts];
        state.form.processState = 'filling';
      });
    input.value = '';
    state.form.valid = false;
  });

  watch(state.form, 'valid', () => renderValidation(submitButton, input, state));
  watch(state, 'feeds', () => renderFeeds(state));
  watch(state, 'posts', () => renderPosts(state));
  watch(state.form, 'processState', () => renderSpinner(state));
  watch(state.form, 'errors', () => renderErrors(state.form.errors));

  findNewPosts(state);
  updateValidationState(state);
};
