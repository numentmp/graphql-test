#!/usr/bin/env bash

if [    -z "${BASH_VERSINFO[0]}" ] || \
   [ 4 -gt "${BASH_VERSINFO[0]}" ] || \
   [ 4 -eq "${BASH_VERSINFO[0]}" -a 4 -gt "${BASH_VERSINFO[1]}" ]
then
    printf '\e[91mERROR: Неизвестная или неподдерживаемая версия bash\e[0m\n' 1>&2
    printf '\e[93mЕсли используется Mac OS, установить актуальную версию bash\e[0m\n' 1>&2
    printf '\e[93m  brew install bash\e[0m\n' 1>&2
    printf '\e[93mи запускайте скрипт через через прямой вызов bash\e[0m\n' 1>&2
    printf '\e[93m  /usr/local/bin/bash %q\e[0m\n' "$0" 1>&2
    exit 1
fi

declare -g SCRIPT_DIR=`dirname "$0"`
cd "$SCRIPT_DIR" || exit 1
source common.sh || exit 1

FILE='dev.yml'
ACTIONS+=( 'mysql' 'bash' 'help' )

action()
{
  local ACTION="$1"
  shift 1

  case "$ACTION" in
    up)
      common_mk_file '.env' \
        DEV_UID=`id -u` \
        DEV_GID=`id -g`
      echo
      common_build
      echo
      common_up
      echo
      common_net 1
      ;;
    down)
      common_down
      echo
      common_rm_vol data
      echo
      common_rm_img dev
      ;;
    mysql)
      common_mysql db "$@"
      ;;
    bash)
      common_bash dev "$@"
      ;;
    help)
      common_help_act
      printf '%q mysql [...] - запуск mysql cli в контейнере db\n' "$0"
      printf '%q bash [...]  - запуск bash в контейнере dev\n' "$0"
      echo
      print_header 'Используемые переменные окружения и значения по умолчанию'
      echo
      echo 'MYSQL_ROOT_PASSWORD=password'
      echo 'APP_PORT=8080'
      echo 'APP_DB_NAME=app'
      echo 'APP_DB_USER=app'
      echo 'APP_DB_PASS=password'
      echo 'APP_DB_CARS=100 (количество тестовых записей)'
      echo 'DEV_UID (UID пользователя host-системы)'
      echo 'DEV_GID (GID пользователя host-системы)'
      echo
      echo 'DEV_UID и DEV_GID используются для запуска процессов в контейнере dev,'
      echo 'чтобы все файлы в каталоге app были доступны и принадлежали одному'
      echo 'пользователю - разработчику. Если файл .env не существует, будет'
      echo 'предложено создать его автоматически с UID/GID текущего пользователя.'
      echo
      common_help_env
      ;;
    *)
      unknown_action "$ACTION"
      ;;
  esac
}

proc "$@"
