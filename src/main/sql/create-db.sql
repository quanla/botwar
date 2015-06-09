CREATE SCHEMA `botwar` ;

CREATE USER `botwar`@`%` IDENTIFIED BY 'qweqweqwe';
GRANT ALL PRIVILEGES ON `botwar`.* TO `botwar`@`%`;


CREATE TABLE `challenge` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `battle_setup` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
