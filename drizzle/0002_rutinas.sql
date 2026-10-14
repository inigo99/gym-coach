CREATE TABLE `horario` (
	`dia` integer PRIMARY KEY NOT NULL,
	`rutina_id` integer NOT NULL,
	`hora` integer NOT NULL,
	`minuto` integer NOT NULL,
	FOREIGN KEY (`rutina_id`) REFERENCES `rutina`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `rutina` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rutina_ejercicio` (
	`rutina_id` integer NOT NULL,
	`ejercicio_id` text NOT NULL,
	`orden` integer NOT NULL,
	`series` integer DEFAULT 3 NOT NULL,
	`reps_min` integer,
	`reps_max` integer,
	`descanso_s` integer DEFAULT 90 NOT NULL,
	PRIMARY KEY(`rutina_id`, `ejercicio_id`),
	FOREIGN KEY (`rutina_id`) REFERENCES `rutina`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ejercicio_id`) REFERENCES `ejercicio`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `sesion` ADD `rutina_id` integer REFERENCES rutina(id) ON DELETE set null;