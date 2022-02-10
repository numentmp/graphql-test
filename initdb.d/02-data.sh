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

declare -g APP_DB_CARS="${APP_DB_CARS-100}"

# Генерация тестовых данных отключена
if [ x"$APP_DB_CARS" == x'0' ]; then
  exit 0
fi

# Проверяем на отрицательное или нечисловое значение
if ! [ 0 -lt "$APP_DB_CARS" ] 2> /dev/null; then
  printf 'ERROR: incorrect value APP_DB_CARS=%q\n' "$APP_DB_CARS" 1>&2
  exit 1
fi

# Количество водителей выбирается случайно со следующей вероятностью
#   0 водителей - 10%
#   1 водитель  - 30%
#   2 водителя  - 50%
#   3 водителя  - 10%
declare -g RANGE0=1
declare -g RANGE1=3
declare -g RANGE2=5
declare -g RANGE3=1

RANGE1=$(( RANGE1 + RANGE0 ))
RANGE2=$(( RANGE2 + RANGE1 ))
RANGE3=$(( RANGE3 + RANGE2 ))

declare -g -a LETTERS=( A B C D E F G H J K L M N P Q R S T U V W X Y Z )

declare -g -a COLORS=( Red Green Blue Black White Yellow )

declare -g -a MODELS=( \
  'Tesla Model S' 'Tesla Model X' \
  'BMW X5' 'BMW Z4' 'BMW i3' \
  'Audi A1' 'Audi A3' 'Audi S5' 'Audi TT' \
  'Toyota Camry' 'Toyota Corolla' 'Toyota RAW4' \
  'Ford Focus' 'Ford Mondeo' 'Ford Taurus' \
)

declare -g -a NAMES=( \
  James Mary Robert Patricia John Jennifer Michael Linda William Elizabeth \
  David Barbara Richard Susan Joseph Jessica Thomas Sarah Charles Karen \
  Christopher Nancy Daniel Lisa Matthew Betty Anthony Margaret Mark Sandra \
  Donald Ashley Steven Kimberly Paul Emily Andrew Donna Joshua Michelle Kenneth \
  Dorothy Kevin Carol Brian Amanda George Melissa Edward Deborah Ronald Stephanie \
  Timothy Rebecca Jason Sharon Jeffrey Laura Ryan Cynthia Jacob Kathleen Gary \
  Amy Nicholas Shirley Eric Angela Jonathan Helen Stephen Anna Larry Brenda \
)

declare -g -a SURNAMES=( \
  Jones Taylor Williams Brown White Harris Martin Davies Wilson Cooper \
  Evans King Thomas Baker Green Wright Johnson Edwards Clark Roberts \
  Robinson Hall Lewis Clarke Young Davis Turner Hill Phillips Collins \
  Allen Moore Thompson Carter James Knight Walker Wood Hughes Parker \
)

gen_plate()
{
  local CAR="$1"
  local R=''
  local X
  local Y

  # Количество букв
  local L=${#LETTERS[@]}
  # Начальное значение для номеров автомобилей - MF987 + порядковый номер
  X=$(( 987 + (5+11*L)*1000 + CAR ))

  Y=$(( X % 1000 ))
  X=$(( X / 1000 ))
  printf -v R '%03d' "$Y"

  Y=$(( X % L ))
  X=$(( X / L ))
  R="${LETTERS[$Y]}$R"

  Y=$(( X % L ))
  X=$(( X / L ))
  R="${LETTERS[$Y]}$R"

  echo -n "$R"
}

gen_model()
{
  local X=$(( RANDOM % ${#MODELS[@]} ))
  echo -n "${MODELS[$X]}"
}

gen_color()
{
  local X=$(( RANDOM % ${#COLORS[@]} ))
  echo -n "${COLORS[$X]}"
}

gen_name()
{
  local R=''
  local X

  X=$(( RANDOM % ${#NAMES[@]} ))
  R="${NAMES[$X]}"

  X=$(( RANDOM % ${#SURNAMES[@]} ))
  R="$R ${SURNAMES[$X]}"

  echo -n "$R"
}

gen_car()
{
  local CAR="$1"

  local PLATE=`gen_plate "$CAR"`
  local MODEL=`gen_model`
  local COLOR=`gen_color`

  echo "INSERT INTO car (model, color, plate_number) VALUES ('$MODEL', '$COLOR', '$PLATE');"
}

gen_drivers()
{
  local CAR="$1"
  local DRIVERS="$2"

  echo -n 'INSERT INTO driver (car_id, name, license) VALUES'

  local FMT="(@CAR_ID, '%s', '5%04d%02d')"
  local NAME

  local I=0
  while [ "$DRIVERS" -gt "$I" ]; do
    (( I = I + 1 ))
    [ "$I" == 1 ] || echo -n ','

    NAME=`gen_name`

    printf "\n$FMT" "$NAME" "$CAR" "$I"
  done

  echo ';'
}

generate()
{
  echo "USE $APP_DB_NAME;"

  local X
  local I=0
  while [ "$APP_DB_CARS" -gt "$I" ]; do
    (( I = I + 1 ))

    echo
    gen_car "$I"

    X=$(( RANDOM % RANGE3 ))

    if [ "$X" -lt "$RANGE0" ]; then
      echo '# no drivers'
      continue;
    fi

    echo 'SET @CAR_ID = LAST_INSERT_ID();'

    if [ "$X" -lt "$RANGE1" ]; then
      echo '# 1 driver'
      X=1
    elif [ "$X" -lt "$RANGE2" ]; then
      echo '# 2 drivers'
      X=2
    else
      echo '# 3 drivers'
      X=3
    fi

    gen_drivers "$I" "$X"
  done
}

proc "$@"
