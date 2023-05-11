import App from './App.js'
//CREATING CONTAINER FOR REACT ELEMENT
const container = document.createElement('div');
container.setAttribute('style', 'width: 100%; height: 100vh; margin: 0; padding: 0;')
document.body.appendChild(container);
// CREATING AND RENDERING REACT ELEMENT INSIDE CONTAINER
ReactDOM.render(React.createElement(App), container);