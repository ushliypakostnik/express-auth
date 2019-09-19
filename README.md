Backend Auth Module
===================

Описание
--------

Написанный на Express.js с Babel модуль полноценной аутентификации через JWT и Passport, использующий удаленную MongoDB с mLab и Express-Mailer.


Примеры клиентских приложений
-----------------------------

* Репозиторий: [Create React App based PWA frontend boilerpate](https://github.com/ushliypakostnik/react-auth)

[Демонстрация](https://react-auth.kafedra.org/)

* Репозиторий: [Vue cli based PWA frontend boilerpate](https://github.com/ushliypakostnik/vue-auth)

[Демонстрация](https://vue-auth.kafedra.org/)


### Features

* Локализация: сообщения об ошибках, а также письма будут отправляться пользователю на языке выбранном в момент отравки на клиенте


API
---

    POST { body : { user: { usermail, password } } }
    (optional, everyone has access)
    ${HOST}/api/user/login

Общедоступный роут выдающий аутентификацию пользователю по адресу электронной почты и паролю и/или регистрирующий пользователя если такого емейла нет в базе.

*

    GET
    (optional, everyone has access)
    ${HOST}/api/user/facebook

    GET
    (optional, everyone has access)
    ${HOST}/api/user/vkontakte

Общедоступные роуты позволяющие получить аутентификацию через социальные сети Facebook и VKontakte. Если полученного от соцсети адреса электронной почты пользователя нет в базе - он добавляется в нее.

*

    POST { user: { id } }
    (authentication required)
    ${HOST}/api/user/send-verify-email

Защищенный роут позволяющий отправить письмо о верификации аккаунта пользователя с переданным айди

*

    POST { body: { id } }
    (optional, everyone has access)
    ${HOST}/api/user/verify

Общедоступнй роут позволяющий верифицировать аккаунт пользователя по полученному айди

*

    POST { body: { usermail } }
    (optional, everyone has access)
    ${HOST}/api/user/remind

Общедоступный роут позволяющий отправить письмо со ссылкой на востановление пароля по переданному адресу электронной почты

*

    POST { body: { user: { id, password } } }
    (authentication required)
    ${HOST}/api/user/password

Защищенный роут позволяющий создать новый пароль для пользователя по переданному айди

*

    GET { user: { id } }
    (authentication required)
    ${HOST}/api/user/profile

Защищенный роут возвращающий профиль пользователя по переданому айди

*

    GET { user: { id } }
    (authentication required)
    ${HOST}/api/user/logout

Защищенный роут прерывающий аутентификацию

*

    GET
    ${HOST}/test

Тестовый роут

*

Deploy
------

Установка зависимостей npm packages

    $ npm install

Development
-----------

    $ npm start

    http://localhost:8082/

Production
----------

Запуск проекта для продакшена

    $ npm run prod

Тесты
-----

Запуск линтера

    $ npm run lint

Запуск тестов

    $ npm run test
