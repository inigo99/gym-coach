CREATE TABLE `programa` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`objetivo` text NOT NULL,
	`dias` integer NOT NULL,
	`semanas` integer NOT NULL,
	`nivel` text NOT NULL,
	`material` text NOT NULL,
	`minutos` integer NOT NULL,
	`inicio` text NOT NULL,
	`fin` text
);
--> statement-breakpoint
CREATE TABLE `programa_rutina` (
	`programa_id` integer NOT NULL,
	`rutina_id` integer NOT NULL,
	`dia` integer NOT NULL,
	PRIMARY KEY(`programa_id`, `rutina_id`),
	FOREIGN KEY (`programa_id`) REFERENCES `programa`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rutina_id`) REFERENCES `rutina`(`id`) ON UPDATE no action ON DELETE cascade
);
