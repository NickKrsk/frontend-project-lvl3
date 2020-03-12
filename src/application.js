
const urls = ['one', 'two'];

const render = (state) => {
  const resultElement = document.querySelector('.result');
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
    valid: true,
  };

  const form = document.getElementById('point');
  console.log(form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();  
    const formData = new FormData(e.target);
    const RSS = formData.get('RSS'); 
    urls.push(RSS);
    console.log(RSS);
    render(state);
  });
  render(state);
}