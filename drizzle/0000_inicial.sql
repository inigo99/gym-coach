CREATE TABLE `ejercicio` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text NOT NULL,
	`registro` text NOT NULL,
	`equipo` text NOT NULL,
	`musculos_principales` text NOT NULL,
	`musculos_secundarios` text NOT NULL,
	`id_origen` text,
	`imagenes_origen` text
);
--> statement-breakpoint
CREATE TABLE `medicion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`fecha` text NOT NULL,
	`peso_kg` real NOT NULL,
	`grasa_pct` real
);
--> statement-breakpoint
CREATE TABLE `perfil` (
	`id` integer PRIMARY KEY NOT NULL,
	`nombre` text,
	`nacimiento` text,
	`sexo` text,
	`altura_cm` real
);
