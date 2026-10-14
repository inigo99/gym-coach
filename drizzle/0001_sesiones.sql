CREATE TABLE `serie` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sesion_id` integer NOT NULL,
	`ejercicio_id` text NOT NULL,
	`peso_kg` real,
	`reps` integer,
	`duracion_s` integer,
	`distancia_m` real,
	`calentamiento` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`sesion_id`) REFERENCES `sesion`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicio`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `serie_ejercicio_idx` ON `serie` (`ejercicio_id`,`sesion_id`);--> statement-breakpoint
CREATE TABLE `sesion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`inicio` text NOT NULL,
	`fin` text
);
--> statement-breakpoint
CREATE TABLE `sesion_ejercicio` (
	`sesion_id` integer NOT NULL,
	`ejercicio_id` text NOT NULL,
	`orden` integer NOT NULL,
	PRIMARY KEY(`sesion_id`, `ejercicio_id`),
	FOREIGN KEY (`sesion_id`) REFERENCES `sesion`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicio`(`id`) ON UPDATE no action ON DELETE no action
);
