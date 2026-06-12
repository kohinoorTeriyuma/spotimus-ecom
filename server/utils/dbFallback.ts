import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure data directory and file exist
function initDB() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ users: [], products: [] }, null, 2)
    );
  }
}

function readData(): { users: any[]; products: any[] } {
  initDB();
  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Error reading JSON fallback DB:", error);
    return { users: [], products: [] };
  }
}

function writeData(data: { users: any[]; products: any[] }) {
  initDB();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing JSON fallback DB:", error);
  }
}

// Low-cost mock Mongo collection
class LocalCollection {
  private collectionName: "users" | "products";

  constructor(collectionName: "users" | "products") {
    this.collectionName = collectionName;
  }

  async find(query: any = {}) {
    const data = readData();
    let items = data[this.collectionName];

    // Simple key-value filtering
    if (query && Object.keys(query).length > 0) {
      items = items.filter((item) => {
        for (const key in query) {
          if (query[key] !== undefined && item[key] !== query[key]) {
            return false;
          }
        }
        return true;
      });
    }
    return items;
  }

  async findOne(query: any) {
    const items = await this.find(query);
    return items.length > 0 ? items[0] : null;
  }

  async findById(id: string) {
    const items = await this.find();
    return items.find((item) => item._id === id || item.id === id) || null;
  }

  async create(doc: any) {
    const data = readData();
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc,
    };
    data[this.collectionName].push(newDoc);
    writeData(data);
    return newDoc;
  }

  async findByIdAndUpdate(id: string, update: any, options: any = {}) {
    const data = readData();
    const index = data[this.collectionName].findIndex(
      (item) => item._id === id || item.id === id
    );
    if (index === -1) return null;

    const current = data[this.collectionName][index];
    // Simple deep merge / overwrite for top level keys
    const updated = {
      ...current,
      ...update,
      updatedAt: new Date().toISOString(),
    };

    data[this.collectionName][index] = updated;
    writeData(data);
    return updated;
  }

  async findByIdAndDelete(id: string) {
    const data = readData();
    const index = data[this.collectionName].findIndex(
      (item) => item._id === id || item.id === id
    );
    if (index === -1) return null;

    const deleted = data[this.collectionName].splice(index, 1);
    writeData(data);
    return deleted[0];
  }

  async countDocuments(query: any = {}) {
    const items = await this.find(query);
    return items.length;
  }
}

export const fallbackDB = {
  User: new LocalCollection("users"),
  Product: new LocalCollection("products"),
  isFallback: true,
};
