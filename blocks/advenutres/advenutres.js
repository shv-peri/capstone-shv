import { fetchPlaceholders, getMetadata, createOptimizedPicture } from '../../scripts/aem.js';

const placeholders = await fetchPlaceholders(getMetadata('locale'));

const {
  cycling,
  climbing,
  all,
  skiing,
  surfing,
  travel,
} = placeholders;

async function createCard(data) {
  const card = document.createElement('div');
  card.classList.add('card');

  const img = document.createElement('img');
  img.src = `${data.Image}`;
  img.alt = data.Type || 'Image';
  img.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));

  const header = document.createElement('h3');
  header.textContent = data.PLACE;

  const description = document.createElement('p');
  description.textContent = data.Description || 'No description available';

  card.append(img, header, description);
  return card;
}

async function createCardsContainer(jsonURL, filter, limit, offset) {
  const pathname = filter
    ? `${jsonURL}?limit=${limit}&offset=${offset}&sheet=${filter}`
    : `${jsonURL}?limit=${limit}&offset=${offset}`;

  const resp = await fetch(pathname);
  const json = await resp.json();

  const container = document.createElement('div');
  container.classList.add('cards-container');

  // eslint-disable-next-line no-restricted-syntax
  for (const item of json.data) {
    // eslint-disable-next-line no-await-in-loop
    const card = await createCard(item);
    container.appendChild(card);
  }

  return container;
}

async function createButtonsMap(jsonURL, parentDiv, limit, offset) {
  let offsetVal = offset;
  const optionsMap = new Map();
  optionsMap.set('all', all);
  optionsMap.set('cycling', cycling);
  optionsMap.set('climbing', climbing);
  optionsMap.set('skiing', skiing);
  optionsMap.set('travel', travel);
  optionsMap.set('surfing', surfing);

  const container = document.createElement('div');
  container.classList.add('activity-container');

  optionsMap.forEach((val, key) => {
    const button = document.createElement('button');
    button.classList.add('btn-activity');
    button.textContent = val;
    button.id = val;

    button.addEventListener('click', async () => {
      offsetVal = 0; // Reset _offset on button click
      const filter = key !== 'all' ? key : null;
      const cardsContainer = await createCardsContainer(jsonURL, filter, limit, offsetVal);
      const existingContainer = parentDiv.querySelector('.cards-container');
      existingContainer.replaceWith(cardsContainer);
    });

    container.append(button);
  });

  return container;
}

export default async function decorate(block) {
  const adventuresLink = block.querySelector('a[href$=".json"]');
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('adventures-block');

  if (adventuresLink) {
    const jsonURL = adventuresLink.href;
    const buttonsMap = await createButtonsMap(jsonURL, parentDiv, 20, 0);
    const cardsContainer = await createCardsContainer(jsonURL, null, 20, 0);

    parentDiv.append(buttonsMap, cardsContainer);
    adventuresLink.replaceWith(parentDiv);
  }
}
