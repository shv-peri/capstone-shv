import { createOptimizedPicture } from '../../scripts/aem.js';

function createCard(data) {
  const card = document.createElement('div');
  card.classList.add('dynamic-card');

  const imgUrl = data.image.includes('/default')
    ? '../../icons/getinTouch.png'
    : data.image;
  const img = createOptimizedPicture(imgUrl, data.title || 'Image', false, [{ width: '750' }]);

  const header = document.createElement('h3');
  header.textContent = data.title;

  const description = document.createElement('p');
  description.textContent = data.description || 'No description available';

  card.append(img, header, description);
  return card;
}

async function fetchJsonData(jsonURL) {
  const resp = await fetch(jsonURL);
  if (!resp.ok) throw new Error(`Failed to fetch JSON from ${jsonURL}`);
  return resp.json();
}

function createCardsContainer(data) {
  const container = document.createElement('div');
  container.classList.add('dynamic-cards-container');
  // Batch create cards;
  const cardElements = data.map(createCard);
  // Append all cards at once
  container.append(...cardElements);
  return container;
}

export default async function decorate(block) {
  const queryIndexLink = block.querySelector('a[href$=".json"]');
  if (!queryIndexLink) return;

  const parentDiv = document.createElement('div');
  parentDiv.classList.add('dynamic-magazine-block');

  try {
    const jsonURL = queryIndexLink.href;
    const jsonData = await fetchJsonData(jsonURL);
    // Pass data to container creation
    const cardsContainer = createCardsContainer(jsonData.data);
    parentDiv.append(cardsContainer);
    queryIndexLink.replaceWith(parentDiv);
  } catch (error) {
    console.error('Error creating dynamic magazine block:', error);
  }
}
