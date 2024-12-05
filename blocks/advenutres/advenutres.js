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

function createCard(data) {
  const card = document.createElement('div');
  card.classList.add('card');

  const img = createOptimizedPicture(data.Image, data.Type || 'Image', false, [{ width: '750' }]);
  const header = document.createElement('h3');
  header.textContent = data.PLACE;

  const description = document.createElement('p');
  description.textContent = data.Description || 'No description available';

  card.append(img, header, description);
  return card;
}

async function fetchCardsData(jsonURL, filter, limit, offset) {
  const url = filter
    ? `${jsonURL}?limit=${limit}&offset=${offset}&sheet=${filter}`
    : `${jsonURL}?limit=${limit}&offset=${offset}`;
  const resp = await fetch(url);
  return resp.json();
}

async function createCardsContainer(jsonURL, filter, limit, offset) {
  const json = await fetchCardsData(jsonURL, filter, limit, offset);

  const container = document.createElement('div');
  container.classList.add('cards-container');

  const cardElements = json.data.map((item) => createCard(item)); // Batch card creation
  container.append(...cardElements); // Append all cards at once
  return container;
}

function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function createButtonsMap(jsonURL, parentDiv, limit) {
  const optionsMap = new Map([
    ['all', all],
    ['cycling', cycling],
    ['climbing', climbing],
    ['skiing', skiing],
    ['travel', travel],
    ['surfing', surfing],
  ]);

  const container = document.createElement('div');
  container.classList.add('activity-container');

  let offsetVal = 0; // Use closure to track offset value

  container.append(
    ...Array.from(optionsMap, ([key, val]) => {
      const button = document.createElement('button');
      button.classList.add('btn-activity');
      button.textContent = val;
      button.id = val;

      button.addEventListener('click', debounce(async () => {
        offsetVal = 0; // Reset offset on button click
        const filter = key !== 'all' ? key : null;
        document.querySelectorAll('.btn-activity').forEach((el) => el.classList.remove('active'));
        button.classList.add('active');
        const cardsContainer = await createCardsContainer(jsonURL, filter, limit, offsetVal);
        const existingContainer = parentDiv.querySelector('.cards-container');
        existingContainer.replaceWith(cardsContainer);
      }, 300));

      return button;
    }),
  );

  return container;
}

export default async function decorate(block) {
  const adventuresLink = block.querySelector('a[href$=".json"]');
  const parentDiv = document.createElement('div');
  parentDiv.classList.add('adventures-block');

  if (adventuresLink) {
    const jsonURL = adventuresLink.href;

    const [buttonsMap, cardsContainer] = await Promise.all([
      createButtonsMap(jsonURL, parentDiv, 20),
      createCardsContainer(jsonURL, null, 20, 0),
    ]);

    parentDiv.append(buttonsMap, cardsContainer);
    adventuresLink.replaceWith(parentDiv);
  }
}
