import mongoose from "mongoose";

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Modified global declaration to avoid using var
declare global {
  namespace NodeJS {
    interface Global {
      mongoose: GlobalMongoose | undefined;
    }
  }
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Define the cached variable using the interface
const cached: GlobalMongoose = (global as typeof global & { mongoose?: GlobalMongoose }).mongoose ?? {
  conn: null,
  promise: null,
};

// Set the global mongoose value
(global as any).mongoose = cached;

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default dbConnect;
