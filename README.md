## Быстрый старт для разработчиков
**1. Клонируем репозиторий**
```bash
git clone git@github.com:tohaocean/2gis_poi_mockup_server.git mockup_server_folder
```

**2. Установка окружения**

1. [Node.js](http://nodejs.org/)
2. Устанавливаем зависимости:

    ```bash
    cd ~/mockup_server_folder
    npm install
    ```

**3. Запуск приложения**
```bash
node app
```

**5. Просмотр результата**

Приложение будет доступно по адресу:

http://127.0.0.1:3100/

Тестовые данные POI по адресу:

http://127.0.0.1:3100/z/x/y/

Возможны XHR и JSONP запросы, для JSONP нужен параметр callback:

http://127.0.0.1:3100/z/x/y/?callback=___JSONP_CALLBACK_NAME___