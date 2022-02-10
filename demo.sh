#!/usr/bin/env bash

declare -g SCRIPT_DIR=`dirname "$0"`
cd "$SCRIPT_DIR" || exit 1
source common.sh || exit 1

FILE='demo.yml'
ACTIONS+=( 'mysql' 'bash' 'help' )

action()
{
  local ACTION="$1"
  shift 1

  case "$ACTION" in
    up)
      common_build
      echo
      common_up
      echo
      common_net net
      ;;
    down)
      common_down
      echo
      common_rm_vol data
      echo
      common_rm_img app
      ;;
    mysql)
      common_mysql db "$@"
      ;;
    bash)
      common_bash app "$@"
      ;;
    help)
      common_help_act
      printf '%q mysql [...] - запуск mysql cli в контейнере db\n' "$0"
      printf '%q bash [...]  - запуск bash в контейнере app\n' "$0"
      echo
      print_header 'Используемые переменные окружения и значения по умолчанию'
      echo
      echo 'MYSQL_ROOT_PASSWORD=password'
      echo 'APP_PORT=8080'
      echo 'APP_DB_NAME=app'
      echo 'APP_DB_USER=app'
      echo 'APP_DB_PASS=password'
      echo 'APP_DB_CARS=100 (количество тестовых записей)'
      echo
      common_help_env
      ;;
    *)
      unknown_action "$ACTION"
      ;;
  esac
}

proc "$@"
