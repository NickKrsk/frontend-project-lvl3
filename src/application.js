
const urls = ['one', 'two'];

const render = (state) => {
  const input = document.querySelector('.form-control');
  const resultElement = document.querySelector('.result');
  const submit = document.querySelector('.btn');
  submit.disabled = state.RSSAdditionProcess.submitDisabled;

  if (state.RSSAdditionProcess.valid) {
    input.style.border = null;
  } else {
    input.style.border = "thick solid red";
  }

  /*const filteredNotebooks = filterItems(state.filter, notebooks);
  if (filteredNotebooks.length === 0) {
    resultElement.innerHTML = '';
    return;
  }*/
  const html = `<ul>${urls.map((el) => `<li>${el}</li>`).join('')}</ul>`;
  resultElement.innerHTML = html;
}


export default () => {

  const state = {
    RSSAdditionProcess: {  
      valid: true,
      submitDisabled: false,
    },
  };

  const input = document.querySelector('.form-control');
  input.addEventListener('keyup', () => {
    if (input.value === '') {
      state.RSSAdditionProcess.valid = true;
      state.RSSAdditionProcess.submitDisabled = true;
    } else if (!input.value.match(/^\d+$/)) {
      state.RSSAdditionProcess.valid = false;
      state.RSSAdditionProcess.submitDisabled = true;
    } else {
      state.RSSAdditionProcess.valid = true;
      state.RSSAdditionProcess.submitDisabled = false;
    }
    
    render(state);
  });

  const form = document.getElementById('point');
  console.log(form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();  
    const formData = new FormData(e.target);
    const RSS = formData.get('RSS'); 
    urls.push(RSS);
    console.log(RSS);
    input.value = "";
    render(state);
  });
  render(state);
}