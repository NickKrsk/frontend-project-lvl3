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
import 'bootstrap/dist/css/bootstrap.min.css';

const proxy = 'https://cors-anywhere.herokuapp.com';

const updateValidationState = (state) => {
  const schema = yup.object().shape({
    rss: yup.string().url().required().min(5)
      .test('RSS already exist', 'RSS already exist',
        (value) => {
          if (_.find(state.feeds, ({ url }) => url === value)) {
            return false;
          }
          return true;
        }),
  });

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

const parseRSS = (data) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(data, 'text/xml');
  const channel = doc.querySelector('channel');
  const title = channel.querySelector('title').innerHTML;
  const description = channel.querySelector('description').innerHTML;

  const posts = [];

  const items = channel.querySelectorAll('item');
  items.forEach((item) => {
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

const getStream = (state, url) => {
  // http://lorem-rss.herokuapp.com/feed
  // https://ru.hexlet.io/lessons.rss
  // http://static.feed.rbc.ru/rbc/logical/footer/news.rss

  const proxyUrl = `${proxy}/${url}`;
  return axios.get(proxyUrl)
    .then((response) => {
      const { title, description, posts } = parseRSS(response.data);
      return {
        url,
        title,
        description,
        posts,
      };
    })
    .catch((error) => {
      throw error;// пробрасываем дальше
    });
};

const findNewPosts = (state) => {
  const updateCheckPeriod = 5000;
  const iter = () => {
    state.feeds.forEach(({ url }) => {
      getStream(state, url)
        .then(({ posts }) => {
          const postIsFind = (postLink) => _.find(state.posts, (post) => post.postLink === postLink);
          const newPosts = posts.filter(({ postLink }) => !postIsFind(postLink));
          state.posts.unshift(...newPosts);
        })
        .catch((error) => {
          console.log(error);
        });
    });
    setTimeout(iter, updateCheckPeriod);
  };
  // - Вопрос на засыпку, как часто будет вызываться функция iter?
  // - 5c, по замерам также вышло
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
      console.log(error);
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
        state.posts.unshift(...posts);// push проще, а еще лучше unshift state.posts = [...state.posts, ...posts];
        state.form.processState = 'filling';
        input.value = '';
        state.form.valid = false;
      })
      .catch((error) => {
        state.form.processState = 'filling';
        console.log(error);
        state.form.errors = [{
          name: error, // 'network error',
        }];
      });
  });

  watch(state.form, 'valid', () => renderValidation(submitButton, input, state));
  watch(state, 'feeds', () => renderFeeds(state));
  watch(state, 'posts', () => renderPosts(state));
  watch(state.form, 'processState', () => renderSpinner(state));
  watch(state.form, 'errors', () => renderErrors(state.form.errors));

  findNewPosts(state);
  updateValidationState(state);
};
