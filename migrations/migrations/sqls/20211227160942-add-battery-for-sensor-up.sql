ALTER TABLE `wireless_final`.`sensor` 
ADD COLUMN `battery` VARCHAR(6) NULL AFTER `name`,
ADD COLUMN `updated_at` TIMESTAMP NULL AFTER `battery`;
