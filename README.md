# graphql-test

MySQL (MariaDB) + NodeJs + GraphQL

`http://localhost:8080/`

![Demo page](/docs/page.png)

## Docker

Два варианта dockerfile:

- `dev.dockerfile` - для использования в dev-окружении
- `prod.dockerfile` - для сборки обычного образа

Два варианта docker-compose:

- `dev.yml` - запуск dev-окружения
- `demo.yml` - запуск prod-образа

Dev-окружение позволяет применять изменения без пересборки образа и перезапуска контейнера. Достигается пробросом каталога /app в контейнер.

## Запуск через docker-compose

Запуск:

```console
$ docker-compose -f demo.yml up -d --build
Creating network "graphql-test_net" with driver "bridge"
Creating volume "graphql-test_data" with default driver
Building app
Step 1/9 : FROM node:latest
...
Successfully built a480bf0512c3
Successfully tagged graphql-test_app:latest
Creating graphql-test_db_1 ... done
Creating graphql-test_app_1 ... done
```

Завершение:

```console
$ docker-compose -f demo.yml down
Stopping graphql-test_app_1 ... done
Stopping graphql-test_db_1  ... done
Removing graphql-test_app_1 ... done
Removing graphql-test_db_1  ... done
Removing network graphql-test_net
```

Удаление образа и тома:

```console
$ docker volume rm graphql-test_data
$ docker image  rm graphql-test_app
```

## Запуск с помощью скрипта

**ВНИМАНИЕ!** В Mac OS используется сильно устаревшая версия bash.
Необходимо установить актуальную версию через `brew install bash` и запускать все скрипты через `/usr/local/bin/bash <script>`.

```shell
./demo.sh
./dev.sh
```

Данные скрипты упрощают вызов docker-compose, а также позволяют удалить "артефакты" сборки/выполнения (image, volume).

Доступные действия: `up`, `down`, `mysql`, `bash`, `help`

- `./dev.sh` - полный цикл в интерактивном режиме (`up`, ожидание, `down`)
- `./dev.sh up`   - подготовка и запуск сервисов в фоновом режиме
- `./dev.sh down` - остановка сервисов и очистка
- `./dev.sh mysql [...]` - запуск mysql cli в контейнере db
- `./dev.sh bash [...]`  - запуск bash в контейнере dev
- `./dev.sh help` - справка

Выполнение скрипта может прерываться запросами подтверждения. Действие по умолчанию указано заглавной буквой: `[Y/n]` - Y.

Пример полного цикла:

```
Выполнить сборку? [Y/n] 
Сборка
$ docker-compose -f demo.yml build
Building app
Step 1/9 : FROM node:latest
...
Successfully built 9bbf498758d5
Successfully tagged graphql-test_app:latest

Запуск сервисов
$ docker-compose -f demo.yml up -d
Creating network "graphql-test_net" with driver "bridge"
Creating volume "graphql-test_data" with default driver
Creating graphql-test_db_1 ... done
Creating graphql-test_app_1 ... done

ГОТОВО

Остановить и удалить сервисы? [Y/n] 
```

На данном этапе приложение готово к использования. Откройте `http://localhost:8080/` в браузере.

```
Остановить и удалить сервисы? [Y/n] 

Остановка сервисов
$ docker-compose -f demo.yml down
Stopping graphql-test_app_1 ... done
Stopping graphql-test_db_1  ... done
Removing graphql-test_app_1 ... done
Removing graphql-test_db_1  ... done
Removing network graphql-test_net

Удалить тома? (graphql-test_data) [Y/n] 

Удаление томов
$ docker volume rm graphql-test_data
graphql-test_data

Удалить образы? (graphql-test_app) [Y/n] 

Удаление образов
$ docker image rm graphql-test_app
Untagged: graphql-test_app:latest
Deleted: sha256:...
Deleted: sha256:...
...
```

### JavaScript

Два варианта хранилища:

- Dummy (endpoint `/dummy`) - записи хранятся в памяти
- MySQL (endpoint `/mysql` и `/profile`)

Оба реализуют общий интерфейс.

При работе с MySQL возможен возврат SQL запросов в ответе GraphQL (endpoint `/profile` или `/mysql` с `NODE_ENV != production`).

### MySQL

База данных инициализируется скриптами из каталога initdb.d.
Количество тестовых данных задаётся переменной окружения APP_DB_CARS (по умолчанию 100).

Скрипты можно запустить вручную для просмотра SQL запросов.

```console
$ ./02-data.sh | head
USE app;

INSERT INTO car (model, color, plate_number) VALUES ('Ford Focus', 'Black', 'MF988');
SET @CAR_ID = LAST_INSERT_ID();
INSERT INTO driver (car_id, name, license) VALUES
(@CAR_ID, 'Andrew Turner', '5000101'),
(@CAR_ID, 'Laura Roberts', '5000102');

...
```
