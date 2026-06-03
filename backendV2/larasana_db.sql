-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 24 Bulan Mei 2026 pada 05.16
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `larasana_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `addresses`
--

CREATE TABLE `addresses` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `label` varchar(50) NOT NULL DEFAULT 'Rumah',
  `recipient_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `full_address` text NOT NULL,
  `district` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `province` varchar(100) NOT NULL,
  `postal_code` varchar(10) NOT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `email_verifications`
--

CREATE TABLE `email_verifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `token` varchar(6) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `favorites`
--

CREATE TABLE `favorites` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_code` varchar(20) NOT NULL,
  `buyer_id` int(10) UNSIGNED NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `shipping_name` varchar(100) NOT NULL,
  `shipping_phone` varchar(20) NOT NULL,
  `shipping_address` text NOT NULL,
  `shipping_city` varchar(100) NOT NULL,
  `shipping_province` varchar(100) NOT NULL,
  `shipping_postal` varchar(10) NOT NULL,
  `notes` text DEFAULT NULL,
  `address_id` int(10) UNSIGNED DEFAULT NULL,
  `shipping_method_id` int(10) UNSIGNED DEFAULT NULL,
  `shipping_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `cancelled_at` timestamp NULL DEFAULT NULL,
  `cancel_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_items`
--

CREATE TABLE `order_items` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `seller_id` int(10) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `unit_price` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `product_snapshot` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`product_snapshot`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_used` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `payments`
--

CREATE TABLE `payments` (
  `id` int(10) UNSIGNED NOT NULL,
  `order_id` int(10) UNSIGNED NOT NULL,
  `payment_method` enum('qris','bank_transfer','va_bca','va_bni','va_bri','va_mandiri','gopay','shopeepay') NOT NULL DEFAULT 'qris',
  `amount` decimal(12,2) NOT NULL,
  `status` enum('pending','paid','failed','expired','refunded') NOT NULL DEFAULT 'pending',
  `midtrans_order_id` varchar(100) DEFAULT NULL,
  `midtrans_transaction_id` varchar(100) DEFAULT NULL,
  `payment_url` varchar(1000) DEFAULT NULL,
  `qr_string` text DEFAULT NULL,
  `qr_image_url` varchar(1000) DEFAULT NULL,
  `va_number` varchar(50) DEFAULT NULL,
  `expiry_time` timestamp NULL DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `failed_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `seller_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(12,2) NOT NULL,
  `stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `sku` varchar(50) DEFAULT NULL,
  `sizes` text DEFAULT NULL,
  `qr_code_url` varchar(500) DEFAULT NULL,
  `sales` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `category` varchar(100) DEFAULT NULL,
  `motif` varchar(100) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `thumbnail_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `average_rating` decimal(3,2) NOT NULL DEFAULT 0.00,
  `total_reviews` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `weaver_name` varchar(100) DEFAULT NULL,
  `weaver_bio` text DEFAULT NULL,
  `weaver_image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `product_images`
--

CREATE TABLE `product_images` (
  `id` int(10) UNSIGNED NOT NULL,
  `product_id` int(10) UNSIGNED NOT NULL,
  `url` varchar(500) NOT NULL,
  `sort_order` tinyint(3) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_revoked` tinyint(1) NOT NULL DEFAULT 0,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `seller_profiles`
--

CREATE TABLE `seller_profiles` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `shop_name` varchar(150) NOT NULL,
  `shop_description` text DEFAULT NULL,
  `ktp_number` varchar(20) NOT NULL,
  `ktp_photo_url` varchar(500) DEFAULT NULL,
  `province` varchar(100) NOT NULL DEFAULT 'Nusa Tenggara Barat',
  `city` varchar(100) NOT NULL,
  `district` varchar(100) NOT NULL,
  `full_address` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `rejected_reason` text DEFAULT NULL,
  `reviewed_by` int(10) UNSIGNED DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `applied_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `shipping_methods`
--

CREATE TABLE `shipping_methods` (
  `id` int(10) UNSIGNED NOT NULL,
  `courier` varchar(50) NOT NULL,
  `service` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `base_cost` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estimated_days` varchar(30) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `shipping_methods`
--

INSERT INTO `shipping_methods` (`id`, `courier`, `service`, `label`, `logo_url`, `base_cost`, `estimated_days`, `is_active`) VALUES
(1, 'JNE', 'REG', 'JNE Regular', NULL, 15000.00, '3-5 hari', 1),
(2, 'JNE', 'YES', 'JNE Express', NULL, 25000.00, '1-2 hari', 1),
(3, 'JNT', 'REG', 'J&T Regular', NULL, 13000.00, '3-5 hari', 1),
(4, 'JNT', 'EZ', 'J&T Express', NULL, 22000.00, '1-2 hari', 1),
(5, 'SICEPAT', 'REG', 'SiCepat Regular', NULL, 12000.00, '2-4 hari', 1),
(6, 'SICEPAT', 'BEST', 'SiCepat BEST', NULL, 20000.00, '1-2 hari', 1),
(7, 'POS', 'BIASA', 'POS Indonesia', NULL, 10000.00, '5-7 hari', 1);

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
  `is_email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `avatar_url` varchar(500) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `is_email_verified`, `is_active`, `avatar_url`, `phone`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Admin Larasana', 'admin@larasana.id', '$2b$12$KIXq3G1eG0uvGj.fz3o5fO7J9BQZS5Bl7ZqkbGkCpV7XcA1QbV9m', 'admin', 1, 1, NULL, NULL, '2026-05-03 01:09:24', '2026-05-03 01:09:24', NULL);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_addr_user` (`user_id`);

--
-- Indeks untuk tabel `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ev_user` (`user_id`);

--
-- Indeks untuk tabel `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_fav` (`user_id`,`product_id`),
  ADD KEY `idx_fav_user` (`user_id`),
  ADD KEY `idx_fav_product` (`product_id`);

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_code` (`order_code`),
  ADD KEY `idx_order_buyer` (`buyer_id`),
  ADD KEY `idx_order_code` (`order_code`),
  ADD KEY `idx_order_status` (`status`),
  ADD KEY `fk_order_address` (`address_id`),
  ADD KEY `fk_order_shipping` (`shipping_method_id`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_oi_order` (`order_id`),
  ADD KEY `idx_oi_product` (`product_id`),
  ADD KEY `fk_oi_seller` (`seller_id`);

--
-- Indeks untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_pr_user` (`user_id`);

--
-- Indeks untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`),
  ADD UNIQUE KEY `midtrans_order_id` (`midtrans_order_id`),
  ADD KEY `idx_pay_order` (`order_id`),
  ADD KEY `idx_pay_status` (`status`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_seller` (`seller_id`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_category` (`category`);

--
-- Indeks untuk tabel `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pi_product` (`product_id`);

--
-- Indeks untuk tabel `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token_hash` (`token_hash`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_token_hash` (`token_hash`);

--
-- Indeks untuk tabel `seller_profiles`
--
ALTER TABLE `seller_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_sp_user` (`user_id`),
  ADD KEY `idx_sp_status` (`status`),
  ADD KEY `fk_sp_reviewer` (`reviewed_by`);

--
-- Indeks untuk tabel `shipping_methods`
--
ALTER TABLE `shipping_methods`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `seller_profiles`
--
ALTER TABLE `seller_profiles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `shipping_methods`
--
ALTER TABLE `shipping_methods`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `fk_addr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD CONSTRAINT `fk_ev_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_fav_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fav_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`),
  ADD CONSTRAINT `fk_order_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_order_shipping` FOREIGN KEY (`shipping_method_id`) REFERENCES `shipping_methods` (`id`);

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_oi_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_pay_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_product_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `fk_pi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `seller_profiles`
--
ALTER TABLE `seller_profiles`
  ADD CONSTRAINT `fk_sp_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `seller_id`, `name`, `slug`, `description`, `price`, `stock`, `sku`, `sizes`, `qr_code_url`, `sales`, `category`, `motif`, `material`, `thumbnail_url`, `is_active`, `average_rating`, `total_reviews`, `weaver_name`, `weaver_bio`, `weaver_image_url`) VALUES
(1, 1, 'Noir Enchanted Vest', 'noir-enchanted-vest', 'Noir Enchanted Vest is inspired by Lombok\'s culture, folklore, and starlit nights. Luminous embroidery symbolizes strength, elegance, and the blend of heritage with modern style. More than a garment, it carries the soul and story of Lombok into today\'s world.', 120.00, 9999, '#32A53', '["S", "M", "L", "XL", "XXL"]', '/images/product/authenticity_qr.png', 1269, 'Authentic Handmade', 'Enchanted', 'Sasak Tenun', '/images/product/far left.png', 1, 5.00, 1, 'Yulia Andirtia', 'Crafted by Yulia Andirtia from the edge of Lombok, this vest carries fragments of ancestral memory through every woven thread. Inspired by volcanic landscapes, island folklore, and starlit nights, this piece reflects the harmony between timeless heritage and contemporary elegance.', '/images/weaver/yulia.png'),
(2, 1, 'Anchronic Vest', 'anchronic-vest', 'A striking fusion of traditional Lombok weave and structured contemporary silhouettes. The Anchronic Vest is built to stand out with comfort and architectural details.', 85.00, 9999, '#32A54', '["M", "L", "XL"]', '/images/product/authenticity_qr.png', 852, 'Modern Fit', 'Anchronic', 'Sasak Tenun', '/images/product/left.png', 1, 4.50, 1, 'Sri Handayani', 'Sri Handayani has been weaving for over 25 years in Sukarara village. She specializes in geometric patterns that combine Lombok heritage with modern architectural layouts, bringing structured balance and resilience to each thread.', '/images/weaver/sri.png'),
(3, 1, 'Larasana Signature', 'larasana-signature', 'The pinnacle of Larasana craft. Handwoven over three months by master artisans, combining traditional golden threadwork with premium organic cotton panels.', 170.00, 9999, '#32A55', '["S", "M", "L"]', '/images/product/authenticity_qr.png', 45, 'Exclusive Collection', 'Signature', 'Premium Tenun & Cotton', '/images/product/MID.png', 1, 5.00, 1, 'Baiq Ratna', 'Baiq Ratna is a master weaver of royal Lombok heritage. Working with traditional golden threads, she weaves only three signature pieces a year. Her work represents the pinnacle of Sasak craftsmanship and traditional storytelling.', '/images/weaver/baiq.png'),
(4, 1, 'Tenun Classic Vest', 'tenun-classic-vest', 'An elegant day-wear vest made using heritage techniques. Perfect for layering and bringing a piece of genuine culture to your everyday outfits.', 65.00, 9999, '#32A56', '["S", "M", "L", "XL"]', '/images/product/authenticity_qr.png', 320, 'Traditional Craft', 'Classic', 'Sasak Tenun', '/images/product/right.png', 1, 4.80, 1, 'Ni Ketut Suarti', 'Ni Ketut Suarti preserves the traditional clay-dyeing and weaving methods passed down by her grandmother. She works in a small collective in Sembalun, infusing the clean mountain air and earth tones into everyday day-wear vests.', '/images/weaver/ni_ketut.png'),
(5, 1, 'Heritage Indigo Coat', 'heritage-indigo-coat', 'Dyed naturally with organic indigo plants in East Lombok, this longline coat has dynamic shades of blue and intricate symbols representing water and longevity.', 220.00, 9999, '#32A57', '["M", "L", "XL", "XXL"]', '/images/product/authenticity_qr.png', 18, 'Premium Outerwear', 'Indigo', 'Natural Dyed Tenun', '/images/product/far right.png', 1, 4.20, 1, 'Inaq Aminah', 'Inaq Aminah is the elder artisan of the East Lombok Indigo Circle. She uses naturally fermented organic indigo plants to dye raw cotton threads, creating deep, shifting ocean-blue shades that tell stories of water, sky, and longevity.', '/images/weaver/inaq.png');

--
-- Dumping data untuk tabel `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `url`, `sort_order`) VALUES
(1, 1, '/images/product/far left.png', 0),
(2, 1, '/images/product/left.png', 1),
(3, 1, '/images/product/MID.png', 2),
(4, 1, '/images/product/right.png', 3),
(5, 1, '/images/product/far right.png', 4),
(6, 2, '/images/product/left.png', 0),
(7, 2, '/images/product/far left.png', 1),
(8, 2, '/images/product/MID.png', 2),
(9, 2, '/images/product/right.png', 3),
(10, 2, '/images/product/far right.png', 4),
(11, 3, '/images/product/MID.png', 0),
(12, 3, '/images/product/far left.png', 1),
(13, 3, '/images/product/left.png', 2),
(14, 3, '/images/product/right.png', 3),
(15, 3, '/images/product/far right.png', 4),
(16, 4, '/images/product/right.png', 0),
(17, 4, '/images/product/far left.png', 1),
(18, 4, '/images/product/left.png', 2),
(19, 4, '/images/product/MID.png', 3),
(20, 4, '/images/product/far right.png', 4),
(21, 5, '/images/product/far right.png', 0),
(22, 5, '/images/product/far left.png', 1),
(23, 5, '/images/product/left.png', 2),
(24, 5, '/images/product/MID.png', 3),
(25, 5, '/images/product/right.png', 4);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
