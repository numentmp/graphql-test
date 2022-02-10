#!/usr/bin/env bash

declare -g SCRIPT_DIR=`dirname "$0"`
cd "$SCRIPT_DIR" || exit 1
source common.sh || exit 1

declare -g APP_DB_USER="${APP_DB_USER-app}"
declare -g APP_DB_PASS="${APP_DB_PASS-password}"

generate()
{
  cat <<EOF
CREATE DATABASE ${APP_DB_NAME}
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE = utf8mb4_general_ci
;

CREATE USER ${APP_DB_USER}
  IDENTIFIED BY '${APP_DB_PASS}'
;

GRANT INSERT, SELECT, UPDATE, DELETE
  ON ${APP_DB_NAME}.*
  TO '${APP_DB_USER}'@'%'
;

USE $APP_DB_NAME;

CREATE TABLE car (
  car_id       INT NOT NULL AUTO_INCREMENT,
  model        VARCHAR(30) NOT NULL,
  color        VARCHAR(30) NOT NULL,
  plate_number VARCHAR(10) NULL,
  PRIMARY KEY (car_id)
) ENGINE=InnoDB;

CREATE TABLE driver (
  driver_id INT NOT NULL AUTO_INCREMENT,
  car_id    INT NULL,
  name      VARCHAR(100) NOT NULL,
  license   VARCHAR(10) NULL,
  PRIMARY KEY (driver_id),
  FOREIGN KEY driver_fk1 (car_id)
    REFERENCES car (car_id)
) ENGINE=InnoDB;
EOF
}

proc "$@"
