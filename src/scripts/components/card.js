import {changeLikeCardStatus, remove} from "./api";

export const likeCard = (likeButton, cardId) => {
    const isLiked = likeButton.classList.contains('card__like-button_is-active');
    const card = likeButton.closest('.card');
    const likeCount = card.querySelector('.card__like-count');

    changeLikeCardStatus(cardId, isLiked)
        .then((data) => {
            likeButton.classList.toggle('card__like-button_is-active');
            likeCount.textContent = data.likes.length;
        })
        .catch(console.log);
};

export const deleteCard = (cardElement, cardId) => {
console.log(cardElement, cardId);
    remove({ cardId })
        .then(() => {
            cardElement.remove();
        })
        .catch((err) => {
            console.log(err);
        });
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard }, currentUserId, isLiked,
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");
    const likeCounter = cardElement.querySelector(".card__like-count");
    if (isLiked) {
        likeButton.classList.add("card__like-button_is-active");
    }
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

    if (data.owner._id !== currentUserId) {
        deleteButton.style.display = "none";
    }

    likeCounter.textContent = data.likes.length;

    likeButton.addEventListener('click', () =>
        onLikeIcon(likeButton, data._id)
    );

    if (onDeleteCard) {
        deleteButton.addEventListener("click", () => {
            onDeleteCard(cardElement, data._id);
        });
    }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  return cardElement;
};