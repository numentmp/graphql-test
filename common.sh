#!/usr/bin/env bash

set -o errexit
set -o nounset
set -o pipefail

declare -g SCRIPT_DIR=`pwd`
declare -g PROJECT=`basename "$SCRIPT_DIR"`
export PROJECT

declare -g FILE='docker-compose.yml'

declare -g -a ACTIONS=( 'up' 'down' )

print_error()
{
  printf '\e[91mERROR: %s\e[0m\n' "$1" 1>&2
}

print_warning()
{
  printf '\e[93mWARNING: %s\e[0m\n' "$1" 1>&2
}

print_header()
{
  printf '\e[97m%s\e[0m\n' "$1"
}

print_cmd()
{
  local PREFIX="$1"
  local CMD="$2"
  shift 2

  printf '\e[97m%s\e[0m %q' "$PREFIX" "$CMD"

  local ARG
  for ARG in "$@"; do
    printf ' %q' "$ARG"
  done
  printf '\n'
}

run_cmd()
{
  print_cmd '$' "$@"

  if ! "$@"; then
    print_error "Выполнение команды завершилось ошибкой"
    exit 1
  fi
}

try_cmd()
{
  print_cmd '$' "$@"

  if ! "$@"; then
    print_warning "Выполнение команды завершилось ошибкой"
  fi
}

input()
{
  printf '\e[94m%s\e[0m ' "$1"
  shift 1
  read -r "$@" || exit 1
}

confirm()
{
  local DEF="$1"
  shift 1

  local X
  while true; do
    input "$@" X
    [ -n "$X" ] || X="$DEF"

    if [ x"$X" == x'y' -o x"$X" == x'Y' ]; then
      return 0
    fi

    if [ x"$X" == x'n' -o x"$X" == x'N' ]; then
      return 1
    fi
  done
}

common_build()
{
  if confirm y 'Выполнить сборку? [Y/n]'; then
    print_header 'Сборка'
    run_cmd docker-compose -f "$FILE" build
  fi
}

common_up()
{
  print_header 'Запуск сервисов'
  run_cmd docker-compose -f "$FILE" up "$@" -d
}

common_net()
{
  if ! which firewall-cmd 1> /dev/null 2>&1; then
    print_header 'Донастройка сети не требуется'
  fi

  print_header 'Донастройка сети'

  local -a X=( )
  local Y
  for Y in "$@"; do
    X+=( --add-interface="br-${PROJECT}_$Y" )
  done

  print_warning 'Обнаружен firewalld'
  echo 'Если интерфейсам bridge не проставляется зона docker, необходимо выполнить'
  print_cmd '#' firewall-cmd --zone=docker "${X[@]}"
  echo 'или'
  print_cmd '#' firewall-cmd --zone=docker "${X[@]}" --permanent
}

common_down()
{
  print_header 'Остановка сервисов'
  try_cmd docker-compose -f "$FILE" down
}

common_ready()
{
  print_header 'ГОТОВО'
  echo
  if confirm y 'Остановить и удалить сервисы? [Y/n]'; then
    return
  fi

  echo
  printf 'Для остановки сервисов и очистки выполните \e[97m%q down\e[0m\n' "$0"
  exit 0
}

common_rm_vol()
{
  local -a X=( )
  local Y
  for Y in "$@"; do
    X+=( "${PROJECT}_$Y" )
  done

  confirm y "Удалить тома? (${X[*]}) [Y/n]" || return 0

  echo
  print_header 'Удаление томов'
  try_cmd docker volume rm "${X[@]}"
}

common_rm_img()
{
  local -a X=( )
  local Y
  for Y in "$@"; do
    X+=( "${PROJECT}_$Y" )
  done

  confirm y "Удалить образы? (${X[*]}) [Y/n]" || return 0

  echo
  print_header 'Удаление образов'
  try_cmd docker image rm "${X[@]}"
}

common_cmd()
{
  print_header 'Запуск произвольной команды'
  run_cmd docker-compose -f "$FILE" "$@"
}

common_mysql()
{
  local CONTAINER="$1"
  shift 1

  print_header "Подключение к базе данных в $CONTAINER"
  run_cmd docker-compose -f "$FILE" exec "$CONTAINER" \
    mysql --user=root --password "$@"
}

common_bash()
{
  local CONTAINER="$1"
  shift 1

  print_header "Запуск bash в $CONTAINER"
  run_cmd docker-compose -f "$FILE" exec "$CONTAINER" \
    bash "$@"
}

common_mk_file()
{
  local FN="$1"
  shift 1

  if [ -f "$FN" ]; then
    print_header "Файл $FN уже существует"
    cat "$FN"
    return
  fi

  confirm y "Создать файл $FN? [Y/n]" || return 0
  echo

  print_header "Создание файл $FN"

  printf '' > "$FN" || exit 1

  local X
  for X in "$@"; do
    printf '%s\n' "$X"
    printf '%s\n' "$X" >> "$FN" || exit 1
  done
}

common_help_act()
{
  local S=''
  local X
  local HELP=false
  for X in "${ACTIONS[@]}"; do
    if [ -z "$S" ]; then
      S="$X"
    else
      S="$S, $X"
    fi

    [ x"$X" != x'help' ] || HELP=true
  done
  $HELP || S="$S, help"

  print_header "Доступные действия: $S"

  echo
  printf '%q - полный цикл в интерактивном режиме (up, ожидание, down)\n' "$0"
  printf '%q up   - подготовка и запуск сервисов в фоновом режиме\n' "$0"
  printf '%q down - остановка сервисов и очистка\n' "$0"
}

common_help_env()
{
  local FN='.env'
  if [ -f "$FN" ]; then
    print_header "Текущий файл $FN:"
    echo
    cat "$FN"
  else
    print_header "Файл $FN отсутствует"
  fi
}

unknown_action()
{
  print_error "Неизвестное действие '$1'. Доступны: ${ACTIONS[*]}."
  exit 1
}

proc()
{
  if [ "$#" == 0 ]; then
    action up
    echo
    common_ready
    echo
    action down
    return
  fi

  local ACTION="$1"
  shift 1

  local X
  for X in "${ACTIONS[@]}"; do
    if [ x"$ACTION" == x"$X" ]; then
      action "$ACTION" "$@"
      return
    fi
  done

  if [ x"$ACTION" == x'help' ]; then
    common_help_act
    echo
    common_help_env
    return
  fi

  print_header 'Запуск произвольной команды'
  run_cmd docker-compose -f "$FILE" "$ACTION" "$@"
}
