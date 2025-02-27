-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 30, 2024 at 03:41 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


-- /*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
-- /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
-- /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
-- /*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tcmc_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--
CREATE DATABASE IF NOT EXISTS `tcmc_db`;

USE `tcmc_db`;
-- Add an index to the `team` column if it doesn't exist
-- ALTER TABLE `users`
--   ADD INDEX `idx_team` (`team`);

-- DESCRIBE `users`;
CREATE TABLE IF NOT EXISTS `subscriptions` (
`id` int NOT NULL PRIMARY KEY AUTO_INCREMENT,
`auth` VARCHAR(255) NOT NULL,
`data` JSON NOT NULL
) ENGINE=InnoDB DEFAULT
CHARSET=utf8mb4
COLLATE=utf8mb4_general_ci;

-- ALTER TABLE `reports` ADD CONSTRAINT `users_team` FOREIGN KEY (team) REFERENCES `users` (team) ON DELETE CASCADE ON UPDATE CASCADE;





-- Ensure the `team` column exists in the `users` table
-- ALTER TABLE `users`
--   ADD COLUMN `team` TINYINT UNSIGNED DEFAULT 0;

-- Add an index to the `team` column if it doesn't exist
-- ALTER TABLE `users`
--   ADD INDEX `idx_team` (`team`);

-- USE `tcmc_db`;




CREATE TABLE IF NOT EXISTS `logs` (
  `log_number` int PRIMARY KEY AUTO_INCREMENT,
  `vehicle_type` enum('Bus','Car', 'Motor', 'Tricycle', 'Truck', 'Van') NOT NULL, -- 0-Bus, 1-Car, 2-Motor, 3-Tricycle, 4-Truck, 5-Van
  `plate_number` varchar(20) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `reports`
--

CREATE TABLE IF NOT EXISTS `reports` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `age` int NOT NULL,
  `sex` enum('Male','Female','Other') NOT NULL,
  `address` text NOT NULL,
  `contactNumber` varchar(20) NOT NULL,
  `isOwner` enum('Yes','No') NOT NULL,
  `driversLicense` varchar(255) DEFAULT '',
  `vehicleRegistration` varchar(255) DEFAULT '',
  `orCr` varchar(255) DEFAULT '',
  `reason` text NOT NULL,
  `vehicleType` enum('Motorcycle','Car','Van','Truck','Other') NOT NULL,
  `platenumber` varchar(10) DEFAULT NULL,
  `color` varchar(30) DEFAULT NULL,
  `description` varchar(60) DEFAULT NULL,
  `reportID` varchar(50) UNIQUE KEY NOT NULL,
  `status` enum('unread','on_investigation','dropped','solved') NOT NULL DEFAULT 'unread',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

USE `tcmc_db`;
-- ALTER TABLE `reports` DROP FOREIGN KEY `fk_users_team`;
-- Add the foreign key constraint to the `reports` table
-- ALTER TABLE `reports`
--   ADD COLUMN `team` TINYINT UNSIGNED DEFAULT 0,
--   ADD CONSTRAINT `fk_users_team`
--   FOREIGN KEY (`team`)
--   REFERENCES `users` (`team`)
--   ON DELETE CASCADE
--   ON UPDATE CASCADE;
  
--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
--   `role` enum('admin','user') DEFAULT 'user',
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(250) DEFAULT NULL,
  `contact_num` varchar(12) DEFAULT NULL,
  `profile_image` varchar(255) DEFAULT NULL,
  `team` tinyint unsigned default 0,
  `isEmailVerified` tinyint unsigned default 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `watchlist`
--

CREATE TABLE IF NOT EXISTS `watchlist` (
  `watch_id` INT PRIMARY KEY AUTO_INCREMENT,
  `report_id` varchar(50) NOT NULL,
  `reported_by_user_id` int(11) DEFAULT NULL,
  `vehicle_type` enum('car','motorcycle') NOT NULL,
  `vehicle_color` varchar(50) NOT NULL,
  `plate_number` varchar(20) DEFAULT NULL,
  `incurred_violations` text DEFAULT NULL,
  `image_upload` VARCHAR(255) NOT NULL,
  `status` varchar(15) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


ALTER TABLE `watchlist`
--   ADD PRIMARY KEY (`report_id`),
  ADD KEY `reported_by_user_id` (`reported_by_user_id`);-- 


ALTER TABLE `watchlist`
  ADD CONSTRAINT `watchlist_ibfk_1` FOREIGN KEY (`reported_by_user_id`) REFERENCES `users` (`user_id`);
COMMIT;

-- ALTER TABLE `reports` ADD COLUMN `remarks` VARCHAR(255) DEFAULT NULL;
ALTER TABLE `users` ADD COLUMN `fcmToken` VARCHAR (255) DEFAULT NULL;
ALTER TABLE  `users` ADD KEY `team` (`team`);
-- /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
-- /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
-- /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
USE `tcmc_db`;
INSERT INTO users (username, name, team, contact_num, password, email, isEmailVerified) 
 VALUES ('Account1', 'Ricardo Dalisay', 0, 09123456789, '$2a$10$2ZRWm3XbtTRGV8uNOsNxjOyua.ZxRLNfOkx2N7I31y44rjJZAIpHG', 'acc1.email@gmail.com', 0);

CREATE TABLE IF NOT EXISTS `master`(
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `master_password` VARCHAR(255) NOT NULL
);
INSERT INTO master (master_password) VALUES ('$2a$10$vvk3fsM0XzkqxxNQW6ZMsOQl48VAWnjKr74SIHfn2fBXHElidYfou'); -- Password : 123456

