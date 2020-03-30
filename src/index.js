import _ from 'lodash';

const render = (state) => {

};

const  app = () => {
  const state = {
    valid: true,
    RSSlist: [],
    posts: [],
  };

  console.log(state);
  const button = document.querySelector('.btn');
  button.addEventListener('click', () => {
    //state.processor = processor.value;
    console.log('click!');
    render(state);
  });

  const input = document.querySelector('[name="input_RSS"]');
  input.addEventListener('input', () => {
    console.log(input.value);
    render(state);
  });

}

app();

/*
function component() {
    const element = document.createElement('div');

    // Lodash, currently included via a script, is required for this line to work
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  
    return element;
  }
  
  document.body.appendChild(component());
  */