import * as SQLite from 'expo-sqlite';
import uuid from 'react-native-uuid';

const db = SQLite.openDatabaseSync("stitch-patterns");
export async function initDb() {
    await db.execAsync('PRAGMA foreign_keys = ON');
    db.execAsync(`
        CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY NOT NULL, image TEXT NOT NULL);
    `);
}

export async function getAllFavorites() {
    const favorites = await db.getAllAsync('SELECT * FROM favorites');
    return favorites;
}

export async function insertFavorite(image) {
    const id = uuid.v4();
    db.runAsync("INSERT INTO favorites (id, image) VALUES (?, ?)", id, image);
}

export async function removeFavorite(image) {
    db.runAsync("DELETE FROM favorites WHERE image = ?", image);
}