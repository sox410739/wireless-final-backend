CREATE TABLE `wireless_final`.`sensor` (
  `UID` VARCHAR(45) NOT NULL,
  `name` VARCHAR(45) NULL,
  PRIMARY KEY (`UID`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;


CREATE TABLE `wireless_final`.`sensor_history` (
  `sensor_UID` VARCHAR(45) NULL,
  `latitude` VARCHAR(20) NULL,
  `longitude` VARCHAR(20) NULL,
  `uploaded_at` TIMESTAMP NOT NULL,
  PRIMARY KEY (`uploaded_at`),
  INDEX `sensor_history_UID_FK_idx` (`sensor_UID` ASC) VISIBLE,
  CONSTRAINT `sensor_history_UID_FK`
    FOREIGN KEY (`sensor_UID`)
    REFERENCES `wireless_final`.`sensor` (`UID`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8;