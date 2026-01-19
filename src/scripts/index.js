/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import {createCardElement, deleteCard, likeCard} from "./components/card.js";
import {closeModalWindow, openModalWindow, setCloseModalWindowEventListeners} from "./components/modal.js";
import {clearValidation, enableValidation} from "./components/validation.js";
import {getCardList, getUserInfo, postCard, setUserAvatar, setUserInfo} from "./components/api";
import {setButtonLoading} from "./components/utils";

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const logoElement = document.querySelector('.logo');
const infoModalWindow = document.querySelector('.popup_type_info');

const popupTitle = infoModalWindow.querySelector('.popup__title');
const popupInfo = infoModalWindow.querySelector('.popup__info');
const popupText = infoModalWindow.querySelector('.popup__text');
const popupList = infoModalWindow.querySelector('.popup__list');

const definitionTemplate = document.getElementById('popup-info-definition-template');

const openStatisticsModal = () => {
    logoElement.textContent = '...';

    getCardList()
        .then((cards) => {
            let likes = 0;
            let maxLikes = 0;
            const users = new Set();
            const likesByUser = {};

            cards.forEach(card => {
                users.add(card.owner._id);
                likes += card.likes.length;
                maxLikes = Math.max(maxLikes, card.likes.length);
                card.likes.forEach(like => {
                    users.add(like._id);

                    likesByUser[like.name] = (likesByUser[like.name] || 0) + 1;
                });
            });

            let champion = '—';
            let championLikes = 0;

            for (const user in likesByUser) {
                if (likesByUser[user] > championLikes) {
                    championLikes = likesByUser[user];
                    champion = user;
                }
            }

            popupTitle.textContent = 'Статистика';
            popupInfo.innerHTML = '';

            [
                ['Всего пользователей:', users.size],
                ['Всего Лайков:', likes],
                ['Максимум Лайков от одного:', maxLikes],
                ['Чемпион лайков:', champion ]
            ].forEach(([name, value]) => {
                const item = definitionTemplate.content.cloneNode(true);
                item.querySelector('.popup__info-term').textContent = name;
                item.querySelector('.popup__info-description').textContent = value;
                popupInfo.append(item);
            });

            popupText.textContent = 'Популярные карточки';
            popupList.innerHTML = '';

            cards
                .sort((a, b) => b.likes.length - a.likes.length)
                .slice(0, 3)
                .forEach((card, i) => {
                    const li = document.createElement('li');
                    li.textContent = `${i + 1}. ${card.name} (${card.likes.length})`;
                    popupList.append(li);
                });

            openModalWindow(infoModalWindow);
        })
        .catch(() => {
            popupTitle.textContent = 'Ошибка';
            popupInfo.innerHTML = '<dt>Ошибка</dt><dd>Данные не получены</dd>';
            openModalWindow(infoModalWindow);
        })
        .finally(() => {
            logoElement.textContent = 'Mesto';
        });
};

if (logoElement) {
    logoElement.addEventListener('click', openStatisticsModal);
    logoElement.style.cursor = 'pointer';
    logoElement.title = 'Показать статистику';
}


const handlePreviewPicture = ({name, link}) => {
    imageElement.src = link;
    imageElement.alt = name;
    imageCaption.textContent = name;
    openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
    evt.preventDefault();
    const button = evt.target.querySelector('.popup__button');
    setButtonLoading(button, true, 'Сохранение...');

    setUserInfo({
        name: profileTitleInput.value,
        about: profileDescriptionInput.value,
    })
        .then(() => {
            profileTitle.textContent = profileTitleInput.value;
            profileDescription.textContent = profileDescriptionInput.value;
            closeModalWindow(profileFormModalWindow);
        })
        .catch(console.log)
        .finally(() => setButtonLoading(button, false));
};

const handleAvatarFromSubmit = (evt) => {
    evt.preventDefault();
    const submitButton = evt.target.querySelector('.popup__button');
    setButtonLoading(submitButton, true, 'Сохранение...');
    setUserAvatar({
        avatar: avatarInput.value,
    })
        .then((userData) => {
            profileAvatar.src = userData.avatar;
            closeModalWindow(avatarFormModalWindow);
        })
        .catch((err) => {
            console.log(err);
        }).finally(() => {
        setButtonLoading(submitButton, false);
    });

};

const handleCardFormSubmit = (evt) => {
    const submitButton = evt.target.querySelector('.popup__button');
    setButtonLoading(submitButton, true, 'Создание...');
    evt.preventDefault();
    postCard({
        name: cardNameInput.value,
        link: cardLinkInput.value,
    })
        .then((userData) => {
            createCardElement(
                {
                    name: cardNameInput.value,
                    link: cardLinkInput.value,
                },
                {
                    onPreviewPicture: handlePreviewPicture,
                    onLikeIcon: likeCard,
                    onDeleteCard: deleteCard,
                },
                true
            )
            closeModalWindow(cardFormModalWindow);
        })
        .catch((err) => {
            console.log(err);
        }).finally(() => {
        setButtonLoading(submitButton, false);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
    profileTitleInput.value = profileTitle.textContent;
    profileDescriptionInput.value = profileDescription.textContent;
    clearValidation(profileForm, validationSettings);
    openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
    avatarForm.reset();
    openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
    cardForm.reset();
    openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
    setCloseModalWindowEventListeners(popup);
});

const validationSettings = {
    formSelector: ".popup__form",
    inputSelector: ".popup__input",
    submitButtonSelector: ".popup__button",
    inactiveButtonClass: "popup__button_disabled",
    inputErrorClass: "popup__input_type_error",
    errorClass: "popup__error_visible",
};

enableValidation(validationSettings);


Promise.all([getCardList(), getUserInfo()])
    .then(([cards, userData]) => {
        profileAvatar.style.backgroundImage = `url(${userData.avatar})`
        profileTitle.textContent = userData.name;
        profileDescription.textContent = userData.about;

        const currentUserId = userData._id;


        cards.forEach((cardData) => {
            const isLiked = cardData.likes.some(like => like._id === currentUserId)
            placesWrap.append(
                createCardElement(cardData, {
                    onPreviewPicture: handlePreviewPicture,
                    onLikeIcon: likeCard,
                    onDeleteCard: deleteCard,
                }, currentUserId, isLiked),
            );
        });
    })
    .catch((err) => {
        console.log(err);
    });
