import { createOptimizedPicture } from '../../scripts/aem.js';

async function createCard(data) {
  const card = document.createElement('div');
  card.classList.add('dynamic-card');
  let img;
  if (!data.image.includes('/default')) {
    img = createOptimizedPicture(data.image, data.title || 'Image', false, [{ width: '750' }]);
  } else {
    img = createOptimizedPicture('../../icons/getinTouch.png', data.title || 'Image', false, [{ width: '750' }]);
  }
  const header = document.createElement('h3');
  header.textContent = data.title;

  const description = document.createElement('p');
  description.textContent = data.description || 'No description available';

  card.append(img, header, description);
  return card;
}

async function createCardsContainer(jsonURL) {
  const resp = await fetch(jsonURL);
  const json = await resp.json();

  const container = document.createElement('div');
  container.classList.add('dynamic-cards-container');

  // eslint-disable-next-line no-restricted-syntax
  for (const item of json.data) {
    // eslint-disable-next-line no-await-in-loop
    const card = await createCard(item);
    container.appendChild(card);
  }

  return container;
}

export default async function decorate(block) {
  const queryIndexLink = block.querySelector('a[href$=".json"]');
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('dynamic-magazine-block');

  if (queryIndexLink) {
    const jsonURL = queryIndexLink.href;
    const cardsContainer = await createCardsContainer(jsonURL);

    parentDiv.append(cardsContainer);
    queryIndexLink.replaceWith(parentDiv);
  }
}
